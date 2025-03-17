require('dotenv').config();
const bcrypt = require('bcrypt');
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
const serviceAccount = require('../firebase-config.json');

app.use(express.json());
app.use(cors());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.post("/signup", async (req, res) => {
    const { hoTen, email, matKhau, sdt, diaChi } = req.body;

    try {
        const userRef = db.collection("nguoidung");
        const q = await userRef.where("Email", "==", email).get();
        if (!q.empty) {
            return res.status(400).json({ message: "Email đã tồn tại!" });
        }

        const hashedPassword = await bcrypt.hash(matKhau, 10);
        const usersSnapshot = await userRef.get();
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

        const newId = `PKA0${maxId + 1}`;
        const userSnapshot = await userRef.where("IDNguoiDung", "==", newId).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ message: "ID đã tồn tại, vui lòng chọn tên khác!" });
        }

        // Tạo tài liệu với ID document là newId
        await userRef.doc(newId).set({
            HoTen: hoTen,
            Email: email,
            MatKhau: hashedPassword,
            SDT: sdt,
            DiaChi: diaChi,
            IDNguoiDung: `PKA0${maxId + 1}`, 
            NgayTao: new Date(),
            role: "user"
        });

        res.json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("Lỗi khi xử lý đăng ký:", error.message);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const userQuery = await db.collection("nguoidung").where("Email", "==", email).get();
        if (userQuery.empty) {
            return res.status(400).json({ message: "Email không tồn tại!" });
        }

        let userData;
        let userId;
        userQuery.forEach(doc => {
            userData = doc.data();
            userId = doc.id;
        });

        // Kiểm tra mật khẩu
        const passwordMatch = await bcrypt.compare(password, userData.MatKhau);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Mật khẩu không đúng!" });
        }

        // Đăng nhập thành công
        res.json({
            message: "Đăng nhập thành công!",
            user: {
                userId,
                userName: userData.HoTen,
                userRole: userData.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});

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
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.get('/lichsudatsan', async (req, res) => {
    try {
        const snapshot = await db.collection('lichsudatsan').get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Không có lịch sử đặt sân nào.' });
        }

        let locations = [];
        snapshot.forEach(doc => {
            locations.push({ id: doc.id, ...doc.data() });
        });

        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.patch('/lichsudatsan/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const docRef = db.collection('lichsudatsan').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: "Không tìm thấy lịch sử đặt sân." });
        }

        await docRef.update(updateData);
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.get('/lichsuthanhtoan', async (req, res) => {
    try {
        const snapshot = await db.collection('lichsuthanhtoan').get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Không có lịch sử thanh toán nào.' });
        }

        let locations = [];
        snapshot.forEach(doc => {
            locations.push({ id: doc.id, ...doc.data() });
        });

        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

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
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.get('/san/:id', async (req, res) => {
    const id = req.params.id;
    console.log("🔍 Đang tìm IDSan:", id);

    try {
        const snapshot = await db.collection('san').where("IDSan", "==", id).get();

        if (snapshot.empty) {
            console.log("❌ Không tìm thấy sân với IDSan:", id);
            return res.status(404).json({ error: "Không tìm thấy sân" });
        }

        let san;
        snapshot.forEach(doc => {
            san = doc.data();
        });
        res.json(san);
    } catch (error) {
        console.error("🔥 Lỗi server:", error);
        res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau." });
    }
});

app.get('/chitietsan/:id', async (req, res) => {
    const id = req.params.id;
    console.log("🔍 Đang tìm IDSan:", id);

    try {
        const snapshot = await db.collection('chitietsan').where("IDSan", "==", id).get();

        if (snapshot.empty) {
            console.log("❌ Không tìm thấy sân với IDSan:", id);
            return res.status(404).json({ error: "Không tìm thấy sân" });
        }

        let isan;
        snapshot.forEach(doc => {
            isan = doc.data();
        });
        res.json(isan);
    } catch (error) {
        console.error("🔥 Lỗi server:", error);
        res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau." });
    }
});

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
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.get('/lich/:IDSan', async (req, res) => {
    const { IDSan } = req.params; 
    const collectionName = `lich${IDSan}`; 

    try {
        const snapshot = await db.collection(collectionName).get();
        let slots = [];
        
        snapshot.forEach(doc => {
            slots.push({ id: doc.id, ...doc.data() });
        });

        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/lich/:IDSan/:documentId', async (req, res) => {
    const { IDSan, documentId } = req.params;
    const updateData = req.body;
    const collectionName = `lich${IDSan}`;

    try {
        const docRef = db.collection(collectionName).doc(documentId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: "Không tìm thấy lịch đặt sân." });
        }

        await docRef.update(updateData);
        res.json({ message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/nguoidung/:userId', async (req, res) => {
    const { userId } = req.params;  

    try {
        const snapshot = await db.collection('nguoidung')
            .where("IDNguoiDung", "==", userId)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }

        let userData = {};
        snapshot.forEach(doc => {
            userData = { id: doc.id, ...doc.data() };
        });

        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

app.post('/send-verification-code', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email không hợp lệ!' });

        // 🔍 Kiểm tra email trong Firestore
        const userSnapshot = await db.collection('nguoidung').where('Email', '==', email).get();
        if (userSnapshot.empty) {
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
            text: `Xin chào ${userData.HoTen},\n\n
                    Mã xác nhận của bạn: ${verificationCode}\n
                    Click vào link để đặt lại mật khẩu: ${resetLink}\n\n
                    Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n
                    Lưu ý: Mã xác nhận này chỉ có hiệu lực trong vòng 5 phút!`
        });

        console.log("📧 Mã xác nhận đã gửi đến:", email);
        res.json({ message: 'Mã xác nhận đã được gửi!' });

    } catch (error) {
        console.error("🚨 Lỗi server:", error);
        res.status(500).json({ message: 'Lỗi server!' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    const expirationTime = 5 * 60 * 1000;

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

// API xử lý thanh toán
app.post('/process-payment', async (req, res) => {
    const { userId, userName, userEmail, userPhone, totalPrice, fieldName, fieldAddress, idSan, selectedDate, selectedTime, paymentTime, onePrice, docId } = req.body;
    let batch = db.batch();

    try {
        // Thêm lịch sử thanh toán
        let paymentRef = db.collection("lichsuthanhtoan").doc(docId);
        batch.set(paymentRef, {
            userId,
            tenNguoiDung: userName,
            email: userEmail,
            sdt: userPhone,
            soTien: totalPrice,
            tenSan: fieldName,
            idSan,
            diaChiSan: fieldAddress,
            khungGio: selectedTime,
            thoiGianThanhToan: paymentTime,
            trangThaiThanhToan: "Thành công"
        });

        // Thêm lịch sử đặt sân
        let bookingRef = db.collection("lichsudatsan").doc(docId);
        batch.set(bookingRef, {
            userId,
            tenNguoiDung: userName,
            sdt: userPhone,
            idSan,
            ngayDatSan: selectedDate,
            khungGio: selectedTime,
            tenSan: fieldName,
            diaChiSan: fieldAddress,
            giaSan: onePrice,
            tienTrinh: "Chưa diễn ra"
        });

        // Cập nhật trạng thái sân thành "Đã đặt"
        let fieldRef = db.collection(`lich${idSan}`).doc(`${idSan}_${selectedDate}_${selectedTime}`);
        batch.update(fieldRef, { TrangThai: "Đã đặt" });

        await batch.commit();
        res.json({ success: true, message: "Thanh toán và đặt sân thành công!" });
    } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error.message);
        res.json({ success: false, message: "Có lỗi xảy ra khi xử lý thanh toán." });
    }
});

app.use(express.static(path.join(__dirname, "html_file")));

// Lắng nghe trên cổng 3000
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
