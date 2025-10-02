import { FileTreeItem } from "../types";

/**
 * Virtual file explorer component using vanilla DOM
 */
export class VirtualFileExplorer {
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
		this.container.addClass("book-simulator-explorer");

		const header = this.container.createDiv({
			cls: "book-simulator-explorer-header",
		});
		header.textContent = "Vault Explorer";

		const contentEl = this.container.createDiv({
			cls: "book-simulator-explorer-content",
		});

		if (!this.fileTree) {
			contentEl.createDiv({
				text: "Loading files...",
				cls: "book-simulator-loading",
			});
			return;
		}

		this.renderFileTreeItem(contentEl, this.fileTree, 0);
	}

	private renderFileTreeItem(
		parentEl: HTMLElement,
		item: FileTreeItem,
		depth: number
	) {
		const itemContainer = parentEl.createDiv({
			cls: "book-simulator-tree-item-container",
		});

		const isFolder = !!item.children;
		const isSelected = this.selectedPath === item.path;
		const isRoot = depth === 0;
		const isExpanded = this.expandedPaths.has(item.path);

		const itemEl = itemContainer.createDiv({
			cls: "book-simulator-tree-item",
		});
		itemEl.style.paddingLeft = `${depth * 16}px`;

		if (isSelected) {
			itemEl.addClass("is-selected");
		}

		if (isFolder) {
			itemEl.addClass("is-folder");
		}

		// Add expand/collapse icon for folders
		if (isFolder && item.children && item.children.length > 0) {
			const expandIcon = itemEl.createSpan({
				cls: "book-simulator-tree-expand-icon",
			});
			expandIcon.textContent = isExpanded ? "▼" : "▶";
			expandIcon.style.cursor = "pointer";
			expandIcon.style.marginRight = "4px";
			expandIcon.addEventListener("click", (e) => {
				e.stopPropagation();
				this.toggleExpanded(item.path);
			});
		} else if (isFolder) {
			// Empty folder - add spacing
			const spacer = itemEl.createSpan({
				cls: "book-simulator-tree-spacer",
			});
			spacer.style.marginRight = "16px";
		}

		const icon = itemEl.createSpan({
			cls: "book-simulator-tree-icon",
		});

		if (isFolder) {
			icon.textContent = isRoot ? "📂" : "📁";
		} else {
			icon.textContent = "📄";
		}

		const name = itemEl.createSpan({
			cls: "book-simulator-tree-name",
		});
		name.textContent = item.path === "/" ? "Vault" : item.name;

		if (isFolder) {
			itemEl.style.cursor = "pointer";
			itemEl.addEventListener("click", (e) => {
				if (item.path === "/") return;

				e.stopPropagation();
				this.onFolderSelect(item);
			});
		}

		// Render children for folders only if expanded
		if (
			isFolder &&
			item.children &&
			item.children.length > 0 &&
			isExpanded
		) {
			const childrenContainer = itemContainer.createDiv({
				cls: "book-simulator-tree-children",
			});

			for (const child of item.children) {
				this.renderFileTreeItem(childrenContainer, child, depth + 1);
			}
		}
	}
}
