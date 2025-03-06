// Kiểm tra vai trò của người dùng từ localStorage
let userName = localStorage.getItem("userName");
let userId = localStorage.getItem("userId");
let userRole = localStorage.getItem("userRole");

console.log("User Info:", { userName, userId, userRole });
console.log("User Role:", userRole);

const allowedPages = {
    user: ["home", "list-courts", "appointments", "history", "membership", "map"],
    admin: ["home", "list-courts", "appointments", "manage-users", "statistics", "map"]
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

    updateMenuByRole(); // GỌI LẠI HÀM NÀY Ở ĐÂY
};


function getPath(filename) {
    if (window.location.origin.includes("127.0.0.1:5500")) {
        return `/html_file/${filename}`; // Live Server (VS Code)
    }
    return `/${filename}`; // Node.js (Express)
}


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
                    if (parts.length > 7) {
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

        let courtCount = {};

        // Đếm số sân theo location_id
        sanList.forEach(san => {
            let locationId = san.location_id;
            courtCount[locationId] = (courtCount[locationId] || 0) + 1;
        });

        // Sắp xếp danh sách locations theo id tăng dần
        locations.sort((a, b) => a.id - b.id);

        let htmlContent = `<p>Có ${locations.length} cơ sở:</p><ul>`;

        // Tạo danh sách hiển thị
        locations.forEach(loc => {
            let numCourts = courtCount[loc.id] || 0;
            htmlContent += `<li>${loc.name}: có ${numCourts} sân</li>`;
        });
        htmlContent += `</ul>`;

        // Hiển thị nội dung lên trang web
        document.getElementById("pickleball-courts").innerHTML = htmlContent;

    } catch (error) {
        console.error("🚨 Lỗi khi tải dữ liệu:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadPickleballData);
