document.addEventListener('DOMContentLoaded', function() {
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const slideCounter = document.getElementById('slideCounter');
    
    if (!slidesWrapper || !nextBtn || !prevBtn || !slideCounter) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateSlides() {
        slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === totalSlides - 1;
        slideCounter.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }

    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateSlides();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlides();
        }
    });

    updateSlides();
});