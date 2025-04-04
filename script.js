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

  // Animate skill bars on scroll
  const skillBars = document.querySelectorAll(".skill-level")

  function animateSkillBars() {
    skillBars.forEach((bar) => {
      const barPosition = bar.getBoundingClientRect().top
      const screenPosition = window.innerHeight / 1.3

      if (barPosition < screenPosition) {
        bar.style.width = bar.parentElement.previousElementSibling.lastElementChild.textContent
      }
    })
  }

  // Initial check for elements in view
  animateSkillBars()

  // Check on scroll
  window.addEventListener("scroll", animateSkillBars)

  // Form submission handling
  const contactForm = document.getElementById("contact-form")
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form values
      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const message = document.getElementById("message").value

      alert(`Thank you, ${name}! Your message has been sent successfully.`)

      // Reset the form
      contactForm.reset()
    })
  }

  // Resume download button
  const resumeDownloadBtn = document.getElementById("resume-download")
  if (resumeDownloadBtn) {
    resumeDownloadBtn.addEventListener("click", (e) => {
      e.preventDefault()

      //  a link to your actual resume file
      alert("Your resume download would start now. Replace this with a real download link in production.")
    })
  }

  // Header scroll effect
  const header = document.querySelector("header")
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      header.style.padding = "10px 0"
      header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
    } else {
      header.style.padding = "15px 0"
      header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
    }
  })

  // Update the navigation links if needed
  const navLinksContainer = document.querySelector(".nav-links")
  if (navLinksContainer) {
    // Check if projects link already exists
    const projectsLink = navLinksContainer.querySelector('a[href="#projects"]')
    if (!projectsLink) {
      // Create a new projects link
      const newProjectsLink = document.createElement("a")
      newProjectsLink.href = "#projects"
      newProjectsLink.textContent = "Projects"

      // Insert it after the skills link
      const skillsLink = navLinksContainer.querySelector('a[href="#skills"]')
      if (skillsLink) {
        skillsLink.parentNode.insertBefore(newProjectsLink, skillsLink.nextSibling)
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
})

