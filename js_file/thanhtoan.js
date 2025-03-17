// Hàm tạo QR Code
function generateQRCode() {
    let qrContainer = document.getElementById("qrcode");
    let paidButton = document.getElementById("paid-btn");
    let totalPrice = parseInt(document.getElementById("total-price").innerText.replace(/\D/g, ""), 10) || 0;
    let accountNumber = "0932396059";
    let bankID = "mb";
    let paymentMethod = document.getElementById("payment-method").value;
    if (paymentMethod === "bank" || paymentMethod === "momo") {
        let apiUrl = `https://img.vietqr.io/image/${bankID}-${accountNumber}-compact.png?amount=${totalPrice}&addInfo=ThanhToanSanBong`;
        qrContainer.innerHTML = `<img src="${apiUrl}" alt="QR Code">`;
        document.getElementById("qr-form").style.display = "block";
        paidButton.style.display = "block";
    } else {
        alert("Vui lòng chọn phương thức thanh toán hợp lệ.");
    }
}
// Hàm xử lý thanh toán
async function handlePayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const idSan = urlParams.get("idSan");
    if (!idSan) {
        console.error("❌ Không tìm thấy idSan trong URL!");
        alert("Có lỗi trong việc lấy thông tin sân. Vui lòng thử lại.");
        return;
    }

    let userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Không tìm thấy ID người dùng! Vui lòng đăng nhập lại.");
        return;
    }

    let selectedDate = document.getElementById("NgayDatSan").innerText.split(":")[1]?.trim();
    let selectedTime = document.getElementById("GioDatSan").innerText.split(":").slice(1).join(":").trim();
    let onePrice = document.getElementById("GiaDatSan").innerText.split(":")[1]?.trim();
    let userName = document.getElementById("NguoiDatSan").innerText.split(":")[1]?.trim();
    let userEmail = document.getElementById("EmailDatSan").innerText.split(":")[1]?.trim();
    let userPhone = document.getElementById("SdtDatSan").innerText.split(":")[1]?.trim();
    let fieldName = document.getElementById("tensan").innerText;
    let fieldAddress = document.getElementById("diachi").innerText;
    let totalPrice = parseInt(document.getElementById("total-price").innerText.replace(/\D/g, ""), 10);
    let paymentTime = new Date().toLocaleString();
    let docId = `${userId}_${selectedDate}_${idSan}_${selectedTime}`;

    // Kiểm tra dữ liệu cần thiết
    if (!selectedDate || !selectedTime || !onePrice || !userName || !userEmail || !userPhone || !fieldName || !fieldAddress || !totalPrice) {
        alert("Vui lòng điền đầy đủ thông tin trước khi thanh toán.");
        return;
    }

    // Gửi yêu cầu thanh toán lên server
    let response = await fetch('http://127.0.0.1:3000/process-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            userName,
            userEmail,
            userPhone,
            totalPrice,
            fieldName,
            fieldAddress,
            idSan,
            selectedDate,
            selectedTime,
            paymentTime,
            onePrice,
            docId
        })
    });

        if (!response.ok) {
            throw new Error('Lỗi khi gửi yêu cầu thanh toán.');
        }

        let data = await response.json();
        if (data.success) {
            alert("Thanh toán thành công và đã lưu thông tin!");
            location.reload();
        } else {
            console.error("Lỗi khi xử lý thanh toán:", data.message);
            alert("Có lỗi xảy ra khi xử lý thanh toán.");
        }
}

// Lắng nghe sự kiện
document.addEventListener("DOMContentLoaded", function () {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Không tìm thấy ID người dùng! Vui lòng đăng nhập lại.");
        return;
    }

    let payButton = document.getElementById("pay-btn");
    let paidButton = document.getElementById("paid-btn");

    if (payButton) {
        payButton.addEventListener("click", generateQRCode);
    } else {
        console.error("Không tìm thấy nút thanh toán!");
    }

    if (paidButton) {
        paidButton.addEventListener("click", handlePayment);
    } else {
        console.error("Không tìm thấy nút đã thanh toán!");
    }
});
