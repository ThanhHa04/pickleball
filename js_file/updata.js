const mysql = require("mysql2");
const admin = require("firebase-admin");

// Load Firebase service account key
const serviceAccount = require("../firebase-config.json"); // Thay đường dẫn file key Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Kết nối Firestore

// Kết nối MySQL
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "050604",
  database: "pickleball_db",
});

connection.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
    return;
  }
  console.log("Kết nối MySQL thành công!");

  // Truy vấn dữ liệu từ MySQL
  connection.query("SELECT * FROM GoiHoiVien", async (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn MySQL:", err);
      return;
    }

    const batch = db.batch(); // Tạo batch để ghi dữ liệu nhanh hơn

    results.forEach((record) => {
      const docRef = db.collection("GoiHoiVien").doc(record.IDGoi); // Ghi vào Firestore theo IDSan
      batch.set(docRef, record);
    });

    await batch.commit(); // Đẩy dữ liệu vào Firestore
    console.log("Dữ liệu đã được thêm vào Firestore!");
    connection.end(); // Đóng kết nối MySQL
  });
});
