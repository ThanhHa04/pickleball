const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } = require("firebase/firestore");

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

// Danh sách sân từ S01 đến S16
const danhSachSan = Array.from({ length: 16 }, (_, i) => `S${(i + 1).toString().padStart(2, "0")}`);

// Lấy ngày hôm qua, hôm nay và ngày +2
const today = new Date();
const ngayHomQua = new Date(today);
ngayHomQua.setDate(today.getDate() - 1);
const ngayHomQuaStr = ngayHomQua.toISOString().split("T")[0]; // YYYY-MM-DD

const ngayMoi = new Date(today);
ngayMoi.setDate(today.getDate() + 2);
const ngayMoiStr = ngayMoi.toISOString().split("T")[0]; // YYYY-MM-DD

async function updateLichSan() {
    try {
        console.log("📅 Ngày cần cập nhật:", { ngayHomQuaStr, ngayMoiStr });

        for (let san of danhSachSan) {
            let collectionName = `lich${san}`;
            console.log(`\n🔄 Đang xử lý: ${collectionName}`);

            // 🔹 **Lưu lại giá sân của ngày hôm qua**
            let giaSanHomQua = {};
            const querySnapshot = await getDocs(collection(db, collectionName));

            for (let docItem of querySnapshot.docs) {
                let data = docItem.data();
                if (data.NgayDat === ngayHomQuaStr) {
                    let key = `${data.GioBatDau}`;
                    giaSanHomQua[key] = data.Gia || 0;
                }
            }

            console.log("📌 Giá sân ngày hôm qua:", giaSanHomQua);

            // ❌ **Chỉ xóa lịch của ngày hôm qua**
            for (let docItem of querySnapshot.docs) {
                let data = docItem.data();
                if (data.NgayDat === ngayHomQuaStr) {
                    console.log(`🗑️ Xóa: ${docItem.id}`);
                    await deleteDoc(doc(db, collectionName, docItem.id));
                }
            }

            // ✅ **Tạo lịch cho ngày mới (ngày hôm nay + 2)**
            for (let hour = 6; hour < 22; hour++) {
                let gioBatDau = `${hour.toString().padStart(2, "0")}:00`;
                let gioKetThuc = `${(hour + 1).toString().padStart(2, "0")}:00`;

                let docID = `${san}_${ngayMoiStr}_${gioBatDau}`;
                let docRef = doc(db, collectionName, docID);

                let giaSan = giaSanHomQua[gioBatDau];

                await setDoc(docRef, {
                    IDSan: san,
                    NgayDat: ngayMoiStr,
                    GioBatDau: gioBatDau,
                    GioKetThuc: gioKetThuc,
                    TrangThai: "Còn trống",
                    Gia: giaSan
                });

                console.log(`✅ Tạo mới: ${docID} | Giá: ${giaSan}`);
            }
        }

        console.log("\n🎉 Cập nhật lịch sân thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật lịch sân:", error);
    }
}

// Chạy cập nhật
updateLichSan();
