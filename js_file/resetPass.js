function resetPassword(event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const code = urlParams.get('code');
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const notification = document.getElementById('notification');

    if (!email || !code) {
        notification.style.display = 'block';
        notification.style.color = 'red';
        notification.textContent = 'Mã xác nhận không hợp lệ!';
        return;
    }

    if (newPassword !== confirmPassword) {
        notification.style.display = 'block';
        notification.style.color = 'red';
        notification.textContent = 'Mật khẩu không khớp!';
        return;
    }

    // Gửi yêu cầu đến server
    fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
    })
    .then(res => res.json())
    .then(data => {
        notification.style.display = 'block';
        notification.style.color = data.success ? 'green' : 'red';
        notification.textContent = data.message;
        if (data.success) {
            setTimeout(() => window.location.href = "../html_file/Login.html", 1000);
        }
    })
    .catch(error => {
        notification.style.display = 'block';
        notification.style.color = 'red';
        notification.textContent = 'Lỗi hệ thống, thử lại sau!';
    });
}
