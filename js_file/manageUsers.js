document.addEventListener('DOMContentLoaded', function() {
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search-input');
    const usersPerPage = 20;
    let currentPage = 1;
    let allUsers = [];

    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyATp-eu8CBatLs04mHpZS4c66FaYw5zLgk",
        authDomain: "pka-pickleball.firebaseapp.com",
        projectId: "pka-pickleball",
        storageBucket: "pka-pickleball.appspot.com",
        messagingSenderId: "38130361867",
        appId: "1:38130361867:web:f3c1a3940e3c390b11890e",
        measurementId: "G-0YQ7GKJKRC"
    };
    firebase.initializeApp(firebaseConfig);

    const db = firebase.firestore();

    function fetchUsers() {
        db.collection('nguoidung').get().then((querySnapshot) => {
            allUsers = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.HoTen || '-',
                    email: data.Email || '-',
                    phone: data.IDNguoiDung || '-',
                    membershipStatus: data.HienThiThongTin ? 'Đã kích hoạt' : 'Chưa kích hoạt',
                    creationDate: data.NgayTao || '-',
                    role: data.role || 'user'
                };
            });
            allUsers.sort((a, b) => {
                if (a.role === b.role) {
                    return a.name.localeCompare(b.name);
                }
                return a.role === 'admin' ? -1 : 1;
            });
            filterUsers();
        });
    }

    function filterUsers() {
        const searchTerm = userSearchInput.value.toLowerCase();
        const filteredUsers = allUsers.filter(user => {
            return user.name.toLowerCase().includes(searchTerm) ||
                   user.phone.includes(searchTerm);
        });
        displayUsers(filteredUsers);
    }

    function handleEditUser(user) {
        alert(`Chỉnh sửa thông tin người dùng: ${user.name}`);
        const userRef = db.collection('nguoidung').doc(user.id);
        const newName = prompt('Nhập tên mới:', user.name);
        const newEmail = prompt('Nhập email mới:', user.email);
        const newPhone = prompt('Nhập số điện thoại mới:', user.phone);
        const newMembershipStatus = confirm('Kích hoạt hiển thị thông tin?') ? true : false;
        const newRole = prompt('Nhập vai trò mới:', user.role);
        
        if (newName) userRef.update({ HoTen: newName });
        if (newEmail) userRef.update({ Email: newEmail });
        if (newPhone) userRef.update({ IDNguoiDung: newPhone });
        userRef.update({ HienThiThongTin: newMembershipStatus });
        if (newRole) userRef.update({ role: newRole });
        
        alert('Thông tin người dùng đã được cập nhật.');
        fetchUsers();
    }

    function handleDeleteUser(user) {
        if (confirm(`Bạn có chắc chắn muốn xóa người dùng: ${user.name}?`)) {
            const userRef = db.collection('nguoidung').doc(user.id);
            userRef.delete().then(() => {
                alert(`Người dùng ${user.name} đã được xóa.`);
                fetchUsers();
            });
        }
    }

    function displayUsers(users) {
        const totalPages = Math.ceil(users.length / usersPerPage);
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const usersToShow = users.slice(start, end);

        userTableBody.innerHTML = '';
        usersToShow.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.membershipStatus}</td>
                <td>${user.creationDate}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn-edit-user">Chỉnh sửa</button>
                    <button class="btn-delete-user">Xóa</button>
                </td>
            `;
            row.querySelector('.btn-edit-user').addEventListener('click', () => handleEditUser(user));
            row.querySelector('.btn-delete-user').addEventListener('click', () => handleDeleteUser(user));
            userTableBody.appendChild(row);
        });

        updatePagination(totalPages);
    }

    function updatePagination(totalPages) {
        const pageNumbers = document.querySelector('.user-page-numbers');
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            if (i === currentPage) span.classList.add('active');
            span.addEventListener('click', () => {
                currentPage = i;
                displayUsers(allUsers);
            });
            pageNumbers.appendChild(span);
        }
        document.querySelector('.btn-prev-user').disabled = currentPage === 1;
        document.querySelector('.btn-next-user').disabled = currentPage === totalPages;
    }

    userSearchInput.addEventListener('input', filterUsers);

    document.querySelector('.btn-prev-user').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterUsers();
        }
    });

    document.querySelector('.btn-next-user').addEventListener('click', () => {
        const totalPages = Math.ceil(allUsers.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            filterUsers();
        }
    });

    fetchUsers();
}); 