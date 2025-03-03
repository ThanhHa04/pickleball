const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('../firebase-config.json'))
});

const db = admin.firestore();
const updateNgayDat = async () => {
  const currentDate = new Date();
  const courtsSnapshot = await db.collection('san').get();
  const courts = courtsSnapshot.docs.map(doc => doc.id); 
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i); 
    const formattedDate = date.toISOString().split('T')[0];
    
    for (const courtId of courts) {
      for (let hour = 6; hour <= 22; hour++) {
        const hourString = `${String(hour).padStart(2, '0')}:00`; 
        const docId = `${courtId}_${formattedDate}_${hourString}`; 

        const docRef = db.collection('lichsan').doc(docId);
        
        try {
          await docRef.update({
            NgayDat: formattedDate 
          });
          
          console.log(`Document ${docId} updated with NgayDat: ${formattedDate}`);
        } catch (error) {
          console.error(`Error updating document ${docId}: `, error);
        }
      }
    }
  }
};

// Gọi hàm để chạy
updateNgayDat();
