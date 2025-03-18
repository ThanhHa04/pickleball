document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM đã sẵn sàng!");

    const urlParams = new URLSearchParams(window.location.search);
    const idSan = urlParams.get("idSan");

    if (!idSan) {
        document.querySelector(".container").innerHTML = "<p>Không tìm thấy ID sân trong URL!</p>";
        console.error("❌ Không tìm thấy idSan trong URL.");
        return;
    }

    const fetchChiTietSan = fetch(`http://localhost:3000/chitietsan/${idSan}`).then(res => res.json());
    const fetchSan = fetch(`http://localhost:3000/san/${idSan}`).then(res => res.json());

    Promise.all([fetchChiTietSan, fetchSan])
        .then(([dataChiTiet, dataSan]) => {
            if (!dataChiTiet || !dataChiTiet.IDSan) {
                document.querySelector(".container").innerHTML = "<p>Không có thông tin chi tiết sân.</p>";
                return;
            }
            if (!dataSan) {
                document.querySelector(".container").innerHTML = "<p>Không có dữ liệu sân từ API /san.</p>";
                return;
            }

            setTextContent("tensan", dataSan.TenSan);
            setTextContent("mota", dataChiTiet.MoTa);
            setTextContent("gioHoatDong", dataChiTiet.GioHoatDong);
            setTextContent("giaSan", dataSan.GiaThue ? `${formatCurrency(dataSan.GiaThue)} đ` : "Không có");
            setTextContent("loaiSan", dataSan.MoTa);

            const location_id = dataSan.location_id;
            if (!location_id) {
                console.error("❌ Không tìm thấy location_id trong dữ liệu sân.");
                return;
            }
            return fetch(`http://localhost:3000/locations/${location_id}`)
                .then(res => res.json())
                .then(dataLocations => {
                    if (!dataLocations) {
                        console.error("❌ Không có dữ liệu từ API /locations.");
                        return;
                    }
                    setTextContent("diachi", dataLocations.address); // Đổi từ `id` thành `diaChi`
                })
                .catch(error => {
                    console.error("❌ Lỗi khi lấy thông tin địa chỉ sân:", error);
                });
        })
        .then(() => {
            let galleryHtml = "";
            if (idSan) {
                fetch(`http://localhost:3000/san/${idSan}`)
                    .then(res => res.json())
                    .then(dataSan => {
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
                        console.error("❌ Lỗi khi tải hình ảnh sân:", error);
                    });
            }

            loadSchedule(idSan);
        })
        .catch(error => {
            console.error("❌ Lỗi khi lấy thông tin sân:", error);
            document.querySelector(".container").innerHTML = "<p>Lỗi khi lấy thông tin sân.</p>";
        });
});

async function getUserInfo(userId) {
  try {
    const response = await fetch(`http://localhost:3000/nguoidung/${userId}`);
    if (!response.ok) {
      throw new Error("Lỗi khi lấy thông tin người dùng");
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loadSchedule(idSan) {
  try {
    const response = await fetch(`http://localhost:3000/lich/${idSan}`);
    if (!response.ok) throw new Error("❌ Lỗi khi tải dữ liệu lịch");

    const data = await response.json();
    const schedule = organizeSchedule(data);
    const dateList = generateDateList(Object.keys(schedule)[0], 3);
    renderSchedule(dateList, schedule);
  } catch (error) {
    console.error("⚠️ Lỗi tải lịch:", error);
  }
}

function renderSchedule(dateList, schedule) {
  const table = document.getElementById("scheduleTable");
  const theadRow = table.querySelector("thead tr");
  const tbody = table.querySelector("tbody");

  theadRow.innerHTML = "<th>Giờ</th>";
  dateList.forEach(date => {
    theadRow.innerHTML += `<th>${formatDate(date)}</th>`;
  });

  tbody.innerHTML = "";
  const now = new Date();
  const currentHour = now.getHours();

  for (let h = 6; h <= 21; h++) {
    const hourStr = `${h < 10 ? "0" + h : h}:00`;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="hour-col">${hourStr}</td>`;
    dateList.forEach(date => {
      const slot = schedule[date]?.[hourStr];
      const slotTime = new Date(date + "T" + hourStr + ":00"); 

      let cellContent = `<span class="empty-slot">-</span>`;
      let cellClass = "";

      tbody.innerHTML = "";
    const now = new Date();
    const currentHour = now.getHours();

    for (let h = 6; h <= 21; h++) {
      const hourStr = `${h < 10 ? "0" + h : h}:00`;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="hour-col">${hourStr}</td>`;

      dateList.forEach(date => {
        const slot = schedule[date]?.[hourStr];
        const slotTime = new Date(date + "T" + hourStr + ":00"); 

        let cellContent = `<span class="empty-slot">-</span>`;
        let cellClass = "";

        if (slot) {
          if (slot.TrangThai === "Còn trống" && slotTime > now) {
            cellContent = `<label class="available-slot">
                            <input type="checkbox" class="booking-checkbox"
                            data-date="${date}" data-hour="${hourStr}"
                            data-san="${slot.IDSan}"
                            value="${formatCurrency(slot.Gia)}đ">
                          </label>`;
            cellClass = "highlight"; // Màu xanh nhạt
          } else if (slotTime <= now) {
            cellContent = `<span class="past-slot">Hết hạn</span>`; // Đánh dấu hết hạn
            cellClass = "disabled-slot"; // Màu xám
          } else {
            cellContent = `<span class="booked-slot">(${slot.TrangThai})</span>`;
          }
        }    
        tr.innerHTML += `<td class="${cellClass}">${cellContent}</td>`;
      });
      tbody.appendChild(tr);
    }      
      tr.innerHTML += `<td class="${cellClass}">${cellContent}</td>`;
    });
    tbody.appendChild(tr);
  }
}

function organizeSchedule(data) {
  const schedule = {};
  data.forEach(({ NgayDat, GioBatDau, IDSan, Gia, TrangThai }) => {
    if (!schedule[NgayDat]) schedule[NgayDat] = {};
    schedule[NgayDat][GioBatDau] = { IDSan, Gia, TrangThai };
  });
  return schedule;
}

function generateDateList(startDateStr, daysCount) {
  const result = [];
  const startDate = new Date(startDateStr);
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    result.push(d.toISOString().split("T")[0]);
  }
  return result;
}

function formatCurrency(amount) {
  return parseFloat(amount).toLocaleString("vi-VN");
}

function setTextContent(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "Không có thông tin";
  } else {
    console.error(`❌ Không tìm thấy phần tử #${id} trong DOM`);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("change", function (event) {
      if (event.target.classList.contains("booking-checkbox")) {
          updateBookingInfo();
      }
  });
});

async function getUserInfo(userId) {
  try {
    const response = await fetch(`http://localhost:3000/nguoidung/${userId}`);
    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        throw new Error(data.error || "Lỗi không xác định");
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
}

async function updateBookingInfo() {
  const selectedFields = document.getElementById("selected-fields");
  const totalPriceElement = document.getElementById("total-price");
  const userId = localStorage.getItem("userId");
  if (userId) {
    getUserInfo(userId).then(userInfo => {
      if (userInfo) {
        console.log("Thông tin người dùng:", userInfo);
      }
    });
  }
  const userInfo = await getUserInfo(userId);
  if (!userInfo) return;

  let total = 0;
  selectedFields.innerHTML = "";

  document.querySelectorAll(".booking-checkbox:checked").forEach(checkbox => {
    const date = checkbox.getAttribute("data-date");
    const hour = checkbox.getAttribute("data-hour");
    const price = parseInt(checkbox.value.replace(/\D/g, ""));
    total += price;

    const fieldInfo = document.createElement("div");
    fieldInfo.classList.add("personal-info");
    fieldInfo.innerHTML = `
          <div class="left-column">
              <div id="NgayDatSan"><strong>Ngày:</strong> ${date}</div>
              <div id="GioDatSan"><strong>Giờ:</strong> ${hour}</div>
              <div id="GiaDatSan"><strong>Giá:</strong> ${formatCurrency(price)}đ</div>
          </div>
          <div class="right-column">
              <div id="NguoiDatSan"><strong>Người đặt:</strong> ${userInfo.HoTen}</div>
              <div id="EmailDatSan"><strong>Email:</strong> ${userInfo.Email}</div>
              <div id="SdtDatSan"><strong>SĐT:</strong> ${userInfo.SDT}</div>
          </div>
    `;
    selectedFields.appendChild(fieldInfo);
  });
  totalPriceElement.textContent = `Tổng giá: ${formatCurrency(total)}đ`;
}

function formatHour(hour) {
  let formattedHour = hour.toString().padStart(2, "0"); 
  return `${formattedHour}:00`;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}
