// Hàm hiển thị thông báo khi nhấn nút Đăng Nhập
function showLoginMessage(event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của liên kết

    const notification = document.getElementById('login-notification');
    const username = "user@example.com"; // Thay đổi thành tài khoản hợp lệ của bạn
    const password = "password123"; // Thay đổi thành mật khẩu hợp lệ của bạn

    // Kiểm tra độ hợp lệ của tài khoản (ví dụ đơn giản)
    const inputUsername = prompt("Nhập tài khoản:");
    const inputPassword = prompt("Nhập mật khẩu:");

    if (inputUsername === username && inputPassword === password) {
        notification.textContent = "Đăng nhập thành công!";
        notification.style.color = 'green'; // Màu xanh cho thông báo thành công
    } else {
        notification.textContent = "Tài khoản hoặc mật khẩu không hợp lệ!";
        notification.style.color = 'red'; // Màu đỏ cho thông báo lỗi
    }

    notification.style.display = 'block'; // Hiển thị thông báo
}
document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra Firebase đã tải chưa
    if (!window.firebase) {
        console.error("Firebase chưa được tải! Kiểm tra lại script trong HTML.");
        return;
    }

    // Cấu hình Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyATp-eu8CBatLs04mHpZS4c66FaYw5zLgk",
        authDomain: "pka-pickleball.firebaseapp.com",
        projectId: "pka-pickleball",
        storageBucket: "pka-pickleball.appspot.com",
        messagingSenderId: "38130361867",
        appId: "1:38130361867:web:f3c1a3940e3c390b11890e",
        measurementId: "G-0YQ7GKJKRC"
    };

    // Khởi tạo Firebase (chỉ khởi tạo nếu chưa có app nào)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();

    // Xử lý đăng nhập
    const loginForm = document.getElementById("login-form");
    if (!loginForm) {
        console.error("Không tìm thấy form đăng nhập!");
        return;
    }

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert("Đăng nhập thành công!");
            window.location.href = "../html_file/home.html";
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    });
});
