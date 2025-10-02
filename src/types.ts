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
}

export const DEFAULT_SETTINGS: BookSimulatorSettings = {
	lastSelectedFolder: '/'
};

export const VIEW_TYPE_BOOK_SIMULATOR = 'book-simulator-view';
