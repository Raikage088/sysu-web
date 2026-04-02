import "./style/main.css";
import { AuthService } from "./api/authService.js";

const initApp = async () => {
  const path = window.location.pathname;
  const isLoginPage = path === "/" || path.includes("index.html");

  if (isLoginPage) return;

  try {
    const result = await AuthService.check();

    localStorage.setItem("userData", JSON.stringify(result.data));
  } catch (error) {
    console.log("DEBUGGER: Login Error: " + error);

    if (!isLoginPage) {
      window.location.href = "/index.html";
    }
  }
};

initApp();
