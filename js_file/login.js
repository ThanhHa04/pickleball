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

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Xử lý đăng nhập
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert("Đăng nhập thành công!");
                window.location.href = "/html_file/home.html"; // Chuyển hướng sau khi đăng nhập
            })
            .catch((error) => {
                alert("Lỗi: " + error.message);
            });
    });
});