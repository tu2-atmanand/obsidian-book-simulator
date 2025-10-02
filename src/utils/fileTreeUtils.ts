import { App, TFolder } from "obsidian";
import { FileTreeItem, FolderInfo } from "../types";

/**
 * Builds a file tree from the vault root
 */
export function buildFileTree(app: App): FileTreeItem | null {
	const root = app.vault.getRoot();
	if (!root) {
		return null;
	}
	return buildTreeRecursive(root);
}

/**
 * Recursively builds a tree structure from a folder
 */
function buildTreeRecursive(folder: TFolder): FileTreeItem {
	const children: FileTreeItem[] = [];

	console.log("Root :", folder);
	if (folder.children && Array.isArray(folder.children)) {
		console.log("This is running....");
		const sortedChildren = [...folder.children].sort((a, b) => {
			const aIsFolder = a instanceof TFolder;
			const bIsFolder = b instanceof TFolder;

			// Folders first
			if (aIsFolder && !bIsFolder) return -1;
			if (!aIsFolder && bIsFolder) return 1;

			// Then alphabetically
			return a.name.localeCompare(b.name);
		});

		for (const child of sortedChildren) {
			if (child instanceof TFolder) {
				children.push(buildTreeRecursive(child));
			} else {
				children.push({
					name: child.name,
					path: child.path,
				});
			}
		}
	}

	return {
		name: folder.name || "Vault",
		path: folder.path || "/",
		children,
	};
}

/**
 * Collects all folders from the vault into a flat array
 */
export function collectAllFolders(app: App): FolderInfo[] {
	const folders: FolderInfo[] = [];
	const root = app.vault.getRoot();

	if (!root) {
		return folders;
	}

	collectFoldersRecursive(root, folders);
	return folders;
}

/**
 * Recursively collects folder information
 */
function collectFoldersRecursive(folder: TFolder, folders: FolderInfo[]): void {
	folders.push({
		name: folder.name || "Vault",
		path: folder.path || "/",
	});

	if (folder.children && Array.isArray(folder.children)) {
		for (const child of folder.children) {
			if (child instanceof TFolder) {
				collectFoldersRecursive(child, folders);
			}
		}
	}
}

/**
 * Finds a folder in the file tree by path
 */
export function findFolderByPath(
	tree: FileTreeItem | null,
	targetPath: string
): FileTreeItem | null {
	if (!tree || !targetPath) return null;
	if (tree.path === targetPath) return tree;

	if (tree.children && Array.isArray(tree.children)) {
		for (const child of tree.children) {
			if (child.children) {
				const found = findFolderByPath(child, targetPath);
				if (found) return found;
			}
		}
	}

	return null;
}

/**
 * Gets all markdown files from a folder recursively
 */
export function getMarkdownFiles(folder: FileTreeItem): string[] {
	const files: string[] = [];

	if (!folder.children || !Array.isArray(folder.children)) {
		return files;
	}

	for (const child of folder.children) {
		if (child.children) {
			// It's a folder, recurse
			files.push(...getMarkdownFiles(child));
		} else if (child.name.endsWith(".md")) {
			// It's a markdown file
			files.push(child.path);
		}
	}

	return files;
}

/**
 * Processes note content and adjusts heading levels
 */
export function processNoteContent(content: string, baseLevel: number): string {
	if (!content || !content.trim()) return "";

	let processedContent = "";
	const lines = content.split("\n");

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (trimmedLine.startsWith("#")) {
			const match = trimmedLine.match(/^#+/);
			if (match) {
				const originalLevel = match[0].length;
				const newLevel = baseLevel + originalLevel - 1;
				const headingText = trimmedLine.replace(/^#+\s*/, "");
				const newHeaderPrefix = "#".repeat(Math.min(newLevel, 6));
				processedContent += `${newHeaderPrefix} ${headingText}\n`;
			} else {
				processedContent += line + "\n";
			}
		} else {
			processedContent += line + "\n";
		}
	}

	return processedContent + "\n";
}
