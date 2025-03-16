document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signup-form").addEventListener("submit", async function (e) {
        e.preventDefault();

        const hoTen = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const matKhau = document.getElementById("password").value;
        const confirmMatKhau = document.getElementById("confirmpassword").value;
        const sdt = document.getElementById("phone").value;
        const diaChi = document.getElementById("address").value;

        // Kiểm tra tính hợp lệ của các trường dữ liệu
        if (!hoTen || !email || !matKhau || !confirmMatKhau || !sdt || !diaChi) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        // Kiểm tra mật khẩu có khớp không
        if (matKhau !== confirmMatKhau) {
            alert("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        // Kiểm tra định dạng email hợp lệ
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            alert("Vui lòng nhập email hợp lệ!");
            return;
        }

        // Kiểm tra mật khẩu có đủ dài không (tối thiểu 6 ký tự)
        if (matKhau.length < 3) {
            alert("Mật khẩu phải có ít nhất 3 ký tự!");
            return;
        }

        try {
            // Gửi yêu cầu đăng ký đến server
            const response = await fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hoTen, email, matKhau, sdt, diaChi }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Đã xảy ra lỗi khi đăng ký.");
            }

            // Thông báo thành công
            alert("Đăng ký thành công!");
            window.location.href = "login.html"; // Chuyển hướng tới trang login
        } catch (error) {
            alert(error.message); // Hiển thị lỗi từ server
        }
    });
});
