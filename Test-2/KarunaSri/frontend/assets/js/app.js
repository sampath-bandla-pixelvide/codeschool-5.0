const API_BASE_URL = "../../backend/index.php?path=";

const App = {
  init: function () {
    this.checkAuth();
    this.setupEventListeners();
  },

  checkAuth: function () {
    const token = localStorage.getItem("token");
    const isLoginPage = window.location.pathname.includes("login.html");

    if (!token && !isLoginPage) {
      window.location.href = "login.html";
    } else if (token && isLoginPage) {
      window.location.href = "dashboard.html";
    }
  },

  apiRequest: async function (endpoint, method, data = null) {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_BASE_URL + endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        body: data ? JSON.stringify(data) : null,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  showToast: function (icon, title) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({ icon, title });
  },

  logout: function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  },

  setupEventListeners: function () {
    $(document).on("click", "#logoutBtn", (e) => {
      e.preventDefault();
      this.logout();
    });
  },
};

$(document).ready(() => App.init());
