export const setAuthUser = (data) => {
  // save object to the local storage
  // Stringify OBJECT TO TEXT
  sessionStorage.setItem("user", JSON.stringify(data));
};

export const getAuthUser = () => {
  if (sessionStorage.getItem("user")) {
    return JSON.parse(sessionStorage.getItem("user"));
  }
};

export const removeAuthUser = () => {
  if (sessionStorage.getItem("user")) sessionStorage.removeItem("user");
};

export const setAuthToken = (data) => {
  // save object to the local storage
  // Stringify OBJECT TO TEXT
  sessionStorage.setItem("jwtToken", JSON.stringify(data));
};

export const getAuthToken = () => {
  if (sessionStorage.getItem("jwtToken")) {
    return JSON.parse(sessionStorage.getItem("jwtToken"));
  }
};

export const removeAuthToken = () => {
  if (sessionStorage.getItem("jwtToken")) sessionStorage.removeItem("jwtToken");
};
