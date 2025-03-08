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

        const appointments = document.querySelectorAll('.appointment-card');
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
                const appointmentDate = appointment.querySelector('.appointment-info p:first-child').textContent;
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                switch(dateValue) {
                    case 'today':
                        if (!appointmentDate.includes(formatDate(today))) {
                            show = false;
                        }
                        break;
                    case 'tomorrow':
                        if (!appointmentDate.includes(formatDate(tomorrow))) {
                            show = false;
                        }
                        break;
                    case 'week':
                        // Thêm logic lọc theo tuần
                        break;
                    case 'month':
                        // Thêm logic lọc theo tháng
                        break;
                }
            }

            appointment.style.display = show ? 'block' : 'none';
        });
    }

    // Thêm event listeners cho bộ lọc
    searchInput.addEventListener('input', filterAppointments);
    statusFilter.addEventListener('change', filterAppointments);
    dateFilter.addEventListener('change', filterAppointments);

    // Xử lý các nút hành động
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-confirm')) {
            handleConfirmAppointment(e.target);
        } else if (e.target.classList.contains('btn-cancel')) {
            handleCancelAppointment(e.target);
        } else if (e.target.classList.contains('btn-reschedule')) {
            handleRescheduleAppointment(e.target);
        } else if (e.target.classList.contains('btn-pay')) {
            handlePayment(e.target);
        } else if (e.target.classList.contains('btn-view-receipt')) {
            handleViewReceipt(e.target);
        }
    });

    // Xử lý xác nhận lịch hẹn
    function handleConfirmAppointment(button) {
        const card = button.closest('.appointment-card');
        const status = card.querySelector('.appointment-status');
        
        if (confirm('Xác nhận lịch hẹn này?')) {
            status.textContent = 'Đã xác nhận';
            status.className = 'appointment-status confirmed';
            button.remove();
            showNotification('Đã xác nhận lịch hẹn thành công!', 'success');
        }
    }

    // Xử lý hủy lịch hẹn
    function handleCancelAppointment(button) {
        const card = button.closest('.appointment-card');
        const status = card.querySelector('.appointment-status');
        
        if (confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
            status.textContent = 'Đã hủy';
            status.className = 'appointment-status cancelled';
            const actions = card.querySelector('.appointment-actions');
            actions.innerHTML = '<button class="btn-reschedule">Đặt lại</button>';
            showNotification('Đã hủy lịch hẹn thành công!', 'info');
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
        if (confirm('Xác nhận thanh toán?')) {
            const status = card.querySelector('.payment-status');
            status.textContent = 'Đã thanh toán';
            status.className = 'payment-status paid';
            
            const actions = card.querySelector('.payment-actions');
            actions.innerHTML = '<button class="btn-view-receipt">Xem hóa đơn</button>';
            
            showNotification('Thanh toán thành công!', 'success');
        }
    }

    // Xử lý xem hóa đơn
    function handleViewReceipt(button) {
        // Thêm logic xem hóa đơn
        alert('Chức năng xem hóa đơn đang được phát triển');
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