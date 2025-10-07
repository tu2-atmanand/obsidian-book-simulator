import { Notice } from "obsidian";
import type BookSimulatorPlugin from "src/main";
import type { InternalPlugins } from "obsidian-typings";

/**
 * Shows a notice prompting the user to reload Obsidian to apply certain changes.
 * @param plugin - TaskBoard plugin instance
 */
export async function showReloadObsidianNotice(
	plugin: BookSimulatorPlugin
): Promise<void> {
	const internalPlugins: InternalPlugins = plugin.app.internalPlugins;

	const reloadObsidianNotice = new Notice(
		createFragment((f) => {
			f.createDiv("reloadObsidianNotice", (el) => {
				el.createEl("p", {
					text: "Reload Obsidian for changes to take effect.",
				});
				el.createEl("button", {
					text: "Reload Now",
					cls: "reloadNowButton",
					onclick: () => {
						internalPlugins.app.commands.executeCommandById(
							"app:reload"
						);
						plugin.app.commands.executeCommandById("app:reload");
						el.hide();
					},
				});
				el.createEl("button", {
					text: "Ignore",
					cls: "ignoreButton",
					onclick: () => {
						el.hide();
					},
				});
			});
		}),
		0
	);

	reloadObsidianNotice.messageEl.onClickEvent((e) => {
		if (!(e.target instanceof HTMLButtonElement)) {
			e.stopPropagation();
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	});
}
