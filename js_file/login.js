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
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        console.log("Đang kiểm tra tài khoản:", email);

        try {
            const userQuery = await db.collection("nguoidung").where("Email", "==", email).get();
            if (userQuery.empty) {
                toastr.error("Email không tồn tại trong hệ thống!");
                return;
            }

            let userData;
            userQuery.forEach(doc => {
                userData = doc.data();
            });

            console.log(userData)

            if (userData.MatKhau !== password) {
                toastr.error("Mật khẩu không đúng!");
                return;
            }

            // Đăng nhập thành công
            alert("Đăng nhập thành công!");
            localStorage.setItem("userName", userData.HoTen);
            localStorage.setItem("userId", userData.IDNguoiDung);
            window.location.href = "home.html";

        } catch (error) {
            toastr.error("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    });
});
