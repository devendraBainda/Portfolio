document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const hamburger = document.querySelector(".hamburger")
  const navLinks = document.querySelector(".nav-links")

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navLinks.classList.toggle("active")
    })

    // Close mobile menu when clicking on a nav link
    const navItems = document.querySelectorAll(".nav-links a")
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navLinks.classList.remove("active")
      })
    })
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      if (targetId === "#") return

      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        })
      }
    })
  })

  // Animate skill bars function (was missing)
  function animateSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && !item.classList.contains('animated')) {
        item.classList.add('animated');
        
        // Add a subtle animation effect
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      }
    });
  }

  // Set initial state for skill items
  document.querySelectorAll('.skill-item').forEach(item => {
    item.style.opacity = '0.7';
    item.style.transform = 'translateY(10px)';
  });

  // Initial check for elements in view
  animateSkillBars()

  // Check on scroll
  window.addEventListener("scroll", animateSkillBars)

  // Form submission handling
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      // Show loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      try {
        const response = await fetch("/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, message }),
        });

        const result = await response.json();

        if (response.ok) {
          alert(`Thank you, ${name}! Your message has been sent successfully.`);
          contactForm.reset();
        } else {
          alert("Oops! Something went wrong: " + result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to send message. Please try again later.");
      } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Resume download button
  const resumeDownloadBtn = document.querySelector('a[href*="resume.pdf"]');
  if (resumeDownloadBtn) {
    resumeDownloadBtn.addEventListener("click", (e) => {
      // Let the default download behavior work
      console.log("Resume download initiated");
    });
  }

  // Header scroll effect
  const header = document.querySelector("header")
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        header.style.padding = "10px 0"
        header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
      } else {
        header.style.padding = "15px 0"
        header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
      }
    })
  }

  // Update the navigation links if needed
  const navLinksContainer = document.querySelector(".nav-links")
  if (navLinksContainer) {
    // Check if projects link already exists
    const projectsLink = navLinksContainer.querySelector('a[href="#projects"]')
    if (!projectsLink) {
      // Create a new projects link
      const newProjectsLink = document.createElement("li")
      const linkElement = document.createElement("a")
      linkElement.href = "#projects"
      linkElement.textContent = "Projects"
      newProjectsLink.appendChild(linkElement)

      // Insert it after the skills link
      const skillsLinkParent = navLinksContainer.querySelector('a[href="#skills"]')?.parentNode
      if (skillsLinkParent) {
        skillsLinkParent.insertAdjacentElement('afterend', newProjectsLink)
      } else {
        navLinksContainer.appendChild(newProjectsLink)
      }
    }
  }

  // Add animation for project cards
  const projectCards = document.querySelectorAll(".project-card")
  if (projectCards.length > 0) {
    function animateProjectCards() {
      projectCards.forEach((card) => {
        const cardPosition = card.getBoundingClientRect().top
        const screenPosition = window.innerHeight / 1.2

        if (cardPosition < screenPosition) {
          card.style.opacity = "1"
          card.style.transform = "translateY(0)"
        }
      })
    }

    // Set initial state for animation
    projectCards.forEach((card) => {
      card.style.opacity = "0"
      card.style.transform = "translateY(20px)"
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease"
    })

    // Initial check and scroll listener
    animateProjectCards()
    window.addEventListener("scroll", animateProjectCards)
  }

  // Add scroll-to-top functionality
  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.innerHTML = '↑';
  scrollToTopBtn.className = 'scroll-to-top';
  scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-color, #6366f1);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 999;
    display: none;
  `;

  document.body.appendChild(scrollToTopBtn);

  // Show/hide scroll to top button
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.style.display = 'block';
      setTimeout(() => scrollToTopBtn.style.opacity = '1', 10);
    } else {
      scrollToTopBtn.style.opacity = '0';
      setTimeout(() => scrollToTopBtn.style.display = 'none', 300);
    }
  });

  // Scroll to top functionality
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Initialize page
  console.log("🚀 Portfolio website initialized successfully!");
  
  // Check if RAG system is available (for debugging)
  fetch('/rag/status')
    .then(response => response.json())
    .then(data => {
      if (data.rag_available && data.rag_initialized) {
        console.log("✅ RAG system is active and ready!");
      } else {
        console.log("⚠️ RAG system not available or not initialized");
      }
    })
    .catch(() => {
      console.log("ℹ️ RAG status check failed - this is normal if RAG isn't set up yet");
    });
})