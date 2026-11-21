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

// Local placeholder images (FrontEnd/public/ — served from the site
// root, no external service, so they work offline and never 404 when a
// third-party placeholder host is down). Brand greens match the old
// placehold.co fallback (#15803d / #16a34a).
export const placeholderProduct = "/placeholder-product.svg";
export const placeholderPerson = "/placeholder-person.svg";

// Image URLs served by the backend's static /img route. Build them from the
// API base instead of hardcoding a localhost string at each call site.
// A cover that is already a full URL (e.g. a placeholder from the seed
// data) is used as-is; a missing cover falls back to the local product
// placeholder. A leading slash on the filename is stripped so the URL
// has no "//".
export const imageUrl = (category, imageCover) => {
  if (!imageCover) return placeholderProduct;
  if (/^https?:\/\//.test(imageCover)) return imageCover;
  return `${apiBaseUrl}/img/${category}/${String(imageCover).replace(
    /^\//,
    ""
  )}`;
};

// <img onError> fallback: if the backend file is missing (the seeded covers
// point at files that were never committed), swap to a local placeholder.
// kind "person" is for avatars, anything else is the product placeholder.
// The guard is a dataset flag, not a src comparison: the local fallback
// is a relative URL, so el.src is absolute and would never equal it —
// the old comparison only worked because the fallback was absolute.
export const handleImgError = (label, kind = "product") => (e) => {
  const el = e.currentTarget;
  if (el.dataset.imgFallback) return;
  el.dataset.imgFallback = "1";
  el.src = kind === "person" ? placeholderPerson : placeholderProduct;
};

// <img onError> fallback for static / bundled images (logo, hero and
// section SVGs, login art, testimonial / team photos): there is no
// sensible placeholder for a logo, so hide the broken element instead
// of showing a broken-image icon.
export const hideImgOnError = (e) => {
  const el = e.currentTarget;
  el.style.display = "none";
};

// Demo detection: the public demo runs on a *.vercel.app domain. Image
// upload is disabled there (uploads land on the serverless function's
// ephemeral disk and never persist); anywhere else (localhost, a real
// domain) upload works normally. The upload code stays in place so the
// feature exists for review — only its availability is gated.
export const isDemoSite = () =>
  typeof window !== "undefined" &&
  window.location.hostname.includes("vercel.app");

export const userImageUrl = (photo) => {
  // No null handling used to produce .../img/users/null (a user photo
  // defaults to null). A missing, empty or literal-"null" photo falls
  // back to the local person placeholder instead.
  if (!photo || photo === "null" || photo === "undefined")
    return placeholderPerson;
  if (/^https?:\/\//.test(photo)) return photo;
  return `${apiBaseUrl}/img/users/${photo}`;
};

export default api;
