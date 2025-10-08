export interface FileTreeItem {
	name: string;
	path: string;
	children?: FileTreeItem[];
}

export interface FolderInfo {
	name: string;
	path: string;
}

export enum folderFileNameConfigs {
	showBoth = 1,
	onlyShowFolderName = 2,
	onlyShowNoteName = 3,
	hideBoth = 4,
}

export interface BookSimulatorSettings {
	openViewOnFolderClick: boolean;
	history: {
		lastSelectedFolder: string;
		leftPanelState: boolean;
	};
	folderFileName: folderFileNameConfigs;
}

export const DEFAULT_SETTINGS: BookSimulatorSettings = {
	openViewOnFolderClick: false,
	history: {
		lastSelectedFolder: "",
		leftPanelState: true,
	},
	folderFileName: folderFileNameConfigs.showBoth,
};

export const VIEW_TYPE_BOOK_SIMULATOR = "book-simulator-view";
