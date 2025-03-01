const admin = require('firebase-admin');

// Khởi tạo Firebase Admin SDK cho Firestore
admin.initializeApp({
  credential: admin.credential.cert(require('../firebase-config.json'))
});

const db = admin.firestore();

async function updateLichSan() {
  const date = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dưới định dạng YYYY-MM-DD
  const docRef = db.collection('lichsan').doc(date);
  
  await docRef.set({
    date: date,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Lichsan document for ${date} updated!`);
}

updateLichSan().catch(console.error);
