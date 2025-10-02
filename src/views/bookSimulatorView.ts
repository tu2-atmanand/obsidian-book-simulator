import { ItemView, WorkspaceLeaf } from 'obsidian';
import { VIEW_TYPE_BOOK_SIMULATOR, FileTreeItem } from '../types';
import { VirtualFileExplorer } from '../components/virtualFileExplorer';
import { BookRenderer } from '../components/bookRenderer';
import { buildFileTree } from '../utils/fileTreeUtils';

/**
 * Custom ItemView for the Book Simulator
 */
export class BookSimulatorView extends ItemView {
	private fileExplorer: VirtualFileExplorer | null = null;
	private bookRenderer: BookRenderer | null = null;
	private selectedFolder: FileTreeItem | null = null;
	
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}
	
	getViewType(): string {
		return VIEW_TYPE_BOOK_SIMULATOR;
	}
	
	getDisplayText(): string {
		return 'Book Simulator';
	}
	
	getIcon(): string {
		return 'book-open';
	}
	
	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('book-simulator-view');
		
		// Create main layout
		const mainContainer = container.createDiv({
			cls: 'book-simulator-main'
		});
		
		// Left sidebar - File Explorer (20% width)
		const explorerContainer = mainContainer.createDiv({
			cls: 'book-simulator-explorer-panel'
		});
		
		// Right side - Book Renderer (80% width)
		const rendererContainer = mainContainer.createDiv({
			cls: 'book-simulator-renderer-panel'
		});
		
		// Initialize components
		this.fileExplorer = new VirtualFileExplorer(
			explorerContainer,
			(folder) => this.handleFolderSelect(folder)
		);
		
		this.bookRenderer = new BookRenderer(rendererContainer, this.app);
		
		// Build and set file tree
		const fileTree = buildFileTree(this.app);
		if (fileTree) {
			this.fileExplorer.setFileTree(fileTree);
			// Select root by default
			// this.handleFolderSelect(fileTree);
		}
	}
	
	async onClose(): Promise<void> {
		if (this.bookRenderer) {
			this.bookRenderer.destroy();
		}
	}
	
	private handleFolderSelect(folder: FileTreeItem) {
		this.selectedFolder = folder;
		
		if (this.fileExplorer) {
			this.fileExplorer.setSelectedPath(folder.path);
		}
		
		if (this.bookRenderer) {
			this.bookRenderer.setFolder(folder);
		}
	}
}
