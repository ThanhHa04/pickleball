document.addEventListener('DOMContentLoaded', function() {
    // Lấy tất cả các menu item và tab content
    const menuItems = document.querySelectorAll('.profile-nav li');
    const tabContents = document.querySelectorAll('.tab-content');

    // Thêm sự kiện click cho từng menu item
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Xóa class active từ tất cả menu items
            menuItems.forEach(item => item.classList.remove('active'));
            
            // Thêm class active cho menu item được click
            this.classList.add('active');

            // Lấy tab-id từ data-tab attribute
            const tabId = this.getAttribute('data-tab');

            // Ẩn tất cả các tab content
            tabContents.forEach(content => content.classList.remove('active'));

            // Hiển thị tab content tương ứng
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Xử lý thông tin cá nhân
    const personalInfoForm = document.querySelector('#personal-info .info-form');
    personalInfoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            fullName: this.querySelector('input[type="text"]').value,
            birthDate: this.querySelector('input[type="date"]').value,
            gender: this.querySelector('select[name="gender"]').value,
            skillLevel: this.querySelector('select[name="skillLevel"]').value,
            playStyle: this.querySelector('select[name="playStyle"]').value
        };
        
        savePersonalInfo(formData);
    });

    // Xử lý thông tin liên hệ
    const contactInfoForm = document.querySelector('#contact-info .info-form');
    contactInfoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            phone: this.querySelector('input[type="tel"]').value,
            email: this.querySelector('input[type="email"]').value,
            address: this.querySelector('textarea').value
        };
        
        saveContactInfo(formData);
    });

    // Hàm gửi dữ liệu lên server
    async function savePersonalInfo(data) {
        try {
            const response = await fetch('/api/profile/personal-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification('Lưu thông tin thành công!', 'success');
            } else {
                throw new Error('Lỗi khi lưu thông tin');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    async function saveContactInfo(data) {
        try {
            const response = await fetch('/api/profile/contact-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification('Lưu thông tin liên hệ thành công!', 'success');
            } else {
                throw new Error('Lỗi khi lưu thông tin liên hệ');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    // Thêm vào file profile.js
    fetchUserInfo();

    // Hiển thị thông báo
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});

async function fetchUserInfo() {
    try {
        // Gọi API để lấy thông tin người dùng
        const response = await fetch('/api/user/info');
        const userData = await response.json();
        
        // Điền thông tin vào các trường
        fillUserData(userData);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
}

function fillUserData(userData) {
    // Điền thông tin cá nhân
    if (userData.fullName) document.getElementById('fullName').value = userData.fullName;
    if (userData.birthDate) document.getElementById('birthDate').value = userData.birthDate;
    if (userData.gender) document.getElementById('gender').value = userData.gender;
    if (userData.skillLevel) document.getElementById('skillLevel').value = userData.skillLevel;
    if (userData.playStyle) document.getElementById('playStyle').value = userData.playStyle;
    
    // Điền thông tin liên hệ
    if (userData.phone) document.getElementById('phone').value = userData.phone;
    if (userData.email) document.getElementById('email').value = userData.email;
    if (userData.address) document.getElementById('address').value = userData.address;
    
    // Điền avatar nếu có
    if (userData.avatar) {
        document.getElementById('avatar-preview').src = userData.avatar;
    }
}

// Xử lý khi người dùng thay đổi thông tin
async function saveUserInfo(formData) {
    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showNotification('Cập nhật thông tin thành công!', 'success');
        } else {
            throw new Error('Lỗi khi cập nhật thông tin');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Thêm event listener cho các form
document.querySelectorAll('.info-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Lấy tất cả thông tin từ form
        const formData = {};
        this.querySelectorAll('input, select, textarea').forEach(input => {
            formData[input.id] = input.value;
        });
        
        await saveUserInfo(formData);
    });
}); 