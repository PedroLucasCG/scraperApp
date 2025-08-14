import { scrape } from "./apiModel.js";

const scrapeButton   = document.getElementById("scrape");
const infoCard       = document.querySelector(".info");
const pagination     = document.querySelector(".pagination");
const resultsHeader  = document.querySelector(".resultsHeader");
const pageSelect     = document.getElementById("maxPages");
const keywordInput   = document.getElementById("scrapeText");

const scrapingData = {
    keyword: "",
    page: 1,
    pages: 1,
};

scrapeButton.addEventListener("click", scrapeAmazon);

async function scrapeAmazon() {
    const pagesVal = Number.parseInt(pageSelect.value, 10);
    scrapingData.keyword = keywordInput.value.trim();
    scrapingData.pages = Number.isFinite(pagesVal) ? pagesVal : undefined;

    try {
        scrapeButton.disabled = true;
        const { keyword, page, pages } = scrapingData
        const result = await scrape(keyword, page, pages);
        console.log(result);

        infoCard?.classList.add("hide");
        pagination?.classList.remove("hide");
        resultsHeader?.classList.remove("hide");
    } catch (err) {
        console.error(err);
        infoCard?.classList.remove("hide");
        if (infoCard) infoCard.textContent = "Could not load results. Please try again.";
    } finally {
        scrapeButton.disabled = false;
    }
}
