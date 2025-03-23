import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

document.addEventListener('DOMContentLoaded', function() {
    const courtTableBody = document.getElementById('court-table-body');
    let allCourts = [];

    async function fetchCourts() {
        try {
            const sanCollection = collection(db, 'san');
            const querySnapshot = await getDocs(sanCollection);
            allCourts = querySnapshot.docs.map(docSnapshot => {
                const data = docSnapshot.data();
                return {
                    id: docSnapshot.id,
                    IDSan: data.IDSan,
                    TenSan: data.TenSan,
                    MoTa: data.MoTa,
                    trangThaiBaoTri: data.trangThaiBaoTri
                };
            });
            displayCourts(allCourts);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu sân:", error);
        }
    }

    async function handleEditCourt(court) {
        const modal = document.getElementById("editCourtModal");
        const closeModal = document.querySelector("#editCourtModal .close");

        // Hiển thị modal
        modal.style.display = "block";

        // Điền thông tin sân vào modal
        document.getElementById("editCourtName").value = court.TenSan;
        document.getElementById("editDescription").value = court.MoTa;
        document.getElementById("editStatus").value = court.trangThaiBaoTri;

        // Khi bấm lưu thay đổi
        document.getElementById("saveCourtChanges").onclick = async function () {
            const courtRef = doc(db, "san", court.id);

            const newCourtName = document.getElementById("editCourtName").value;
            const newDescription = document.getElementById("editDescription").value;
            const newStatus = document.getElementById("editStatus").value;

            try {
                await updateDoc(courtRef, {
                    TenSan: newCourtName,
                    MoTa: newDescription,
                    trangThaiBaoTri: newStatus
                });

                alert("Thông tin sân đã được cập nhật.");
                modal.style.display = "none";
                fetchCourts();
            } catch (error) {
                console.error("Lỗi cập nhật thông tin sân:", error);
            }
        };

        // Đóng modal khi bấm "X"
        closeModal.onclick = function () {
            modal.style.display = "none";
        };

        // Đóng modal khi click ra ngoài
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };
    }

    function displayCourts(courts) {
        courtTableBody.innerHTML = '';
        courts.forEach(court => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${court.IDSan}</td>
                <td>${court.TenSan}</td>
                <td>${court.MoTa}</td>
                <td>${court.trangThaiBaoTri}</td>
                <td>
                    <button class="btn-edit">Chỉnh sửa</button>
                </td>
            `;
            row.querySelector('.btn-edit').addEventListener('click', () => handleEditCourt(court));
            courtTableBody.appendChild(row);
        });
    }

    fetchCourts();
});