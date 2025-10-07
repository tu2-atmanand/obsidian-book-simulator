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
	}
}
