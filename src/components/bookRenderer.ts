import {
	App,
	Component,
	MarkdownRenderer,
	Notice,
	TFolder,
	TFile,
} from "obsidian";
import { FileTreeItem } from "../types";
import { generateHierarchyMarkdown } from "../utils/hierarchyGenerator";
import { splitMarkdownIntoChunks, isNearBottom } from "../utils/lazyLoadUtils";
import { SnapshotNameModal } from "./snapshotNameModal";

/**
 * Component that renders a book view from a folder's notes
 */
export class BookRenderer {
	private container: HTMLElement;
	private app: App;
	private folder: FileTreeItem | null = null;
	private contentContainer: HTMLElement;
	private headerEl: HTMLElement;
	private renderComponent: Component | null = null;
	private isLoading = false;

	// Lazy loading properties
	private fullMarkdown = "";
	private markdownChunks: string[] = [];
	private currentChunkIndex = 0;
	private isLoadingMore = false;
	private refreshLeftPanel: () => void;
	private scrollListener: ((e: Event) => void) | null = null;

	constructor(
		container: HTMLElement,
		app: App,
		selectedFolder: FileTreeItem | TFolder | null,
		refreshLeftPanel: () => void
	) {
		this.app = app;
		this.container = container;
		this.refreshLeftPanel = refreshLeftPanel;

		// Convert TFolder to FileTreeItem if needed
		if (
			selectedFolder &&
			"children" in selectedFolder &&
			!Array.isArray(selectedFolder.children)
		) {
			// It's a TFolder, convert to FileTreeItem
			this.folder = {
				name: selectedFolder.name,
				path: selectedFolder.path,
				children: [], // We don't need the full tree structure for rendering
			};
		} else {
			// It's already a FileTreeItem or null
			this.folder = selectedFolder as FileTreeItem | null;
		}

		console.log("Folder received for rendering :", this.folder);
		this.render();
	}

	setFolder(folder: FileTreeItem | TFolder | null) {
		if (!folder) {
			this.folder = null;
		} else if ("children" in folder && !Array.isArray(folder.children)) {
			// It's a TFolder, convert to FileTreeItem
			this.folder = {
				name: folder.name,
				path: folder.path,
				children: [], // We don't need the full tree structure for rendering
			};
		} else {
			// It's already a FileTreeItem
			this.folder = folder as FileTreeItem;
		}
		// this.renderBook();
		this.render();
	}

	private render() {
		this.container.empty();

		if (this.folder && this.folder?.path !== "/") {
			this.container.addClass("book-simulator-renderer");

			this.headerEl = this.container.createDiv({
				cls: "book-simulator-renderer-header",
			});

			this.contentContainer = this.container.createDiv({
				cls: "book-simulator-renderer-content markdown-reading-view",
			});

			this.renderBook();
		} else {
			this.container.addClass("book-simulator-root-folder-message");

			this.container.createDiv({
				cls: "book-simulator-renderer-root-folder-message",
				text: "Please select a folder to render it",
			});
		}
	}

	private async renderBook() {
		// Update header
		if (this.folder) {
			const folderName =
				this.folder.path === "/" ? "Vault" : this.folder.name;
			this.headerEl.textContent = `Book: ${folderName}`;
		} else {
			this.headerEl.textContent = "Book Simulator";
		}

		this.headerEl
			.createEl("button", {
				cls: "book-simulator-renderer-header-save-snap-btn",
				text: "Save snapshot",
			})
			.addEventListener("click", (ev: PointerEvent) => {
				this.openSnapshotModal();
			});

		// Clear content
		this.contentContainer.empty();

		if (this.renderComponent) {
			this.renderComponent.unload();
			this.renderComponent = null;
		}

		// Remove old scroll listener if exists
		if (this.scrollListener) {
			this.contentContainer.removeEventListener(
				"scroll",
				this.scrollListener
			);
			this.scrollListener = null;
		}

		if (!this.folder) {
			const emptyState = this.contentContainer.createDiv({
				cls: "book-simulator-empty-state",
			});
			emptyState.textContent =
				"Select a folder from the explorer to view its contents as a book";
			return;
		}

		// Show loading state
		this.isLoading = true;
		const loadingEl = this.contentContainer.createDiv({
			cls: "book-simulator-loading",
		});
		loadingEl.textContent = "Loading book content...";

		try {
			// Generate full markdown
			this.fullMarkdown = await generateHierarchyMarkdown(
				this.app,
				this.folder
			);

			// Clear loading
			this.contentContainer.empty();
			this.isLoading = false;

			// Split markdown into chunks
			this.markdownChunks = splitMarkdownIntoChunks(
				this.fullMarkdown,
				100
			);
			this.currentChunkIndex = 0;

			console.log(
				`Lazy loading: Split markdown into ${
					this.markdownChunks.length
				} chunks (${this.fullMarkdown.split("\n").length} lines total)`
			);

			// Render first chunk
			await this.renderNextChunk();

			// Setup scroll listener for lazy loading
			this.setupScrollListener();
		} catch (error) {
			console.error("Error rendering book:", error);
			this.contentContainer.empty();
			this.isLoading = false;
			const errorEl = this.contentContainer.createDiv({
				cls: "book-simulator-error",
			});
			errorEl.textContent = `Error rendering book: ${error.message}`;
		}
	}

	/**
	 * Renders the next chunk of markdown content
	 * Appends to existing content without re-rendering
	 */
	private async renderNextChunk() {
		if (
			this.currentChunkIndex >= this.markdownChunks.length ||
			this.isLoadingMore
		) {
			return;
		}

		this.isLoadingMore = true;
		console.log(
			`Lazy loading: Rendering chunk ${this.currentChunkIndex + 1}/${
				this.markdownChunks.length
			}`
		);

		try {
			const chunk = this.markdownChunks[this.currentChunkIndex];

			// Create a temporary container for the new chunk
			const chunkContainer = this.contentContainer.createDiv({
				cls: "book-simulator-chunk",
			});

			// Create a new component for this chunk
			const chunkComponent = new Component();
			chunkComponent.load();

			// Render the chunk
			await MarkdownRenderer.render(
				this.app,
				chunk,
				chunkContainer,
				"",
				chunkComponent
			);

			// Store the component reference (we'll need to unload all later)
			if (!this.renderComponent) {
				this.renderComponent = new Component();
				this.renderComponent.load();
			}
			this.renderComponent.addChild(chunkComponent);

			this.currentChunkIndex++;
		} catch (error) {
			console.error("Error rendering chunk:", error);
		} finally {
			this.isLoadingMore = false;
		}
	}

	/**
	 * Sets up scroll listener for lazy loading more content
	 */
	private setupScrollListener() {
		this.scrollListener = async (e: Event) => {
			if (this.isLoadingMore) {
				return;
			}

			const container = e.target as HTMLElement;
			if (isNearBottom(container, 500)) {
				if (this.currentChunkIndex < this.markdownChunks.length) {
					await this.renderNextChunk();
				}
			}
		};

		this.contentContainer.addEventListener("scroll", this.scrollListener);
	}

	/**
	 * Opens the snapshot name modal
	 */
	private openSnapshotModal() {
		if (!this.fullMarkdown) {
			new Notice("No content to save as snapshot");
			return;
		}

		const modal = new SnapshotNameModal(this.app, (name) => {
			this.saveSnapshot(name);
		});
		modal.open();
	}

	/**
	 * Saves the current content as a snapshot
	 */
	private async saveSnapshot(name: string) {
		try {
			// Ensure the snapshots folder exists
			const snapshotsFolder = "bookSimulatorSnapshots";
			const folder =
				this.app.vault.getAbstractFileByPath(snapshotsFolder);

			if (!folder) {
				await this.app.vault.createFolder(snapshotsFolder);
			}

			// Create the snapshot file
			const fileName = `${name}.md`;
			const filePath = `${snapshotsFolder}/${fileName}`;

			// Check if file already exists
			const existingFile = this.app.vault.getAbstractFileByPath(filePath);
			if (existingFile) {
				new Notice(
					`Snapshot "${name}" already exists. Please choose a different name.`
				);
				return;
			}

			// Create the snapshot with metadata header
			const snapshotContent = this.generateSnapshotContent(name);

			await this.app.vault.create(filePath, snapshotContent);
			new Notice(`Snapshot "${name}" saved successfully!`);
			this.refreshLeftPanel();
		} catch (error) {
			console.error("Error saving snapshot:", error);
			new Notice(`Error saving snapshot: ${error.message}`);
		}
	}

	/**
	 * Opens and displays a snapshot file
	 */
	async openSnapshot(snapshotPath: string) {
		try {
			const file = this.app.vault.getAbstractFileByPath(snapshotPath);
			if (!file || !(file instanceof TFile)) {
				new Notice("Snapshot file not found");
				return;
			}

			const content = await this.app.vault.read(file as TFile);

			// Extract the actual markdown content (after the frontmatter)
			const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
			const markdownContent = content
				.replace(frontmatterRegex, "")
				.trim();

			// Set up the renderer for snapshot mode
			this.folder = {
				name: (file as TFile).basename,
				path: snapshotPath,
				children: [],
			};

			this.fullMarkdown = markdownContent;

			// Render the snapshot
			this.renderSnapshotContent();
		} catch (error) {
			console.error("Error opening snapshot:", error);
			new Notice(`Error opening snapshot: ${error.message}`);
		}
	}

	/**
	 * Renders snapshot content directly without lazy loading
	 */
	private async renderSnapshotContent() {
		this.container.empty();
		this.container.addClass("book-simulator-renderer");

		this.headerEl = this.container.createDiv({
			cls: "book-simulator-renderer-header",
		});

		this.contentContainer = this.container.createDiv({
			cls: "book-simulator-renderer-content markdown-reading-view",
		});

		// Update header for snapshot
		if (this.folder) {
			this.headerEl.textContent = this.folder.name;
		}

		// Add snapshot indicator
		this.headerEl.createDiv({
			cls: "book-simulator-snapshot-indicator",
			text: "📄 Snapshot",
		});

		// Clear content and remove old scroll listener
		this.contentContainer.empty();
		if (this.renderComponent) {
			this.renderComponent.unload();
			this.renderComponent = null;
		}

		if (this.scrollListener) {
			this.contentContainer.removeEventListener(
				"scroll",
				this.scrollListener
			);
			this.scrollListener = null;
		}

		// Show loading state
		this.isLoading = true;
		const loadingEl = this.contentContainer.createDiv({
			cls: "book-simulator-loading",
		});
		loadingEl.textContent = "Loading book content...";

		try {
			// Clear loading
			this.contentContainer.empty();
			this.isLoading = false;

			// Split markdown into chunks
			this.markdownChunks = splitMarkdownIntoChunks(
				this.fullMarkdown,
				100
			);
			this.currentChunkIndex = 0;

			console.log(
				`Lazy loading: Split markdown into ${
					this.markdownChunks.length
				} chunks (${this.fullMarkdown.split("\n").length} lines total)`
			);

			// Render first chunk
			await this.renderNextChunk();

			// Setup scroll listener for lazy loading
			this.setupScrollListener();
		} catch (error) {
			console.error("Error rendering snapshot:", error);
			this.contentContainer.empty();
			this.isLoading = false;
			const errorEl = this.contentContainer.createDiv({
				cls: "book-simulator-error",
			});
			errorEl.textContent = `Error rendering book: ${error.message}`;
		}
	}

	/**
	 * Generates the content for the snapshot file
	 */
	private generateSnapshotContent(name: string): string {
		const now = new Date();
		const timestamp = now.toISOString();
		const folderName = this.folder?.name || "Unknown";
		const folderPath = this.folder?.path || "";

		const header = `---\n  snapshot_name: ${name}\n  created_date: ${timestamp}\n  source_folder: ${folderName}\n  source_path: ${folderPath}\n---\n\n`;

		return header + this.fullMarkdown;
	}

	destroy() {
		// Remove scroll listener
		if (this.scrollListener) {
			this.contentContainer?.removeEventListener(
				"scroll",
				this.scrollListener
			);
			this.scrollListener = null;
		}

		if (this.renderComponent) {
			this.renderComponent.unload();
			this.renderComponent = null;
		}
	}
}
