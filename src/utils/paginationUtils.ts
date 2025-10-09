/**
 * Utility functions for pagination
 */

// export type CustomCSSProperties = CSSProperties & {
// 	"--book-simulator-page-height": string;
// };

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
	linesPerPage: 25,
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

/**
 * Injects CSS variables into the document root for global access
 * @param variables - Object containing CSS variable names and values
 */
export function injectCSSVariables(variables: Record<string, string>): void {
	const documentElement = document.documentElement;

	Object.entries(variables).forEach(([name, value]) => {
		// Ensure CSS variable name starts with --
		const cssVarName = name.startsWith("--") ? name : `--${name}`;
		documentElement.style.setProperty(cssVarName, value);
	});
}

/**
 * Removes CSS variables from the document root
 * @param variableNames - Array of CSS variable names to remove
 */
export function removeCSSVariables(variableNames: string[]): void {
	const documentElement = document.documentElement;

	variableNames.forEach((name) => {
		// Ensure CSS variable name starts with --
		const cssVarName = name.startsWith("--") ? name : `--${name}`;
		documentElement.style.removeProperty(cssVarName);
	});
}

/**
 * Sets up default CSS variables for the book simulator
 * @param config - Page configuration to use for CSS variables
 */
export function setupBookSimulatorCSSVariables(
	config: PageConfig = DEFAULT_PAGE_CONFIG
): void {
	const variables = {
		"--book-simulator-page-width": config.pageWidth,
		"--book-simulator-page-height": config.pageHeight,
		"--book-simulator-page-padding": config.padding,
		"--book-simulator-lines-per-page": config.linesPerPage.toString(),
	};

	injectCSSVariables(variables);
}

/**
 * Cleans up CSS variables when the plugin is unloaded
 */
export function cleanupBookSimulatorCSSVariables(): void {
	const variablesToRemove = [
		"--book-simulator-page-width",
		"--book-simulator-page-height",
		"--book-simulator-page-padding",
		"--book-simulator-lines-per-page",
	];

	removeCSSVariables(variablesToRemove);
}

/**
 * Gets a CSS variable value from the document root
 * @param variableName - Name of the CSS variable (with or without --)
 * @returns The CSS variable value or empty string if not found
 */
export function getCSSVariable(variableName: string): string {
	const cssVarName = variableName.startsWith("--")
		? variableName
		: `--${variableName}`;
	return getComputedStyle(document.documentElement)
		.getPropertyValue(cssVarName)
		.trim();
}

/**
 * Gets all book simulator CSS variables as an object
 * @returns Object containing all book simulator CSS variables
 */
export function getBookSimulatorCSSVariables(): Record<string, string> {
	return {
		pageWidth: getCSSVariable("--book-simulator-page-width"),
		pageHeight: getCSSVariable("--book-simulator-page-height"),
		pagePadding: getCSSVariable("--book-simulator-page-padding"),
		linesPerPage: getCSSVariable("--book-simulator-lines-per-page"),
	};
}

/**
 * Updates a specific CSS variable
 * @param variableName - Name of the CSS variable
 * @param value - New value for the variable
 */
export function updateCSSVariable(variableName: string, value: string): void {
	const cssVarName = variableName.startsWith("--")
		? variableName
		: `--${variableName}`;
	document.documentElement.style.setProperty(cssVarName, value);
}
