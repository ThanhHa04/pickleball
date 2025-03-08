import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, writeBatch, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Hàm tạo mã QR
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
    }

}

// Hàm xử lý thanh toán
async function handlePayment() {
    let userId = localStorage.getItem("userId");
    
    let selectedDate = document.getElementById("NgayDatSan").innerText.split(":")[1]?.trim();
    let selectedTime = document.getElementById("GioDatSan").innerText.split(":").slice(1).join(":").trim();
    let onePrice = document.getElementById("GiaDatSan").innerText.split(":")[1]?.trim();
    let userName = document.getElementById("NguoiDatSan").innerText.split(":")[1]?.trim();
    let userEmail = document.getElementById("EmailDatSan").innerText.split(":")[1]?.trim();
    let userPhone = document.getElementById("SdtDatSan").innerText.split(":")[1]?.trim();
    let fieldName = document.getElementById("tensan").innerText;
    let fieldAddress = document.getElementById("diachi").innerText;
    let totalPrice = document.getElementById("total-price").innerText;
    let paymentTime = new Date().toLocaleString();
    let docId = `${userId}_${selectedDate}_${fieldName}_${paymentTime}`;
    let docIdd = `${userId}_${selectedDate}_${fieldName}_${selectedTime}`;

    let batch = writeBatch(db);

    // Thêm lịch sử thanh toán
    let paymentRef = doc(db, "lichsuthanhtoan", docId);
    batch.set(paymentRef, {
        userId,
        tenNguoiDung: userName,
        email: userEmail,
        sdt: userPhone,
        soTien: totalPrice,
        tenSan: fieldName,
        diaChiSan: fieldAddress,
        thoiGianThanhToan: paymentTime
    });

    // Thêm lịch sử đặt sân
    let bookingRef = doc(db, "lichsudatsan", docIdd);
    batch.set(bookingRef, {
        userId,
        tenNguoiDung: userName,
        sdt: userPhone,
        ngayDatSan: selectedDate,
        khungGio: selectedTime,
        tenSan: fieldName,
        diaChiSan: fieldAddress,
        giaSan: onePrice
    });

    try {
        await batch.commit();
        alert("Thanh toán thành công và đã lưu thông tin!");
    } catch (error) {
        console.error("Lỗi khi lưu:", error);
        alert("Có lỗi xảy ra khi lưu thông tin thanh toán!");
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
