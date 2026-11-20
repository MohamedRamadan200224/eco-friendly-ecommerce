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

// Demo placeholder image for products without a usable cover.
// Image upload is not available in the demo (uploads land on the
// serverless function's ephemeral disk and never persist), so products
// created in the demo have no cover, and the seeded covers point at files
// that were never committed. Show a placeholder instead of a broken image.
export const placeholderImage = (label) =>
  `https://placehold.co/600x400/15803d/ffffff?text=${encodeURIComponent(
    label || "No image"
  )}`;

// Image URLs served by the backend's static /img route. Build them from the
// API base instead of hardcoding a localhost string at each call site.
// A cover that is already a full URL (e.g. a placeholder from the seed
// data) is used as-is; a missing cover falls back to the placeholder.
// A leading slash on the filename is stripped so the URL has no "//".
export const imageUrl = (category, imageCover) => {
  if (!imageCover) return placeholderImage(category || "Product");
  if (/^https?:\/\//.test(imageCover)) return imageCover;
  return `${apiBaseUrl}/img/${category}/${String(imageCover).replace(
    /^\//,
    ""
  )}`;
};

// <img onError> fallback: if the backend file is missing (the seeded covers
// point at files that were never committed), swap to the placeholder.
// The guard stops an infinite loop if the placeholder itself fails.
export const handleImgError = (label) => (e) => {
  const el = e.currentTarget;
  const fallback = placeholderImage(label);
  if (el.src !== fallback) el.src = fallback;
};

export const userImageUrl = (photo) => `${apiBaseUrl}/img/users/${photo}`;

export default api;
