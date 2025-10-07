import { Plugin, WorkspaceLeaf } from 'obsidian';
import { BookSimulatorView } from './views/bookSimulatorView';
import { VIEW_TYPE_BOOK_SIMULATOR, BookSimulatorSettings, DEFAULT_SETTINGS } from './types';

export default class BookSimulatorPlugin extends Plugin {
	settings: BookSimulatorSettings;

	async onload() {
		await this.loadSettings();

		// Register the custom view
		this.registerView(
			VIEW_TYPE_BOOK_SIMULATOR,
			(leaf) => new BookSimulatorView(leaf)
		);

		// Add ribbon icon to open the view
		this.addRibbonIcon('book-open', 'Open Book Simulator', () => {
			this.activateView();
		});

		// Add command to open the view
		this.addCommand({
			id: 'open-book-simulator',
			name: 'Open book composer view',
			callback: () => {
				this.activateView();
			}
		});

		// Add command to the file menu
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle('Open in Book Simulator')
						.setIcon('book-open')
						.onClick(() => {
							this.activateView();
						});
				});
			})
		);
	}

	onunload() {
		// Detach all leaves of this view type
		// this.app.workspace.detachLeavesOfType(VIEW_TYPE_BOOK_SIMULATOR);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_BOOK_SIMULATOR);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			const rightLeaf = workspace.getLeaf("tab");
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({
					type: VIEW_TYPE_BOOK_SIMULATOR,
					active: true,
				});
			}
		}

		// Reveal the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// set by folder element
	private async setByFolderElement(folderItemEl: Element) {
		let folderPath = "";
		let folderName = "";

		const className = folderItemEl.className.toString();
		let folderElem = folderItemEl;
		if (className.contains("nav-folder-title-content")) {
			folderName = folderElem.getText();
			if (folderItemEl.parentElement) {
				folderElem = folderItemEl.parentElement;
				if (
					folderElem.attributes.getNamedItem("data-path")?.textContent
				)
					folderPath =
						folderElem.attributes.getNamedItem("data-path")
							?.textContent ?? "";
				// console.log("setByFolderElement : data-path : folderPth :", folderPath);
			}
		} else if (className.contains("nav-folder-title")) {
			folderPath =
				folderItemEl.attributes.getNamedItem("data-path")
					?.textContent ?? "";
			folderName = folderItemEl.lastElementChild?.getText() ?? "";
		}

		// fix the folder path
		if (folderPath.length > 0) {
			const slashLast = folderPath.lastIndexOf("/");
			const folderPathLast = folderPath.split("/").pop();
			if (folderPathLast != folderName) {
				folderPath =
					folderPath.substring(0, slashLast + 1) + folderName;
			}
		}

		return this.app.vault.getAbstractFileByPath(folderPath);
	}

	/**
	 * Update all existing BookSimulatorView instances with new folder selection
	 */
	private updateExistingViews(folder: TFolder) {
		const leaves = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_BOOK_SIMULATOR
		);
		leaves.forEach((leaf) => {
			const view = leaf.view;
			if (view instanceof BookSimulatorView) {
				view.updateSelectedFolder(folder);
			}
		});
	}

	private async registerPluginEvents() {
		if (this.settings.openViewOnFolderClick) {
			this.registerDomEvent(
				document,
				"click",
				async (evt: MouseEvent) => {
					console.log("CLick event is triggered...");

					// Event to open the Cards View on Folder click, just like Folder Notes plugin
					const elemTarget = evt.target as Element;
					const Tfolder = await this.setByFolderElement(elemTarget);

					// open it
					if (Tfolder && Tfolder instanceof TFolder) {
						this.selectedFolder = Tfolder;

						// Update existing views with new folder
						this.updateExistingViews(Tfolder);

						console.log(
							"Saved following folder in the selectedFolder :",
							this.selectedFolder
						);

						this.activateView();
					}
				}
			);
		}
	}

	public saveSelectedFolderInHistory() {
		this.settings.lastSelectedFolder = this.selectedFolder
			? this.selectedFolder?.path
			: "";
		this.saveSettings();
	}
}
