// Hàm gửi mã xác nhận về email
function sendEmail(event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của form

    const emailInput = document.querySelector('input[type="email"]');
    const email = emailInput.value;

    // Lấy phần tử thông báo
    const notification = document.getElementById('notification');
    notification.style.display = 'block'; // Hiển thị phần tử thông báo

    // Gửi yêu cầu đến server để gửi mã xác nhận
    fetch('http://localhost:3000/send-verification-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    })
    .then(response => {
        if (response.status === 404) { // Kiểm tra nếu email không tồn tại
            throw new Error('Email không tồn tại');
        }
        if (!response.ok) {
            throw new Error('Lỗi khi gửi mã xác nhận');
        }
        return response.json();
    })
    .then(data => {
        notification.textContent = 'Mã xác nhận đã được gửi đến email của bạn!';
        notification.style.color = 'green'; // Màu xanh cho thông báo thành công
    })
    .catch(error => {
        console.error('Lỗi:', error);
        notification.textContent = error.message; // Hiển thị thông báo lỗi
        notification.style.color = 'red'; // Màu đỏ cho thông báo lỗi
    });
} 