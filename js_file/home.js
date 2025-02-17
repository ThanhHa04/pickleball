function showContent(page, element) {
    document.querySelectorAll(".content").forEach(div => div.style.display = "none");
    document.getElementById(page).style.display = "block";
    document.querySelectorAll(".below-top a").forEach(link => link.classList.remove("active"));
    element.classList.add("active");
}
window.onload = function () {
    showContent('home', document.querySelector(".below-top a"));
};

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
    var map = L.map('map').setView([20.9725, 105.7772], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Lấy danh sách sân từ server (API)
    fetch('http://localhost:3000/locations')
        .then(response => response.json())
        .then(locations => {
            var markers = locations.map(loc => {
                var marker = L.marker([loc.lat, loc.lng]).addTo(map);
                marker.bindTooltip(loc.name, { permanent: true, direction: "top" });
                marker.bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
                return marker;
            });

            var group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu sân:', error));

    // Xác định vị trí người dùng
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

                // Sử dụng API Nominatim để lấy địa chỉ từ tọa độ
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&accept-language=vi`)
                    .then(response => response.json())
                    .then(data => {
                        let address = data.display_name;
                        address = cleanAddress(address);

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