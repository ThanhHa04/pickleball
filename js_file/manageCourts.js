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


// Hàm để mở modal và điền thông tin sân
function openEditModal(san) {
    document.getElementById("editCourtName").value = san.TenSan;
    document.getElementById("editDescription").value = san.MoTa;
    document.getElementById("editStatus").value = san.trangThaiBaoTri;
    document.getElementById("editCourtModal").style.display = "block";

    // Lưu ID sân để sử dụng khi cập nhật
    document.getElementById("editCourtModal").dataset.id = san.IDSan;
}

// Hàm để cập nhật thông tin sân
async function saveCourtChanges() {
    const idSan = document.getElementById("editCourtModal").dataset.id;
    const courtRef = doc(db, "san", idSan);

    const updatedData = {
        TenSan: document.getElementById("editCourtName").value,
        MoTa: document.getElementById("editDescription").value,
        trangThaiBaoTri: document.getElementById("editStatus").value
    };

    await updateDoc(courtRef, updatedData);
    document.getElementById("editCourtModal").style.display = "none";
    loadCourts(); // Tải lại danh sách sân
}

// Gắn sự kiện cho nút "Chỉnh sửa"
document.addEventListener("click", function(event) {
    if (event.target.classList.contains("btn-edit")) {
        const row = event.target.closest("tr");
        const san = {
            IDSan: row.cells[0].textContent,
            TenSan: row.cells[1].textContent,
            MoTa: row.cells[2].textContent,
            trangThaiBaoTri: row.cells[3].textContent
        };
        openEditModal(san);
    }
});

// Gắn sự kiện cho nút "Lưu thay đổi"
document.getElementById("saveUserChanges").addEventListener("click", saveCourtChanges);

// Đóng modal khi nhấn nút "X"
document.querySelector("#editCourtModal .close").addEventListener("click", function() {
    document.getElementById("editCourtModal").style.display = "none";
});