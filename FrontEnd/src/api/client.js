// Single axios instance for the whole frontend.
//
// Boundary rule (owner decision, 2026-11-19): the frontend never imports
// backend code. The ONLY connection to the backend is this HTTP client.
// Every page / component / modal talks to the API through `api` below —
// no raw axios imports and no hardcoded backend URLs anywhere else.
//
// VITE_API_URL is the backend ORIGIN (e.g. http://localhost:3000), not the
// /api/v1 prefix: every call site appends /api/v1/... , matching the
// convention the codebase (and CartModal from the security PR) already uses.
// See FrontEnd/.env.example.
import axios from "axios";
import toast from "react-hot-toast";

export const apiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: apiBaseUrl,
  // Auth is cookie-based (security PR #1): the backend sets an httpOnly
  // `jwt` cookie on login / signup and the browser sends it automatically.
  withCredentials: true,
});

// ONE shared error handler: every failed request toasts the server's message
// once, with the styling the codebase already uses. Call sites must NOT add
// their own toast.error(err.response.data.message) in .catch() — that would
// toast the same error twice. Keep toast.success / toast.loading at the
// call site; those are not errors and the interceptor never fires for them.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error &&
      error.response &&
      error.response.data &&
      error.response.data.message
        ? error.response.data.message
        : (error && error.message) || "Something went wrong. Please try again.";
    toast.error(message, { className: "w-auto" });
    return Promise.reject(error);
  }
);

// Image URLs served by the backend's static /img route. Build them from the
// API base instead of hardcoding a localhost string at each call site.
export const imageUrl = (category, imageCover) =>
  `${apiBaseUrl}/img/${category}/${imageCover}`;

export const userImageUrl = (photo) => `${apiBaseUrl}/img/users/${photo}`;

export default api;
