let canHideNavbar = true;

function toggleMenu() {
    const pageContainer = document.getElementById("page-container");
    const mobileMenu = document.getElementById("mobileMenu");
    const burgerIcon = document.querySelector(".burger-menu");
  
    // Blur/unblur page content
    pageContainer.classList.toggle("blur");
    // Slide menu open/close
    mobileMenu.classList.toggle("show");
    // Animate burger to an "X"
    burgerIcon.classList.toggle("change");
}

// Close menu when clicking a nav link
document.querySelectorAll('.nav-mobile-menu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const pageContainer = document.getElementById("page-container");
        const mobileMenu = document.getElementById("mobileMenu");
        const burgerIcon = document.querySelector(".burger-menu");

        pageContainer.classList.remove("blur");
        mobileMenu.classList.remove("show");
        burgerIcon.classList.remove("change");
    });
});

// Keep navbar visible when clicking nav links
document.querySelectorAll('.nav-right .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const mainNav = document.querySelector(".main-nav");
        const burger = document.querySelector(".burger-menu");
        
        // Show navbar and burger
        mainNav.classList.remove("nav-hide");
        burger.classList.remove("nav-hide");
        
        // Prevent navbar from hiding immediately after click
        canHideNavbar = false;
        
        // Allow navbar to hide again after 500ms
        setTimeout(() => {
            canHideNavbar = true;
            lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        }, 500);
    });
});

// Close mobile menu if window is resized above 768px
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        const pageContainer = document.getElementById("page-container");
        const mobileMenu = document.getElementById("mobileMenu");
        const burgerIcon = document.querySelector(".burger-menu");

        pageContainer.classList.remove("blur");
        mobileMenu.classList.remove("show");
        burgerIcon.classList.remove("change");
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
  