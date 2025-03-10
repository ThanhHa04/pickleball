document.addEventListener("DOMContentLoaded", async () => {
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            return null;
        }
    }

    async function updateBookingData(bookings) {
        const userId = localStorage.getItem("userId");
        const bookingList = document.getElementById("booking-list");
        bookingList.innerHTML = "";

        for (const booking of bookings) {
            const sanData = await fetchData(`http://localhost:3000/san/${booking.idSan}`);
            const hinhAnh = sanData?.HinhAnh || "../images/default.webp";
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
                        <img src="${hinhAnh}" alt="Sân Pickleball">
                        <div class="court-details">
                            <h3>${booking.tenSan}</h3>
                            <p><i class='bx bx-map'></i> ${booking.diaChiSan}</p>
                        </div>
                    </div>
                    <div class="appointment-status ${booking.trangthai}">
                        ${booking.trangthai === "pending" ? "Chờ xác nhận" : "Đã xác nhận"}
                    </div>
                </div>
                <div class="appointment-body">
                    <div class="appointment-info">
                        <p><i class='bx bx-calendar'></i> Ngày: ${booking.ngayDatSan}</p>
                        <p><i class='bx bx-time'></i> Thời gian: ${booking.khungGio}</p>
                        <p><i class='bx bxs-caret-right-circle'></i> Trạng thái: ${booking.tienTrinh}</p>
                        <p><i class='bx bx-money'></i> Tổng tiền: ${booking.giaSan}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-cancel">Hủy lịch</button>
                        <button class="btn-reschedule">Đổi lịch</button>
                    </div>
                </div>
            `;

            bookingList.appendChild(card);
        }
    }

    const bookings = await fetchData("http://localhost:3000/lichsudatsan");
    if (bookings) {
        await updateBookingData(bookings);
    }
});

document.addEventListener('DOMContentLoaded', function() {
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
                    <option value="pending">Chờ xác nhận</option>
                    <option value="completed">Đã hoàn thành</option>
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

                    switch(dateValue) {
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
                    const status = payment.querySelector('.payment-status').classList[1];
                    if (status !== statusValue) {
                        show = false;
                    }
                }

                // Lọc theo ngày
                if (dateValue !== 'all') {
                    const paymentDate = new Date(payment.querySelector('.payment-info p:first-child').textContent.split(': ')[1]);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    switch(dateValue) {
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
    document.addEventListener('click', function(e) {
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
    
        const idSan = card.dataset.idsan;
        const ngayDatSan = card.dataset.ngay;
        const khungGio = card.dataset.gio;
        const userId = localStorage.getItem("userId"); 
    
        if (confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
            try {
                const documentId = `${idSan}_${ngayDatSan}_${khungGio}`;
                const updateURL = `http://localhost:3000/lich/${idSan}/${documentId}`;

                const bookingResponse = await fetch(updateURL, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trangthai: "Còn trống" })
                });

    
                const historyId = `${userId}_${ngayDatSan}_${idSan}_${khungGio}`;
                const response = await fetch(`http://localhost:3000/lichsudatsan/${historyId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tienTrinh: "Đã hủy" })
                });
                
                const historyResponse = await fetch(historyURL, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ TienTrinh: "Đã hủy" })  
                });
        
                if (!historyResponse.ok) {
                    const errorText = await historyResponse.text();
                    throw new Error(`Lỗi khi cập nhật lịch sử đặt sân: ${errorText}`);
                }
                console.log("Cập nhật lịch sử đặt sân thành công!");
                
    
                if (bookingResponse.ok && historyResponse.ok) {
                    status.textContent = "Đã hủy";
                    status.className = "appointment-status cancelled";
                    card.querySelector(".appointment-actions").innerHTML = '<button class="btn-reschedule">Đặt lại</button>';
                    toastr.success("Đã hủy lịch hẹn thành công!", "Thông báo");
                } else {
                    toastr.error("Lỗi khi cập nhật dữ liệu. Vui lòng thử lại!", "Lỗi");
                }
            } catch (error) {
                console.error("Lỗi khi hủy lịch hẹn:", error);
                toastr.error("Lỗi hệ thống. Vui lòng thử lại!", "Lỗi");
            }
        }
    }
    
    

    // Xử lý đổi lịch hẹn
    function handleRescheduleAppointment(button) {
        const card = button.closest('.appointment-card');
        
        // Tạo form đổi lịch
        const form = document.createElement('div');
        form.className = 'reschedule-form';
        form.innerHTML = `
            <h3>Chọn thời gian mới</h3>
            <input type="date" id="new-date" min="${formatDateForInput(new Date())}">
            <select id="new-time">
                <option value="">Chọn giờ</option>
                <option value="08:00">08:00 - 10:00</option>
                <option value="10:00">10:00 - 12:00</option>
                <option value="14:00">14:00 - 16:00</option>
                <option value="16:00">16:00 - 18:00</option>
            </select>
            <div class="form-actions">
                <button class="btn-confirm-reschedule">Xác nhận</button>
                <button class="btn-cancel-reschedule">Hủy</button>
            </div>
        `;
        
        card.appendChild(form);
        
        // Xử lý sự kiện cho form
        form.querySelector('.btn-confirm-reschedule').addEventListener('click', () => {
            const newDate = document.getElementById('new-date').value;
            const newTime = document.getElementById('new-time').value;
            
            if (newDate && newTime) {
                const dateInfo = card.querySelector('.appointment-info p:first-child');
                const timeInfo = card.querySelector('.appointment-info p:nth-child(2)');
                
                dateInfo.innerHTML = `<i class='bx bx-calendar'></i> Ngày: ${formatDate(new Date(newDate))}`;
                timeInfo.innerHTML = `<i class='bx bx-time'></i> Thời gian: ${newTime}`;
                
                const status = card.querySelector('.appointment-status');
                status.textContent = 'Chờ xác nhận';
                status.className = 'appointment-status pending';
                
                form.remove();
                showNotification('Đã đổi lịch hẹn thành công!', 'success');
            } else {
                showNotification('Vui lòng chọn ngày và giờ mới!', 'error');
            }
        });
        
        form.querySelector('.btn-cancel-reschedule').addEventListener('click', () => {
            form.remove();
        });
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
        
        switch(type) {
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