document.addEventListener('DOMContentLoaded', () => {
    const reviewsGrid = document.getElementById('reviewsGrid');
    
    const reviews = [
        { name: 'Sarah M.', avatar: 'https://i.pravatar.cc/150?img=1', stars: 5, text: 'Space Radio has become my daily companion. The variety of stations is incredible!' },
        { name: 'James K.', avatar: 'https://i.pravatar.cc/150?img=3', stars: 5, text: 'Best internet radio experience. The UI is beautiful and the sound quality is top-notch.' },
        { name: 'Emily R.', avatar: 'https://i.pravatar.cc/150?img=5', stars: 5, text: 'Love the cosmic theme! It makes listening to music feel like a journey through space.' },
        { name: 'Michael T.', avatar: 'https://i.pravatar.cc/150?img=8', stars: 4, text: 'Great selection of stations from around the world. Highly recommend!' },
        { name: 'Lisa Chen', avatar: 'https://i.pravatar.cc/150?img=9', stars: 5, text: 'The weather feature is so handy. Everything I need in one place!' },
        { name: 'David W.', avatar: 'https://i.pravatar.cc/150?img=12', stars: 5, text: 'Amazing DJs and great music curation. My favorite radio app!' }
    ];
    
    const starFilled = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    const starEmpty = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    
    reviewsGrid.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar"><img src="${review.avatar}" alt="${review.name}"></div>
                <div class="review-author">
                    <h4>${review.name}</h4>
                    <div class="review-stars">${starFilled.repeat(review.stars)}${starEmpty.repeat(5 - review.stars)}</div>
                </div>
            </div>
            <p class="review-text">"${review.text}"</p>
        </div>
    `).join('');
});
