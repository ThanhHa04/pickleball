

const firebaseConfig = {
    apiKey: "AIzaSyATp-eu8CBatLs04mHpZS4c66FaYw5zLgk",
    authDomain: "pka-pickleball.firebaseapp.com",
    projectId: "pka-pickleball",
    storageBucket: "pka-pickleball.appspot.com",
    messagingSenderId: "38130361867",
    appId: "1:38130361867:web:f3c1a3940e3c390b11890e",
    measurementId: "G-0YQ7GKJKRC"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const userUid = localStorage.getItem('userUid');
if (userUid) {
    // Người dùng đã đăng nhập, tiếp tục xử lý
    console.log('User UID:', userUid);
    // ... thực hiện các thao tác khác
const docRef = doc(db, "nguoidung", userUid);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
    const userData = docSnap.data();
    document.getElementById('name').value = userData.HoTen;
    document.getElementById('email').value = userData.Email;
    document.getElementById('phone').value = userData.SoDienThoai;
    document.getElementById('address').value = userData.DiaChi;
    document.getElementById('birthDate').value = userData.birthDate;
    document.getElementById('gender').value = userData.GioiTinh;
    document.getElementById('skillLevel').value = userData.TrinhDo;
} else {
    console.log("Không tìm thấy người dùng với ID:", userUid);
}
} else {
    // Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    //window.location.href = '/login.html';
}

// const auth = getAuth();
// const db = getFirestore();

// Xử lý chuyển tab
document.querySelectorAll('.profile-nav li').forEach(tab => {
    tab.addEventListener('click', () => {
        // Xóa active class từ tất cả các tab
        document.querySelectorAll('.profile-nav li').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Thêm active class cho tab được chọn
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Xử lý upload ảnh đại diện
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');
const avatarModal = document.getElementById('avatar-modal');
const modalAvatar = document.getElementById('modal-avatar');
const closeModal = document.querySelector('.close');

avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Xử lý modal xem ảnh
avatarPreview.addEventListener('click', () => {
    modalAvatar.src = avatarPreview.src;
    avatarModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    avatarModal.style.display = 'none';
});

// Lấy thông tin người dùng từ Firestore

console.log("Firebase Firestore initialized:", db);


async function getUserData(userId) {
    try {
        console.log("Checked id:" ,userId);

       
        const userQuery = await db.collection("nguoidung").where("IDNguoiDung", "==", userId).get();

        if (userQuery.empty) {
            toastr.error("Email không tồn tại trong hệ thống!");
            return;
        }


        
        let userData;
            userQuery.forEach(doc => {
             userData = doc.data();
            });

            console.log(userData)
            // Điền thông tin vào form
            document.getElementById('fullName').value = userData.HoTen || '';
            document.getElementById('birthDate').value = userData.NgaySinh || '';
            document.getElementById('gender').value = userData.GioiTinh || '';
            document.getElementById('skillLevel').value = userData.TrinhDo || '';
            document.getElementById('playStyle').value = userData.PhongCach || '';
            document.getElementById('phone').value = userData.SDT || '';
            document.getElementById('email').value = userData.Email || '';
            document.getElementById('address').value = userData.DiaChi || '';
            if (userData.avatarUrl) {
                avatarPreview.src = userData.avatarUrl;
            }
            return ""
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
}

getUserData("PKA04")
// Lưu thông tin cá nhân
async function savePersonalInfo(userId) {
    try {
        const userData = {
            HoTen: document.getElementById('fullname').value,
            NgaySinh: document.getElementById('birthDate').value,
            GioiTinh: document.getElementById('gender').value,
            TrinhDo: document.getElementById('skillLevel').value,
            PhongCach: document.getElementById('playStyle').value
        };
        
        await updateDoc(doc(db, "nguoidung", userId), userData);
        alert("Đã lưu thông tin thành công!");
    } catch (error) {
        console.error("Lỗi khi lưu thông tin:", error);
        alert("Có lỗi xảy ra khi lưu thông tin!");
    }
}

// Lưu thông tin liên hệ
async function saveContactInfo(userId) {
    try {
        const contactData = {
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            DiaChi: document.getElementById('DiaChi').value
        };
        
        await updateDoc(doc(db, "nguoidung", userId), contactData);
        alert("Đã lưu thông tin liên hệ thành công!");
    } catch (error) {
        console.error("Lỗi khi lưu thông tin liên hệ:", error);
        alert("Có lỗi xảy ra khi lưu thông tin!");
    }
}

// Kiểm tra trạng thái đăng nhập và load dữ liệu
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         getUserData(user.uid);
        
//         // Xử lý nút lưu thông tin cá nhân
//         document.querySelector('#personal-info .save-btn').addEventListener('click', () => {
//             savePersonalInfo(user.uid);
//         });
        
//         // Xử lý nút lưu thông tin liên hệ
//         document.querySelector('#contact-info .save-btn').addEventListener('click', () => {
//             saveContactInfo(user.uid);
//         });
        
//         // Xử lý đổi mật khẩu
//         document.querySelector('#account-info .save-btn').addEventListener('click', async () => {
//             const newPassword = document.getElementById('newPassword').value;
//             const confirmPassword = document.getElementById('confirmPassword').value;
            
//             if (newPassword !== confirmPassword) {
//                 alert("Mật khẩu mới không khớp!");
//                 return;
//             }
            
//             try {
//                 await updatePassword(user, newPassword);
//                 alert("Đã cập nhật mật khẩu thành công!");
//             } catch (error) {
//                 console.error("Lỗi khi đổi mật khẩu:", error);
//                 alert("Có lỗi xảy ra khi đổi mật khẩu!");
//             }
//         });
//     } else {
//         window.location.href = '/html_file/login.html';
//     }
// });

// userId là gì , để e thử gọi 


// Lưu dữ liệu lên Firebase
const saveButtons = document.querySelectorAll('.save-btn');

saveButtons.forEach(saveButton => {
    saveButton.addEventListener('click', async () => {
        const fullName = document.getElementById('fullName').value;
        const birthDate = document.getElementById('birthDate').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;

        const updateData = {};

        if (fullName) {
            updateData.HoTen = fullName;
        }
        if (birthDate) {
            updateData.NgaySinh = birthDate;
        }
        if (email) {
            updateData.Email = email;
        }
        if (address) {
            updateData.DiaChi = address;
        }

        if (auth.currentUser) { // Kiểm tra trạng thái đăng nhập
            try {
                const userId = auth.currentUser.uid;
                const userDocRef = doc(db, 'nguoidung', userId);
                await updateDoc(userDocRef, updateData);
                alert('Cập nhật thông tin thành công!');
            } catch (error) {
                console.error('Lỗi khi cập nhật thông tin:', error);
                alert('Có lỗi xảy ra khi cập nhật thông tin.');
            }
        } else {
            alert('Bạn cần đăng nhập để cập nhật thông tin.');
            // Hoặc chuyển hướng người dùng đến trang đăng nhập:
            // window.location.href = '/html_file/Login.html';
        }
    });
});

