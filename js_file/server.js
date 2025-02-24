require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

// Khởi tạo Express
const app = express();
const port = 3000;

app.use('/css_file', express.static(path.join(__dirname, '../css_file')));
app.use('/js_file', express.static(path.join(__dirname, '../js_file')));
app.use('/images', express.static(path.resolve(__dirname, '../images')));
app.use(express.static(path.resolve(__dirname, '../html_file')));


const { FieldValue } = admin.firestore;
// Kết nối Firebase
const serviceAccount = require('../firebase-config.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.collection('nguoidung').get()
    .then(() => console.log('Kết nối Firestore thành công!'))
    .catch(err => console.error('Lỗi kết nối Firestore:', err));

// Cấu hình CORS để cho phép frontend truy cập
app.use(express.json());
app.use(cors());

// API lấy danh sách địa điểm từ 'locations'
app.get('/locations', async (req, res) => {
    try {
        const snapshot = await db.collection('locations').get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Không có địa điểm nào.' });
        }

        let locations = [];
        snapshot.forEach(doc => {
            locations.push({ id: doc.id, ...doc.data() });
        });

        res.json(locations);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách địa điểm:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API lấy danh sách sân từ 'san'
app.get('/san', async (req, res) => {
    try {
        const snapshot = await db.collection('san').get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Không có sân nào.' });
        }

        let sanList = [];
        snapshot.forEach(doc => {
            sanList.push({ id: doc.id, ...doc.data() });
        });

        res.json(sanList);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách sân:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API lấy chi tiết sân từ 'san' hoặc hiển thị mẫu Sân A01 nếu không có
app.get('/san/:id', async (req, res) => {
    try {
        const sanId = req.params.id;
        const sanRef = db.collection('san').doc(sanId);
        const doc = await sanRef.get();

        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        console.error('Lỗi khi lấy thông tin sân:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API lấy thông tin địa điểm theo ID từ 'locations'
app.get('/locations/:id', async (req, res) => {
    try {
        const locationId = req.params.id;
        const snapshot = await db.collection('locations').get();

        let foundLocation = null;
        snapshot.forEach(doc => {
            const docData = doc.data();
            if (docData.id && docData.id.toString() === locationId) {
                foundLocation = docData;
            }
        });

        if (!foundLocation) {
            console.log('Không tìm thấy địa điểm với ID:', locationId);
            return res.status(404).json({ message: 'Không tìm thấy địa điểm.' });
        }

        res.json(foundLocation);
    } catch (err) {
        console.error('Lỗi khi lấy thông tin địa điểm:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.get("/chitietsan/:id", async (req, res) => {
    try {
        const courtId = req.params.id;

        const snapshot = await db.collection("san").where("IDSan", "==", courtId).get();  // Dùng IDSan để truy vấn
        if (snapshot.empty) {
            return res.status(404).json({ message: "Không tìm thấy sân." });
        }

        // Nếu có dữ liệu, trả về tài liệu đầu tiên
        const court = snapshot.docs[0];
        res.json({ id: court.id, ...court.data() });
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết sân:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Cố định cho Gmail
    secure: true, // true cho 465, false cho 587
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});


// 📌 API gửi mã xác nhận về email
app.post('/send-verification-code', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email không hợp lệ!' });

        // 🔍 Kiểm tra email trong Firestore
        const userSnapshot = await db.collection('nguoidung').where('Email', '==', email).get();
        if (userSnapshot.empty) {
            console.log("❌ Không tìm thấy email:", email);
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống!' });
        }

        // 🔹 Lấy thông tin người dùng
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const timestamp = Date.now();

        // 🔹 Tạo mã xác nhận ngẫu nhiên
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        // 🔹 Lưu mã xác nhận vào Firestore
        await db.collection('nguoidung').doc(userDoc.id).update({
            resetCode: verificationCode,
            resetCodeTime: timestamp
        });

        // 🔹 Gửi email đặt lại mật khẩu
        const resetLink = `http://localhost:3000/reset-password?email=${email}&code=${verificationCode}`;
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Đặt lại mật khẩu',
            text: `Xin chào ${userData.HoTen},\n\nMã xác nhận của bạn: ${verificationCode}\nClick vào link để đặt lại mật khẩu: ${resetLink}\n\nNếu bạn không yêu cầu, vui lòng bỏ qua email này.`
        });

        console.log("📧 Mã xác nhận đã gửi đến:", email);
        res.json({ message: 'Mã xác nhận đã được gửi!' });

    } catch (error) {
        console.error("❌ Lỗi khi gửi mã xác nhận:", error);
        res.status(500).json({ message: 'Lỗi server!' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    const expirationTime = 5 * 60 * 1000; // 5 phút

    try {
        const userRef = db.collection('nguoidung').where('Email', '==', email);
        const snapshot = await userRef.get();

        if (snapshot.empty) {
            return res.json({ success: false, message: 'Email không tồn tại!' });
        }

        let userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const currentTime = Date.now();

        // Kiểm tra mã xác nhận & thời gian hợp lệ
        if (!userData.resetCode || userData.resetCode !== parseInt(code)) {
            return res.json({ success: false, message: 'Mã xác nhận không đúng!' });
        }
        if (!userData.resetCodeTime || currentTime - userData.resetCodeTime > expirationTime) {
            return res.json({ success: false, message: 'Mã xác nhận đã hết hạn!' });
        }

        // Cập nhật mật khẩu & xóa mã
        await userDoc.ref.update({
            MatKhau: newPassword,
            resetCode: FieldValue.delete(),
            resetCodeTime: FieldValue.delete()
        });

        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống!' });
    }
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../html_file/ResetPassWord.html'));
});

// Lắng nghe trên cổng 3000
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
