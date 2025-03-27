// Kiểm tra vai trò của người dùng từ localStorage
let userName = localStorage.getItem("userName");
let userId = localStorage.getItem("userId");
let userRole = localStorage.getItem("userRole");

console.log("User Info:", { userName, userId, userRole });
console.log("User Role:", userRole);
const allowedPages = {
    user: ["home", "list-courts", "appointments", "history", "membership", "map"],
    admin: ["home", "manage-courts", "manage-users","allAppointments", "statistics", "map"]
};

// Ẩn/hiện menu theo vai trò
function updateMenuByRole() {
    const menuItems = document.querySelectorAll(".below-top a");
    menuItems.forEach(item => {
        const onclickAttr = item.getAttribute("onclick");
        const match = onclickAttr?.match(/showContent\('([^']+)',?\s*this?\)/);
        if (!match) {
            console.warn("⚠️ Không tìm thấy thuộc tính onclick hợp lệ:", item);
            return;
        }
        const page = match[1]; 
        if (!allowedPages[userRole] || !allowedPages[userRole].includes(page)) {
            item.style.display = "none";
        } else {
            item.style.display = "inline-block";
        }
    });
}   

document.addEventListener("DOMContentLoaded", updateMenuByRole);

function showContent(page, element) {
    document.querySelectorAll(".content").forEach(div => div.style.display = "none");
    let targetElement = document.getElementById(page);
    if (targetElement) {
        targetElement.style.display = page === "map" ? "flex" : "block";
    }
    document.querySelectorAll(".below-top a").forEach(link => link.classList.remove("active"));
    if (element) {
        element.classList.add("active");
    }
}

window.onload = function () {
    document.querySelectorAll(".content").forEach(div => div.style.display = "none");

    if (userName) {
        document.getElementById("user-name").style.display = "block";
        document.getElementById("user-name-text").textContent = userName;
        document.getElementById("loginLink").style.display = "none";
        document.getElementById("signupLink").style.display = "none";
    } else {
        document.getElementById("loginLink").style.display = "block";
        document.getElementById("signupLink").style.display = "block";
        document.getElementById("user-name").style.display = "none";
    }

    showContent('home', document.querySelector(".below-top a"));

    document.getElementById("loginLink").setAttribute("href", getPath("Login.html"));
    document.getElementById("signupLink").setAttribute("href", getPath("Signup.html"));

    updateMenuByRole();
};


function getPath(filename) {
    const isLiveServer = window.location.protocol === "file:";
    return isLiveServer ? `/html_file/${filename}` : `/${filename}`;
}

function addMessage(sender, text) {
    let chatMessages = document.querySelector(".chat-messages");
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleChat() {
    let chatBox = document.querySelector(".chat-box");
    let chatIcon = document.querySelector(".chat-icon");

    if (chatBox.style.display === "none" || chatBox.style.display === "") {
        chatBox.style.display = "block";
        chatIcon.style.display = "flex";
    } else {
        chatBox.style.display = "none";
        chatIcon.style.display = "flex";
    }
}
//chatbot
document.addEventListener("DOMContentLoaded", function () {
    let chatMessages = document.querySelector(".chat-messages");

    const botResponses = {
        "Giờ mở cửa": "⏰ Chúng tôi mở cửa từ 6h00 - 22h00 hàng ngày.",
        "Giá dịch vụ": "💰 Bạn có thể xem bảng giá chi tiết trong mục danh sách sân.",
        "Liên hệ với nhân viên": "📞 Gọi vào số 0123456789 để được hỗ trợ nhanh nhất!",
        "Tạm biệt": "🙏 Cảm ơn bạn đã ghé thăm! Chúc bạn một ngày tốt lành!"
    };

    function sendMessage(userMessage) {
        addMessage("Bạn", userMessage);
    
        if (userMessage === "Hướng dẫn thanh toán") {
            sendStepByStepPayment();
            return; 
        }
    
        if (userMessage === "Hủy sân") {
            sendStepByStepCancel();
            return; 
        }
    
        if (userMessage === "Xem lịch sử thanh toán") {
            sendStepByStepPayment();
            return;
        }
    
        if (userMessage === "Xem lịch sử đặt sân") {
            sendStepByStepBooking();
            return;
        }
    
        setTimeout(() => {
            let botReply = botResponses[userMessage] || "🤖 Xin lỗi, tôi chưa hiểu câu hỏi của bạn.";
            addMessage("Bot", botReply);
        }, 500);
    }
    function addMessage(sender, text) {
        let messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
    
        // Thêm lớp tùy thuộc vào người gửi
        if (sender === "Bạn") {
            messageDiv.classList.add("user");
        } else {
            messageDiv.classList.add("bot");
        }
    
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function sendStepByStepPayment() {
        setTimeout(() => addMessage("Bot", "💳 **Hướng dẫn thanh toán:**"), 500);
        setTimeout(() => addMessage("Bot", "1️⃣ Truy cập vào danh sách sân."), 1000);
        setTimeout(() => addMessage("Bot", "2️⃣ Chọn sân mà bạn muốn đặt."), 1500);
        setTimeout(() => addMessage("Bot", "3️⃣ Chọn khung giờ và phương thức thanh toán."), 2000);
        setTimeout(() => addMessage("Bot", "4️⃣ Nhấn 'Đã thanh toán' sau khi hoàn tất giao dịch."), 2500);
    }

    function sendStepByStepCancel() {
        setTimeout(() => addMessage("Bot", " **Hướng dẫn hủy sân:**"), 500);
        setTimeout(() => addMessage("Bot", "1️⃣ Truy cập vào quản lý lịch hẹn."), 1000);
        setTimeout(() => addMessage("Bot", "2️⃣ Chọn lịch đặt mà bạn muốn hủy."), 1500);
        setTimeout(() => addMessage("Bot", "3️⃣ Nhấn hủy sân ở bên dướidưới."), 2000);
        setTimeout(() => addMessage("Bot", "⚠️ Chỉ có thể hủy sân trước 2 tiếng so với thời gian đặt "), 2500);
    }
    
    function sendStepByStepPayment() {
        setTimeout(() => addMessage("Bot", "💳 **Hướng dẫn xem lịch sử thanh toán:**"), 500);
        setTimeout(() => addMessage("Bot", "1️⃣ Truy cập vào mục lịch sử thanh toán trên menu."), 1000);
        setTimeout(() => addMessage("Bot", "2️⃣ Hiển thị lịch sử thanh toántoán"), 1500);
    }

    function sendStepByStepBooking() {
        setTimeout(() => addMessage("Bot", "💳 **Hướng dẫn thanh toán:**"), 500);
        setTimeout(() => addMessage("Bot", "1️⃣ Truy cập vào quản lý lịch hẹn."), 1000);
        setTimeout(() => addMessage("Bot", "2️⃣ Hệ thống sẽ hiển thị danh sách các lịch mà bạn đã đặt."), 1500);
    }

    function addMessage(sender, text) {
        let messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    window.sendMessage = sendMessage;
});

document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('leafletMap').setView([20.9725, 105.7772], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    fetch("http://localhost:3000/locations")
        .then(response => response.json())
        .then(locations => {
            if (Array.isArray(locations)) {
                var markers = locations.map(loc => {
                    var marker = L.marker([loc.lat, loc.lng]).addTo(map);
                    marker.bindTooltip(loc.name, { permanent: true, direction: "top" });
                    marker.bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
                    return marker;
                });
                var group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            } else {
                console.error("Dữ liệu trả về không phải là mảng.");
            }
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu sân:', error));

    // ✅ Sửa lỗi xác định vị trí người dùng (cần kiểm tra `navigator.geolocation`)
    function locateUser() {
        if (!navigator.geolocation) {
            alert("Trình duyệt của bạn không hỗ trợ xác định vị trí.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;

                function cleanAddress(address) {
                    let parts = address.split(", ");
                    if (parts.length > 5) {
                        return parts.slice(0, 5).join(", "); 
                    }
                    return address;
                }

                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&accept-language=vi`)
                    .then(response => response.json())
                    .then(data => {
                        let address = cleanAddress(data.display_name);
                        var userMarker = L.marker([userLat, userLng]).addTo(map)
                            .bindPopup(`<b>Vị trí của bạn</b><br>${address}`).openPopup();
                        map.setView([userLat, userLng], 15);
                    })
                    .catch(error => {
                        console.error("Lỗi khi lấy địa chỉ:", error);
                        var userMarker = L.marker([userLat, userLng]).addTo(map)
                            .bindPopup("<b>Vị trí của bạn</b><br>Không xác định được địa chỉ").openPopup();
                        map.setView([userLat, userLng], 15);
                    });
            },
            function (error) {
                alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra cài đặt.");
            }
        );
    }

    var locateButton = L.control({ position: "topright" });
    locateButton.onAdd = function () {
        var btn = L.DomUtil.create("button", "locate-button");
        btn.innerHTML = "📍 Xác định vị trí";
        btn.onclick = locateUser;
        return btn;
    };
    locateButton.addTo(map);
});

function toggleUserDropdown(event) {
    var dropdown = document.getElementById("user-dropdown");
    
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
    event.stopPropagation();
}

function manageProfile() {
    alert("Quản lý thông tin cá nhân");
}

function logout() {
    if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("userInfo"); 
        sessionStorage.removeItem("userInfo");
        window.location.href = "login.html"; 
    }
}

let nextMembership = document.querySelector('.next-membership');
let prevMembership = document.querySelector('.prev-membership');

if (nextMembership && prevMembership) {
    nextMembership.addEventListener('click', function () {
        let items = document.querySelectorAll('.membership-item');
        document.querySelector('.membership-slide').appendChild(items[0]);
    });

    prevMembership.addEventListener('click', function () {
        let items = document.querySelectorAll('.membership-item');
        document.querySelector('.membership-slide').prepend(items[items.length - 1]);
    });
}

async function loadPickleballData() {
    try {
        const locationsRes = await fetch('http://localhost:3000/locations');
        const locations = await locationsRes.json();
        const sanRes = await fetch('http://localhost:3000/san');
        const sanList = await sanRes.json();
        console.log("🏀 Locations:", locations);
        console.log("🏟️ Courts:", sanList);
        let courtCount = {};
        sanList.forEach(san => {
            let locationId = san.location_id;
            courtCount[locationId] = (courtCount[locationId] || 0) + 1;
        });
        locations.sort((a, b) => a.id - b.id);

        let htmlContent = `<p>Có ${locations.length} cơ sở:</p><ul>`;
        locations.forEach(loc => {
            let numCourts = courtCount[loc.id] || 0;
            htmlContent += `<li>${loc.name}: có ${numCourts} sân</li>`;
        });

        htmlContent += `</ul>`;
        document.getElementById("listed").innerHTML = htmlContent;

    } catch (error) {
        console.error("🚨 Lỗi khi tải dữ liệu:", error);
    }
}
document.addEventListener("DOMContentLoaded", loadPickleballData);

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".ql-images, .tk-images,.intro-content, .intro-image,.cards .card");

    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.9;
        elements.forEach(el => {
            if (el.getBoundingClientRect().top < triggerBottom) {
                el.classList.add("show");
            }
        });
    }
    window.addEventListener("scroll", checkScroll);
    checkScroll();
});
document.addEventListener("DOMContentLoaded", function () {
    const registerButtons = document.querySelectorAll(".register-btn");
    const modal = document.getElementById("membership-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalImage = document.getElementById("modal-image");
    const closeModal = document.querySelector(".close-btn");

    const paymentModal = document.getElementById("payment-modal");
    const confirmPaymentModal = document.getElementById("confirm-payment-modal");

    let currentMembership = {}; // Lưu thông tin gói thành viên

    async function fetchMembership(idGoi) {
        try {
            const response = await fetch(`http://localhost:3000/membership/${idGoi}`);
            if (!response.ok) throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể tải thông tin gói thành viên. Vui lòng thử lại!");
            return null;
        }
    }

    registerButtons.forEach((button) => {
        button.addEventListener("click", async function () {
            const membershipItem = button.closest(".membership-item");
            const idGoi = membershipItem.getAttribute("data-id");

            const data = await fetchMembership(idGoi);
            if (!data) return;

            currentMembership = {
                id: idGoi,
                tenGoi: data.TenGoi,
                giaTien: data.GiaTien,
                quyenLoi: data.QuyenLoi,
                thoiHan: data.ThoiHan,
            };

            modalTitle.innerText = data.TenGoi;
            modalDescription.innerText = `Giá: ${data.GiaTien.toLocaleString("vi-VN")} VNĐ\nQuyền lợi: ${data.QuyenLoi}\nThời hạn: ${data.ThoiHan}`;
            modalImage.src = membershipItem.getAttribute("data-image");

            modal.style.display = "block";
        });
    });

    function closeModalHandler(event) {
        event.target.closest(".modal").style.display = "none";
    }

    closeModal.addEventListener("click", closeModalHandler);
    document.querySelector(".close-payment").addEventListener("click", closeModalHandler);
    document.querySelector(".close-confirm-payment").addEventListener("click", closeModalHandler);

    window.addEventListener("click", function (event) {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    });

    document.getElementById("confirm-btn").addEventListener("click", function () {
        if (!currentMembership.giaTien) {
            alert("Vui lòng chọn gói thành viên trước khi thanh toán.");
            return;
        }
        modal.style.display = "none";
        paymentModal.style.display = "flex";
    });

    document.getElementById("pay-now-btn").addEventListener("click", async function () {
        paymentModal.style.display = "none";
        confirmPaymentModal.style.display = "flex";

        await updatePaymentModal();
    });

    async function getUserInfo(userId) {
        try {
            const response = await fetch(`http://localhost:3000/nguoidung/${userId}`);
            if (!response.ok) throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            return null;
        }
    }

    async function updatePaymentModal() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.error("Không tìm thấy userId trong localStorage.");
            return;
        }

        const userInfo = await getUserInfo(userId);
        if (!userInfo) return;

        document.getElementById("payer-name").textContent = userInfo.HoTen || "N/A";
        document.getElementById("payer-email").textContent = userInfo.Email || "N/A";
        document.getElementById("payer-phone").textContent = userInfo.SDT || "N/A";

        const formattedDate = new Date().toLocaleDateString("vi-VN");
        document.getElementById("payment-date").textContent = formattedDate;

        document.getElementById("total-amount").textContent = `${currentMembership.giaTien.toLocaleString("vi-VN")} VNĐ`;

        const soTaiKhoan = "8831814758";
        const nganHang = "970418";
        const soTien = currentMembership.giaTien;
        const noiDung = encodeURIComponent(`Thanh toan goi ${currentMembership.tenGoi}`);

        const vietqrLink = `https://img.vietqr.io/image/${nganHang}-${soTaiKhoan}-compact2.jpg?amount=${soTien}&addInfo=${noiDung}`;

        document.getElementById("vietqr-image").src = vietqrLink;
    }

    document.getElementById("confirm-payment-btn").addEventListener("click", async function () {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("Không tìm thấy ID người dùng! Vui lòng đăng nhập lại.");
            return;
        }

        if (!currentMembership.id || !currentMembership.giaTien) {
            alert("Lỗi: Không có thông tin thanh toán hợp lệ.");
            return;
        }

        let now = new Date();
        let paymentTime = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const transactionData = {
            userId,
            membershipId: currentMembership.id,
            membershipName: currentMembership.tenGoi,
            amount: currentMembership.giaTien,
            paymentTime
        };

        try {
            const response = await fetch("http://localhost:3000/handle-membership-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(transactionData),
            });

            const result = await response.json();

            if (result.success) {
                alert("✅ Thanh toán đã được xác nhận thành công!");
                confirmPaymentModal.style.display = "none"; // Đóng modal
                location.reload(); // Refresh trang
            } else {
                alert("❌ Xác nhận thanh toán thất bại! Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi xác nhận thanh toán:", error);
            alert("❌ Đã xảy ra lỗi khi xác nhận thanh toán.");
        }
    });
});

function toggleNotificationDropdown(event) {
    const dropdown = document.getElementById("notification-dropdown");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
    event.stopPropagation();
}

//ẩn dropdown khi click ra ngoài
document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("notification-dropdown");
    if (!dropdown.contains(event.target) && !event.target.closest(".notification-icon")) {
        dropdown.style.display = "none";
    }
});

//lấy thông báo từ database
function getNotifications() {
    fetch("http://localhost:3000/notifications")
        .then(response => response.json())
        .then(notifications => {
            const dropdown = document.getElementById("notification-dropdown");
            notifications.forEach(notification => {
                if (notification.title === "Thông báo" && notification.message === "Bạn chưa có thông báo nào") {
                    return;
                }
                const notificationItem = document.createElement("li");
                notificationItem.innerHTML = `<strong>${notification.title}</strong> - ${notification.message}`;
                dropdown.appendChild(notificationItem);
            });
        })
        .catch(error => console.error("Lỗi khi lấy thông báo:", error));
}

//cập nhật số thông báo
function updateNotificationCount() {
    const count = document.querySelector(".notification-count");
    count.textContent = "0";
}

//xử lý click vào thông báo
function handleNotificationClick(event) {
    const dropdown = document.getElementById("notification-dropdown");
    dropdown.style.display = "none";
}