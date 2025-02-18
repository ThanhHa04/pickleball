const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5000'];
app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '050604',
    database: 'pickleball_db'
});

connection.connect(function (err) {
    if (err) {
        console.error('Lỗi kết nối MySQL: ' + err.stack);
        return;
    }
    console.log('Kết nối MySQL thành công với ID: ' + connection.threadId);
});

// Endpoint để lấy danh sách các địa điểm
app.get('/locations', (req, res) => {
    connection.query('SELECT * FROM locations', function (err, results) {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            return res.status(500).send('Lỗi truy vấn');
        }
        res.json(results);  // Trả về dữ liệu dạng JSON
    });
});
app.get('/San', (req, res) => {
    connection.query('SELECT * FROM San', (err, results) => {
        if (err) {
            res.status(500).send('Lỗi khi truy vấn cơ sở dữ liệu');
            return;
        }
        res.json(results);  // Trả kết quả dưới dạng JSON
    });
});

app.listen(port, () => {
    console.log(`Server đang chạy trên cổng ${port}`);
});
