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
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        // Kiểm tra mật khẩu nhập lại
        if (matKhau !== confirmMatKhau) {
            alert("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        try {
            // 🔥 Kiểm tra xem email đã tồn tại trong collection `nguoidung` chưa
            const userRef = db.collection("nguoidung");
            const querySnapshot = await userRef.where("email", "==", email).get();

            if (!querySnapshot.empty) {
                alert("Email đã tồn tại! Vui lòng sử dụng email khác.");
                return;
            }

            // Lấy tất cả các IDNguoiDung đã có và tìm ID mới
            const usersSnapshot = await userRef.get();
            let maxId = 0;
            usersSnapshot.forEach(doc => {
                const id = doc.data().IDNguoiDung;
                if (id && id.startsWith("PKA0")) {
                    const numberPart = id.slice(4); // Lấy phần số sau "PKA0"
                    const num = parseInt(numberPart, 10);
                    if (!isNaN(num) && num > maxId) {
                        maxId = num; // Cập nhật ID lớn nhất
                    }
                }
            });

            // Tạo ID mới theo cấu trúc PKA0x, PKA0xx, PKA0xxx (tùy thuộc vào số đã có)
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
            window.location.href = "/html_file/login.html"; // Chuyển hướng về trang đăng nhập
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    });
});
