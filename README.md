# PsycHeal

PsycHeal is a serene, high-contrast mental health sanctuary application built with a focus on tranquility and user-centric design. Designed to provide a calming environment, it features an adaptive dual-theme system that promotes mental well-being through intentional color palettes and intuitive UI interactions.

## 🌿 Design Philosophy

The visual experience of PsycHeal is crafted to act as a digital sanctuary, utilizing color psychology to create a calming, safe, and welcoming space.

* **Dark Mode: Deep Slate-Charcoal Forest**
* **Palette:** `#0d1112` (Background), `#161b1d` (Cards), `#222a2e` (Borders).
* **Vibe:** Evokes the peaceful atmosphere of a deep woodland, minimizing eye strain for evening usage.


* **Light Mode: Ivory-Warm Sand**
* **Palette:** `#FAF9F6` (Background), `#eae6df` (Dividers).
* **Vibe:** An inviting, warm, and airy environment that remains clean and uncluttered.


* **Accent Color: Healing Emerald & Mint**
* **Colors:** `#5bb374` and `#10b981`.
* **Usage:** These refreshing greens guide the user through interactive elements, voice chat indicators, and breathing exercises, providing consistent, gentle feedback.



## 🔐 Authentication & Security

PsycHeal features a robust, secure **Email Verification flow** designed for both production readiness and development efficiency:

* **Unified Verification Engine:** The system intelligently detects environment variables to toggle between live Firebase authentication and a safe sandbox simulation.
* **Live Production Mode:** Leverages standard Firebase auth (`createUserWithEmailAndPassword`, `sendEmailVerification`) to ensure real-world security and account validation.
* **Sandbox Simulation Mode:** Provides a seamless developer experience with a high-contrast preview block. A generated 6-digit verification code allows for testing the entire signup and entry sequence without requiring live email triggers.
* **Polished UX:** Interactive controls include dynamic cooldown animations for resend buttons, secure code masking, and helpful error state notifications using Emerald and Rose accents.

## 🛠 Tech Stack & Environment

This application utilizes a modular approach for environment management to ensure secure credential handling and flexible deployment.

* **Auth Provider:** Firebase
* **Theming:** Adaptive CSS variables with dual-mode support.
* **Environment Configuration:** The project utilizes the following variables:
* `OPEN_WEIGHT_MODEL_API_URL`
* `OPEN_WEIGHT_MODEL_API_KEY`
* `OPEN_WEIGHT_MODEL_NAME`



---

*PsycHeal is built to be a quiet, helpful, and healing digital space.*

---

Would you like me to add a "Getting Started" or "Installation" section to this README based on your project's specific requirements?
