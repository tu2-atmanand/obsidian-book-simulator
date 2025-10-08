/**
 * Utility functions for pagination
 */

/**
 * Configuration for page dimensions (A4 size as default)
 */
export interface PageConfig {
	linesPerPage: number;
	pageWidth: string;
	pageHeight: string;
	padding: string;
}

/**
 * Default A4 page configuration
 * Approximately 40-50 lines fit on an A4 page with standard formatting
 */
export const DEFAULT_PAGE_CONFIG: PageConfig = {
	linesPerPage: 45,
	pageWidth: "210mm",
	pageHeight: "297mm",
	padding: "20mm",
};

/**
 * Represents a single page of content
 */
export interface Page {
	content: string;
	pageNumber: number;
	totalPages: number;
}

/**
 * Splits markdown content into pages based on line count
 * @param markdown - The full markdown content
 * @param linesPerPage - Number of lines per page (default: 45 for A4)
 * @returns Array of Page objects
 */
export function splitMarkdownIntoPages(
	markdown: string,
	linesPerPage: number = DEFAULT_PAGE_CONFIG.linesPerPage
): Page[] {
	const lines = markdown.split("\n");
	const pages: Page[] = [];
	const totalPages = Math.ceil(lines.length / linesPerPage);

	for (let i = 0; i < lines.length; i += linesPerPage) {
		const pageContent = lines.slice(i, i + linesPerPage).join("\n");
		const pageNumber = Math.floor(i / linesPerPage) + 1;

		pages.push({
			content: pageContent,
			pageNumber,
			totalPages,
		});
	}

	return pages;
}

/**
 * Generate header content for a page
 * @param bookTitle - Title of the book (usually folder name)
 * @returns HTML string for header
 */
export function generatePageHeader(bookTitle: string): string {
	return bookTitle;
}

/**
 * Generate footer content for a page
 * @param pageNumber - Current page number
 * @param totalPages - Total number of pages
 * @returns HTML string for footer
 */
export function generatePageFooter(
	pageNumber: number,
	totalPages: number
): string {
	return `Page ${pageNumber} of ${totalPages}`;
}
