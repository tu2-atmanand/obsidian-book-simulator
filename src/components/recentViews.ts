import { FileTreeItem } from "../types";

/**
 * Virtual file explorer component using vanilla DOM
 */
export class RecentViewsExplorer {
	private container: HTMLElement;
	private fileTree: FileTreeItem | null = null;
	private onFolderSelect: (folder: FileTreeItem) => void;
	private selectedPath = "";
	private expandedPaths = new Set<string>(["/"]); // Root is expanded by default

	constructor(
		container: HTMLElement,
		onFolderSelect: (folder: FileTreeItem) => void
	) {
		this.container = container;
		this.onFolderSelect = onFolderSelect;
		this.render();
	}

	setFileTree(fileTree: FileTreeItem | null) {
		this.fileTree = fileTree;
		this.render();
	}

	setSelectedPath(path: string) {
		this.selectedPath = path;
		this.render();
	}

	private toggleExpanded(path: string) {
		if (this.expandedPaths.has(path)) {
			this.expandedPaths.delete(path);
		} else {
			this.expandedPaths.add(path);
		}
		this.render();
	}

	private render() {
		this.container.empty();
		this.container.addClass("book-simulator-recent-views");

		const header = this.container.createDiv({
			cls: "book-simulator-explorer-header",
		});
		header.textContent = "Recent Views";

		const contentEl = this.container.createDiv({
			cls: "book-simulator-explorer-content",
		});

		if (!this.fileTree) {
			contentEl.createDiv({
				text: "Under Developement",
				cls: "book-simulator-loading",
			});
			return;
		}

		// this.renderFileTreeItem(contentEl, this.fileTree, 0);
	}

	private renderFileTreeItem(
		parentEl: HTMLElement,
		item: FileTreeItem,
		depth: number
	) {
		// const itemContainer = parentEl.createDiv({
		// 	cls: "book-simulator-recent-item-container",
		// });
	}
}
