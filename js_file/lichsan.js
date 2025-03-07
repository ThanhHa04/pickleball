const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } = require("firebase/firestore"); // 🔹 Thêm getDocs để lấy danh sách tài liệu

// 🔹 Cấu hình Firebase (Thông tin cần được bảo mật khi triển khai thực tế)
const firebaseConfig = {
    apiKey: "AIzaSyATp-eu8CBatLs04mHpZS4c66FaYw5zLgk",
    authDomain: "pka-pickleball.firebaseapp.com",
    projectId: "pka-pickleball",
    storageBucket: "pka-pickleball.appspot.com",
    messagingSenderId: "38130361867",
    appId: "1:38130361867:web:f3c1a3940e3c390b11890e",
    measurementId: "G-0YQ7GKJKRC"
};

// 🔹 Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Hàm tạo lịch sân
async function createLichSan() {
    try {
        const danhSachSan = Array.from({ length: 16 }, (_, i) => `S${(i + 1).toString().padStart(2, "0")}`);
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            let ngayDat = new Date(today);
            ngayDat.setDate(today.getDate() + i);
            let ngayDatStr = ngayDat.toISOString().split("T")[0];

            for (let san of danhSachSan) {
                for (let hour = 6; hour < 22; hour++) {
                    let gioBatDau = `${hour.toString().padStart(2, "0")}:00`;
                    let gioKetThuc = `${(hour + 1).toString().padStart(2, "0")}:00`;

                    let idLich = `${san}_${ngayDatStr}_${gioBatDau}`; // 🔹 Đảm bảo ID đúng format
                    let docRef = doc(db, "lichsan", idLich);

                    await setDoc(docRef, {
                        IDSan: san,
                        NgayDat: ngayDatStr,
                        GioBatDau: gioBatDau,
                        GioKetThuc: gioKetThuc,
                        TrangThai: "Còn trống"
                    });
                }
            }
        }
        console.log("✅ Lịch sân đã được tạo thành công!"); // 🔹 Thêm log xác nhận
    } catch (error) {
        console.error("❌ Lỗi khi tạo lịch sân:", error);
    }
}

// 🔹 Xóa toàn bộ lịch cũ trước khi tạo mới
async function resetLichSan() {
    try {
        console.log("🗑️ Đang xóa dữ liệu cũ...");
        const querySnapshot = await getDocs(collection(db, "lichsan")); // 🔹 Lấy danh sách tài liệu hiện có
        for (let document of querySnapshot.docs) {
            await deleteDoc(document.ref);
        }
        console.log("✅ Dữ liệu cũ đã bị xóa!"); // 🔹 Thêm log xác nhận
        await createLichSan();
    } catch (error) {
        console.error("❌ Lỗi khi xóa dữ liệu cũ:", error);
    }
}

// 🔹 Chạy script
createLichSan();
