import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//Tổng QuanQuan
document.addEventListener('DOMContentLoaded', async function() {
    const statTabs = document.querySelectorAll('.stats-tab');
    const statContents = document.querySelectorAll('.stats-content');

    statTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            statTabs.forEach(t => t.classList.remove('active'));
            statContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            const activeContent = document.getElementById(this.getAttribute('data-tab'));
            activeContent.classList.add('active');
        });
    });

    async function fetchStats() {
        try {
            const now = new Date();
            const currentYear = now.getFullYear(); // 2025
            const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // '03'
            const currentMonthKey = `${currentYear}-${currentMonth}`; // '2025-03'
                        
            const usersSnapshot = await getDocs(collection(db, "nguoidung"));
            const courtsSnapshot = await getDocs(collection(db, "san"));
            const bookingsSnapshot = await getDocs(collection(db, "lichsudatsan"));
            const paymentsSnapshot = await getDocs(collection(db, "doanhThu"));
            
            const totalUsers = usersSnapshot.size;
            const totalCourts = courtsSnapshot.size;

            // Lấy tổng lịch đặt trong tháng
            let totalBookingsThisMonth = 0;
            bookingsSnapshot.forEach(doc => {
                const docId = doc.id; // IDNguoiDung_YYYY-MM-DD_KhungGio
                const parts = docId.split('_'); // Tách theo dấu '_'
                if (parts.length >= 2) {
                    const bookingDate = parts[1].substring(0, 7); // Lấy YYYY-MM từ ID
                    if (bookingDate === currentMonthKey) {
                        totalBookingsThisMonth++;
                    }
                }
            });
            
            let totalRevenueThisMonth = 0;
            paymentsSnapshot.forEach(doc => {
                if (doc.id === currentMonthKey) { // Chỉ lấy ID đúng tháng
                    totalRevenueThisMonth += doc.data().tongDoanhThuThang || 0;
                }
            });
            document.getElementById('stats-users').textContent = totalUsers + '  Người dùng';
            document.getElementById('stats-courts').textContent = totalCourts + '  Sân';
            document.getElementById('stats-bookings').textContent = totalBookingsThisMonth + '  Lịch';
            document.getElementById('stats-revenue').textContent = totalRevenueThisMonth.toLocaleString() + ' đ';

            // Đếm số lần đặt sân và sắp xếp theo tenSan
            const courtBookingCount = new Map();
            bookingsSnapshot.forEach(doc => {
                const data = doc.data();
                const tenSan = data.tenSan;
                if (!tenSan) return;
                courtBookingCount.set(tenSan, (courtBookingCount.get(tenSan) || 0) + 1);
            });
            const courtStats = Array.from(courtBookingCount.entries())
                .map(([tenSan, count]) => ({ tenSan, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            renderTopCourtsChart(courtStats);

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu thống kê:", error);
        }
    }
    
    async function fetchRevenueLast6Months() {
        const revenueByMonth = new Map();
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
    
        // Tạo danh sách 6 tháng gần nhất
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            let month = currentMonth - i;
            let year = currentYear;
    
            if (month <= 0) { 
                month += 12;
                year -= 1;
            }
    
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            last6Months.push(monthKey);
            revenueByMonth.set(monthKey, 0);
        }
        // Lấy dữ liệu từ Firestore
        const revenueSnapshot = await getDocs(collection(db, "doanhThu"));
    
        revenueSnapshot.forEach(doc => {
            const monthKey = doc.id; // ID của document là YYYY-MM
            if (last6Months.includes(monthKey)) {
                const data = doc.data();
                revenueByMonth.set(monthKey, (revenueByMonth.get(monthKey) || 0) + (data.tongDoanhThuThang || 0));
            }
        });
        renderRevenueChart(revenueByMonth);
    }    
    
    function renderRevenueChart(revenueByMonth) {
        const labels = Array.from(revenueByMonth.keys()); // Danh sách tháng
        const data = Array.from(revenueByMonth.values()); // Doanh thu tương ứng
        const ctx = document.getElementById('revenueChart').getContext('2d');
    
        if (window.myRevenueChart) {
            window.myRevenueChart.destroy(); // Xóa chart cũ nếu có
        }
    
        window.myRevenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Tháng"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Doanh thu"
                        }
                    }
                }
            }
        });
    }
    
    function renderTopCourtsChart(data) {
        const ctx = document.getElementById('topCourtsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.tenSan),
                datasets: [{
                    label: 'Số lần đặt',
                    data: data.map(item => item.count),
                    backgroundColor: 'rgba(163, 240, 228, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                      title:{
                        display:true,
                        text: "Tên sân"
                      }  
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async function updateGrowthPercentage() {
        const growthElement = document.getElementById("stats-growth-revenue");    
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
        const lastMonthKey = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}`;

        let currentRevenue = 0, lastRevenue = 0;
        const revenueSnapshot = await getDocs(collection(db, "doanhThu"));
    
        revenueSnapshot.forEach(doc => {
            if (doc.id === currentMonthKey) {
                currentRevenue = doc.data().tongDoanhThuThang || 0;
            } else if (doc.id === lastMonthKey) {
                lastRevenue = doc.data().tongDoanhThuThang || 0;
            }
        });

        let growthRate = 0;
        if (lastRevenue > 0) {
            growthRate = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        } else if (lastRevenue == 0) {
            growthRate = 100;
        }
    
        growthElement.textContent = growthRate.toFixed(2) + "% so với tháng trước";
    }
    
    fetchStats();
    fetchRevenueLast6Months();
    updateGrowthPercentage()
});

//Doanh thu
document.addEventListener('DOMContentLoaded', async function(){
    document.getElementById('totalRevenueChart')
});
