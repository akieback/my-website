let canHideNavbar = true;

function toggleMenu() {
    const pageContainer = document.getElementById("page-container");
    const mobileMenu = document.getElementById("mobileMenu");
    const burgerIcon = document.querySelector(".burger-menu");
    
    // Check if elements exist before trying to access them
    if (pageContainer && mobileMenu && burgerIcon) {
        // Blur/unblur page content
        pageContainer.classList.toggle("blur");
        // Slide menu open/close
        mobileMenu.classList.toggle("show");
        // Animate burger to an "X"
        burgerIcon.classList.toggle("change");
    }
}

// Close menu when clicking a nav link
document.addEventListener('DOMContentLoaded', () => {
    const mobileNavLinks = document.querySelectorAll('.nav-mobile-menu .nav-link');
    if (mobileNavLinks.length > 0) {
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                const pageContainer = document.getElementById("page-container");
                const mobileMenu = document.getElementById("mobileMenu");
                const burgerIcon = document.querySelector(".burger-menu");

                if (pageContainer && mobileMenu && burgerIcon) {
                    pageContainer.classList.remove("blur");
                    mobileMenu.classList.remove("show");
                    burgerIcon.classList.remove("change");
                }
            });
        });
    }

    // Keep navbar visible when clicking nav links
    const navRightLinks = document.querySelectorAll('.nav-right .nav-link');
    if (navRightLinks.length > 0) {
        navRightLinks.forEach(link => {
            link.addEventListener('click', () => {
                const mainNav = document.querySelector(".main-nav");
                const burger = document.querySelector(".burger-menu");
                
                if (mainNav && burger) {
                    // Show navbar and burger
                    mainNav.classList.remove("nav-hide");
                    burger.classList.remove("nav-hide");
                    
                    // Prevent navbar from hiding immediately after click
                    canHideNavbar = false;
                    
                    // Allow navbar to hide again after 500ms
                    setTimeout(() => {
                        canHideNavbar = true;
                        if (typeof lastScrollTop !== 'undefined') {
                            lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        }
                    }, 500);
                }
            });
        });
    }
});

// Close mobile menu if window is resized above 768px
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        const pageContainer = document.getElementById("page-container");
        const mobileMenu = document.getElementById("mobileMenu");
        const burgerIcon = document.querySelector(".burger-menu");

        // Check if elements exist before trying to access them
        if (pageContainer && mobileMenu && burgerIcon) {
            pageContainer.classList.remove("blur");
            mobileMenu.classList.remove("show");
            burgerIcon.classList.remove("change");
        }
    }
});

// Hide navbar & burger on scroll down, show on scroll up
let lastScrollTop = 0;
let scrollThreshold = 50;
let scrollDirection = 'none';

window.addEventListener("scroll", () => {
    if (!canHideNavbar) return; // Don't hide if we just clicked a link

    const mainNav = document.querySelector(".main-nav");
    const burger = document.querySelector(".burger-menu");
    
    // Skip this functionality if elements don't exist (like on the landing page)
    if (!mainNav || !burger) return;
    
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDifference = Math.abs(currentScroll - lastScrollTop);

    // Only hide burger if menu is closed (burger not in "X" state)
    const isMenuOpen = burger.classList.contains("change");

    // Determine scroll direction, but only act if we've scrolled past threshold
    if (scrollDifference > scrollThreshold) {
        if (currentScroll > lastScrollTop) {
            // Scrolling down
            if (!isMenuOpen) {
                mainNav.classList.add("nav-hide");
                burger.classList.add("nav-hide");
            }
        } else {
            // Scrolling up
            mainNav.classList.remove("nav-hide");
            burger.classList.remove("nav-hide");
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }
});

// Make entire choice cards clickable with enhanced transitions
document.addEventListener('DOMContentLoaded', function() {
    // Add transition effect to card clicks
    function navigateWithTransition(url) {
        // Create overlay for transition effect
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#2C4A3F';
        overlay.style.zIndex = '9999';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s ease';
        document.body.appendChild(overlay);
        
        // Fade in then navigate
        setTimeout(() => {
            overlay.style.opacity = '1';
            setTimeout(() => {
                window.location.href = url;
            }, 400);
        }, 10);
        
        return false; // Prevent default link behavior
    }
    
    // Handle Professional card
    const professionalCard = document.querySelector('.professional-card');
    if (professionalCard) {
        professionalCard.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            navigateWithTransition('Professional.html');
        });
    }
    
    // Handle Personal card
    const personalCard = document.querySelector('.personal-card');
    if (personalCard) {
        personalCard.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            navigateWithTransition('Personal.html');
        });
    }
    
    // Add subtle animation to card patterns
    const cardPatterns = document.querySelectorAll('.card-pattern');
    if (cardPatterns.length > 0) {
        cardPatterns.forEach(pattern => {
            // Create subtle movement on mousemove
            document.addEventListener('mousemove', function(e) {
                const card = pattern.closest('.choice-card');
                if (!card) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the card
                const y = e.clientY - rect.top;  // y position within the card
                
                // Calculate movement based on mouse position (subtle effect)
                const moveX = (x / rect.width - 0.5) * 10;
                const moveY = (y / rect.height - 0.5) * 10;
                
                // Apply the movement if mouse is over this card
                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                    pattern.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
                } else {
                    pattern.style.transform = 'translate(0, 0) scale(1)';
                }
            });
        });
    }
    
    // Add fade-in animation for landing page elements
    const landingElements = document.querySelectorAll('.profile-wrapper, .choice-prompt, .choice-card, .landing-footer');
    if (landingElements.length > 0) {
        landingElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            // Stagger the animations
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + (index * 150));
        });
    }
});

// Page transition for when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add initial page load transition
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Handle back button transitions
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // Page was loaded from cache (back button)
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        }
    });
    
    // Add analytics event tracking (mock implementation)
    function trackCardSelection(cardType) {
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'selectLandingChoice',
                'cardChoice': cardType
            });
        }
        // For demonstration/future implementation
        console.log('Card selected:', cardType);
    }
    
    // Update professional card click handler to include analytics
    const professionalCard = document.querySelector('.professional-card');
    if (professionalCard) {
        professionalCard.addEventListener('click', function(e) {
            e.preventDefault();
            trackCardSelection('professional');
            navigateWithTransition('Professional.html');
        });
    }
    
    // Update personal card click handler to include analytics
    const personalCard = document.querySelector('.personal-card');
    if (personalCard) {
        personalCard.addEventListener('click', function(e) {
            e.preventDefault();
            trackCardSelection('personal');
            navigateWithTransition('Personal.html');
        });
    }
});

// Handle preloader
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.querySelector('.preloader');
    
    if (preloader) {
        // Show preloader for at least 2 seconds for IKEA effect
        setTimeout(() => {
            preloader.classList.add('hidden');
            // Remove from DOM after transition completes
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 2000);
    }
});

// Handle breadcrumb visibility
document.addEventListener('DOMContentLoaded', function() {
    const breadcrumb = document.querySelector('.breadcrumb-nav');
    
    if (breadcrumb) {
        // Show breadcrumb after 3 seconds
        setTimeout(() => {
            breadcrumb.classList.add('visible');
        }, 3000);
        
        // Hide breadcrumb when scrolling down, show when scrolling up
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 300) {
                // Scrolling down & past threshold
                breadcrumb.classList.remove('visible');
            } else {
                // Scrolling up or near top
                breadcrumb.classList.add('visible');
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }
});

// Landing page enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in effect for the page
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 100);

    // Add choice cards hover metrics to measure engagement
    const professionalCard = document.querySelector('.professional-card');
    const personalCard = document.querySelector('.personal-card');
    const choiceCards = document.querySelectorAll('.choice-card');
    
    if (choiceCards.length > 0) {
        choiceCards.forEach(card => {
            // Track hover time
            let hoverStartTime = 0;
            
            card.addEventListener('mouseenter', () => {
                hoverStartTime = Date.now();
            });
            
            card.addEventListener('mouseleave', () => {
                const hoverTime = Date.now() - hoverStartTime;
                // We could log this to analytics in a real implementation
                console.log(`Card hovered for ${hoverTime}ms`);
            });
            
            // Add click animation
            card.addEventListener('click', (e) => {
                // Don't need to prevent default as the link handles navigation
                card.classList.add('card-clicked');
            });
        });
    }
    
    // Optional: add a small delay before navigation to show the click animation
    const choiceLinks = document.querySelectorAll('.choice-btn');
    if (choiceLinks.length > 0) {
        choiceLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                // Show a minimal loading indicator
                const loader = document.createElement('div');
                loader.className = 'minimal-loader visible';
                loader.innerHTML = '<div class="mini-spinner"></div><span>Loading...</span>';
                document.body.appendChild(loader);
                
                // Navigate after a short delay
                setTimeout(() => {
                    window.location.href = href;
                }, 600);
            });
        });
    }
});