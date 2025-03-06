// Import Firebase theo cách đúng trong trình duyệt
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
            const userRef = collection(db, "nguoidung");
            const q = query(userRef, where("Email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("Email đã tồn tại! Vui lòng sử dụng email khác.");
                return;
            }

            const usersSnapshot = await getDocs(userRef);
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

            // Tạo ID mới
            const newId = `PKA0${usersSnapshot.size + 1}`;
            // Thêm dữ liệu vào collection `nguoidung`
            await addDoc(userRef, {
                HoTen: hoTen,
                Email: email,
                MatKhau: matKhau,  // 🔴 KHÔNG NÊN lưu mật khẩu trực tiếp, cần mã hóa
                SDT: sdt,
                DiaChi: diaChi,
                IDNguoiDung: newId,
                NgayTao: new Date(),
                role:"user"
            });

            alert("Đăng ký thành công!");
            window.location.href = "login.html"; // Chuyển hướng về trang đăng nhập
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    });
});
