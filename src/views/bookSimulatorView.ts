import { ItemView, TFolder, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_BOOK_SIMULATOR, FileTreeItem } from "../types";
import { VirtualFileExplorer } from "../components/virtualFileExplorer";
import { BookRenderer } from "../components/bookRenderer";
// import { buildFileTree } from "../utils/fileTreeUtils";
import type BookSimulatorPlugin from "src/main";
import { RecentViewsExplorer } from "src/components/recentViews";

/**
 * Custom ItemView for the Book Simulator
 */
export class BookSimulatorView extends ItemView {
	private plugin: BookSimulatorPlugin;
	private fileExplorer: VirtualFileExplorer | null = null;
	private bookRenderer: BookRenderer | null = null;
	private selectedFolder: FileTreeItem | TFolder | null = null;
	private recentViewsContainer: HTMLElement | null = null;
	private isRecentViewsPanelVisible = true;
	private toggleButton: HTMLElement | null = null;

	constructor(
		plugin: BookSimulatorPlugin,
		leaf: WorkspaceLeaf,
		selectedFolder: TFolder | FileTreeItem
	) {
		super(leaf);
		this.plugin = plugin;
		this.selectedFolder = selectedFolder;
	}

	getViewType(): string {
		return VIEW_TYPE_BOOK_SIMULATOR;
	}

	getDisplayText(): string {
		return "Book Simulator";
	}

	getIcon(): string {
		return "book-open";
	}

	async onOpen(): Promise<void> {
		this.toggleButton = this.addAction("panel-left", "Toggle recent view panel", () => {
			this.toggleRecentViewsPanel();
		});
		this.toggleButton.addClass("recent-views-panel-toggle-btn");

		const container = this.containerEl.children[1];
		container.empty();
		container.addClass("book-simulator-view");

		// Create main layout
		const mainContainer = container.createDiv({
			cls: "book-simulator-main",
		});

		// Left sidebar - Recent Views (20% width)
		// const explorerContainer = mainContainer.createDiv({
		// 	cls: "book-simulator-explorer-panel",
		// });
		this.recentViewsContainer = mainContainer.createDiv({
			cls: "book-simulator-recent-views-panel",
		});

		// Right side - Book Renderer (80% width)
		const rendererContainer = mainContainer.createDiv({
			cls: "book-simulator-renderer-panel",
		});

		// Initialize components
		// this.fileExplorer = new VirtualFileExplorer(
		// 	explorerContainer,
		// 	(folder) => this.handleFolderSelect(folder)
		// );

		new RecentViewsExplorer(this.recentViewsContainer, (recentView) => {
			console.log("Recent view clicked.");
		});

		this.bookRenderer = new BookRenderer(
			rendererContainer,
			this.app,
			this.selectedFolder
		);

		// Build and set file tree
		// const fileTree = buildFileTree(this.app);
		// if (fileTree) {
		// 	this.fileExplorer.setFileTree(fileTree);
		// 	// Select root by default
		// 	// this.handleFolderSelect(fileTree);
		// }
	}

	async onClose(): Promise<void> {
		if (this.bookRenderer) {
			this.bookRenderer.destroy();
		}
	}

	private handleFolderSelect(folder: FileTreeItem) {
		this.selectedFolder = folder;

		if (this.fileExplorer) {
			this.fileExplorer.setSelectedPath(folder.path);
		}

		if (this.bookRenderer) {
			this.bookRenderer.setFolder(folder);
		}
	}

	/**
	 * Update the selected folder from external source (e.g., when user clicks folder in Obsidian)
	 */
	public updateSelectedFolder(folder: TFolder | FileTreeItem | null) {
		if (!folder) return;

		// Convert TFolder to FileTreeItem if needed
		let folderItem: FileTreeItem;
		if ("children" in folder && Array.isArray(folder.children)) {
			// It's already a FileTreeItem
			folderItem = folder as FileTreeItem;
		} else {
			// It's a TFolder, convert to FileTreeItem
			folderItem = {
				name: folder.name,
				path: folder.path,
				children: [], // We don't need the full tree structure for rendering
			};
		}

		this.selectedFolder = folderItem;

		if (this.bookRenderer) {
			this.bookRenderer.setFolder(folderItem);
		}
	}

	/**
	 * Toggle the visibility of the recent views panel with smooth animation
	 */
	private toggleRecentViewsPanel() {
		if (!this.recentViewsContainer) return;

		this.isRecentViewsPanelVisible = !this.isRecentViewsPanelVisible;

		// Update button tooltip
		if (this.toggleButton) {
			this.toggleButton.setAttribute(
				"aria-label", 
				this.isRecentViewsPanelVisible ? "Hide recent view panel" : "Show recent view panel"
			);
		}

		if (this.isRecentViewsPanelVisible) {
			// Show the panel
			this.recentViewsContainer.removeClass("collapsed");
			this.recentViewsContainer.addClass("expanding");
			
			// Remove expanding class after animation completes
			setTimeout(() => {
				this.recentViewsContainer?.removeClass("expanding");
			}, 300);
		} else {
			// Hide the panel
			this.recentViewsContainer.removeClass("expanding");
			this.recentViewsContainer.addClass("collapsing");
			
			// Add collapsed class after animation completes
			setTimeout(() => {
				this.recentViewsContainer?.removeClass("collapsing");
				this.recentViewsContainer?.addClass("collapsed");
			}, 300);
		}
	}
}
