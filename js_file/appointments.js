import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { query, getFirestore, collection, doc, getDocs, getDoc, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {

    async function getBookings() {
        const userId = localStorage.getItem("userId");
        const bookingsCol = collection(db, "lichsudatsan");
        const q = query(bookingsCol, where("userId", "==", userId));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => ({
            ...docSnap.data(),
            id: docSnap.id
        }));
    }

    async function getSanById(idSan) {
        const sanRef = doc(db, "san", idSan);
        const sanSnap = await getDoc(sanRef);
        return sanSnap.exists() ? sanSnap.data() : null;
    }

    async function getHistoryById(historyId) {
        const historyRef = doc(db, "lichsudatsan", historyId);
        const historySnap = await getDoc(historyRef);
        return historySnap.exists() ? historySnap.data() : null;
    }

    async function updateBookingData(bookings) {
        const userId = localStorage.getItem("userId");
        const bookingList = document.getElementById("booking-list");
        bookingList.innerHTML = "";

        for (const booking of bookings) {
            const computedHistoryId = `${userId}_${booking.ngayDatSan}_${booking.idSan}_${booking.khungGio}`;
            console.log("Computed historyId:", computedHistoryId);
            const sanData = await getSanById(booking.idSan);
            const historyData = await getHistoryById(computedHistoryId);
            const hinhAnh = sanData?.HinhAnh;
            let tienTrinh = historyData?.tienTrinh || "Không xác định";

            const bookingDate = new Date(booking.ngayDatSan); // Lấy ngày đặt sân
            const [startHour, startMinute] = booking.khungGio.split(":"); // Lấy giờ và phút từ khung giờ
            const bookingTime = new Date(bookingDate.setHours(startHour, startMinute)); // Tạo đối tượng thời gian đầy đủ

            // Xác định trạng thái của lịch hẹn
            let statusClass = "pending";
            let statusText = tienTrinh;
            const currentDate = new Date(); 

            if (currentDate > bookingTime) { // Nếu thời gian hiện tại đã qua lịch hẹn
                statusClass = "finished";
                statusText = "Đã diễn ra";
                // Nếu trạng thái trong lịch sử đặt sân là "Chưa diễn ra" hoặc "Đã hủy", cập nhật thành "Đã diễn ra"
                if (tienTrinh === "Chưa diễn ra") {
                    tienTrinh = "Đã diễn ra"; 
                    await updateDoc(doc(db, "lichsudatsan", computedHistoryId), { tienTrinh: "Đã diễn ra" });
                }
            } else if (tienTrinh === "Chưa diễn ra") {
                statusClass = "ongoing";
                statusText = "Chưa diễn ra";
            } else if (tienTrinh === "Đã hủy") {
                statusClass = "cancelled";
                statusText = "Đã hủy";
            }

            let actionsHTML = "";
            if (statusClass !== "cancelled" && statusClass !== "finished") {
                actionsHTML = `
                    <div class="appointment-actions">
                        <button class="btn-cancel">Hủy lịch</button>
                    </div>
                `;
            }

            // Tạo card lịch hẹn
            const card = document.createElement("div");
            card.classList.add("appointment-card");
            card.dataset.idsan = booking.idSan;
            card.dataset.ngay = booking.ngayDatSan;
            card.dataset.gio = booking.khungGio;
            card.dataset.userid = userId;

            card.innerHTML = `
                <div class="appointment-header">
                    <div class="final">
                        <img src="${hinhAnh}" alt="Sân">
                        <div class="court-details">
                            <h3>${booking.tenSan}</h3>
                            <p><i class='bx bx-map'></i> ${booking.diaChiSan}</p>
                        </div>
                    </div>
                    <div class="appointment-status">
                        ${tienTrinh}
                    </div>
                </div>
                <div class="appointment-body">
                    <div class="appointment-info">
                        <p><i class='bx bx-calendar'></i> Ngày: ${booking.ngayDatSan}</p>
                        <p><i class='bx bx-time'></i> Thời gian: ${booking.khungGio}</p>
                        <p><i class='bx bxs-caret-right-circle'></i> Trạng thái: ${tienTrinh}</p>
                        <p><i class='bx bx-money'></i> Tổng tiền: ${booking.giaSan}</p>
                    </div>
                    ${actionsHTML}
                </div>
            `;

            // Cập nhật class cho phần tử trạng thái
            const statusElement = card.querySelector(".appointment-status");
            statusElement.classList.add(statusClass);

            bookingList.appendChild(card);
        }
    }

    const bookings = await getBookings();
    if (bookings) {
        await updateBookingData(bookings);
    }

});


document.addEventListener("DOMContentLoaded", async () => {
    async function getTransactionHistory() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.error("❌ Không tìm thấy userId trong localStorage!");
            return [];
        }

        const historyRef = collection(db, "lichsuthanhtoan");
        const q = query(historyRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.warn("⚠️ Không có giao dịch nào cho userId:", userId);
            return [];
        }

        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`📌 Giao dịch của userId=${userId}:`, transactions);
        return transactions;
    }

    async function updateHistoryTable() {
        const historyBody = document.getElementById("history-body");
        if (!historyBody) {
            console.error("❌ Không tìm thấy phần tử history-body trong HTML!");
            return;
        }
        historyBody.innerHTML = "";

        const transactions = await getTransactionHistory();
        console.log("📌 Transactions Data:", transactions);

        if (!transactions.length) {
            historyBody.innerHTML = "<tr><td colspan='5' style='text-align:center'>Không có giao dịch nào</td></tr>";
            return;
        }

        transactions.forEach(transaction => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${transaction.diaChiSan || "N/A"}</td>
                <td>${transaction.tenSan || "N/A"}</td>
                <td>${transaction.soTien ? transaction.soTien + "đ" : "N/A"}</td>
                <td>${transaction.trangThaiThanhToan || "Chưa rõ"}</td>
                <td>${transaction.thoiGianThanhToan || "N/A"}</td>
            `;
            historyBody.appendChild(row);
        });
    }

    await updateHistoryTable();
});

document.addEventListener('DOMContentLoaded', function () {
    // Lấy các phần tử
    const searchInput = document.getElementById('appointment-search');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');

    function filterAppointments() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;

        const appointments = document.querySelectorAll('.appointment-card');

        appointments.forEach(appointment => {
            let show = true;

            // Lọc theo từ khóa tìm kiếm
            const courtName = appointment.querySelector('.court-details h3').textContent.toLowerCase();
            const courtAddress = appointment.querySelector('.court-details p').textContent.toLowerCase();
            if (!courtName.includes(searchTerm) && !courtAddress.includes(searchTerm)) {
                show = false;
            }

            // Lọc theo trạng thái
            if (statusValue !== 'all') {
                const status = appointment.querySelector('.appointment-status');
                const statusClass = status ? status.classList[1] : ''; // Lấy lớp trạng thái

                if (statusClass !== statusValue) {
                    show = false;
                }
            }

            // Lọc theo thời gian
            if (dateValue !== 'all') {
                const appointmentDate = new Date(appointment.querySelector('.appointment-info p:first-child').textContent.split(': ')[1]);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                switch (dateValue) {
                    case 'today':
                        if (appointmentDate.toDateString() !== today.toDateString()) {
                            show = false;
                        }
                        break;
                    case 'tomorrow':
                        if (appointmentDate.toDateString() !== tomorrow.toDateString()) {
                            show = false;
                        }
                        break;
                    case 'week':
                        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        if (appointmentDate < weekStart || appointmentDate > weekEnd) {
                            show = false;
                        }
                        break;
                    case 'month':
                        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        if (appointmentDate < monthStart || appointmentDate > monthEnd) {
                            show = false;
                        }
                        break;
                }
            }

            // Hiển thị hoặc ẩn lịch hẹn
            appointment.style.display = show ? 'block' : 'none';
        });
    }

    // Thêm event listeners cho bộ lọc
    searchInput.addEventListener('input', filterAppointments);
    statusFilter.addEventListener('change', filterAppointments);
    dateFilter.addEventListener('change', filterAppointments);

    // Xử lý các nút hành động
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-cancel')) {
            handleCancelAppointment(e.target);
        }
    });

    // Xử lý hủy lịch hẹn
    async function handleCancelAppointment(button) {
        const card = button.closest(".appointment-card");
        const status = card.querySelector(".appointment-status");
        const actions = card.querySelector(".appointment-actions");

        const idSan = card.dataset.idsan;
        const ngayDatSan = card.dataset.ngay;
        const khungGio = card.dataset.gio;
        const userId = localStorage.getItem("userId");

        if (confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
            try {
                const historyId = `${userId}_${ngayDatSan}_${idSan}_${khungGio}`;
                const scheduleId = `${idSan}_${ngayDatSan}_${khungGio}`;
                const collectionName = `lich${idSan}`;
                const sanRef = doc(db, collectionName, scheduleId);
                console.log("TT: ", sanRef);
                await updateDoc(sanRef, { trangthai: "Còn trống" });

                const historyRef = doc(db, "lichsudatsan", historyId);
                await updateDoc(historyRef, { tienTrinh: "Đã hủy" });

                console.log("✅ Cập nhật lịch sân & lịch sử đặt sân thành công!");

                status.textContent = "Đã hủy";
                status.className = "appointment-status cancelled";

                if (actions) {
                    actions.innerHTML = ""; // Xóa toàn bộ nút
                }

                toastr.success("Đã hủy lịch hẹn thành công!", "Thông báo");

            } catch (error) {
                console.error("❌ Lỗi khi hủy lịch hẹn:", error);
                toastr.error("Lỗi hệ thống. Vui lòng thử lại!", "Lỗi");
            }
        }
    }

}); 


