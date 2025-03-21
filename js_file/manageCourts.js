import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Sử dụng Firestore đã khởi tạo
const db = getFirestore();

// Hàm lấy dữ liệu từ Firestore và hiển thị vào bảng
async function loadCourts() {
    const sanCollection = collection(db, "san");
    const sanSnapshot = await getDocs(sanCollection);
    const sanList = sanSnapshot.docs.map(doc => doc.data());

    const tableBody = document.getElementById("court-table-body");
    tableBody.innerHTML = ""; // Xóa nội dung cũ

    sanList.forEach(san => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${san.IDSan}</td>
            <td>${san.TenSan}</td>
            <td>${san.MoTa}</td>
            <td>${san.trangThaiBaoTri}</td>
            <td>
                <button class="btn-edit">Chỉnh sửa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Gọi hàm loadCourts khi trang được tải
document.addEventListener("DOMContentLoaded", loadCourts);

document.addEventListener("DOMContentLoaded", function() {
    const editButtons = document.querySelectorAll(".btn-edit");
    const editModal = document.getElementById("editUserModal");
    const closeModal = document.querySelector("#editUserModal .close");
    const saveChanges = document.getElementById("saveUserChanges");

    editButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Lấy thông tin của hàng tương ứng
            const row = this.closest("tr");
            const courtName = row.cells[1].innerText;
            const description = row.cells[2].innerText;
            const status = row.cells[3].innerText;

            // Điền thông tin vào modal
            document.getElementById("editCourtName").value = courtName;
            document.getElementById("editDescription").value = description;
            document.getElementById("editStatus").value = status;

            // Hiển thị modal
            editModal.style.display = "flex";
        });
    });

    closeModal.addEventListener("click", function() {
        editModal.style.display = "none";
    });

    saveChanges.addEventListener("click", function() {
        // Lưu thay đổi và cập nhật thông tin
        const newCourtName = document.getElementById("editCourtName").value;
        const newDescription = document.getElementById("editDescription").value;
        const newStatus = document.getElementById("editStatus").value;

        // Cập nhật thông tin trong bảng (cần thêm logic để lưu vào Firestore nếu cần)
        const row = document.querySelector(".btn-edit").closest("tr");
        row.cells[1].innerText = newCourtName;
        row.cells[2].innerText = newDescription;
        row.cells[3].innerText = newStatus;

        // Đóng modal
        editModal.style.display = "none";
    });
});