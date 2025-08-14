export class CardBuilder{
  constructor() {
    this.imageSrc = '';
    this.description = '';
    this.stars = [];
    this.rating = 0;
    this.reviewCount = 0;
    this.link = '#';
  }

  setImage(src) {
    this.imageSrc = src;
    return this;
  }

  setDescription(desc) {
    this.description = desc;
    return this;
  }

  setStars(starArray) {
    this.stars = starArray;
    return this;
  }

  setRating(rating) {
    this.rating = rating;
    return this;
  }

  setReviewCount(count) {
    this.reviewCount = count;
    return this;
  }

  setLink(link) {
    this.link = link;
    return this;
  }

  build() {
    const card = document.createElement('div');
    card.classList.add('card');

    // Image
    const img = document.createElement('img');
    img.src = this.imageSrc;
    img.alt = `imagem do produto ${this.description}`;
    card.appendChild(img);

    // Description
    const desc = document.createElement('p');
    desc.textContent = this.description;
    card.appendChild(desc);

    // Score
    const score = document.createElement('div');
    score.classList.add('score');
    this.stars.forEach(starSrc => {
      const span = document.createElement('span');
      span.classList.add('star');
      const starImg = document.createElement('img');
      starImg.src = starSrc;
      starImg.alt = starSrc.includes('half') ? 'half-star-review' : 'full-star-review';
      span.appendChild(starImg);
      score.appendChild(span);
    });

    const ratingSpan = document.createElement('span');
    ratingSpan.textContent = `(${this.rating})`;
    score.appendChild(ratingSpan);
    card.appendChild(score);

    // Reviews
    const reviews = document.createElement('div');
    reviews.classList.add('reviews');
    const bubbleImg = document.createElement('img');
    bubbleImg.src = './public/message-bubble.svg';
    bubbleImg.alt = 'message-bubble';
    reviews.appendChild(bubbleImg);

    const countSpan = document.createElement('span');
    countSpan.textContent = this.reviewCount.toLocaleString();
    reviews.appendChild(countSpan);

    const textSpan = document.createElement('span');
    textSpan.textContent = 'reviews';
    reviews.appendChild(textSpan);
    card.appendChild(reviews);

    // Divider
    card.appendChild(document.createElement('hr'));

    // Link
    const linkEl = document.createElement('a');
    linkEl.href = this.link;
    const linkIcon = document.createElement('img');
    linkIcon.src = './public/link.svg';
    linkIcon.alt = 'link-icon';
    linkEl.appendChild(linkIcon);
    linkEl.appendChild(document.createTextNode(' View on Amazon'));
    card.appendChild(linkEl);

    return card;
  }
}
