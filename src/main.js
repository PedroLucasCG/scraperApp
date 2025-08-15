import { scrape } from "./apiModel.js";
import { ResultsUIBuilder } from "./resultsBuilder.js";

const pagination       = document.querySelector(".pagination");
const resultsHeader    = document.querySelector(".resultsHeader");
const resultsContainer = document.querySelector(".results");
const scrapeButton     = document.getElementById("scrape");
const infoCard         = document.querySelector(".info");
const pageSelect       = document.getElementById("maxPages");
const keywordInput     = document.getElementById("scrapeText");

// Centralized UI/query state
const scrapingData = {
    keyword: "",
    page: 1,        // current page (1-based)
    pages: 1,       // how many pages to fetch server-side
    totalPages: 1,  // last known total pages from the API
};

// Trigger search
scrapeButton.addEventListener("click", scrapeAmazon);

// Allow Enter to submit
keywordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") scrapeAmazon();
});

async function scrapeAmazon() {
    // Parse "pages" (how many pages to fetch per request) from the select
    const pagesVal = Number.parseInt(pageSelect.value, 10);

    // Read/trim keyword from input
    const keyword = keywordInput.value.trim();
    if (!keyword) {
        // Simple UX hint if keyword missing
        infoCard?.classList.remove("hide");
        if (infoCard) infoCard.innerHTML = "<h2 style='color: #000'>Please enter a keyword first.</h2>";
        return;
  }

  // New search always starts at page 1
  scrapingData.keyword = keyword;
  scrapingData.page = 1;
  scrapingData.pages = Number.isFinite(pagesVal) ? pagesVal : undefined;

  try {
        scrapeButton.disabled = true;

        const { keyword, page, pages } = scrapingData;
        const results = await scrape(keyword, page, pages);

        // Store total pages defensively (fall back to 1 if null/undefined)
        scrapingData.totalPages = Number.isFinite(results?.totalPages) ? results.totalPages : 1;

        updateResultsUI(results);
        infoCard?.classList.add("hide");
    } catch (err) {
        console.error(err);
        infoCard?.classList.remove("hide");
        if (infoCard) infoCard.textContent = "Could not load results. Please try again.";
    } finally {
        scrapeButton.disabled = false;
    }
}

// Render the current results (header, grid, pagination)
function updateResultsUI(results) {
    const { keyword, page } = scrapingData;

    new ResultsUIBuilder(resultsHeader, pagination, resultsContainer)
        .setKeyword(keyword)
        .setPage(page)
        .setCount(results?.count ?? 0)
        .setTotalPages(results?.totalPages ?? scrapingData.totalPages ?? 1)
        .setProducts(results?.products ?? [])
        .onPageClick(changePage) // note: handler receives the click event
        .build();
}

/**
 * Pagination click handler.
 * Supports:
 *  - "Prev"/"Next" labels (case-insensitive),
 *  - numeric labels (e.g., "3"),
 */
async function changePage(e) {
    if (["Prev", "Next"].includes(e.target.innerText)) {
        const op = e.target.innerText;

        if (op === "Prev" && scrapingData.page > 1) {
            scrapingData.page--;
        } else if (op === "Next" && scrapingData.page < scrapingData.totalPages) {
            scrapingData.page++;
        } else {
            return;
        }
    } else {
        const clickedIndex = parseInt(e.target.innerText);
        const selectedPage = clickedIndex !== scrapingData.page ? clickedIndex : null;
        if (!selectedPage) return;
        scrapingData.page = selectedPage;
    }

    try {
        scrapeButton.disabled = true;
        const { keyword, page, pages } = scrapingData;
        const results = await scrape(keyword, page, pages);
        updateResultsUI(results);
    } catch (err) {
        console.error(err);
        infoCard?.classList.remove("hide");
        if (infoCard) infoCard.textContent = "Could not load results. Please try again.";
    } finally {
        scrapeButton.disabled = false;
    }
}
