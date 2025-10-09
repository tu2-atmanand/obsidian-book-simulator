import { App, TFile, TFolder } from "obsidian";

interface SnapshotItem {
	name: string;
	path: string;
	file: TFile;
	lastModified: number;
}

/**
 * Component that shows recent snapshots and allows opening them
 */
export class SnapshotsExplorer {
	private container: HTMLElement;
	private app: App;
	private onSnapshotSelect: (snapshotPath: string) => void;
	private snapshots: SnapshotItem[] = [];

	constructor(
		app: App,
		container: HTMLElement,
		onSnapshotSelect: (snapshotPath: string) => void
	) {
		this.app = app;
		this.container = container;
		this.onSnapshotSelect = onSnapshotSelect;
		this.loadSnapshots();
		this.render();
	}

	/**
	 * Refresh the snapshots list
	 */
	public refreshSnapshots() {
		this.loadSnapshots();
		this.render();
	}

	/**
	 * Load snapshots from the .bookSimulatorSnapshots folder
	 */
	private async loadSnapshots() {
		console.log(
			"Entering the loadSnapshots function of SnapshotsExplorer..."
		);
		const snapshotsFolder = this.app.vault.getAbstractFileByPath(
			"bookSimulatorSnapshots"
		);
		console.log("snapshotsFolder :", snapshotsFolder);

		if (!snapshotsFolder || !(snapshotsFolder instanceof TFolder)) {
			this.snapshots = [];
			return;
		}

		const snapshotFiles = snapshotsFolder.children.filter(
			(child): child is TFile =>
				child instanceof TFile && child.extension === "md"
		);
		console.log(
			"Children in the hidden folder : ",
			snapshotsFolder,
			"\nChildrens :",
			snapshotFiles
		);

		this.snapshots = snapshotFiles
			.map((file: TFile) => ({
				name: file.basename,
				path: file.path,
				file: file,
				lastModified: file.stat.mtime,
			}))
			.sort(
				(a: SnapshotItem, b: SnapshotItem) =>
					b.lastModified - a.lastModified
			); // Sort by last modified, newest first

		console.log("loadSnapshots job done...");
	}

	private render() {
		console.log("Entering the render function of SnapshotsExplorer...");
		this.container.empty();
		this.container.addClass("book-simulator-recent-views");

		const header = this.container.createDiv({
			cls: "book-simulator-explorer-header",
		});
		header.textContent = "Snapshots";

		const contentEl = this.container.createDiv({
			cls: "book-simulator-explorer-content",
		});

		if (this.snapshots.length === 0) {
			contentEl.createDiv({
				text: "No snapshots found",
				cls: "book-simulator-empty-state",
			});
			return;
		}

		// Render each snapshot
		this.snapshots.forEach((snapshot) => {
			this.renderSnapshotItem(contentEl, snapshot);
		});
	}

	private renderSnapshotItem(parentEl: HTMLElement, snapshot: SnapshotItem) {
		const itemContainer = parentEl.createDiv({
			cls: "book-simulator-snapshot-item",
		});

		const itemNameContainer = itemContainer.createDiv({
			cls: "book-simulator-snapshot-item-name",
		});

		const iconEl = itemNameContainer.createSpan({
			cls: "book-simulator-snapshot-icon",
		});
		iconEl.textContent = "📄";

		const nameEl = itemNameContainer.createSpan({
			cls: "book-simulator-snapshot-name",
		});
		nameEl.textContent = snapshot.name;

		const dateEl = itemContainer.createDiv({
			cls: "book-simulator-snapshot-date",
		});
		const date = new Date(snapshot.lastModified);
		dateEl.textContent =
			date.toLocaleDateString() +
			" " +
			date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

		// Click handler
		itemContainer.addEventListener("click", () => {
			this.onSnapshotSelect(snapshot.path);
		});

		// Hover effect
		itemContainer.addEventListener("mouseenter", () => {
			itemContainer.addClass("is-hovered");
		});

		itemContainer.addEventListener("mouseleave", () => {
			itemContainer.removeClass("is-hovered");
		});
	}
}
