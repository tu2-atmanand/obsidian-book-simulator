import { App, Component, MarkdownRenderer, Notice, TFolder } from "obsidian";
import { FileTreeItem } from "../types";
import { generateHierarchyMarkdown } from "../utils/hierarchyGenerator";
import { splitMarkdownIntoChunks, isNearBottom } from "../utils/lazyLoadUtils";

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
	private scrollListener: ((e: Event) => void) | null = null;

	constructor(
		container: HTMLElement,
		app: App,
		selectedFolder: FileTreeItem | TFolder | null
	) {
		this.container = container;
		this.app = app;

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
				new Notice("Feature under development.");
			});

		// Clear content
		this.contentContainer.empty();

		if (this.renderComponent) {
			this.renderComponent.unload();
			this.renderComponent = null;
		}
		
		// Remove old scroll listener if exists
		if (this.scrollListener) {
			this.contentContainer.removeEventListener('scroll', this.scrollListener);
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
			this.markdownChunks = splitMarkdownIntoChunks(this.fullMarkdown, 100);
			this.currentChunkIndex = 0;
			
			console.log(`Lazy loading: Split markdown into ${this.markdownChunks.length} chunks (${this.fullMarkdown.split('\n').length} lines total)`);

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
		if (this.currentChunkIndex >= this.markdownChunks.length || this.isLoadingMore) {
			return;
		}

		this.isLoadingMore = true;
		console.log(`Lazy loading: Rendering chunk ${this.currentChunkIndex + 1}/${this.markdownChunks.length}`);

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

		this.contentContainer.addEventListener('scroll', this.scrollListener);
	}

	destroy() {
		// Remove scroll listener
		if (this.scrollListener) {
			this.contentContainer?.removeEventListener('scroll', this.scrollListener);
			this.scrollListener = null;
		}
		
		if (this.renderComponent) {
			this.renderComponent.unload();
			this.renderComponent = null;
		}
	}
}
