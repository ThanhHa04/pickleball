import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function() {
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search-input');
    const usersPerPage = 20;
    let currentPage = 1;
    let allUsers = [];

    async function fetchUsers() {
        try {
            const nguoidungCol = collection(db, 'nguoidung');
            const querySnapshot = await getDocs(nguoidungCol);
            allUsers = querySnapshot.docs.map(docSnapshot => {
                const data = docSnapshot.data();
                return {
                    id: docSnapshot.id,
                    name: data.HoTen || '-',
                    email: data.Email || '-',
                    phone: data.IDNguoiDung || '-',
                    membershipStatus: data.HienThiThongTin ? 'Đã kích hoạt' : 'Chưa kích hoạt',
                    creationDate: data.NgayTao || '-',
                    role: data.role || 'user'
                };
            });
            // Sắp xếp: admin trước, sau đó theo thứ tự tên
            allUsers.sort((a, b) => {
                if (a.role === b.role) {
                    return a.name.localeCompare(b.name);
                }
                return a.role === 'admin' ? -1 : 1;
            });
            filterUsers();
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
    }

    function filterUsers() {
        const searchTerm = userSearchInput.value.toLowerCase();
        const filteredUsers = allUsers.filter(user => {
            return user.name.toLowerCase().includes(searchTerm) ||
                   user.phone.includes(searchTerm);
        });
        displayUsers(filteredUsers);
    }

    async function handleEditUser(user) {
        alert(`Chỉnh sửa thông tin người dùng: ${user.name}`);
        const userRef = doc(db, 'nguoidung', user.id);
        const newName = prompt('Nhập tên mới:', user.name);
        const newEmail = prompt('Nhập email mới:', user.email);
        const newPhone = prompt('Nhập số điện thoại mới:', user.phone);
        const newMembershipStatus = confirm('Kích hoạt hiển thị thông tin?');
        const newRole = prompt('Nhập vai trò mới:', user.role);
        
        try {
            if (newName) await updateDoc(userRef, { HoTen: newName });
            if (newEmail) await updateDoc(userRef, { Email: newEmail });
            if (newPhone) await updateDoc(userRef, { IDNguoiDung: newPhone });
            await updateDoc(userRef, { HienThiThongTin: newMembershipStatus });
            if (newRole) await updateDoc(userRef, { role: newRole });
            alert('Thông tin người dùng đã được cập nhật.');
            fetchUsers();
        } catch (error) {
            console.error("Lỗi cập nhật người dùng:", error);
        }
    }

    async function handleDeleteUser(user) {
        if (confirm(`Bạn có chắc chắn muốn xóa người dùng: ${user.name}?`)) {
            const userRef = doc(db, 'nguoidung', user.id);
            try {
                await deleteDoc(userRef);
                alert(`Người dùng ${user.name} đã được xóa.`);
                fetchUsers();
            } catch (error) {
                console.error("Lỗi xóa người dùng:", error);
            }
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
