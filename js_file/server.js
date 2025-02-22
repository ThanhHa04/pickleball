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

// API để lấy dữ liệu từ collection locations
app.get('/locations', (req, res) => {
  const collectionRef = db.collection('locations');
  
  collectionRef.get()
    .then(snapshot => {
      if (snapshot.empty) {
        return res.status(404).json({ message: 'No locations found.' });
      }

      let locations = [];
      snapshot.forEach(doc => {
        locations.push(doc.data());
      });

      res.json(locations);  // Trả về dữ liệu cho frontend
    })
    .catch(err => {
      console.log('Error getting documents:', err);
      res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ Firebase.' });
    });
});

app.get('/san', (req, res) => {
    const collectionRef = db.collection('san');
    
    collectionRef.get()
      .then(snapshot => {
        if (snapshot.empty) {
          return res.status(404).json({ message: 'No locations found.' });
        }
  
        let locations = [];
        snapshot.forEach(doc => {
          locations.push(doc.data());
        });
  
        res.json(locations);  // Trả về dữ liệu cho frontend
      })
      .catch(err => {
        console.log('Error getting documents:', err);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ Firebase.' });
      });
  });

    app.get('/locations/:id', (req, res) => {
        const locationId = req.params.id;  // Lấy ID từ request
        console.log('Request for location ID:', locationId);  // Log để kiểm tra
    
        db.collection('locations').get()  // Lấy tất cả dữ liệu trong collection 'locations'
        .then(snapshot => {
            let foundLocation = null;
    
            snapshot.forEach(doc => {
            const docData = doc.data();
            if (docData.id && docData.id.toString() === locationId) {  // So sánh ID với request ID
                foundLocation = docData;  // Lưu lại thông tin location
            }
            });
    
            if (!foundLocation) {
            console.log('Location with ID ' + locationId + ' not found');
            return res.status(404).json({ message: 'Location not found.' });
            }
    
            res.json(foundLocation);  // Trả về dữ liệu location
        })
        .catch(err => {
            console.error('Error getting location:', err);
            res.status(500).json({ error: 'Lỗi khi lấy thông tin địa điểm.' });
        });
    });
  
  
  
// Lắng nghe trên cổng 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
