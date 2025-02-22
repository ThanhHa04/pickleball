document.addEventListener("DOMContentLoaded", function () {
    fetch('http://localhost:3000/san')  // Lấy dữ liệu sân từ API
        .then(response => response.json())
        .then(San => {
            console.log(San);
            let currentPage = 1;
            const itemsPerPage = 8;
            let locations = {};

            function getLocationName(locationId) {
                if (locations[locationId]) {
                    return Promise.resolve(locations[locationId]);
                }
                return fetch(`http://localhost:3000/locations/${locationId}`)
                    .then(response => response.json())
                    .then(location => {
                        locations[locationId] = location.name;
                        return location.name;
                    })
                    .catch(err => {
                        console.error('Lỗi khi lấy thông tin địa điểm:', err);
                        return "Không có thông tin địa điểm";
                    });
            }

            function countCourtTypes(filteredCourts) {
                let pickleballCount = 0;
                let footballCount = 0;
                let badmintonCount = 0;

                filteredCourts.forEach(court => {
                    if (court.IDLoaiSan?.startsWith("P")) pickleballCount++;
                    else if (court.IDLoaiSan?.startsWith("S")) footballCount++;
                    else if (court.IDLoaiSan?.startsWith("B")) badmintonCount++;
                });

                document.getElementById('pickleball-count').textContent = pickleballCount;
                document.getElementById('football-count').textContent = footballCount;
                document.getElementById('badminton-count').textContent = badmintonCount;
            }

            function displayCourts() {
                const searchQuery = document.getElementById("search-bar").value.toLowerCase();
                const priceFilter = document.getElementById("price-filter").value;

                function removeAccents(str) {
                    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
                }
                let filteredCourts = San.filter(court =>
                    removeAccents(court.TenSan).includes(removeAccents(searchQuery))
                );

                if (priceFilter) {
                    filteredCourts = filteredCourts.filter(court => court.GiaThue !== undefined && court.GiaThue !== null);
                    if (priceFilter === "low-to-high") {
                        filteredCourts.sort((a, b) => Number(a.GiaThue) - Number(b.GiaThue));
                    } else if (priceFilter === "high-to-low") {
                        filteredCourts.sort((a, b) => Number(b.GiaThue) - Number(a.GiaThue));
                    }
                }

                countCourtTypes(filteredCourts);
                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const courtsToDisplay = filteredCourts.slice(start, end);
                const courtListDiv = document.getElementById("san-list");
                courtListDiv.innerHTML = '';

                Promise.all(courtsToDisplay.map(async (court) => {
                    court.locationName = await getLocationName(court.location_id);
                    return court;
                })).then(updatedCourts => {
                    updatedCourts.forEach(court => {
                        const courtItem = document.createElement("div");
                        courtItem.classList.add("court-item");
                        courtItem.dataset.idSan = court.IDSan;  // Đảm bảo sử dụng IDSan

                        let giaThue = court.GiaThue % 1 === 0 ? Math.floor(court.GiaThue) : court.GiaThue;
                        let imageUrl = court.HinhAnh || "default-image.jpg";

                        courtItem.innerHTML = `
                        <div class="court-img">
                            <img class="court-img-ex" src="${imageUrl}" alt="${court.TenSan}">
                        </div>
                        <div class="court-info">
                            <h3>${court.TenSan}</h3>
                            <p><strong>Địa chỉ:</strong> ${court.locationName}</p> 
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
                });
            }

            displayCourts();

            document.getElementById("prev-page").addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayCourts();
                }
            });

            document.getElementById("next-page").addEventListener("click", () => {
                currentPage++;
                displayCourts();
            });

            document.getElementById("search-bar").addEventListener("input", displayCourts);
            document.getElementById("price-filter").addEventListener("change", displayCourts);

            // --- HIỂN THỊ THÔNG TIN CHI TIẾT SÂN KHI CLICK ---
            document.getElementById("san-list").addEventListener("click", function (event) {
                const courtItem = event.target.closest(".court-item");
                if (courtItem) {
                    const idSan = courtItem.dataset.idSan;
                    console.log("ID sân:", idSan);

                    // Điều hướng đến trang chi tiết với ID sân trong URL
                    window.location.href = `../html_file/infoSan.html?idSan=${idSan}`;
                }
            });
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu sân:', error));
});

