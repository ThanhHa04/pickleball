const admin = require('firebase-admin');

// Đảm bảo rằng bạn đã tải xuống tệp JSON của Service Account Key từ Firebase Console
const serviceAccount = require('../firebase-config.json'); // Đảm bảo thay đường dẫn đúng đến tệp JSON

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://console.firebase.google.com/u/0/project/pka-pickleball/database" // Thay thế với URL của Realtime Database bạn đang sử dụng
});

// Trả về đối tượng cơ sở dữ liệu
const db = admin.database();
module.exports = db;
