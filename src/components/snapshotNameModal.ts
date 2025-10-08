import { App, Modal, Setting } from "obsidian";

/**
 * Modal for entering snapshot name
 */
export class SnapshotNameModal extends Modal {
	private onSubmit: (name: string) => void;
	private snapshotName: string;

	constructor(app: App, onSubmit: (name: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
		
		// Generate default name with current date-time
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		
		this.snapshotName = `${year}-${month}-${day}_${hours}:${minutes}`;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Save Book Snapshot" });

		new Setting(contentEl)
			.setName("Snapshot name")
			.setDesc("Enter a name for this snapshot (leave default for date-time)")
			.addText((text) => {
				text.setPlaceholder("Enter snapshot name...")
					.setValue(this.snapshotName)
					.onChange((value) => {
						this.snapshotName = value || this.snapshotName;
					});
				
				// Focus the input and select all text
				text.inputEl.focus();
				text.inputEl.select();
				
				// Handle Enter key
				text.inputEl.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						this.submit();
					}
				});
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Save")
					.setCta()
					.onClick(() => {
						this.submit();
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Cancel")
					.onClick(() => {
						this.close();
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private submit() {
		if (this.snapshotName.trim()) {
			this.onSubmit(this.snapshotName.trim());
			this.close();
		}
	}
}
