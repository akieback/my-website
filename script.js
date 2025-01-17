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
  window.addEventListener("scroll", () => {
    const mainNav = document.querySelector(".main-nav");
    const burger = document.querySelector(".burger-menu");
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  
    // Hide if scrolling down
    if (currentScroll > lastScrollTop) {
      mainNav.classList.add("nav-hide");
      burger.classList.add("nav-hide");
    } else {
      // Show if scrolling up
      mainNav.classList.remove("nav-hide");
      burger.classList.remove("nav-hide");
    }
  
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });
  