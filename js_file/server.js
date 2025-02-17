const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3000;

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '050604', // Mật khẩu của bạn
    database: 'pickleball_db'
});

// Kết nối đến cơ sở dữ liệu MySQL
db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL: ' + err.stack);
        return;
    }
    console.log('Kết nối MySQL thành công');
});

app.use(cors());

// Endpoint để lấy danh sách sân từ MySQL
app.get('/locations', (req, res) => {
    const query = 'SELECT lat, lng, name, address FROM locations';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Lỗi truy vấn cơ sở dữ liệu');
            return;
        }
        res.json(results);
    });
});

// Lắng nghe ở cổng 3000
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
