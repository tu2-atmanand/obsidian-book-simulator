import { App, Component, MarkdownRenderer } from "obsidian";
import {
	Page,
	generatePageHeader,
	generatePageFooter,
	splitMarkdownIntoPages,
} from "../utils/paginationUtils";
import { paginatedViewTypeConfigs } from "../types";

/**
 * Component that renders paginated book view
 */
export class PageRenderer {
	private container: HTMLElement;
	private app: App;
	private pages: Page[] = [];
	private currentPageIndex = 0;
	private renderComponent: Component | null = null;
	private bookTitle: string;
	private showHeaderFooter: boolean;
	private paginatedViewType: paginatedViewTypeConfigs;
	private navigationContainer: HTMLElement | null = null;
	private keyboardListener: ((e: KeyboardEvent) => void) | null = null;

	constructor(
		container: HTMLElement,
		app: App,
		markdown: string,
		bookTitle: string,
		showHeaderFooter: boolean,
		paginatedViewType: paginatedViewTypeConfigs
	) {
		this.container = container;
		this.app = app;
		this.bookTitle = bookTitle;
		this.showHeaderFooter = showHeaderFooter;
		this.paginatedViewType = paginatedViewType;

		// Split markdown into pages
		this.pages = splitMarkdownIntoPages(markdown);

		// Render based on pagination type
		this.render();
	}

	private render() {
		this.container.empty();
		this.container.addClass("book-simulator-paginated-view");

		switch (this.paginatedViewType) {
			case paginatedViewTypeConfigs.contineousScroll:
				this.renderContinuousScroll();
				break;
			case paginatedViewTypeConfigs.singlePage:
				this.renderSinglePage();
				break;
			case paginatedViewTypeConfigs.twoPages:
				this.renderTwoPages();
				break;
		}
	}

	/**
	 * Render continuous scroll view with all pages
	 */
	private async renderContinuousScroll() {
		const scrollContainer = this.container.createDiv({
			cls: "book-simulator-continuous-scroll",
		});

		// Render first 3 pages initially
		const initialPageCount = Math.min(3, this.pages.length);
		for (let i = 0; i < initialPageCount; i++) {
			await this.renderPage(scrollContainer, i);
		}

		// Setup lazy loading for remaining pages
		if (this.pages.length > initialPageCount) {
			this.setupContinuousScrollListener(
				scrollContainer,
				initialPageCount
			);
		}
	}

	/**
	 * Setup scroll listener for continuous scroll mode lazy loading
	 */
	private setupContinuousScrollListener(
		scrollContainer: HTMLElement,
		startIndex: number
	) {
		let nextPageToRender = startIndex;

		const scrollListener = async () => {
			const scrollTop = scrollContainer.scrollTop;
			const scrollHeight = scrollContainer.scrollHeight;
			const clientHeight = scrollContainer.clientHeight;

			// Check if near bottom (within 500px)
			if (
				scrollHeight - scrollTop - clientHeight < 500 &&
				nextPageToRender < this.pages.length
			) {
				await this.renderPage(scrollContainer, nextPageToRender);
				nextPageToRender++;
			}
		};

		scrollContainer.addEventListener("scroll", scrollListener);
	}

	/**
	 * Render single page view with navigation
	 */
	private async renderSinglePage() {
		const pageContainer = this.container.createDiv({
			cls: "book-simulator-single-page-container",
		});

		// Create page content area
		const contentArea = pageContainer.createDiv({
			cls: "book-simulator-page-content-area",
		});

		// Render current page
		await this.renderPage(contentArea, this.currentPageIndex);

		// Create navigation
		this.createNavigation(pageContainer);

		// Setup keyboard navigation
		this.setupKeyboardNavigation();
	}

	/**
	 * Render two pages side by side with navigation
	 */
	private async renderTwoPages() {
		const pageContainer = this.container.createDiv({
			cls: "book-simulator-two-pages-container",
		});

		// Create two page areas
		const pagesWrapper = pageContainer.createDiv({
			cls: "book-simulator-pages-wrapper",
		});

		const leftPageArea = pagesWrapper.createDiv({
			cls: "book-simulator-page-content-area left-page",
		});

		const rightPageArea = pagesWrapper.createDiv({
			cls: "book-simulator-page-content-area right-page",
		});

		// Render current and next page
		await this.renderPage(leftPageArea, this.currentPageIndex);

		if (this.currentPageIndex + 1 < this.pages.length) {
			await this.renderPage(rightPageArea, this.currentPageIndex + 1);
		}

		// Create navigation
		this.createNavigation(pageContainer);

		// Setup keyboard navigation
		this.setupKeyboardNavigation();
	}

	/**
	 * Render a single page
	 */
	private async renderPage(
		container: HTMLElement,
		pageIndex: number
	): Promise<void> {
		if (pageIndex >= this.pages.length) {
			return;
		}

		const page = this.pages[pageIndex];
		const pageWrapper = container.createDiv({
			cls: "book-simulator-page",
		});

		// Add header if enabled
		if (this.showHeaderFooter) {
			const header = pageWrapper.createDiv({
				cls: "book-simulator-page-header",
			});
			header.textContent = generatePageHeader(this.bookTitle);
		} else {
			// Add empty header space for consistent layout
			pageWrapper.createDiv({
				cls: "book-simulator-page-header-spacer",
			});
		}

		// Render page content
		const pageContent = pageWrapper.createDiv({
			cls: "book-simulator-page-content",
		});

		const pageComponent = new Component();
		pageComponent.load();

		await MarkdownRenderer.render(
			this.app,
			page.content,
			pageContent,
			"",
			pageComponent
		);

		if (!this.renderComponent) {
			this.renderComponent = new Component();
			this.renderComponent.load();
		}
		this.renderComponent.addChild(pageComponent);

		// Add footer if enabled
		if (this.showHeaderFooter) {
			const footer = pageWrapper.createDiv({
				cls: "book-simulator-page-footer",
			});
			footer.textContent = generatePageFooter(
				page.pageNumber,
				page.totalPages
			);
		} else {
			// Add empty footer space for consistent layout
			pageWrapper.createDiv({
				cls: "book-simulator-page-footer-spacer",
			});
		}
	}

	/**
	 * Create navigation controls
	 */
	private createNavigation(container: HTMLElement) {
		this.navigationContainer = container.createDiv({
			cls: "book-simulator-navigation",
		});

		const prevButton = this.navigationContainer.createEl("button", {
			cls: "book-simulator-nav-button prev",
			text: "← Previous",
		});

		const pageInfo = this.navigationContainer.createDiv({
			cls: "book-simulator-page-info",
		});
		this.updatePageInfo(pageInfo);

		const nextButton = this.navigationContainer.createEl("button", {
			cls: "book-simulator-nav-button next",
			text: "Next →",
		});

		// Event handlers
		prevButton.addEventListener("click", () => this.previousPage());
		nextButton.addEventListener("click", () => this.nextPage());

		// Update button states
		this.updateNavigationButtons(prevButton, nextButton);
	}

	/**
	 * Update page info display
	 */
	private updatePageInfo(pageInfo: HTMLElement) {
		const isPagesToDisplay =
			this.paginatedViewType === paginatedViewTypeConfigs.twoPages;
		if (isPagesToDisplay && this.currentPageIndex + 1 < this.pages.length) {
			pageInfo.textContent = `Pages ${this.currentPageIndex + 1}-${
				this.currentPageIndex + 2
			} of ${this.pages.length}`;
		} else {
			pageInfo.textContent = `Page ${this.currentPageIndex + 1} of ${
				this.pages.length
			}`;
		}
	}

	/**
	 * Update navigation button states
	 */
	private updateNavigationButtons(
		prevButton: HTMLElement,
		nextButton: HTMLElement
	) {
		// Disable previous button if on first page
		if (this.currentPageIndex === 0) {
			prevButton.addClass("disabled");
			prevButton.setAttribute("disabled", "true");
		} else {
			prevButton.removeClass("disabled");
			prevButton.removeAttribute("disabled");
		}

		// Disable next button if on last page(s)
		const isOnLastPage =
			this.paginatedViewType === paginatedViewTypeConfigs.twoPages
				? this.currentPageIndex + 1 >= this.pages.length
				: this.currentPageIndex >= this.pages.length - 1;

		if (isOnLastPage) {
			nextButton.addClass("disabled");
			nextButton.setAttribute("disabled", "true");
		} else {
			nextButton.removeClass("disabled");
			nextButton.removeAttribute("disabled");
		}
	}

	/**
	 * Navigate to previous page
	 */
	private previousPage() {
		if (this.currentPageIndex > 0) {
			const step =
				this.paginatedViewType === paginatedViewTypeConfigs.twoPages
					? 2
					: 1;
			this.currentPageIndex = Math.max(0, this.currentPageIndex - step);
			this.refreshCurrentView();
		}
	}

	/**
	 * Navigate to next page
	 */
	private nextPage() {
		const step =
			this.paginatedViewType === paginatedViewTypeConfigs.twoPages
				? 2
				: 1;
		const maxIndex = this.pages.length - 1;

		if (this.currentPageIndex < maxIndex) {
			this.currentPageIndex = Math.min(
				maxIndex,
				this.currentPageIndex + step
			);
			this.refreshCurrentView();
		}
	}

	/**
	 * Refresh the current view after navigation
	 */
	private async refreshCurrentView() {
		// Clear the content area and re-render
		const contentAreas = this.container.querySelectorAll(
			".book-simulator-page-content-area"
		);

		contentAreas.forEach((area) => {
			(area as HTMLElement).empty();
		});

		// Render based on view type
		if (this.paginatedViewType === paginatedViewTypeConfigs.singlePage) {
			await this.renderPage(
				contentAreas[0] as HTMLElement,
				this.currentPageIndex
			);
		} else if (
			this.paginatedViewType === paginatedViewTypeConfigs.twoPages
		) {
			await this.renderPage(
				contentAreas[0] as HTMLElement,
				this.currentPageIndex
			);
			if (this.currentPageIndex + 1 < this.pages.length) {
				await this.renderPage(
					contentAreas[1] as HTMLElement,
					this.currentPageIndex + 1
				);
			}
		}

		// Update navigation
		if (this.navigationContainer) {
			const pageInfo = this.navigationContainer.querySelector(
				".book-simulator-page-info"
			) as HTMLElement;
			const prevButton = this.navigationContainer.querySelector(
				".book-simulator-nav-button.prev"
			) as HTMLElement;
			const nextButton = this.navigationContainer.querySelector(
				".book-simulator-nav-button.next"
			) as HTMLElement;

			if (pageInfo) this.updatePageInfo(pageInfo);
			if (prevButton && nextButton)
				this.updateNavigationButtons(prevButton, nextButton);
		}
	}

	/**
	 * Setup keyboard navigation for arrow keys
	 */
	private setupKeyboardNavigation() {
		// Remove existing listener if any
		if (this.keyboardListener) {
			document.removeEventListener("keydown", this.keyboardListener);
		}

		this.keyboardListener = (e: KeyboardEvent) => {
			// Only handle navigation when the container is visible
			if (!this.container.isConnected) {
				return;
			}

			// Check if user is typing in an input field
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			if (e.key === "ArrowLeft") {
				e.preventDefault();
				this.previousPage();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				this.nextPage();
			}
		};

		document.addEventListener("keydown", this.keyboardListener);
	}

	/**
	 * Cleanup method
	 */
	destroy() {
		// Remove keyboard listener
		if (this.keyboardListener) {
			document.removeEventListener("keydown", this.keyboardListener);
			this.keyboardListener = null;
		}

		// Unload render component
		if (this.renderComponent) {
			this.renderComponent.unload();
			this.renderComponent = null;
		}
	}
}
