// 6. Set up the services from client to backend
// The one that connects frontend and backend
import response from "assert";

const BASE_URL = "/api/auth";

export const AuthService = {
  login: async (username, password) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    return data;
  },
  async check() {
    const response = await fetch(`${BASE_URL}/check`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Unauthorized");
    return response.json();
  },

  async logout() {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.clear();
    window.location.href = "/";

    if (!response.ok) throw new Error("Logout failed on server");
    return response.json();
  },
};
