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