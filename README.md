# Book Simulator

A plugin for Obsidian (https://obsidian.md) that simulates a book view by combining multiple notes from a folder into a continuous reading experience. It uses the hierarchy of the folder to structure the chapters and sections of the book.

## Features

- **Vault Explorer**: Browse your vault's folder structure in a dedicated sidebar (20% of the view)
- **Book Renderer**: View combined notes from a selected folder as a continuous book (80% of the view)
- **Hierarchical Structure**: Notes are organized hierarchically with proper heading adjustments
- **Markdown Rendering**: Uses Obsidian's native MarkdownRenderer for proper content display
- **Easy Access**: Open via ribbon icon, command palette, or file menu

## How to Use

1. **Open Book Simulator**: Click the book icon in the left ribbon, or use the command palette (Ctrl/Cmd+P) and search for "Open Book Simulator"
2. **Select a Folder**: Click on any folder in the explorer panel on the left
3. **Read**: The right panel will display all notes from the selected folder (and its subfolders) combined into a single continuous book view

## Installation

### From Obsidian Community Plugins (once released)

1. Open Settings → Community plugins
2. Search for "Book Simulator"
3. Click Install, then Enable

### Manual Installation

1. Download `main.js`, `styles.css`, and `manifest.json` from the latest release
2. Create a folder named `obsidian-book-simulator` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into this folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community plugins

## Development

This project uses TypeScript and esbuild for bundling.

### Setup

```bash
npm install
```

### Development Build (with watch mode)

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Project Structure

```
src/
  main.ts                          # Plugin entry point
  types.ts                         # TypeScript interfaces
  views/
    bookSimulatorView.ts          # Main view implementation
  components/
    virtualFileExplorer.ts        # File explorer component
    bookRenderer.ts               # Book rendering component
  utils/
    fileTreeUtils.ts              # File tree building utilities
    hierarchyGenerator.ts         # Markdown hierarchy generation
```

## How It Works

1. The plugin creates a custom ItemView that splits into two panels
2. The left panel (20%) shows a virtual file explorer of your vault
3. When you select a folder, the right panel (80%) generates a combined markdown document
4. All markdown files in the folder (and subfolders) are combined with proper heading adjustments
5. The combined content is rendered using Obsidian's MarkdownRenderer API

## License

GPL v3

## Support

If you find this plugin helpful, consider supporting its development by making a donation!

