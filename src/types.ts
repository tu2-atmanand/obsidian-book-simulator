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
	openViewOnFolderClick: boolean;
	history: {
		lastSelectedFolder: string;
		leftPanelState: boolean;
	};
}

export const DEFAULT_SETTINGS: BookSimulatorSettings = {
	openViewOnFolderClick: false,
	history: {
		lastSelectedFolder: "",
		leftPanelState: true,
	},
};

export const VIEW_TYPE_BOOK_SIMULATOR = "book-simulator-view";
