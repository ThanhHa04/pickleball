async function sendEmail(event) {
    event.preventDefault();

    const emailInput = document.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    const notification = document.getElementById('notification');
    notification.style.display = 'block';

    if (!email) {
        notification.textContent = 'Vui lòng nhập email!';
        notification.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/send-verification-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        

        const data = await response.json().catch(() => ({}));  // Tránh lỗi JSON

        if (!response.ok) {
            throw new Error(data.message || 'Lỗi server!');
        }

        notification.textContent = data.message || 'Mã xác nhận đã được gửi!';
        notification.style.color = 'green';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('Lỗi:', error);
        notification.textContent = error.message;
        notification.style.color = 'red';
    }
}

function getPath(filename) {
    if (window.location.origin.includes("127.0.0.1:5500")) {
        return `/html_file/${filename}`; 
    }
    return `/${filename}`;
}
window.onload = function () {
    document.getElementById("loginLink").setAttribute("href", getPath("Login.html"));
};