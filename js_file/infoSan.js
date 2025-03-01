document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM đã sẵn sàng!");

    const urlParams = new URLSearchParams(window.location.search);
    const idSan = urlParams.get("idSan");

    if (!idSan) {
        document.querySelector(".container").innerHTML = "<p>Không tìm thấy ID sân trong URL!</p>";
        console.error("❌ Không tìm thấy idSan trong URL.");
        return;
    }

    // Gọi API lấy thông tin chi tiết sân
    const fetchChiTietSan = fetch(`http://localhost:3000/chitietsan/${idSan}`).then(res => res.json());
    // Gọi API lấy giá sân & hình ảnh
    const fetchSan = fetch(`http://localhost:3000/san/${idSan}`).then(res => res.json());

    Promise.all([fetchChiTietSan, fetchSan])
        .then(([dataChiTiet, dataSan]) => {
            console.log("✅ Dữ liệu từ API /chitietsan:", dataChiTiet);
            console.log("✅ Dữ liệu từ API /san:", dataSan);

            // Kiểm tra dữ liệu trả về
            if (!dataChiTiet || !dataChiTiet.IDSan) {
                document.querySelector(".container").innerHTML = "<p>Không có thông tin chi tiết sân.</p>";
                return;
            }
            if (!dataSan) {
                document.querySelector(".container").innerHTML = "<p>Không có dữ liệu sân từ API /san.</p>";
                return;
            }

            // Gán dữ liệu vào HTML
            setTextContent("tensan", dataSan.TenSan);
            setTextContent("mota", dataChiTiet.MoTa);
            setTextContent("gioHoatDong", dataChiTiet.GioHoatDong);
            setTextContent("trangThai", dataChiTiet.TrangThai);
            setTextContent("giaSan", dataSan.GiaThue ? `${formatCurrency(dataSan.GiaThue)} đ` : "Không có");
            setTextContent("loaiSan", dataSan.IDLoaiSan);

            // Hiển thị hình ảnh sân
            let galleryHtml = "";
            if (dataSan.HinhAnh && typeof dataSan.HinhAnh === "string") {
                galleryHtml = `<img src="${dataSan.HinhAnh}" alt="Hình ảnh sân">`;
            } else if (Array.isArray(dataSan.HinhAnh) && dataSan.HinhAnh.length > 0) {
                galleryHtml = dataSan.HinhAnh.map(img => `<img src="${img}" alt="Hình ảnh sân">`).join("");
            } else {
                galleryHtml = "<p>Không có hình ảnh.</p>";
            }
            document.getElementById("hinhAnh").innerHTML = galleryHtml;
        })
        .catch(error => {
            console.error("❌ Lỗi khi lấy thông tin sân:", error);
            document.querySelector(".container").innerHTML = "<p>Lỗi khi lấy thông tin sân.</p>";
        });
});

// Hàm kiểm tra phần tử trước khi gán dữ liệu
function setTextContent(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || "Không có thông tin";
    } else {
        console.error(`❌ Không tìm thấy phần tử #${id} trong DOM`);
    }
}
function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString("vi-VN");
}
