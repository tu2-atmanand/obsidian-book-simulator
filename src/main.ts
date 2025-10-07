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
}
