export interface FileTreeItem {
	name: string;
	path: string;
	children?: FileTreeItem[];
}

export interface FolderInfo {
	name: string;
	path: string;
}

export interface BookSimulatorSettings {
	lastSelectedFolder: string;
	openViewOnFolderClick: boolean;
}

export const DEFAULT_SETTINGS: BookSimulatorSettings = {
	lastSelectedFolder: "",
	openViewOnFolderClick: false,
};

export const VIEW_TYPE_BOOK_SIMULATOR = "book-simulator-view";
