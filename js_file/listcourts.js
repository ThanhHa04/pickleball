document.addEventListener("DOMContentLoaded", function() {
    // Gọi API để lấy dữ liệu sân
    fetch('http://localhost:3000/San')
        .then(response => response.json())
        .then(San => {
            // Xử lý dữ liệu và hiển thị danh sách sân
            const container = document.getElementById('san-list');
            // Duyệt qua từng sân và tạo các phần tử HTML để hiển thị
            San.forEach(san => {
                const sanElement = document.createElement('div');
                sanElement.classList.add('san'); // Đảm bảo chỉ thêm class cho sanElement

                sanElement.innerHTML = `
                    <h3>${san.ViTri}</h3>
                    <p>ID: ${san.IDSan}</p>
                    <p>Giá thuê: ${san.GiaThue.toLocaleString()} VND</p>
                    <p>Mô tả: ${san.MoTa}</p>
                    <p>Trạng thái: ${san.TrangThai}</p>
                `;
                container.appendChild(sanElement); // Thêm phần tử san vào container
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy dữ liệu sân:', error);
        });
});
