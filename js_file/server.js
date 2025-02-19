const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Cấu hình CORS
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5000'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Kết nối MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '050604',
    database: 'pickleball_db'
});

connection.connect(err => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err.stack);
        return;
    }
    console.log('Kết nối MySQL thành công với ID:', connection.threadId);
});

app.get('/San', (req, res) => {
    const sql = `
        SELECT San.*, locations.name AS location_name 
        FROM San 
        LEFT JOIN locations ON San.location_id = locations.id
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn:", err);
            return res.status(500).send("Lỗi server");
        }
        res.json(results);
    });
});

app.get('/locations', (req, res) => {
    connection.query('SELECT * FROM locations', (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            return res.status(500).send('Lỗi truy vấn');
        }
        res.json(results);
    });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy trên cổng ${port}`);
});
