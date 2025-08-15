/**
 * CardBuilder
 * -----------
 * Small fluent builder to create a product “card” DOM node.
 * Usage:
 *   new CardBuilder()
 *     .setImage(url)
 *     .setDescription(text)
 *     .setStars(4.5)          // or .setStars([fullIcon, fullIcon, halfIcon, ...])
 *     .setRating(4.5)
 *     .setReviewCount(1234)
 *     .setLink("https://...")
 *     .build();
 */
export class CardBuilder {
    constructor() {
        /** @type {string} main product image URL */
        this.imageSrc = '';
        /** @type {string} product description/title */
        this.description = '';
        /**
         * @type {string[]} icon paths for stars, e.g. ["./star.svg","./star.svg","./star-half.svg"]
         * Filled by setStars(); if you pass a number, we compute this array for you.
         */
        this.stars = [];
        /** @type {number} numeric rating (e.g., 4.5). Used for the “(4.5)” text next to stars */
        this.rating = 0;
        /** @type {number} total review count */
        this.reviewCount = 0;
        /** @type {string} product link (opens in a new tab) */
        this.link = '#';

        // Internal assets for star icons (full and half)
        this._FULL = './star.svg';
        this._HALF = './star-half.svg';
    }

    /** Set the product image URL */
    setImage(src) {
        this.imageSrc = src;
        return this;
    }

    /** Set the product description/title */
    setDescription(desc) {
        this.description = desc;
        return this;
    }

    /**
     * Set star icons.
     * You can pass:
     *  - an array of icon URLs (advanced/manual control), or
     *  - a number (rating 0..5) and we’ll generate full/half stars for you.
     * @param {number|Array<string>} starArrayOrRating
     */
    setStars(starArrayOrRating) {
        // If it’s already an array of icon paths, use it verbatim.
        if (Array.isArray(starArrayOrRating)) {
            this.stars = starArrayOrRating;
            return this;
        }

        // Otherwise, treat as a numeric rating
        const rating = Number(starArrayOrRating);
        if (!Number.isFinite(rating)) {
            // Invalid input — clear stars and bail
            this.stars = [];
            return this;
        }

        this.rating = rating;

        // Clamp to [0,5] just in case, then split into full and (in some cases) half star.
        const r = Math.min(5, Math.max(0, rating));
        const full = Math.floor(r);
        const hasHalf = r < 5 && r !== full; // half-star for any non-integer below 5

        // Build the icon array (no empty stars shown here — purely full/half)
        const icons = Array(full).fill(this._FULL);
        if (hasHalf) icons.push(this._HALF);

        this.stars = icons;
        return this;
    }

    /** Set the numeric rating (e.g., 4.5). This controls the “(4.5)” text. */
    setRating(rating) {
        this.rating = rating;
        return this;
    }

    /** Set the total number of reviews */
    setReviewCount(count) {
        this.reviewCount = count;
        return this;
    }

    /** Set the product link (opens in a new tab) */
    setLink(link) {
        this.link = link;
        return this;
    }

    /**
     * Build and return the card DOM element.
     * The structure roughly is:
     * <div.card>
     *   <img/>                // product image
     *   <p>…description…</p>  // product title/description
     *   <div.score>…</div>    // star icons + (rating) — only if rating != null
     *   <div.reviews>…</div>  // review count      — only if rating != null
     *   <hr/>
     *   <a target="_blank">View on Amazon</a>
     * </div>
     */
    build() {
        const card = document.createElement('div');
        card.classList.add('card');

        // --- Image ---------------------------------------------------------------
        const img = document.createElement('img');
        img.src = this.imageSrc;
        img.alt = `product image ${this.description}`; // ALT ties to description for accessibility
        card.appendChild(img);

        // --- Description ---------------------------------------------------------
        const desc = document.createElement('p');
        desc.textContent = this.description;
        card.appendChild(desc);

        // Only render rating/reviews UI when a rating value exists (some listings lack it)
        if (this.rating != null) {
        // --- Score (stars + numeric rating) -----------------------------------
        const score = document.createElement('div');
        score.classList.add('score');

        // Add each star icon as an <img/> wrapped in a <span.star>
        this.stars.forEach(starSrc => {
            const span = document.createElement('span');
            span.classList.add('star');

            const starImg = document.createElement('img');
            starImg.src = starSrc;
            starImg.alt = starSrc.includes('half') ? 'half-star-review' : 'full-star-review';

            span.appendChild(starImg);
            score.appendChild(span);
        });

        // “(4.5)” next to the stars
        const ratingSpan = document.createElement('span');
        ratingSpan.textContent = `(${this.rating})`;
        score.appendChild(ratingSpan);

        card.appendChild(score);

        // --- Reviews (bubble icon + count + label) ----------------------------
        const reviews = document.createElement('div');
        reviews.classList.add('reviews');

        const bubbleImg = document.createElement('img');
        bubbleImg.src = './message-bubble.svg';
        bubbleImg.alt = 'message-bubble';
        reviews.appendChild(bubbleImg);

        const countSpan = document.createElement('span');
        countSpan.textContent = this.reviewCount.toLocaleString();
        reviews.appendChild(countSpan);

        const textSpan = document.createElement('span');
        textSpan.textContent = 'reviews';
        reviews.appendChild(textSpan);

        card.appendChild(reviews);
        }

        // --- Divider -------------------------------------------------------------
        card.appendChild(document.createElement('hr'));

        // --- Link (opens in a new tab) ------------------------------------------
        const linkEl = document.createElement('a');
        linkEl.href = this.link;
        linkEl.target = "_blank";

        const linkIcon = document.createElement('img');
        linkIcon.src = './link.svg';
        linkIcon.alt = 'link-icon';

        linkEl.appendChild(linkIcon);
        linkEl.appendChild(document.createTextNode(' View on Amazon'));
        card.appendChild(linkEl);

        return card;
    }
}
