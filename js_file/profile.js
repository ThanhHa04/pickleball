

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

const userUid = localStorage.getItem('userId');
if (userUid) {
    getUserData(userUid)
}

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



// Lưu dữ liệu lên Firebase
const saveButtons = document.querySelectorAll('.save-btn');

saveButtons.forEach(saveButton => {
    saveButton.addEventListener('click', async () => {
        const avatar = document.getElementById('avatar-preview').src;
        const fullName = document.getElementById('fullName').value;
        const birthDate = document.getElementById('birthDate').value;
        const gender = document.getElementById('gender').value;
        const skillLevel = document.getElementById('skillLevel').value;
        const playStyle = document.getElementById('playStyle').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;

        const updateData = {};

        if (fullName) {
            updateData.HoTen = fullName;
        }
        if (avatar) {
            updateData.Avt = avatar;
        }
        if (birthDate) {
            updateData.NgaySinh = birthDate;
        }
        if (gender) {
            updateData.GioiTinh = gender;
        }
        if (skillLevel) {
            updateData.TrinhDo = skillLevel;
        }
        if (playStyle) {
            updateData.PhongCach = playStyle;
        }
        if (email) {
            updateData.Email = email;
        }
        if (address) {
            updateData.DiaChi = address;
        }

        try {
            const userQuerySnapshot = await db.collection("nguoidung")
                .where("IDNguoiDung", "==", userUid)
                .get();

            if (userQuerySnapshot.empty) {
                console.log(" Không tìm thấy tài liệu!");
            } else {
                userQuerySnapshot.forEach(async (doc) => {
                    const docData = doc.data(); // Lấy dữ liệu hiện tại của document

                    // Kiểm tra và thêm các trường nếu chúng chưa tồn tại
                    if (avatar && !docData.Avt) {
                        updateData.Avt = avatar;
                    }
                    if (fullName && !docData.HoTen) {
                        updateData.HoTen = fullName;
                    }
                    if (birthDate && !docData.NgaySinh) {
                        updateData.NgaySinh = birthDate;
                    }
                    if (gender && !docData.GioiTinh) {
                        updateData.GioiTinh = gender;
                    }
                    if (skillLevel && !docData.TrinhDo) {
                        updateData.TrinhDo = skillLevel;
                    }
                    if (playStyle && !docData.PhongCach) {
                        updateData.PhongCach = playStyle;
                    }
                    if (email && !docData.Email) {
                        updateData.Email = email;
                    }
                    if (address && !docData.DiaChi) {
                        updateData.DiaChi = address;
                    }

                    await doc.ref.update(updateData); // Cập nhật document với dữ liệu đã kiểm tra
                });
                console.log("✅ Cập nhật thành công!");
                alert('Cập nhật thành công');
            }

            getUserData(userUid);
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin.');
        }

    });
});


const savePassWord = document.querySelector('.pw-save-btn');

savePassWord.addEventListener('click', async () => {

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;


    const updateData = {};

        if (confirmPassword == newPassword) {
            updateData.MatKhau = newPassword;
        }
        else {
            alert('Mật khẩu không khớp!');
            return;
        }

        try {
            const userQuerySnapshot = await db.collection("nguoidung")
                .where("IDNguoiDung", "==", userUid)
                .get();

                if (userQuerySnapshot.empty) {
                    console.log(" Không tìm thấy tài liệu!");
                } else {
                    userQuerySnapshot.forEach(async (doc) => {
                        const docData = doc.data(); // Lấy dữ liệu hiện tại của document

                        if (currentPassword != docData.MatKhau) {
                            alert('Mật khẩu hiện tại không đúng!');
                            return;
                        }
                        if (newPassword == currentPassword) {
                            alert('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
                            return;
                        }
                        else {
                            updateData.MatKhau = newPassword;
                            await doc.ref.update(updateData);
                            alert('Đã cập nhật mật khẩu thành công!');
                        }
                    });
                }
        }
        catch (error) {
            console.error('Lỗi khi cập nhật mật khẩu:', error);
            alert('Có lỗi xảy ra khi cập nhật mật khẩu.');
        }
});
