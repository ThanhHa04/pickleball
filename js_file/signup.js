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
const db = firebase.firestore();

async function checkEmailExists(email) {
    const apiKey = "1f3a48c94b7d7239c66e4d008a8c469e"; // Thay bằng API Key mới
    const apiUrl = `https://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        // Kiểm tra nếu API trả về lỗi
        if (data.success === false) {
            console.error("Lỗi API:", data.error);
            return false;
        }

        // Xác thực email dựa trên nhiều tiêu chí
        if (data.format_valid && data.mx_found && data.score >= 0.4) {
            return true;
        }

        return false;
    } catch (error) {
        console.error("Lỗi kiểm tra email:", error);
        return false;
    }
}

// Xử lý sự kiện đăng ký
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signup-form").addEventListener("submit", async function (e) {
        e.preventDefault(); // Ngăn chặn load lại trang

        // Lấy dữ liệu từ input
        const hoTen = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const matKhau = document.getElementById("password").value;
        const confirmMatKhau = document.getElementById("confirmpassword").value;
        const sdt = document.getElementById("phone").value;
        const diaChi = document.getElementById("address").value;

        // Kiểm tra nhập đủ dữ liệu
        if (!hoTen || !email || !matKhau || !confirmMatKhau || !sdt || !diaChi) {
            toastr.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        // Kiểm tra mật khẩu nhập lại
        if (matKhau !== confirmMatKhau) {
            toastr.error("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        try {
            // 🔥 Kiểm tra email có thực sự tồn tại không
            const emailExists = await checkEmailExists(email);
            if (!emailExists) {
                toastr.error("Email không tồn tại khi đã kiểm tra bằng Mailbox Layer!");
                return;
            }
            // 🔥 Kiểm tra xem email đã tồn tại trong collection `nguoidung` chưa
            const userRef = db.collection("nguoidung");
            const querySnapshot = await userRef.where("Email", "==", email).get();

            if (!querySnapshot.empty) {
                toastr.error("Email đã tồn tại! Vui lòng sử dụng email khác.");
                return;
            }

            // Lấy tất cả các IDNguoiDung đã có và tìm ID mới
            const usersSnapshot = await userRef.get();
            let maxId = 0;
            usersSnapshot.forEach(doc => {
                const id = doc.data().IDNguoiDung;
                if (id && id.startsWith("PKA0")) {
                    const numberPart = id.slice(4);
                    const num = parseInt(numberPart, 10);
                    if (!isNaN(num) && num > maxId) {
                        maxId = num;
                    }
                }
            });

            const newId = `PKA0${(maxId + 1).toString()}`; // Tạo ID mới tăng dần mà không giới hạn số chữ số

            // Nếu chưa tồn tại, thêm dữ liệu vào collection `nguoidung`
            await userRef.add({
                HoTen: hoTen,
                Email: email,
                MatKhau: matKhau,  // 🔴 KHÔNG NÊN lưu mật khẩu trực tiếp, cần mã hóa
                SDT: sdt,
                DiaChi: diaChi,
                IDNguoiDung: newId,
                NgayTao: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Đăng ký thành công!");
            window.location.href = "login.html"; // Chuyển hướng về trang đăng nhập
        } catch (error) {
            toastr.error("Lỗi: " + error.message);
        }
    });
});
