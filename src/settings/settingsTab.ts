// ./srcsettings/settings.ts

import { App, PluginSettingTab, Setting } from "obsidian";
import type BookSimulatorPlugin from "src/main";
import { showReloadObsidianNotice } from "src/utils/generalUtils";

export class BookSimulatorSettingsTab extends PluginSettingTab {
	plugin: BookSimulatorPlugin;
	private reloadNoticeAlreadyShown = false;

	constructor(app: App, plugin: BookSimulatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private openReloadNoticeIfNeeded() {
		if (!this.reloadNoticeAlreadyShown) {
			sleep(100).then(() => {
				showReloadObsidianNotice(this.plugin);
				this.reloadNoticeAlreadyShown = true;
			});
			return;
		}
		return;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Click folder to open composer view")
			.setDesc(
				"Open the book composer view on folder click from the default file explorer."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openViewOnFolderClick)
					.onChange(async (value) => {
						this.plugin.settings.openViewOnFolderClick = value;
						await this.plugin.saveSettings();
						this.openReloadNoticeIfNeeded();
					})
			);

		// new Setting(containerEl)
		// 	.setName("Folder and note name visibility")
		// 	.setDesc(
		// 		"Select 'show both' to see both the folder name and note names as the header. Select 'only show folder name' to see only the folder name as header and note name wont be rendered. Select 'only show note name' to dont render folder name as header but render note name. Select 'hide both' to dont render folder and file name, but if you have a 'folder-note' inside your folder, than the first heading from that file will be taken as the folder name to create the heading."
		// 	)
		// 	.addDropdown((dropdown) =>
		// 		dropdown
		// 			.addOptions({
		// 				[cardSectionsVisibilityOptions.showDescriptionOnly]: t(
		// 					"show-description-only"
		// 				),
		// 				[cardSectionsVisibilityOptions.showSubTasksOnly]:
		// 					t("show-subtasks-only"),
		// 				[cardSectionsVisibilityOptions.showBoth]:
		// 					t("show-both"),
		// 				[cardSectionsVisibilityOptions.hideBoth]:
		// 					t("hide-both"),
		// 			})
		// 			.setValue(cardSectionsVisibility)
		// 			.onChange(async (value) => {
		// 				this.globalSettings!.cardSectionsVisibility = value;
		// 				await this.saveSettings();
		// 			})
		// 	);
	}
}
