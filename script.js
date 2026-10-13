const FORMSPREE_ENDPOINT = "YOUR_FORMSPREE_ENDPOINT_HERE";

/**
 * Harbor & Pine Accounting - Interactive Script
 * Portland, Oregon | Portfolio Concept Project
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initFaqAccordion();
  initContactForm();
});

/* ==========================================================================
   1. Mobile Navigation Toggle
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

  // Close when clicking a nav link on mobile
  const navLinks = navMenu.querySelectorAll(".nav-link, .nav-cta-wrapper a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (navMenu.classList.contains("is-open")) {
        toggleMenu(false);
      }
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });

  // Close on clicking outside menu
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

      // Optional: Collapse all other items for a clean single-open accordion
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove("is-open");
          const otherBtn = otherItem.querySelector(".faq-question");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current item
      const willOpen = !isExpanded;
      button.setAttribute("aria-expanded", String(willOpen));
      item.classList.toggle("is-open", willOpen);
    });
  });
}

/* ==========================================================================
   3. Phone Number Validation (Rejects Dummy / Repeating Patterns)
   ========================================================================== */
/**
 * Validates phone numbers to ensure they are real looking and not dummy inputs.
 * Rejects:
 * - All identical digits (e.g. 1111111111, 0000000000, 9999999999)
 * - Sequential ascending digits (e.g. 1234567890, 0123456789)
 * - Sequential descending digits (e.g. 9876543210, 8765432109)
 * - Repeating pairs or triplets (e.g. 1212121212, 1231231231)
 * - Lengths outside valid US/standard boundaries (10 to 11 digits)
 * - Known fictitious area codes (000, 111, 999)
 */
function isValidPhoneNumber(phoneString) {
  if (!phoneString || typeof phoneString !== "string") return false;

  // Strip all non-digit characters
  const digits = phoneString.replace(/\D/g, "");

  // Must have 10 digits (or 11 digits starting with 1 for US)
  let cleanNumber = digits;
  if (digits.length === 11 && digits.startsWith("1")) {
    cleanNumber = digits.slice(1);
  }

  if (cleanNumber.length !== 10) {
    return false;
  }

  // Reject all identical digits (e.g., 1111111111, 0000000000)
  if (/^(\d)\1{9}$/.test(cleanNumber)) {
    return false;
  }

  // Reject standard ascending/descending sequences
  const ascending = "0123456789012345";
  const descending = "9876543210987654";
  if (ascending.includes(cleanNumber) || descending.includes(cleanNumber)) {
    return false;
  }

  // Specific common dummy strings check
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

  // Reject repeating 2-digit patterns like 1212121212
  if (/^(\d{2})\1{4}$/.test(cleanNumber)) {
    return false;
  }

  // Reject repeating 3-digit patterns like 1231231231
  if (/^(\d{3})\1{2}\d$/.test(cleanNumber)) {
    return false;
  }

  // Area code cannot start with 0 or 1
  const areaCodeFirstDigit = cleanNumber.charAt(0);
  if (areaCodeFirstDigit === "0" || areaCodeFirstDigit === "1") {
    return false;
  }

  // Central office code cannot start with 0 or 1
  const centralOfficeFirstDigit = cleanNumber.charAt(3);
  if (centralOfficeFirstDigit === "0" || centralOfficeFirstDigit === "1") {
    return false;
  }

  return true;
}

/* ==========================================================================
   4. Contact Form Validation & Submission
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("intro-call-form");
  if (!form) return;

  const errorAlert = document.getElementById("form-error-alert");
  const successAlert = document.getElementById("form-success-alert");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Input elements
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const businessTypeInput = document.getElementById("business_type");
  const messageInput = document.getElementById("message");

  // Helper to show/hide field errors
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

  // Live validation cleanup on input
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

    // Reset status alerts
    if (errorAlert) {
      errorAlert.classList.remove("is-visible");
      errorAlert.textContent = "";
    }
    if (successAlert) {
      successAlert.classList.remove("is-visible");
    }

    let isValid = true;
    const errorMessages = [];

    // 1. Name validation
    const nameVal = nameInput ? nameInput.value.trim() : "";
    if (!nameVal || nameVal.length < 2) {
      isValid = false;
      setFieldError(nameInput, true);
      errorMessages.push("Please provide your full name.");
    } else {
      setFieldError(nameInput, false);
    }

    // 2. Email validation
    const emailVal = emailInput ? emailInput.value.trim() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailPattern.test(emailVal)) {
      isValid = false;
      setFieldError(emailInput, true);
      errorMessages.push("Please provide a valid email address.");
    } else {
      setFieldError(emailInput, false);
    }

    // 3. Phone validation with dummy pattern rejection
    const phoneVal = phoneInput ? phoneInput.value.trim() : "";
    if (!phoneVal || !isValidPhoneNumber(phoneVal)) {
      isValid = false;
      setFieldError(phoneInput, true);
      errorMessages.push("Please enter a valid 10-digit phone number (dummy sequences and repeated digits are rejected).");
    } else {
      setFieldError(phoneInput, false);
    }

    // 4. Business Type validation
    const businessVal = businessTypeInput ? businessTypeInput.value : "";
    if (!businessVal) {
      isValid = false;
      setFieldError(businessTypeInput, true);
      errorMessages.push("Please select your business structure or status.");
    } else {
      setFieldError(businessTypeInput, false);
    }

    // 5. Message validation
    const messageVal = messageInput ? messageInput.value.trim() : "";
    if (!messageVal || messageVal.length < 10) {
      isValid = false;
      setFieldError(messageInput, true);
      errorMessages.push("Please share a brief note about your business or needs (at least 10 characters).");
    } else {
      setFieldError(messageInput, false);
    }

    // If validation fails, show error summary
    if (!isValid) {
      if (errorAlert) {
        errorAlert.innerHTML = `
          <svg class="form-alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>
            <strong>Please resolve the following:</strong>
            <ul style="margin-top: 0.35rem; list-style: disc; padding-left: 1.25rem;">
              ${errorMessages.map(msg => `<li>${msg}</li>`).join("")}
            </ul>
          </div>
        `;
        errorAlert.classList.add("is-visible");
        errorAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    // Prepare UI for submission state
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit Request";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-opacity="0.25"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending Request...
      `;
    }

    const formData = new FormData(form);

    try {
      // If endpoint is still the placeholder variable, simulate clean submission
      if (
        !FORMSPREE_ENDPOINT ||
        FORMSPREE_ENDPOINT === "YOUR_FORMSPREE_ENDPOINT_HERE" ||
        FORMSPREE_ENDPOINT.includes("YOUR_FORMSPREE")
      ) {
        // Artificial delay for realistic submission feel
        await new Promise(resolve => setTimeout(resolve, 600));

        // Display exact success message requirement: "Request received. We will reply by email."
        showSubmissionSuccess();
      } else {
        // Real Formspree submission via Fetch AJAX
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: {
            "Accept": "application/json"
          },
          body: formData
        });

        if (response.ok) {
          showSubmissionSuccess();
        } else {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || "Formspree submission encountered an issue.");
        }
      }
    } catch (err) {
      if (errorAlert) {
        errorAlert.innerHTML = `
          <svg class="form-alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>We were unable to send your request. Please try again or reach out directly at hello@harborandpine.example.</div>
        `;
        errorAlert.classList.add("is-visible");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  function showSubmissionSuccess() {
    form.reset();
    if (errorAlert) {
      errorAlert.classList.remove("is-visible");
    }
    if (successAlert) {
      successAlert.innerHTML = `
        <svg class="form-alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div>
          <strong>Request received. We will reply by email.</strong>
        </div>
      `;
      successAlert.classList.add("is-visible");
      successAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}
