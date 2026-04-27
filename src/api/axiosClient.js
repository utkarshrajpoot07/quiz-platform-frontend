import axios from "axios";

const axiosClient = axios.create({
 baseURL: "http://localhost:5273/api",
  timeout: 30000, // 10 seconds — prevents infinite hanging requests
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────
// Adds token to every request automatically
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────
axiosClient.interceptors.response.use(

  // success — just return response as is
  (response) => response,

  // error — handle globally
  (error) => {

    // token expired or unauthorized → logout automatically
    if (error.response?.status === 401) {

      // public pages — no redirect, just reject
      const publicPaths = ["/quizzes", "/contact", "/public-leaderboard"];
      const isPublic    = publicPaths.some(p =>
        window.location.pathname.startsWith(p)
      );

      if (!isPublic) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // server error
    if (error.response?.status === 500) {
      console.error("Server error — please try again later");
    }

    // network error — no internet or backend down
    if (!error.response) {
      console.error("Network error — check your connection or backend");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;