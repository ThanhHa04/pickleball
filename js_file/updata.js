const admin = require("firebase-admin");

// Load thông tin từ file service account JSON
const serviceAccount = require("../firebase-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log("✅ Firebase đã kết nối thành công!");

async function createScheduleForNext3Days() {
  const today = new Date();
  const timeSlots = [];

  for (let i = -1; i <= 1; i++) {
    let futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    let formattedDate = futureDate.toISOString().split("T")[0]; // YYYY-MM-DD

    for (let hour = 6; hour < 22; hour++) {
      let price = (hour >= 8 && hour < 10) || (hour >= 15 && hour < 18) ? 170000 : 120000;

      let GioBatDau = `${hour.toString().padStart(2, "0")}:00`;
      let GioKetThuc = `${(hour + 1).toString().padStart(2, "0")}:00`;

      let docId = `S16_${formattedDate}_${GioBatDau}`;

      let timeSlot = {
        Gia: price,
        GioBatDau,
        GioKetThuc,
        IDSan: "S16",
        NgayDat: formattedDate,
        TrangThai: "Còn trống"
      };

      timeSlots.push({ docId, timeSlot });
    }
  }

  // Thêm dữ liệu vào Firestore
  for (let { docId, timeSlot } of timeSlots) {
    try {
      await db.collection("lichS16").doc(docId).set(timeSlot);
      console.log(`✅ Thêm thành công: ${docId}`);
    } catch (error) {
      console.error(`❌ Lỗi khi thêm ${docId}:`, error);
    }
  }
}

createScheduleForNext3Days();
