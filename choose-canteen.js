document.addEventListener('DOMContentLoaded', function() {
    // Get all canteen cards
    const canteenCards = document.querySelectorAll('.canteen-card');
    
    // Add click event listeners to each canteen card
    canteenCards.forEach(card => {
        card.addEventListener('click', function() {
            // Get the canteen type from data attribute
            const canteenType = this.getAttribute('data-canteen');
            
            // Add transition animation
            document.body.classList.add('page-transition');
            
            // Redirect to the appropriate menu page after a short delay
            setTimeout(() => {
                switch(canteenType) {
                    case 'vit':
                        window.location.href = 'vit-menu.html';
                        break;
                    case 'fruit':
                        window.location.href = 'fruit-menu.html';
                        break;
                    case 'nescafe':
                        window.location.href = 'nescafe-menu.html';
                        break;
                    case 'poona':
                        window.location.href = 'poona-menu.html';
                        break;
                    default:
                        console.error('Unknown canteen type');
                }
            }, 300);
        });
        
        // Add hover animation
        card.addEventListener('mouseenter', function() {
            this.classList.add('animate__animated', 'animate__pulse');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('animate__animated', 'animate__pulse');
        });
    });
    
    // Create placeholder images if real images aren't available
    const images = document.querySelectorAll('.canteen-image img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // If image fails to load, remove it and add a placeholder
            this.style.display = 'none';
            this.parentElement.setAttribute('data-canteen', this.alt);
        });
    });
    
    // Add touch effects for mobile
    canteenCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
});