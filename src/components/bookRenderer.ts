import { App, Component, MarkdownRenderer } from "obsidian";
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

	constructor(container: HTMLElement, app: App) {
		this.container = container;
		this.app = app;
		console.log("Folder received for rendering :", this.folder);
		this.render();
	}

	setFolder(folder: FileTreeItem | null) {
		this.folder = folder;
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
