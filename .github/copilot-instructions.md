# Obsidian Book Simulator Plugin - AI Coding Instructions

## Architecture Overview

This is an **Obsidian Community Plugin** that creates a custom ItemView for rendering folder contents as a continuous book. The plugin follows a clean component-based architecture:

- **`main.ts`**: Minimal plugin lifecycle management (onload, commands, ribbon icons)
- **`views/bookSimulatorView.ts`**: Core ItemView that manages the split-panel layout (20% explorer + 80% renderer)
- **`components/`**: Reusable UI components using vanilla DOM (no frameworks)
- **`utils/`**: Business logic for file tree processing and markdown generation

## Key Development Patterns

### Component Communication Pattern
Components communicate via callback functions passed in constructors:
```typescript
// Parent passes callback to child component
this.fileExplorer = new VirtualFileExplorer(
    explorerContainer,
    (folder) => this.handleFolderSelect(folder) // Callback for selection events
);
```

### Obsidian API Integration
- Use `MarkdownRenderer.render()` for rendering markdown content with proper Obsidian styling
- Create `Component` instances for proper lifecycle management: `component.load()` and `component.unload()`
- Access vault files via `app.vault.getAbstractFileByPath()` and cast to `TFile` for reading

### File Tree Processing
The plugin builds its own file tree representation (`FileTreeItem`) from Obsidian's vault structure:
- `buildFileTree()` creates the tree from vault root
- Folders are sorted first, then files alphabetically
- Tree navigation uses path-based selection (`setSelectedPath()`)

## Critical Development Workflows

### Development Setup
```bash
npm install          # Install dependencies
npm run dev          # Watch mode with inline sourcemaps
npm run build        # Production build (minified, no sourcemaps)
```

### Testing in Obsidian
1. Copy `main.js`, `manifest.json`, `styles.css` to `<vault>/.obsidian/plugins/obsidian-book-simulator/`
2. Reload Obsidian (Ctrl+R)
3. Enable plugin in Settings → Community plugins

### Build System
- **esbuild** for bundling with external Obsidian APIs
- TypeScript compilation with strict mode
- All dependencies bundled into single `main.js` (except Obsidian APIs)

## Project-Specific Conventions

### Component Structure
- Components take container element + callback functions in constructor
- Use `container.empty()` before re-rendering content
- Add CSS classes with `book-simulator-` prefix for styling
- Always call `destroy()` method for cleanup (especially MarkdownRenderer components)

### Panel Toggle Pattern
Views can implement collapsible panels with smooth animations:
- Store panel container as class property for manipulation
- Use CSS animations with `expanding`/`collapsing`/`collapsed` classes
- Implement toggle methods with setTimeout for proper class management
- Update button tooltips and states for better UX

### View Update Pattern
When external folder selection changes (e.g., user clicks folder in Obsidian explorer):
1. Plugin updates `selectedFolder` property
2. Plugin calls `updateExistingViews()` to notify all open BookSimulatorView instances
3. Views call `updateSelectedFolder()` method which converts TFolder to FileTreeItem
4. BookRenderer refreshes content automatically via `setFolder()` and `renderBook()`

### Type Conversion Pattern
- `TFolder` (Obsidian native) ↔ `FileTreeItem` (plugin internal)
- Conversion happens in constructors and setters to maintain clean interfaces
- Always handle both types in component methods that accept folder parameters

### Error Handling Pattern
```typescript
try {
    // Async operation
} catch (error) {
    console.error('Context-specific error message:', error);
    // Display user-friendly error in UI
    errorEl.textContent = `Error: ${error.message}`;
}
```

### Markdown Processing
- Use `processNoteContent()` to adjust heading levels when combining files
- Headers are automatically adjusted based on folder hierarchy depth
- Files processed recursively: files first, then subfolders

## Integration Points

### Obsidian APIs Used
- `ItemView` for custom views
- `MarkdownRenderer` for content rendering
- `TFile`/`TFolder` for vault access
- `WorkspaceLeaf` for view management
- `Component` for lifecycle management

### CSS Architecture
- Uses Obsidian's existing classes (e.g., `markdown-reading-view`)
- Custom classes follow `book-simulator-*` naming convention
- Split-panel layout implemented via CSS Grid/Flexbox

### File System Integration
- Reads all `.md` files from selected folder and subfolders
- Maintains folder structure in generated book content
- Handles missing files gracefully with error messages

## Common Tasks

### Adding New Components
1. Create in `src/components/` with constructor taking `(container: HTMLElement, ...callbacks)`
2. Implement `destroy()` method for cleanup
3. Use vanilla DOM with Obsidian's `createDiv()`, `createSpan()` methods

### Modifying File Tree Behavior
- Edit `fileTreeUtils.ts` for tree building logic
- Modify `virtualFileExplorer.ts` for tree rendering
- Selection state managed via path strings, not object references

### Updating Markdown Generation
- Modify `hierarchyGenerator.ts` for content combination logic
- Adjust heading levels in `processNoteContent()` function
- Handle special markdown elements (links, embeds) as needed

## Debug Tips

- Check browser DevTools console for component errors
- Use `console.log()` in callbacks to trace component communication
- Verify file paths match vault structure exactly (case-sensitive)
- Test with various folder structures (empty folders, nested files, special characters)
