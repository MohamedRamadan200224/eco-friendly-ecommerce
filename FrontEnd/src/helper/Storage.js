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
  // Drop a jwtToken an older version of the app may have stored.
  if (sessionStorage.getItem("jwtToken"))
    sessionStorage.removeItem("jwtToken");
};

// Auth state is the stored user object (getAuthUser) plus the httpOnly
// `jwt` cookie the backend sets on login / signup. There is deliberately
// no token helper: a JWT must never live in browser storage, where any
// script on the page could read it.
