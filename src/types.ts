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

export enum viewTypeConfigs {
	infiniteView = 1,
	pageView = 2,
}

export enum paginatedViewTypeConfigs {
	contineousScroll = 1,
	singlePage = 2,
	twoPages = 3,
}

export interface BookSimulatorSettings {
	openViewOnFolderClick: boolean;
	history: {
		lastSelectedFolder: string;
		leftPanelState: boolean;
		viewType: viewTypeConfigs;
		paginatedViewType: paginatedViewTypeConfigs;
		showHeaderFooter: boolean;
	};
	folderFileName: folderFileNameConfigs;
}

export const DEFAULT_SETTINGS: BookSimulatorSettings = {
	openViewOnFolderClick: false,
	history: {
		lastSelectedFolder: "",
		leftPanelState: true,
		viewType: viewTypeConfigs.infiniteView,
		paginatedViewType: paginatedViewTypeConfigs.contineousScroll,
		showHeaderFooter: true,
	},
	folderFileName: folderFileNameConfigs.showBoth,
};

export const VIEW_TYPE_BOOK_SIMULATOR = "book-simulator-view";
