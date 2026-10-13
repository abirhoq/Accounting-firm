const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

/**
 * Harbor & Pine Accounting - Client Scripts
 * Formspree submission, phone validation, mobile navigation & FAQ accordion
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initFaqAccordion();
  initContactForm();
});

/* ==========================================================================
   1. Mobile Navigation
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu-wrapper");

  if (!toggleBtn || !navMenu) return;

  function toggleMenu(isOpen) {
    const shouldOpen = typeof isOpen === "boolean" ? isOpen : toggleBtn.getAttribute("aria-expanded") !== "true";
    toggleBtn.setAttribute("aria-expanded", String(shouldOpen));
    navMenu.classList.toggle("is-open", shouldOpen);

    if (shouldOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  toggleBtn.addEventListener("click", () => {
    toggleMenu();
  });

  const navLinks = navMenu.querySelectorAll(".nav-link, .nav-cta-wrapper a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (navMenu.classList.contains("is-open")) {
        toggleMenu(false);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (
      navMenu.classList.contains("is-open") &&
      !navMenu.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   2. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove("is-open");
          const otherBtn = otherItem.querySelector(".faq-question");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });

      const willOpen = !isExpanded;
      button.setAttribute("aria-expanded", String(willOpen));
      item.classList.toggle("is-open", willOpen);
    });
  });
}

/* ==========================================================================
   3. Phone Number Validation
   ========================================================================== */
/**
 * Rejects dummy sequences, repeated identical digits, and invalid phone patterns.
 */
function isValidPhoneNumber(phoneString) {
  if (!phoneString || typeof phoneString !== "string") return false;

  const digits = phoneString.replace(/\D/g, "");

  let cleanNumber = digits;
  if (digits.length === 11 && digits.startsWith("1")) {
    cleanNumber = digits.slice(1);
  }

  if (cleanNumber.length !== 10) {
    return false;
  }

  // Reject identical repeated digits (e.g., 1111111111, 0000000000, 9999999999)
  if (/^(\d)\1{9}$/.test(cleanNumber)) {
    return false;
  }

  // Reject ascending and descending consecutive runs
  const ascending = "0123456789012345";
  const descending = "9876543210987654";
  if (ascending.includes(cleanNumber) || descending.includes(cleanNumber)) {
    return false;
  }

  // Known dummy test patterns
  const knownDummies = [
    "1234567890",
    "0123456789",
    "9876543210",
    "5555555555",
    "1231231234",
    "1234512345"
  ];
  if (knownDummies.includes(cleanNumber)) {
    return false;
  }

  // Reject repeating pair patterns (e.g. 1212121212)
  if (/^(\d{2})\1{4}$/.test(cleanNumber)) {
    return false;
  }

  // Area code cannot start with 0 or 1
  if (cleanNumber.charAt(0) === "0" || cleanNumber.charAt(0) === "1") {
    return false;
  }

  // Central office code cannot start with 0 or 1
  if (cleanNumber.charAt(3) === "0" || cleanNumber.charAt(3) === "1") {
    return false;
  }

  return true;
}

/* ==========================================================================
   4. Contact Form Submission
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("intro-call-form");
  if (!form) return;

  const errorAlert = document.getElementById("form-error-alert");
  const successAlert = document.getElementById("form-success-alert");
  const submitBtn = form.querySelector('button[type="submit"]');

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const businessTypeInput = document.getElementById("business_type");
  const messageInput = document.getElementById("message");

  function setFieldError(input, hasError) {
    if (!input) return;
    if (hasError) {
      input.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
    } else {
      input.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
    }
  }

  [nameInput, emailInput, phoneInput, businessTypeInput, messageInput].forEach(field => {
    if (!field) return;
    field.addEventListener("input", () => {
      if (field.classList.contains("has-error")) {
        setFieldError(field, false);
      }
      if (errorAlert) {
        errorAlert.classList.remove("is-visible");
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorAlert) {
      errorAlert.classList.remove("is-visible");
      errorAlert.innerHTML = "";
    }
    if (successAlert) {
      successAlert.classList.remove("is-visible");
      successAlert.innerHTML = "";
    }

    let isValid = true;
    const errorMessages = [];

    const nameVal = nameInput ? nameInput.value.trim() : "";
    if (!nameVal || nameVal.length < 2) {
      isValid = false;
      setFieldError(nameInput, true);
      errorMessages.push("Please provide your full name.");
    } else {
      setFieldError(nameInput, false);
    }

    const emailVal = emailInput ? emailInput.value.trim() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailPattern.test(emailVal)) {
      isValid = false;
      setFieldError(emailInput, true);
      errorMessages.push("Please provide a valid email address.");
    } else {
      setFieldError(emailInput, false);
    }

    const phoneVal = phoneInput ? phoneInput.value.trim() : "";
    if (!phoneVal || !isValidPhoneNumber(phoneVal)) {
      isValid = false;
      setFieldError(phoneInput, true);
      errorMessages.push("Please provide a valid 10-digit phone number (dummy sequences or repeated digits are rejected).");
    } else {
      setFieldError(phoneInput, false);
    }

    const businessVal = businessTypeInput ? businessTypeInput.value : "";
    if (!businessVal) {
      isValid = false;
      setFieldError(businessTypeInput, true);
      errorMessages.push("Please select your business structure or stage.");
    } else {
      setFieldError(businessTypeInput, false);
    }

    const messageVal = messageInput ? messageInput.value.trim() : "";
    if (!messageVal || messageVal.length < 10) {
      isValid = false;
      setFieldError(messageInput, true);
      errorMessages.push("Please enter a short message describing your inquiry (at least 10 characters).");
    } else {
      setFieldError(messageInput, false);
    }

    if (!isValid) {
      if (errorAlert) {
        errorAlert.innerHTML = `
          <div class="alert-content">
            <strong>Please correct the following:</strong>
            <ul>
              ${errorMessages.map(msg => `<li>${msg}</li>`).join("")}
            </ul>
          </div>
        `;
        errorAlert.classList.add("is-visible");
      }
      return;
    }

    const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit Request";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span>`;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        body: formData
      });

      if (response.ok) {
        form.reset();
        if (errorAlert) errorAlert.classList.remove("is-visible");
        if (successAlert) {
          successAlert.textContent = "Request received. We will reply by email.";
          successAlert.classList.add("is-visible");
        }
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to send request at this time.");
      }
    } catch (err) {
      if (errorAlert) {
        errorAlert.innerHTML = `<div>Unable to submit form. Please verify your details or try again shortly.</div>`;
        errorAlert.classList.add("is-visible");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}
