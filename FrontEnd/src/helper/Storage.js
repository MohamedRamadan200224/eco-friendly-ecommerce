// Non-sensitive user profile data only. The JWT itself is NEVER stored
// here (or in localStorage): it lives in an httpOnly cookie set by the
// backend on login / signup, and the browser sends it automatically with
// credentialed requests (axios: withCredentials: true). Anything stored
// in sessionStorage / localStorage is readable by any script running on
// the page, so storing a JWT there makes it stealable via XSS.
export const setAuthUser = (data) => {
  // Save the user object to sessionStorage (profile data only, never a JWT).
  // Stringify OBJECT TO TEXT
  sessionStorage.setItem("user", JSON.stringify(data));
};

export const getAuthUser = () => {
  if (sessionStorage.getItem("user")) {
    return JSON.parse(sessionStorage.getItem("user"));
  }
  return null;
};

export const removeAuthUser = () => {
  if (sessionStorage.getItem("user")) sessionStorage.removeItem("user");
};

// --- Deprecated token helpers -------------------------------------------------
// Kept as no-ops so existing imports do not break, but they deliberately
// never write a JWT to browser storage. Auth is cookie-based now:
// the backend sets an httpOnly `jwt` cookie, and axios calls use
// withCredentials: true. Remove these (and their call sites) in a
// follow-up once Login / Signup stop expecting a token in the response.
/** @deprecated JWT is stored in an httpOnly cookie, not in storage. */
export const setAuthToken = () => {};

/** @deprecated JWT is stored in an httpOnly cookie, not in storage. */
export const getAuthToken = () => undefined;

/** @deprecated JWT is stored in an httpOnly cookie, not in storage. */
export const removeAuthToken = () => {
  // Remove any token a previous version of the app stored.
  if (sessionStorage.getItem("jwtToken"))
    sessionStorage.removeItem("jwtToken");
};
