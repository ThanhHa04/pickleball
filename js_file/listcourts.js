document.addEventListener("DOMContentLoaded", function() {
    fetch('http://localhost:3000/San')
        .then(response => response.json())
        .then(San => {
            let currentPage = 1;
            const itemsPerPage = 8;

            // Hàm so sánh độ chính xác của kết quả tìm kiếm
            function getMatchScore(court, query) {
                const position = court.TenSan.toLowerCase();
                query = query.toLowerCase();
                if (position === query) {
                    return 3; 
                } else if (position.startsWith(query)) {
                    return 2; 
                } else if (position.includes(query)) {
                    return 1;
                }
                return 0; 
            }

            function countCourtTypes() {
                let pickleballCount = 0;
                let footballCount = 0;
                let badmintonCount = 0;

                // Đếm số lượng sân theo loại dựa trên IDSan
                San.forEach(court => {
                    if (court.IDSan.startsWith("P")) {
                        pickleballCount++;
                    } else if (court.IDSan.startsWith("S")) {
                        footballCount++;
                    } else if (court.IDSan.startsWith("B")) {
                        badmintonCount++;
                    }
                });

                // Cập nhật số lượng sân từng loại lên giao diện
                document.getElementById('pickleball-count').textContent = `Pickleball... ${pickleballCount}`;
                document.getElementById('football-count').textContent = `Bóng đá... ${footballCount}`;
                document.getElementById('badminton-count').textContent = `Cầu lông... ${badmintonCount}`;
            }

            function displayCourts() {
                const searchQuery = document.getElementById("search-bar").value;
                const priceFilter = document.getElementById("price-filter").value;

                // Lọc và sắp xếp danh sách sân theo độ khớp
                let filteredCourts = San.filter(court => court.TenSan.toLowerCase().includes(searchQuery.toLowerCase()))
                                         .sort((a, b) => getMatchScore(b, searchQuery) - getMatchScore(a, searchQuery)); // Sắp xếp theo độ khớp

                // Lọc theo giá
                if (priceFilter === "low-to-high") {
                    filteredCourts.sort((a, b) => a.GiaThue - b.GiaThue); // Sắp xếp giá từ thấp đến cao
                } else if (priceFilter === "high-to-low") {
                    filteredCourts.sort((a, b) => b.GiaThue - a.GiaThue); // Sắp xếp giá từ cao đến thấp
                }

                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const courtsToDisplay = filteredCourts.slice(start, end);
                const courtListDiv = document.getElementById("san-list");
                courtListDiv.innerHTML = ''; 

                courtsToDisplay.forEach(court => {
                    const courtItem = document.createElement("div");
                    courtItem.classList.add("court-item");
                    let giaThue = court.GiaThue;
                    if (giaThue % 1 === 0) {
                        giaThue = Math.floor(giaThue);
                    }

                    courtItem.innerHTML = ` 
                        <h3>${court.TenSan}</h3>
                        <p>ID: ${court.IDSan}</p>
                        <p>Giá thuê: ${giaThue.toLocaleString()} VND</p> <!-- Hiển thị giá đúng format -->
                        <p>Mô tả: ${court.MoTa}</p>
                        <p>Trạng thái: ${court.TrangThai}</p>
                    `;
                    courtListDiv.appendChild(courtItem);
                });

                document.getElementById("page-number").textContent = `Trang ${currentPage}`;
                document.getElementById("prev-page").disabled = currentPage === 1;
                document.getElementById("next-page").disabled = end >= filteredCourts.length;

                // Cập nhật tổng số sân theo loại
                countCourtTypes();
            }

            document.getElementById("search-bar").addEventListener("input", () => {
                currentPage = 1;
                displayCourts();
            });

            document.getElementById("price-filter").addEventListener("change", () => {
                console.log("Selected price filter: ", document.getElementById("price-filter").value);  // Kiểm tra giá trị lọc
                currentPage = 1;
                displayCourts();
            });

            document.getElementById("prev-page").addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayCourts();
                }
            });
            document.getElementById("next-page").addEventListener("click", () => {
                const filteredCourts = San.filter(court => court.TenSan.toLowerCase().includes(document.getElementById("search-bar").value.toLowerCase()));
                if ((currentPage * itemsPerPage) < filteredCourts.length) {
                    currentPage++;
                    displayCourts();
                }
            });

            displayCourts();
        })
        .catch(error => {
            console.error('Lỗi khi lấy dữ liệu sân:', error);
        });
});
