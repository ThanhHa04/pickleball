import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//Tổng Quan
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
    async function fetchTotalRevenue() {
        try {
            const revenueSnapshot = await getDocs(collection(db, "doanhThu"));
            let totalRevenue = 0;
            let revenueList = "";
    
            revenueSnapshot.forEach((doc) => {
                const data = doc.data();
                const revenue = parseFloat(data.tongDoanhThuThang) || 0;
                totalRevenue += revenue;
    
                revenueList += `<li><strong>${doc.id}:</strong> ${revenue.toLocaleString()} VNĐ</li>`;
            });
    
            const revenueElement = document.getElementById("finalRevenue");
            if (revenueElement) {
                revenueElement.innerHTML = `<ul>${revenueList}</ul>
                    <br><strong>Tổng cộng: ${totalRevenue.toLocaleString()} VNĐ</strong>`;
            }
    
        } catch (error) {
            console.error("Lỗi khi lấy tổng doanh thu:", error);
        }
    }
    

    async function fetchFinalBookingStats() {
        try {
            const bookingsSnapshot = await getDocs(collection(db, "lichsudatsan"));
            const courtsSnapshot = await getDocs(collection(db, "san"));
    
            // 1. Tạo danh sách khung giờ từ 06:00 - 21:00
            const timeSlots = Array.from({ length: 16 }, (_, i) => {
                const hour = (i + 6).toString().padStart(2, '0'); // 06, 07, ..., 21
                return `${hour}:00`;
            });
            const timeSlotCount = Object.fromEntries(timeSlots.map(slot => [slot, 0]));
    
            
            const courtTypeMap = new Map();
            courtsSnapshot.forEach(doc => {
                const data = doc.data();
                courtTypeMap.set(doc.id, data.IDLoaiSan);
            });
    
            // 3. Đếm số lần đặt theo IDLoaiSan
            const courtTypeCount = new Map([
                ["P01", 0], ["P02", 0], ["P03", 0], ["P04", 0] 
            ]);
            bookingsSnapshot.forEach(doc => {
                const parts = doc.id.split('_'); 
                if (parts.length < 4) return;
                const timeSlot = parts[3]; 
                if (timeSlotCount[timeSlot] !== undefined) {
                    timeSlotCount[timeSlot]++;
                }
                const courtId = parts[2];
                const courtTypeId = courtTypeMap.get(courtId);
                if (courtTypeId) {
                    courtTypeCount.set(courtTypeId, (courtTypeCount.get(courtTypeId) || 0) + 1);
                }
            });
    
            // 4. Vẽ biểu đồ chấm (Scatter chart)
            const scatterCanvas = document.getElementById("timeSlotRevenueChart");
            if (scatterCanvas) {
                const scatterCtx = scatterCanvas.getContext("2d");
                const scatterData = Object.entries(timeSlotCount).map(([slot, count]) => ({
                    x: parseInt(slot.split(":")[0]),
                    y: count
                }));

                new Chart(scatterCtx, {
                    type: "scatter",
                    data: {
                        datasets: [{
                            label: "Số lần đặt sân",
                            data: scatterData,
                            backgroundColor: "rgba(75, 192, 192, 0.6)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            pointRadius: 6, 
                            pointHoverRadius: 8,
                        }]
                    },
                    options: {
                        responsive: false,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                type: "linear",
                                position: "bottom",
                                title: { display: true, text: "Khung Giờ" },
                                ticks: { stepSize: 1, min: 6, max: 21 }
                            },
                            y: {
                                title: { display: true, text: "Số lần đặt" },
                                beginAtZero: true
                            }
                        }
                    }
                });
            } else {
                console.error("Không tìm thấy phần tử canvas với ID 'timeSlotScatterChart'");
            }

            // 5. Vẽ biểu đồ tròn hiển thị số lần đặt theo loại sân
            const courtTypeLabels = ["Sân Acrylic", "Sân Polyurethane", "Sân Nhựa Tổng Hợp", "Sân Bê Tông"];
            const courtTypeData = ["P01", "P02", "P03", "P04"].map(id => courtTypeCount.get(id) || 0);
            console.log(courtTypeCount);
            const ctx = document.getElementById("courtTypeRevenueChart").getContext("2d");
            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: courtTypeLabels,
                    datasets: [{
                        data: courtTypeData,
                        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false
                }
            });
    
        } catch (error) {
            console.error("Lỗi khi lấy thống kê đặt sân:", error);
        }
    }
    
    
    fetchFinalBookingStats()
    fetchTotalRevenue();
});