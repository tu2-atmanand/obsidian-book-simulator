import { App, Component, MarkdownRenderer, Notice, TFolder } from "obsidian";
import { FileTreeItem } from "../types";
import { generateHierarchyMarkdown } from "../utils/hierarchyGenerator";

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
			// Generate markdown
			const markdown = await generateHierarchyMarkdown(
				this.app,
				this.folder
			);

			// Clear loading
			this.contentContainer.empty();
			this.isLoading = false;

			// Render markdown using Obsidian's API
			this.renderComponent = new Component();
			this.renderComponent.load();

			await MarkdownRenderer.render(
				this.app,
				markdown,
				this.contentContainer,
				"",
				this.renderComponent
			);
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

	destroy() {
		if (this.renderComponent) {
			this.renderComponent.unload();
			this.renderComponent = null;
		}
	}
}
