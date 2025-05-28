document.getElementById("logoutButton").addEventListener("click", function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        window.location.href = "/login";

});