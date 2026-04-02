import { AuthService } from "../api/authService.js";

// 1. Kuhanin ang reference sa form
const loginForm = document.querySelector("#loginForm");

// Siguraduhin na ang form ay nage-exist sa page bago mag-attach ng listener
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Iwasan ang pag-refresh ng page

    // 2. Kuhanin ang data mula sa form fields (gamit ang 'name' attribute)
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    // Simple Validation
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      // UI Feedback: Disable button habang naglo-load
      const submitBtn = loginForm.querySelector("button");
      submitBtn.disabled = true;
      submitBtn.textContent = "AUTHENTICATING...";

      // 3. Tawagin ang AuthService (Login logic)
      const response = await AuthService.login(username, password);

      if (response.success) {
        loginForm.reset();
        // I-save ang profile data (hindi ang token, dahil nasa Cookie na iyon)
        localStorage.setItem("userData", JSON.stringify(response.data));

        // 4. Redirect sa Dashboard
        window.location.href = "dashboard.html";
      }
    } catch (error) {
      // 5. Error Handling: I-display ang message mula sa Backend
      alert(error.message || "Invalid login credentials.");
      loginForm.reset();

      // Re-enable button para makasubok ulit ang user
      const submitBtn = loginForm.querySelector("button");
      submitBtn.disabled = false;
      submitBtn.textContent = "AUTHENTICATE";
    }
  });
}
