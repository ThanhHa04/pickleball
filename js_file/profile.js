import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import * as bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/+esm";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userUid = localStorage.getItem('userId');
if (userUid) {
    getUserData(userUid)
}

// Xử lý chuyển tab
document.querySelectorAll('.profile-nav li').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.profile-nav li').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
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
async function getUserData(userId) {
    try {
        const userQuery = query(collection(db, "nguoidung"), where("IDNguoiDung", "==", userId));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            toastr.error("Email không tồn tại trong hệ thống!");
            return;
        }

        querySnapshot.forEach(doc => {
            const userData = doc.data();
            document.getElementById('fullName').value = userData.HoTen || '';
            document.getElementById('birthDate').value = userData.NgaySinh || '';
            document.getElementById('gender').value = userData.GioiTinh || '';
            document.getElementById('skillLevel').value = userData.TrinhDo || '';
            document.getElementById('playStyle').value = userData.PhongCach || '';
            document.getElementById('phone').value = userData.SDT || '';
            document.getElementById('email').value = userData.Email || '';
            document.getElementById('address').value = userData.DiaChi || '';
            if (userData.avatarUrl) {
                document.getElementById('avatar-preview').src = userData.avatarUrl;
            }
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
}

// Lưu thông tin cá nhân
async function savePersonalInfo(userId) {
    try {
        const userData = {
            HoTen: document.getElementById('fullName').value,
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
            SDT: document.getElementById('phone').value,
            Email: document.getElementById('email').value,
            DiaChi: document.getElementById('address').value
        };
        await updateDoc(doc(db, "nguoidung", userId), contactData);
        alert("Đã lưu thông tin liên hệ thành công!");
    } catch (error) {
        console.error("Lỗi khi lưu thông tin liên hệ:", error);
        alert("Có lỗi xảy ra khi lưu thông tin!");
    }
}

const saveButtons = document.querySelectorAll(".save-btn");
saveButtons.forEach((saveButton) => {
    saveButton.addEventListener("click", async () => {
        const avatar = document.getElementById("avatar-preview").src;
        const fullName = document.getElementById("fullName").value;
        const birthDate = document.getElementById("birthDate").value;
        const gender = document.getElementById("gender").value;
        const skillLevel = document.getElementById("skillLevel").value;
        const playStyle = document.getElementById("playStyle").value;
        const email = document.getElementById("email").value;
        const address = document.getElementById("address").value;
        const phone = document.getElementById("phone").value;

        if (!userUid) {
            console.error("❌ userUid bị undefined! Kiểm tra lại.");
            alert("Lỗi: Không tìm thấy ID người dùng!");
            return;
        }

        const updateData = {};

        if (fullName) updateData.HoTen = fullName;
        if (phone) updateData.SDT = phone;
        if (avatar) updateData.Avt = avatar;
        if (birthDate) updateData.NgaySinh = birthDate;
        if (gender) updateData.GioiTinh = gender;
        if (skillLevel) updateData.TrinhDo = skillLevel;
        if (playStyle) updateData.PhongCach = playStyle;
        if (email) updateData.Email = email;
        if (address) updateData.DiaChi = address;

        if (Object.keys(updateData).length === 0) {
            console.log("⚠️ Không có dữ liệu để cập nhật!");
            return;
        }

        try {
            const userQuerySnapshot = await getDocs(
                query(collection(db, "nguoidung"), where("IDNguoiDung", "==", userUid))
            );

            if (userQuerySnapshot.empty) {
                console.log("❌ Không tìm thấy tài liệu!");
                alert("Không tìm thấy thông tin người dùng.");
            } else {
                userQuerySnapshot.forEach(async (document) => {
                    await updateDoc(doc(db, "nguoidung", document.id), updateData);
                });

                console.log("✅ Cập nhật thành công!");
                alert("Cập nhật thành công!");
            }

            getUserData(userUid);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật thông tin:", error);
            alert("Có lỗi xảy ra khi cập nhật thông tin.");
        }
    });
});

const savePassWord = document.querySelector('.pw-save-btn');
savePassWord.addEventListener('click', async () => {
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('Mật khẩu không khớp!');
            return;
        }

        const userQuery = query(collection(db, "nguoidung"), where("IDNguoiDung", "==", userUid));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            alert("Không tìm thấy tài khoản!");
            return;
        }

        querySnapshot.forEach(async (docSnapshot) => {
            const docData = docSnapshot.data();
            // So sánh mật khẩu hiện tại (đã hash) với mật khẩu nhập vào
            const match = await bcrypt.compare(currentPassword, docData.MatKhau);
            if (!match) {
                alert('Mật khẩu hiện tại không đúng!');
                return;
            }
            if (newPassword === currentPassword) {
                alert('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
                return;
            }
            // Hash mật khẩu mới trước khi lưu vào Firestore
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await updateDoc(doc(db, "nguoidung", docSnapshot.id), { MatKhau: hashedPassword });

            alert('Đã cập nhật mật khẩu thành công!');
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật mật khẩu:", error);
        alert("Có lỗi xảy ra khi cập nhật mật khẩu.");
    }
});

