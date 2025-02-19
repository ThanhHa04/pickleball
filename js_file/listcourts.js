document.addEventListener("DOMContentLoaded", function () {
    fetch('http://localhost:3000/San')
        .then(response => response.json())
        .then(San => {
            let currentPage = 1;
            const itemsPerPage = 8;

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

                San.forEach(court => {
                    if (court.IDLoaiSan && court.IDLoaiSan.startsWith("P")) {
                        pickleballCount++;
                    } else if (court.IDLoaiSan && court.IDLoaiSan.startsWith("S")) {
                        footballCount++;
                    } else if (court.IDLoaiSan && court.IDLoaiSan.startsWith("B")) {
                        badmintonCount++;
                    }
                });

                document.getElementById('pickleball-count').textContent = pickleballCount;
                document.getElementById('football-count').textContent = footballCount;
                document.getElementById('badminton-count').textContent = badmintonCount;
            }

            function displayCourts() {
                const searchQuery = document.getElementById("search-bar").value.toLowerCase();
                const priceFilter = document.getElementById("price-filter").value;

                let filteredCourts = San.filter(court => court.TenSan.toLowerCase().includes(searchQuery))
                    .sort((a, b) => getMatchScore(a, searchQuery) - getMatchScore(b, searchQuery));

                if (priceFilter === "low-to-high") {
                    filteredCourts.sort((a, b) => a.GiaThue - b.GiaThue);
                } else if (priceFilter === "high-to-low") {
                    filteredCourts.sort((a, b) => b.GiaThue - a.GiaThue);
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

                    let imageUrl = court.HinhAnh ? court.HinhAnh : "default-image.jpg"; // Nếu không có hình thì dùng ảnh mặc định

                    courtItem.innerHTML = ` 
                    <div class="court-img">
                        <img class="court-img-ex" src="${imageUrl}" alt="${court.TenSan}">
                    </div>
                    <div class="court-info">
                        <h3>${court.TenSan}</h3>
                        <p><strong>Địa chỉ:</strong> ${court.location_name}</p> 
                        <p><strong>Giá thuê:</strong> ${giaThue.toLocaleString()}</p>
                        <p class="rating">⭐⭐⭐⭐⭐</p>
                        <p class="dich-vu">
                            <span>📶 Wifi</span>
                            <span>🍽 Căng tin</span>
                        </p>
                    </div>
                    `;
                    courtListDiv.appendChild(courtItem);
                });

                document.getElementById("page-number").textContent = `Trang ${currentPage}`;
                document.getElementById("prev-page").disabled = currentPage === 1;
                document.getElementById("next-page").disabled = end >= filteredCourts.length;

                countCourtTypes();
            }

            document.getElementById("search-bar").addEventListener("input", () => {
                currentPage = 1;
                displayCourts();
            });

            document.getElementById("price-filter").addEventListener("change", () => {
                console.log("Selected price filter: ", document.getElementById("price-filter").value);
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
