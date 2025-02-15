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
        chatBox.style.display = "block"; // Hiển thị chatbox
        chatIcon.style.display = "none"; // Ẩn biểu tượng chat nhỏ
    } else {
        chatBox.style.display = "none"; // Ẩn chatbox
        chatIcon.style.display = "flex"; // Hiện biểu tượng chat nhỏ
    }
}
document.addEventListener("DOMContentLoaded", function () {
    // Khởi tạo bản đồ, đặt tâm tại quận Hà Đông, Hà Nội
    var map = L.map('map').setView([20.9725, 105.7772], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Danh sách các sân Pickleball ở Hà Đông
    var locations = [
        { lat: 20.9746, lng: 105.7745, name: "Sân Pickleball Hà Đông 1", address: "KĐT Văn Quán, Hà Đông, Hà Nội" },
        { lat: 20.9689, lng: 105.7807, name: "Sân Pickleball Hà Đông 2", address: "Công viên Thiên Văn Học, Hà Đông, Hà Nội" },
        { lat: 20.9783, lng: 105.7701, name: "Sân Pickleball Hà Đông 3", address: "Sân thể thao Mỗ Lao, Hà Đông, Hà Nội" }
    ];

    var markers = locations.map(loc => {
        var marker = L.marker([loc.lat, loc.lng]).addTo(map);
        marker.bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
        return marker;
    });

    var group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });

    // Xác định vị trí của người dùng
    function locateUser() {
        if (!navigator.geolocation) {
            alert("Trình duyệt của bạn không hỗ trợ xác định vị trí.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;

                var userMarker = L.marker([userLat, userLng]).addTo(map)
                    .bindPopup("<b>Vị trí của bạn</b>").openPopup();

                map.setView([userLat, userLng], 15);
            },
            function (error) {
                alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra cài đặt.");
            }
        );
    }

    // Thêm nút xác định vị trí vào giao diện
    var locateButton = L.control({ position: "topright" });
    locateButton.onAdd = function () {
        var btn = L.DomUtil.create("button", "locate-button");
        btn.innerHTML = "📍 Xác định vị trí";
        btn.onclick = locateUser;
        return btn;
    };
    locateButton.addTo(map);
});