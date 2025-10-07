/**
 * Utility functions for lazy loading markdown content
 */

/**
 * Splits markdown content into chunks of specified line count
 * @param markdown - The full markdown content
 * @param linesPerChunk - Number of lines per chunk (default: 100)
 * @returns Array of markdown chunks
 */
export function splitMarkdownIntoChunks(markdown: string, linesPerChunk = 100): string[] {
	const lines = markdown.split('\n');
	const chunks: string[] = [];
	
	for (let i = 0; i < lines.length; i += linesPerChunk) {
		const chunk = lines.slice(i, i + linesPerChunk).join('\n');
		chunks.push(chunk);
	}
	
	return chunks;
}

/**
 * Check if user has scrolled near the bottom of the container
 * @param container - The scrollable container element
 * @param threshold - Distance from bottom in pixels to trigger loading (default: 500)
 * @returns true if near bottom, false otherwise
 */
export function isNearBottom(container: HTMLElement, threshold = 500): boolean {
	const scrollTop = container.scrollTop;
	const scrollHeight = container.scrollHeight;
	const clientHeight = container.clientHeight;
	
	return (scrollHeight - scrollTop - clientHeight) < threshold;
}
