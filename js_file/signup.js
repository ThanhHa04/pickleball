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
        e.preventDefault();  // Ngăn chặn load lại trang

        // Lấy dữ liệu từ input
        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Kiểm tra mật khẩu nhập lại
        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        try {
            // Đăng ký tài khoản Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Lưu thông tin người dùng vào Firestore
            await db.collection("users").doc(user.uid).set({
                fullName: fullName,
                email: email,
                uid: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Đăng ký thành công!");
            window.location.href = "/html_file/login.html"; // Chuyển hướng về trang đăng nhập
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    });
});
