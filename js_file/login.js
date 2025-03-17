document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            // Lưu thông tin vào localStorage
            localStorage.setItem("userName", data.user.userName);
            localStorage.setItem("userRole", data.user.userRole);
            localStorage.setItem("userId", data.user.userId);

            alert("Đăng nhập thành công!");
            window.location.href = "home.html";
        } catch (error) {
            alert(error.message);
        }
    });
});
