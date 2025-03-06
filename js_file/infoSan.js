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
          setTextContent("loaiSan", dataSan.IDLoaiSan);
          let galleryHtml = "";
          if (dataSan.HinhAnh && typeof dataSan.HinhAnh === "string") {
              galleryHtml = `<img src="${dataSan.HinhAnh}" alt="Hình ảnh sân">`;
          } else if (Array.isArray(dataSan.HinhAnh) && dataSan.HinhAnh.length > 0) {
              galleryHtml = dataSan.HinhAnh.map(img => `<img src="${img}" alt="Hình ảnh sân">`).join("");
          } else {
              galleryHtml = "<p>Không có hình ảnh.</p>";
          }
          document.getElementById("hinhAnh").innerHTML = galleryHtml;
          loadSchedule(idSan);
      })
      .catch(error => {
          console.error("❌ Lỗi khi lấy thông tin sân:", error);
          document.querySelector(".container").innerHTML = "<p>Lỗi khi lấy thông tin sân.</p>";
      });
});

async function loadSchedule(idSan) {
  console.log("🔄 Đang tải lịch...");
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
// 🌟 Format tiền theo chuẩn Việt Nam
function formatCurrency(amount) {
  return parseFloat(amount).toLocaleString("vi-VN");
}

// 📅 Sắp xếp lịch từ dữ liệu
function organizeSchedule(data) {
  const schedule = {};
  data.forEach(({ NgayDat, GioBatDau, IDSan, Gia, TrangThai }) => {
    if (!schedule[NgayDat]) schedule[NgayDat] = {};
    schedule[NgayDat][GioBatDau] = { IDSan, Gia, TrangThai };
  });
  return schedule;
}

function setTextContent(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "Không có thông tin";
  } else {
    console.error(`❌ Không tìm thấy phần tử #${id} trong DOM`);
  }
}

// 📅 Tạo danh sách ngày từ ngày bắt đầu
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

// 🗓️ Định dạng ngày DD/MM
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}
