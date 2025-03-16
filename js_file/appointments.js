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

    async function getPayments() {
        const userId = localStorage.getItem("userId");
        const paymentsCol = collection(db, "lichsuthanhtoan");
        const q = query(paymentsCol, where("userId", "==", userId));

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
            const tienTrinh = historyData?.tienTrinh || "Không xác định";

            // Xác định class trạng thái
            let statusClass = "pending";
            if (tienTrinh === "Đã xác nhận") {
                statusClass = "confirmed";
            } else if (tienTrinh === "Đã hủy") {
                statusClass = "cancelled";
            }

            let actionsHTML = "";
            if (statusClass !== "cancelled") {
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

    async function updatePaymentData(payments) {
        const userId = localStorage.getItem("userId");
        const paymentList = document.getElementById("payments-list");
        paymentList.innerHTML = "";

        for (const payment of payments) {
            const computedHistoryId = `${userId}_${payment.ngayDatSan}_${payment.idSan}_${payment.khungGio}`;
            console.log("Computed historyId:", computedHistoryId);

            // Lấy dữ liệu lịch sử thanh toán từ Firestore
            const paidData = await getHistoryById(computedHistoryId);

            // Tạo card thanh toán
            const card = document.createElement("div");
            card.classList.add("payment-card");
            card.dataset.idsan = payment.idSan;
            card.dataset.ngay = payment.ngayDatSan;
            card.dataset.gio = payment.khungGio;
            card.dataset.userid = userId;

            // Tạo nội dung HTML cho card thanh toán
            card.innerHTML = `
                <div class="payment-header">
                    <div class="payment-title">
                        <h3>Thanh toán tiền sân</h3>
                        <span class="payment-status ${payment.status === "Đã thanh toán" ? "paid" : "unpaid"}">${payment.trangThaiThanhToan}</span>
                    </div>
                    <div class="payment-amount">
                        <span>${payment.soTien}đ</span>
                    </div>
                </div>
                <div class="payment-body">
                    <div class="payment-info">
                        <p><i class='bx bx-calendar'></i> Ngày thanh toán: ${payment.thoiGianThanhToan}</p>
                        <p><i class='bx bx-cricket-ball'></i> Sân Pickleball: ${payment.tenSan}</p>
                        <p><i class='bx bxs-compass'></i> Địa chỉ sân: ${payment.diaChiSan}</p>
                    </div>
                    <div class="payment-actions">
                        <button class="btn-${payment.tienTrinh === "Thành công" ? "view-receipt" : "pay"}">
                            ${payment.tienTrinh === "Thành công" ? "Xem hóa đơn" : "Thanh toán ngay"}
                        </button>
                    </div>
                </div>
            `;

            // Thêm card vào danh sách thanh toán
            paymentList.appendChild(card);
        }
    }

    const payments = await getPayments();
    if (payments) {
        await updatePaymentData(payments);
    }
});


document.addEventListener("DOMContentLoaded", async () => {
    async function getTransactionHistory() {
        console.log("✅ Hàm getTransactionHistory() đã được gọi!");
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
    // Xử lý chuyển tab
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Xóa active class từ tất cả các tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Thêm active class cho tab được chọn
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Thay đổi nội dung của status filter theo tab
            if (tabId === 'bookings') {
                statusFilter.innerHTML = `
                    <option value="all">Tất cả trạng thái</option>
                    <option value="upcoming">Chưa diễn ra</option>
                    <option value="ongoing">Đã diễn ra</option>
                    <option value="cancelled">Đã hủy</option>
                `;
            } else if (tabId === 'payments') {
                statusFilter.innerHTML = `
                    <option value="all">Tất cả trạng thái</option>
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                `;
            }
        });
    });

    // Xử lý tìm kiếm
    const searchInput = document.getElementById('appointment-search');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');

    function filterAppointments() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;

        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        const appointments = document.querySelectorAll('.appointment-card');
        const payments = document.querySelectorAll('.payment-card');

        if (activeTab === 'bookings') {
            appointments.forEach(appointment => {
                let show = true;

                // Lọc theo từ khóa
                const courtName = appointment.querySelector('.court-details h3').textContent.toLowerCase();
                const courtAddress = appointment.querySelector('.court-details p').textContent.toLowerCase();
                if (!courtName.includes(searchTerm) && !courtAddress.includes(searchTerm)) {
                    show = false;
                }

                // Lọc theo trạng thái
                if (statusValue !== 'all') {
                    const status = appointment.querySelector('.appointment-status').classList[1];
                    if (status !== statusValue) {
                        show = false;
                    }
                }

                // Lọc theo ngày
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

                appointment.style.display = show ? 'block' : 'none';
            });
        } else if (activeTab === 'payments') {
            payments.forEach(payment => {
                let show = true;

                // Lọc theo từ khóa
                const paymentTitle = payment.querySelector('.payment-title h3').textContent.toLowerCase();
                if (!paymentTitle.includes(searchTerm)) {
                    show = false;
                }

                // Lọc theo trạng thái
                if (statusValue !== 'all') {
                    const statusText = appointment.querySelector('.appointment-status').textContent.trim(); // Lấy nội dung trạng thái

                    if (statusValue === "cancelled") {
                        if (statusText !== "Đã hủy") {
                            show = false;
                        }
                    } else if (statusValue === "upcoming") {
                        if (statusText !== "Chưa diễn ra") {
                            show = false;
                        }
                    } else if (statusValue === "ongoing") {
                        if (statusText !== "Đã diễn ra") {
                            show = false;
                        }
                    }
                }

                // Lọc theo ngày
                if (dateValue !== 'all') {
                    const paymentDate = new Date(payment.querySelector('.payment-info p:first-child').textContent.split(': ')[1]);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    switch (dateValue) {
                        case 'today':
                            if (paymentDate.toDateString() !== today.toDateString()) {
                                show = false;
                            }
                            break;
                        case 'tomorrow':
                            if (paymentDate.toDateString() !== tomorrow.toDateString()) {
                                show = false;
                            }
                            break;
                        case 'week':
                            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekEnd.getDate() + 6);
                            if (paymentDate < weekStart || paymentDate > weekEnd) {
                                show = false;
                            }
                            break;
                        case 'month':
                            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                            if (paymentDate < monthStart || paymentDate > monthEnd) {
                                show = false;
                            }
                            break;
                    }
                }

                payment.style.display = show ? 'block' : 'none';
            });
        }
    }

    // Thêm event listeners cho bộ lọc
    searchInput.addEventListener('input', filterAppointments);
    statusFilter.addEventListener('change', filterAppointments);
    dateFilter.addEventListener('change', filterAppointments);

    // Xử lý các nút hành động
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-view-receipt')) {
            handleViewReceipt(e.target);
        } else if (e.target.classList.contains('btn-cancel')) {
            handleCancelAppointment(e.target);
        } else if (e.target.classList.contains('btn-reschedule')) {
            handleRescheduleAppointment(e.target);
        } else if (e.target.classList.contains('btn-pay')) {
            handlePayment(e.target);
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

    // Xử lý thanh toán
    function handlePayment(button) {
        const card = button.closest('.payment-card');
        const qrOverlay = document.createElement('div');
        qrOverlay.className = 'qr-overlay';
        qrOverlay.innerHTML = `
            <div class="qr-content">
                <button class="btn-close-qr">X</button>
                <img src="../images/QRcode.png" alt="QR Code" class="qr-image">
            </div>
        `;
        document.body.appendChild(qrOverlay);

        // Đóng QR code
        qrOverlay.querySelector('.btn-close-qr').addEventListener('click', () => {
            qrOverlay.remove();
        });

        showNotification('Thanh toán thành công!', 'success');
    }

    // Xử lý xem hóa đơn
    function handleViewReceipt(button) {
        // Thêm logic xem hóa đơn

        const receiptOverlay = document.createElement('div');
        receiptOverlay.className = 'receipt-overlay';
        receiptOverlay.innerHTML = ` 
            <div class="receipt-content">
                <button class="btn-close-receipt">X</button>
                <h2>Hóa đơn Thanh toán</h2>
                <p><strong>Số hóa đơn:</strong> #123456</p>
                <p><strong>Ngày thanh toán:</strong> 13/03/2024</p>
                <p><strong>Sân Pickleball:</strong> Sân Pickleball Số 2</p>
                <p><strong>Thời gian đặt:</strong> 08:00 - 10:00 (16/03/2024)</p>
                <p><strong>Số tiền:</strong> 300.000đ</p>
                <p><strong>Trạng thái:</strong> Đã thanh toán</p>
            </div>
        `;
        document.body.appendChild(receiptOverlay);

        // Đóng hóa đơn
        receiptOverlay.querySelector('.btn-close-receipt').addEventListener('click', () => {
            receiptOverlay.remove();
        });

    }

    // Xử lý phân trang
    const itemsPerPage = 6;
    let currentPage = 1;

    function updatePagination() {
        const totalItems = document.querySelectorAll('.appointment-card:not([style*="display: none"])').length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const pageNumbers = document.querySelector('.page-numbers');
        pageNumbers.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            if (i === currentPage) span.classList.add('active');
            span.addEventListener('click', () => goToPage(i));
            pageNumbers.appendChild(span);
        }

        document.querySelector('.btn-prev').disabled = currentPage === 1;
        document.querySelector('.btn-next').disabled = currentPage === totalPages;
    }

    function goToPage(page) {
        currentPage = page;
        const items = document.querySelectorAll('.appointment-card');
        items.forEach((item, index) => {
            const shouldShow = index >= (page - 1) * itemsPerPage && index < page * itemsPerPage;
            item.style.display = shouldShow ? 'block' : 'none';
        });
        updatePagination();
    }

    document.querySelector('.btn-prev').addEventListener('click', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    });

    document.querySelector('.btn-next').addEventListener('click', () => {
        const totalItems = document.querySelectorAll('.appointment-card').length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage < totalPages) goToPage(currentPage + 1);
    });

    // Xử lý phân trang cho lịch sử giao dịch
    function updateHistoryPagination() {
        const itemsPerPage = 5;
        let currentPage = 1;

        const rows = document.querySelectorAll('.history-table tbody tr');
        const totalPages = Math.ceil(rows.length / itemsPerPage);

        function goToPage(page) {
            currentPage = page;
            rows.forEach((row, index) => {
                const shouldShow = index >= (page - 1) * itemsPerPage && index < page * itemsPerPage;
                row.style.display = shouldShow ? 'table-row' : 'none';
            });
            updatePageNumbers();
        }

        function updatePageNumbers() {
            const pageNumbers = document.querySelector('.history-container .page-numbers');
            pageNumbers.innerHTML = '';

            for (let i = 1; i <= totalPages; i++) {
                const span = document.createElement('span');
                span.textContent = i;
                if (i === currentPage) span.classList.add('active');
                span.addEventListener('click', () => goToPage(i));
                pageNumbers.appendChild(span);
            }

            document.querySelector('.history-container .btn-prev').disabled = currentPage === 1;
            document.querySelector('.history-container .btn-next').disabled = currentPage === totalPages;
        }

        document.querySelector('.history-container .btn-prev').addEventListener('click', () => {
            if (currentPage > 1) goToPage(currentPage - 1);
        });

        document.querySelector('.history-container .btn-next').addEventListener('click', () => {
            if (currentPage < totalPages) goToPage(currentPage + 1);
        });

        goToPage(1);
    }

    // Helper functions
    function formatDate(date) {
        return date.toLocaleDateString('vi-VN');
    }

    function formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    function showNotification(message, type) {
        toastr.options = {
            closeButton: true,
            progressBar: true,
            positionClass: "toast-top-right",
            timeOut: 3000
        };

        switch (type) {
            case 'success':
                toastr.success(message);
                break;
            case 'error':
                toastr.error(message);
                break;
            case 'warning':
                toastr.warning(message);
                break;
            default:
                toastr.info(message);
        }
    }

    // Khởi tạo ban đầu
    updatePagination();
    goToPage(1);

    // Khởi tạo phân trang cho lịch sử giao dịch
    updateHistoryPagination();
}); 