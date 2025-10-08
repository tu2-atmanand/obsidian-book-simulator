import { App, TFile } from "obsidian";
import { FileTreeItem } from "../types";
import { processNoteContent } from "./fileTreeUtils";

/**
 * Generates a hierarchical markdown structure from a folder
 */
export async function generateHierarchyMarkdown(
	app: App,
	folder: FileTreeItem,
	headerLevel = 1
): Promise<string> {
	try {
		let markdown = "";

		const headerPrefix = "#".repeat(headerLevel);
		const folderName = folder.path === "/" ? "Vault" : folder.name;
		markdown += `${headerPrefix} ${folderName}\n\n`;

		if (folder.children && folder.children.length > 0) {
			const files = folder.children.filter((child) => !child.children);
			const folders = folder.children.filter((child) => child.children);

			// Process files first
			for (const file of files) {
				if (file.name && file.name.endsWith(".md")) {
					const fileHeaderPrefix = "#".repeat(headerLevel + 1);
					const fileName = file.name.replace(".md", "");
					markdown += `${fileHeaderPrefix} ${fileName}\n\n`;

					try {
						const fileObj = app.vault.getAbstractFileByPath(
							file.path
						);
						if (fileObj && fileObj instanceof TFile) {
							const content = await app.vault.cachedRead(fileObj);
							const processedContent = processNoteContent(
								content,
								headerLevel + 2
							);
							markdown += processedContent;
						}
					} catch (error) {
						console.warn(
							`Could not read file: ${file.path}`,
							error
						);
						markdown += `*Could not load content for ${fileName}*\n\n`;
					}
				}
			}

			// Process subfolders recursively
			for (const subfolder of folders) {
				const subHierarchy = await generateHierarchyMarkdown(
					app,
					subfolder,
					headerLevel + 1
				);
				markdown += subHierarchy;
			}
		}

		return markdown;
	} catch (error) {
		console.error("Error generating hierarchy:", error);
		return `Error generating hierarchy: ${error.message}`;
	}
}
