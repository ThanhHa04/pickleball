const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Kết nối Firebase
const serviceAccount = require('../firebase-config.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Khởi tạo Express
const app = express();
const port = 3000;

// Cấu hình CORS để cho phép frontend truy cập
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

        if (!doc.exists) {
            // Nếu sân không tồn tại, trả về thông tin mẫu của Sân A01
            return res.json({
                IDSan: "S01",
                IDLoaiSan: "P01",
                TenSan: "Sân A01",
                GiaThue: 200000,
                MoTa: "Sân Acrylic",
                TrangThai: "Hoạt động",
                location_id: 1,
                HinhAnh: [
                    "https://sukavietnam.com/wp-content/uploads/2024/09/sukavietnam.com-hinh-anh-mau-san-pickleball-dep-1.webp"
                ],
                KichThuoc: "20m x 40m",
                SoNguoiToiDa: 8,
                TinhTrang: "Bề mặt sân còn mới, có hệ thống đèn chiếu sáng"
            });
        }

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
        const courtId = req.params.id;  // Lấy ID từ URL
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


// Lắng nghe trên cổng 3000
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
