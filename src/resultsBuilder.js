import { CardBuilder } from "./CardBuilder";

/**
 * ResultsUIBuilder
 * ----------------
 * Renders:
 *  - a header summary (icon + label + count + keyword + current page)
 *  - a compact pagination bar (Prev, 1, …, neighbors, …, last, Next)
 *  - a grid of product cards
 *
 * Fluent API:
 *   new ResultsUIBuilder(headerEl, paginationEl, resultsEl)
 *     .setKeyword("laptop")
 *     .setCount(24)
 *     .setPage(2)
 *     .setTotalPages(7)
 *     .setProducts(products)
 *     .onPageClick(handler)      // handler receives the click event
 *     .build();
 */
export class ResultsUIBuilder {
    /**
     * @param {HTMLElement} headerEl     Container for the summary header
     * @param {HTMLElement} paginationEl Container for the pagination controls
     * @param {HTMLElement} [resultsEl]  Container where cards will be appended
     */
    constructor(headerEl, paginationEl, resultsEl = null) {
        this.headerEl = headerEl;
        this.paginationEl = paginationEl;
        this.resultsEl = resultsEl;

        // Header defaults
        this.iconSrc = "./shopping-cart.svg";
        this.label = "Amazon Products";
        this.keyword = "";
        this.count = 0;

        // Pagination state
        this.page = 1;
        this.totalPages = 1;

        // Pagination click callback (event-based)
        this.onClick = null;

        // Data to render
        this.products = [];
    }

    // --------- Fluent setters ---------

    /** @param {string} src */
    setIcon(src)         { this.iconSrc = src; return this; }
    /** @param {string} text */
    setLabel(text)       { this.label = text; return this; }
    /** @param {string} kw */
    setKeyword(kw)       { this.keyword = kw ?? ""; return this; }
    /** @param {number} n */
    setCount(n)          { this.count = Number(n) || 0; return this; }
    /** @param {number} p */
    setPage(p)           { this.page = Math.max(1, Number(p) || 1); return this; }
    /** @param {Array<object>} p */
    setProducts(p)       { this.products = Array.isArray(p) ? p : []; return this; }
    /** @param {number} tp */
    setTotalPages(tp)    { this.totalPages = Math.max(1, Number(tp) || 1); return this; }
    /** @param {HTMLElement} el */
    setResultsEl(el)     { this.resultsEl = el; return this; }
    /** @param {(e:MouseEvent)=>void} handler */
    onPageClick(handler) { this.onClick = handler; return this; }

    /**
     * Render all sections. Returns refs to the containers for convenience.
     */
    build() {
            this.#renderHeader();
            this.#renderPagination();
            this.#renderCards();
            return { headerEl: this.headerEl, paginationEl: this.paginationEl, resultsEl: this.resultsEl };
    }

     // ---------- Private rendering helpers ----------

    /**
     * Render product cards into resultsEl.
     * Uses DocumentFragment to minimize layout thrashing.
     */
    #renderCards() {
            if (!this.resultsEl) return [];

            this.resultsEl.innerHTML = "";
            const frag = document.createDocumentFragment();

            const cards = this.products.map((p) => {
            // Build one card
            const builder = new CardBuilder()
                .setImage(p.image || "./example.jpg")
                .setDescription(p.title || "Untitled product")
                .setLink(p.url || "#");

            // If rating exists, show rating + stars + reviews; otherwise show just reviews count
            if (p.rating != null) {
                builder
                .setRating(Number(p.rating))
                .setReviewCount(Number(p.reviews ?? 0))
                .setStars(p.rating); // numeric → CardBuilder computes full/half star icons
            } else {
                builder.setReviewCount(Number(p.reviews ?? 0));
            }

            // Finalize and annotate element
            const el = builder.build();
            el.dataset.asin = p.asin || "";

            // Improve accessibility: propagate product title to image ALT
            const imgEl = el.querySelector("img");
            if (imgEl && p.title) imgEl.alt = p.title;

            frag.appendChild(el);
            return el;
        });

        this.resultsEl.appendChild(frag);
        this.resultsEl.classList.remove("hide");
        return cards;
    }

    /**
     * Render the header summary above the results grid.
     * Example:  "Amazon Products  (24 products found for "laptop" on page 2)"
     */
    #renderHeader() {
        if (!this.headerEl) return;

        const countStr = this.count.toLocaleString();
        const kw = String(this.keyword ?? "");
        const supText = `(${countStr} ${this.count === 1 ? "product" : "products"} found for "${kw}" on page ${this.page})`;

        this.headerEl.innerHTML = "";

        const p = document.createElement("p");

        const img = document.createElement("img");
        img.src = this.iconSrc;
        img.alt = "shopping-cart";

        const sup = document.createElement("sup");
        sup.textContent = supText;

        p.append(img, document.createTextNode(this.label + " "), sup);
        this.headerEl.appendChild(p);
        this.headerEl.classList.remove("hide");
    }

    /**
     * Render a compact pagination bar:
     *   Prev, 1, …, neighbors around current, …, last, Next
     * Each interactive item receives the provided onClick handler.
     *
     * Note: This implementation attaches one listener per item (simple and fine for small page counts).
     * For very large totals, consider event delegation for performance.
     */
    #renderPagination() {
        if (!this.paginationEl) return;

        const { page, totalPages } = this;
        this.paginationEl.innerHTML = "";

        // Build logical items first, then transform them into DOM nodes
        const items = this.#buildPageList(page, totalPages);

        for (const it of items) {
            // Ellipsis placeholder (non-interactive)
            if (it.type === "ellipsis") {
                const span = document.createElement("span");
                span.textContent = "…";
                span.setAttribute("aria-hidden", "true");
                this.paginationEl.appendChild(span);
                continue;
            }

            // Interactive page item (using <span> styled as a control)
            const el = document.createElement("span");
            el.type = "span";
            el.dataset.page = String(it.page);
            el.textContent = it.label;

            // Mark current page for styling/ARIA
            if (it.current) {
                el.setAttribute("aria-current", "page");
                el.classList.add("current");
            }

            // “Disabled” pages (Prev at page 1, Next at last page) shouldn’t react
            if (it.disabled) {
                el.setAttribute("aria-disabled", "true");
                el.style.pointerEvents = "none";
                el.style.opacity = "0.6";
            } else if (this.onClick) {
                // Attach consumer-provided handler (receives MouseEvent)
                el.addEventListener("click", this.onClick);
            }

            this.paginationEl.appendChild(el);
        }

        this.paginationEl.classList.remove("hide");
    }

    /**
     * Compute a compact set of pagination items.
     * @param {number} current   Current page (1-based)
     * @param {number} total     Total pages (>=1)
     * @param {number} neighbors How many numeric neighbors to show around current
     * @returns {Array<{type:'page'|'ellipsis', page?:number, label?:string, current?:boolean, disabled?:boolean}>}
     */
    #buildPageList(current, total, neighbors = 1) {
        const clamp = (n) => Math.max(1, Math.min(total, n));
        const items = [];

        // Prev control
        items.push({ type: "page", page: clamp(current - 1), label: "Prev", disabled: current <= 1 });

        // Always show page 1
        items.push({ type: "page", page: 1, label: "1", current: current === 1 });

        // Window of neighbors around the current page (excluding first/last)
        const start = Math.max(2, current - neighbors);
        const end = Math.min(total - 1, current + neighbors);

        if (start > 2) items.push({ type: "ellipsis" });

        for (let p = start; p <= end; p++) {
            items.push({ type: "page", page: p, label: String(p), current: p === current });
        }

        if (end < total - 1) items.push({ type: "ellipsis" });

        // Always show last page (if more than one page)
        if (total > 1) {
            items.push({
                type: "page",
                page: total,
                label: String(total),
                current: current === total
            });
        }

        // Next control
        items.push({
            type: "page",
            page: clamp(current + 1),
            label: "Next",
            disabled: current >= total
        });

        return items;
    }

    /**
     * Optional utility: convert a numeric rating (e.g., 3.5) to a 5-slot array
     * where 1=full, 0.5=half, 0=empty. Useful if CardBuilder expects a star mask.
     * (Not used by default; kept for future styling needs.)
     */
    #ratingToStars(rating) {
        const full = Math.floor(rating);
        const half = rating - full >= 0.5 ? 1 : 0;
        const arr = Array(5).fill(0).map((_, i) => (i < full ? 1 : i === full && half ? 0.5 : 0));
        return arr; // e.g., [1,1,1,0.5,0]
    }
}
