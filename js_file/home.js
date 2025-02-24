// Hàm để chuyển đổi giữa các trang
function showContent(page, element) {
    // Ẩn tất cả các content
    document.querySelectorAll(".content").forEach(div => div.style.display = "none");

    // Hiển thị trang tương ứng
    document.getElementById(page).style.display = "block";

    // Loại bỏ class active của tất cả các link
    document.querySelectorAll(".below-top a").forEach(link => link.classList.remove("active"));

    // Thêm class active cho link hiện tại
    element.classList.add("active");
}

window.onload = function () {
    // Ẩn tất cả content trước khi hiển thị content tương ứng
    document.querySelectorAll(".content").forEach(div => div.style.display = "none");

    // Kiểm tra nếu có người dùng đã đăng nhập từ localStorage, hiển thị content 'home' mặc định
    const userName = localStorage.getItem("userName");
    if (userName) {
        document.getElementById("user-name").style.display = "block";
        document.getElementById("user-name-text").textContent = userName; // Hiển thị tên người dùng
        document.getElementById("login-link").style.display = "none";
        document.getElementById("signup-link").style.display = "none";
    } else {
        document.getElementById("login-link").style.display = "block";
        document.getElementById("signup-link").style.display = "block";
        document.getElementById("user-name").style.display = "none";
    }

    // Mặc định hiển thị content home
    showContent('home', document.querySelector(".below-top a"));
};

// Hàm toggle chat box
function toggleChat() {
    let chatBox = document.querySelector(".chat-box");
    let chatIcon = document.querySelector(".chat-icon");
    if (chatBox.style.display === "none" || chatBox.style.display === "") {
        chatBox.style.display = "block";
        chatIcon.style.display = "none";
    } else {
        chatBox.style.display = "none";
        chatIcon.style.display = "flex";
    }
}

// Khi tài liệu HTML đã tải xong
document.addEventListener("DOMContentLoaded", function () {
    // Khởi tạo bản đồ
    var map = L.map('map').setView([20.9725, 105.7772], 14); // Vị trí mặc định của bản đồ
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Lấy danh sách địa điểm từ server (API)
    fetch('http://localhost:3000/locations')
        .then(response => response.json())
        .then(locations => {
            if (Array.isArray(locations)) {
                var markers = locations.map(loc => {
                    var marker = L.marker([loc.lat, loc.lng]).addTo(map);
                    marker.bindTooltip(loc.name, { permanent: true, direction: "top" });
                    marker.bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
                    return marker;
                });

                // Tự động căn chỉnh bản đồ sao cho hiển thị hết các marker
                var group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            } else {
                console.error("Dữ liệu trả về không phải là mảng.");
            }
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu sân:', error));

    // Hàm xác định vị trí người dùng
    function locateUser() {
        if (!navigator.geolocation) {
            alert("Trình duyệt của bạn không hỗ trợ xác định vị trí.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;

                // Hàm xử lý địa chỉ người dùng
                function cleanAddress(address) {
                    let parts = address.split(", ");
                    if (parts.length > 6) {
                        return parts.slice(0, 5).join(", ");
                    }
                    return address;
                }

                // Sử dụng API Nominatim để lấy địa chỉ từ tọa độ
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&accept-language=vi`)
                    .then(response => response.json())
                    .then(data => {
                        let address = data.display_name;
                        address = cleanAddress(address);

                        // Thêm marker vị trí người dùng vào bản đồ
                        var userMarker = L.marker([userLat, userLng]).addTo(map)
                            .bindPopup(`<b>Vị trí của bạn</b><br>${address}`).openPopup();

                        // Di chuyển bản đồ về vị trí người dùng
                        map.setView([userLat, userLng], 15);
                    })
                    .catch(error => {
                        console.error("Lỗi khi lấy địa chỉ:", error);
                        var userMarker = L.marker([userLat, userLng]).addTo(map)
                            .bindPopup("<b>Vị trí của bạn</b><br>Không xác định được địa chỉ").openPopup();

                        // Di chuyển bản đồ về vị trí người dùng
                        map.setView([userLat, userLng], 15);
                    });
            },
            function (error) {
                alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra cài đặt.");
            }
        );
    }

    // Tạo nút xác định vị trí người dùng
    var locateButton = L.control({ position: "topright" });
    locateButton.onAdd = function () {
        var btn = L.DomUtil.create("button", "locate-button");
        btn.innerHTML = "📍 Xác định vị trí";
        btn.onclick = locateUser;
        return btn;
    };
    locateButton.addTo(map);
});

// Hàm toggle dropdown cho user
function toggleUserDropdown(event) {
    var dropdown = document.getElementById("user-dropdown");
    var userName = document.getElementById("user-name");

    // Kiểm tra xem dropdown đã hiển thị hay chưa
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";  // Nếu đã hiển thị thì ẩn đi
    } else {
        dropdown.style.display = "block";  // Nếu chưa hiển thị thì bật dropdown lên
    }

    // Ngừng lan truyền sự kiện nhấp chuột (chỉ áp dụng cho phần tử cần toggle)
    event.stopPropagation();
}


// Hàm quản lý thông tin cá nhân (Bạn có thể thay đổi tùy theo yêu cầu)
function manageProfile() {
    alert("Quản lý thông tin cá nhân");
}

// Hàm đăng xuất
function logout() {
    localStorage.removeItem("userName"); // Xóa tên người dùng khỏi localStorage
    window.location.href = "/html_file/login.html"; // Điều hướng về trang đăng nhập
}
