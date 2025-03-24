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

    let currentPage = 1;
    const itemsPerPage = 6;
    let allBookings = [];

    async function updateBookingData() {
        const userId = localStorage.getItem("userId");
        const bookingList = document.getElementById("booking-list");
        bookingList.innerHTML = "";
        
        const selectedStatus = document.getElementById("status-filter").value; // Lấy giá trị dropdown
        
        allBookings.sort((a, b) => {
            const dateA = new Date(`${a.ngayDatSan}T${a.khungGio}`);
            const dateB = new Date(`${b.ngayDatSan}T${b.khungGio}`);
            return dateB - dateA;
        });
    
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const bookingsToShow = allBookings.slice(start, end);
    
        for (const booking of bookingsToShow) {
            const computedHistoryId = `${userId}_${booking.ngayDatSan}_${booking.idSan}_${booking.khungGio}`;
            const sanData = await getSanById(booking.idSan);
            const historyData = await getHistoryById(computedHistoryId);
            const hinhAnh = sanData?.HinhAnh;
            let tienTrinh = historyData?.tienTrinh || "Không xác định";
    
            // Kiểm tra nếu không chọn "Tất cả" và trạng thái không khớp thì bỏ qua
            if (selectedStatus !== "all" && tienTrinh !== selectedStatus) {
                continue;
            }
    
            const bookingDate = new Date(booking.ngayDatSan);
            const [startHour, startMinute] = booking.khungGio.split(":");
            const bookingTime = new Date(bookingDate.setHours(startHour, startMinute));
    
            let statusClass = "pending";
            let statusText = tienTrinh;
            const currentDate = new Date();
    
            if (tienTrinh === "Đã hủy") {
                statusClass = "cancelled";
                statusText = "Đã hủy";
            } else if (tienTrinh === "Chưa diễn ra" && currentDate > bookingTime) {
                statusClass = "finished";
                statusText = "Đã diễn ra";
                tienTrinh = "Đã diễn ra";
                await updateDoc(doc(db, "lichsudatsan", computedHistoryId), { tienTrinh: "Đã diễn ra" });
            } else if (tienTrinh === "Chưa diễn ra") {
                statusClass = "ongoing";
                statusText = "Chưa diễn ra";
            } else if (tienTrinh === "Đã diễn ra") {
                statusClass = "finished";
                statusText = "Đã diễn ra";
            }
    
            let actionsHTML = "";
            if (statusClass !== "cancelled" && statusClass !== "finished") {
                actionsHTML = `
                    <div class="appointment-actions">
                        <button class="btn-cancel">Hủy lịch</button>
                    </div>
                `;
            }
    
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
                    <div class="appointment-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                <div class="appointment-body">
                    <div class="appointment-info">
                        <p><i class='bx bx-calendar'></i> Ngày: ${booking.ngayDatSan}</p>
                        <p><i class='bx bx-time'></i> Thời gian: ${booking.khungGio}</p>
                        <p><i class='bx bxs-caret-right-circle'></i> Trạng thái: ${statusText}</p>
                        <p><i class='bx bx-money'></i> Tổng tiền: ${booking.giaSan}</p>
                    </div>
                    ${actionsHTML}
                </div>
            `;
    
            bookingList.appendChild(card);
        }
    
        updatePagination();
    }
    

    function updatePagination() {
        const totalPages = Math.ceil(allBookings.length / itemsPerPage);
        document.querySelector(".page-numbers").innerHTML = Array.from({ length: totalPages }, (_, i) => `
            <span class="${i + 1 === currentPage ? 'active' : ''}" data-page="${i + 1}">${i + 1}</span>
        `).join('');
    }
    
    document.querySelector(".btn-prev").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateBookingData();
        }
    });

    document.querySelector(".btn-next").addEventListener("click", () => {
        const totalPages = Math.ceil(allBookings.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateBookingData();
        }
    });

    document.querySelector(".page-numbers").addEventListener("click", (e) => {
        if (e.target.tagName === "SPAN") {
            currentPage = parseInt(e.target.dataset.page);
            updateBookingData();
        }
    });

    allBookings = await getBookings();
    if (allBookings.length) {
        updateBookingData();
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
            console.log("Không có giao dịch nào cho userId:", userId);
            return [];
        }

        const transactions = snapshot.docs.map(doc => {
            const data = doc.data();

            // Kiểm tra loại giao dịch (đặt sân hoặc hội viên)
            const isMembershipPayment = data.paymentTime !== undefined;
            return {
                id: doc.id,
                diaChiSan: isMembershipPayment ? data.membershipName || "N/A" : data.diaChiSan || "N/A",
                tenSan: isMembershipPayment ? data.membershipId || "N/A" : data.tenSan || "N/A",
                soTien: data.amount || data.soTien || "N/A",
                trangThaiThanhToan: data.status || data.trangThaiThanhToan || "Chưa rõ",
                thoiGianThanhToan: formatDateForSorting(data.paymentTime || data.thoiGianThanhToan)
            };
        });

        // Sắp xếp theo thời gian giảm dần
        transactions.sort((a, b) => b.thoiGianThanhToan - a.thoiGianThanhToan);

        return transactions;
    }

    function formatDateForSorting(dateString) {
        if (!dateString) return null;

        let parts = dateString.split(" ");
        if (parts.length !== 2) return null;

        let [datePart, timePart] = parts;
        let [day, month, year] = datePart.split("/").map(num => num.padStart(2, "0"));
        let [hour, minute, second] = timePart.split(":").map(num => num.padStart(2, "0"));

        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    }

    async function updateHistoryTable() {
        const historyBody = document.getElementById("history-body");
        if (!historyBody) {
            console.error("❌ Không tìm thấy phần tử history-body trong HTML!");
            return;
        }
        historyBody.innerHTML = "";

        const transactions = await getTransactionHistory();

        if (!transactions.length) {
            historyBody.innerHTML = "<tr><td colspan='5' style='text-align:center'>Không có giao dịch nào</td></tr>";
            return;
        }

        transactions.forEach(transaction => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${transaction.diaChiSan}</td>
                <td>${transaction.tenSan}</td>
                <td>${transaction.soTien !== "N/A" ? transaction.soTien.toLocaleString() + "đ" : "N/A"}</td>
                <td>${transaction.trangThaiThanhToan}</td>
                <td>${transaction.thoiGianThanhToan ? transaction.thoiGianThanhToan.toLocaleString("vi-VN", { hour12: false }) : "N/A"}</td>
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
                const statusElement = appointment.querySelector('.appointment-status');
                if (!statusElement.classList.contains(statusValue)) {
                    show = false;
                }
            }
    
            // Lọc theo thời gian
            if (dateValue !== 'all') {
                const appointmentDateText = appointment.querySelector('.appointment-info p:first-child').textContent.split(': ')[1];
                const appointmentDate = new Date(appointmentDateText);
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);
    
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
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
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
        
        const currentTime = new Date();
        const bookingTime = new Date(`${ngayDatSan}T${khungGio}:00`);
        const diffInMs = bookingTime - currentTime;
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 2) {
            toastr.warning("Hết hạn hủy lịch sân! Bạn chỉ có thể hủy trước 2 giờ.", "Thông báo");
            return;
        }

        if (confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
            try {
                const historyId = `${userId}_${ngayDatSan}_${idSan}_${khungGio}`;
                const scheduleId = `${idSan}_${ngayDatSan}_${khungGio}`;
                const collectionName = `lich${idSan}`;
                const sanRef = doc(db, collectionName, scheduleId);
                const historyRef = doc(db, "lichsudatsan", historyId);
    
                // Cập nhật trạng thái sân & lịch sử đặt sân
                await updateDoc(sanRef, { trangthai: "Còn trống" });
                await updateDoc(historyRef, { tienTrinh: "Đã hủy" });
    
                console.log("✅ Cập nhật lịch sân & lịch sử đặt sân thành công!");
    
                // 🔹 Lấy số tiền từ `lichsuthanhtoan`
                const paymentRef = doc(db, "lichsuthanhtoan", historyId);
                const paymentSnap = await getDoc(paymentRef);
                if (!paymentSnap.exists()) {
                    console.warn("⚠️ Không tìm thấy thông tin thanh toán!");
                    return;
                }
    
                const soTien = paymentSnap.data().soTien || 0;
    
                // 🔹 Lấy YYYY-MM từ `ngayDatSan`
                const [year, month] = ngayDatSan.split('-');
                const monthKey = `${year}-${month}`;
    
                // 🔹 Trừ tiền vào `doanhThu`
                const revenueRef = doc(db, "doanhThu", monthKey);
                const revenueSnap = await getDoc(revenueRef);
                
                if (revenueSnap.exists()) {
                    const tongDoanhThuThang = revenueSnap.data().tongDoanhThuThang || 0;
                    const updatedRevenue = Math.max(0, tongDoanhThuThang - soTien);
    
                    await updateDoc(revenueRef, { tongDoanhThuThang: updatedRevenue });
    
                    console.log(`✅ Cập nhật doanh thu tháng ${monthKey}: -${soTien} đ`);
                } else {
                    console.warn(`⚠️ Không tìm thấy doanh thu tháng ${monthKey}`);
                }
    
                // 🔹 Cập nhật giao diện
                status.textContent = "Đã hủy";
                status.className = "appointment-status cancelled";
                if (actions) {
                    actions.innerHTML = "";
                }
    
                toastr.success("Đã hủy lịch hẹn thành công!", "Thông báo");
    
            } catch (error) {
                console.error("❌ Lỗi khi hủy lịch hẹn:", error);
                toastr.error("Lỗi hệ thống. Vui lòng thử lại!", "Lỗi");
            }
        }
    }

}); 

//Quản lý tất cả lịch đặt sân
document.addEventListener("DOMContentLoaded", async () => {
    async function getPayments() {
        const paymentsCol = collection(db, "lichsuthanhtoan");
        const snapshot = await getDocs(paymentsCol);
        let payments = {};
        snapshot.docs.forEach(docSnap => {
            let paymentData = docSnap.data(); 
            payments[docSnap.id] = {
                thoiGianThanhToan: paymentData.thoiGianThanhToan || paymentData.paymentTime,    
                trangThaiThanhToan: paymentData.trangThaiThanhToan || "Chưa rõ",
                tenSan: paymentData.tenSan || paymentData.membershipName,
                userId: paymentData.userId,
                soTien: paymentData.soTien || paymentData.amount,
                tienTrinh: paymentData.tienTrinh || "-",
                phuongThucThanhToan: paymentData.phuongThucThanhToan || "-"
            };
        });
        return payments;
    }

    async function updateBookingData() {
        const tableBody = document.getElementById("bookingTableBody");
        tableBody.innerHTML = ""; // Xóa dữ liệu cũ trước khi thêm mới
    
        let allPayments = await getPayments(); // Lấy danh sách thanh toán
    
        for (const id in allPayments) {
            let payment = allPayments[id];
            
            let paymentMethodMap = { "bank": "Chuyển khoản", "momo": "MoMo", "cash": "Tiền mặt" };
            let phuongThucThanhToan = paymentMethodMap[payment.phuongThucThanhToan] || payment.phuongThucThanhToan || "-";

            let soTien = parseFloat(payment.soTien || payment.amount || 0); // Ưu tiên soTien, nếu không có thì lấy amount
            let soTienHienThi = isNaN(soTien) ? "Chưa có giá" : soTien.toLocaleString('vi-VN') + " đ";
    
            let trangThai = payment.trangThaiThanhToan || "Chưa rõ";
            let buttons = `
                <button class="confirm-btn" data-id="${id}">✔ Xác nhận</button>
                <button class="reject-btn" data-id="${id}">✖ Từ chối</button>
            `;
    
            // Nếu trạng thái là Thành công, thay thế bằng "Đã nhận"
            if (trangThai === "Thành công") {
                buttons = `<span class="received-status">Đã nhận</span>`;
            }
    
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${payment.tenSan || "Không rõ"}</td>
                <td>${payment.userId || "Không rõ"}</td>
                <td>${payment.thoiGianThanhToan || "Không có thông tin"}</td>
                <td>${soTienHienThi}</td>
                <td>${phuongThucThanhToan || "-"}</td>
                <td>${trangThai}</td>
                <td>${buttons}</td>
            `;
    
            tableBody.appendChild(row);
        }
    
        // Gán sự kiện cho nút xác nhận và từ chối (chỉ gán nếu trạng thái chưa phải Thành công)
        document.querySelectorAll(".confirm-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const paymentId = e.target.dataset.id;
                await updateBookingStatus(paymentId, "Thành công");
                await updateBookingData(); // Cập nhật lại bảng sau khi thay đổi
            });
        });
    
        document.querySelectorAll(".reject-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const paymentId = e.target.dataset.id;
                await updateBookingStatus(paymentId, "Đã từ chối");
                await updateBookingData(); // Cập nhật lại bảng sau khi thay đổi
            });
        });
    }
    

    updateBookingData(); // Gọi hàm hiển thị dữ liệu thanh toán
});


