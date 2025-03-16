document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signup-form").addEventListener("submit", async function (e) {
        e.preventDefault();

        const hoTen = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const matKhau = document.getElementById("password").value;
        const confirmMatKhau = document.getElementById("confirmpassword").value;
        const sdt = document.getElementById("phone").value;
        const diaChi = document.getElementById("address").value;

        if (!hoTen || !email || !matKhau || !confirmMatKhau || !sdt || !diaChi) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        if (matKhau !== confirmMatKhau) {
            alert("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hoTen, email, matKhau, sdt, diaChi }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            alert("Đăng ký thành công!");
            window.location.href = "login.html";
        } catch (error) {
            alert(error.message);
        }
    });
});
