
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM đã sẵn sàng!");

  const urlParams = new URLSearchParams(window.location.search);
  const idSan = urlParams.get("idSan");

  if (!idSan) {
    document.querySelector(".container").innerHTML = "<p>Không tìm thấy ID sân trong URL!</p>";
    console.error("❌ Không tìm thấy idSan trong URL.");
    return;
  }

  // Truy vấn thông tin sân để lấy location_id
  const fetchSan = fetch(`http://localhost:3000/san/${idSan}`).then(res => res.json());

  fetchSan
    .then(dataSan => {
      if (!dataSan || !dataSan.location_id) {
        document.querySelector(".container").innerHTML = "<p>Không tìm thấy location_id cho sân.</p>";
        console.error("❌ Không tìm thấy location_id.");
        return;
      }

      // Sau khi có location_id, tiếp tục gọi API để lấy thông tin địa điểm
      const location_id = dataSan.location_id;
      const fetchLocation = fetch(`http://localhost:3000/locations/${location_id}`).then(res => res.json());

      // Tiến hành xử lý dữ liệu
      const fetchChiTietSan = fetch(`http://localhost:3000/chitietsan/${idSan}`).then(res => res.json());

      Promise.all([fetchChiTietSan, fetchSan, fetchLocation])
        .then(([dataChiTiet, dataSan, dataLocation]) => { // 🔹 Sửa 'fetchLocation' thành 'dataLocation' để đúng logic.
          if (!dataChiTiet || !dataChiTiet.IDSan) {
            document.querySelector(".container").innerHTML = "<p>Không có thông tin chi tiết sân.</p>";
            return;
          }
          if (!dataSan) {
            document.querySelector(".container").innerHTML = "<p>Không có dữ liệu sân từ API /san.</p>";
            return;
          }
          setTextContent("tensan", dataSan.TenSan);
          setTextContent("diachi", dataLocation.address);
          setTextContent("mota", dataChiTiet.MoTa);
          setTextContent("gioHoatDong", dataChiTiet.GioHoatDong);
          setTextContent("giaSan", dataSan.GiaThue ? `${formatCurrency(dataSan.GiaThue)} đ` : "Không có");
          setTextContent("loaiSan", dataSan.MoTa);
          
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
    })
    .catch(error => {
      console.error("❌ Lỗi khi lấy dữ liệu sân:", error);
    });
});

<<<<<<< HEAD

=======
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
>>>>>>> Yoo

async function loadSchedule(idSan) {
  console.log("🔄 Đang tải lịch...");
  try {
    const response = await fetch(`http://localhost:3000/lich/${idSan}`);
    if (!response.ok) throw new Error("❌ Lỗi khi tải dữ liệu lịch");

    const data = await response.json();
    const schedule = organizeSchedule(data);
    const dateList = generateDateList(Object.keys(schedule)[0] || new Date().toISOString().split("T")[0], 3); // 🔹 Fix lỗi khi schedule rỗng.
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
      const slotTime = new Date(`${date}T${hourStr}:00`);

      let cellContent = `<span class="empty-slot">-</span>`;
      let cellClass = "";

      if (slot) {
        if (slot.TrangThai === "Còn trống" && slotTime > now) {
          cellContent = `<label class="available-slot">
                          <input type="checkbox" class="booking-checkbox"
                          data-date="${date}" data-hour="${hourStr}"
                          data-san="${slot.IDSan}"
                          value="${formatCurrency(slot.Gia)} đ">
                        </label>`;
          cellClass = "highlight";
        } else if (slotTime <= now) {
          cellContent = `<span class="past-slot">Hết hạn</span>`;
          cellClass = "disabled-slot";
        } else {
          cellContent = `<span class="booked-slot">(${slot.TrangThai})</span>`;
        }
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
        <div class="info-container">
            <div class="left-column">
                <p><strong>Ngày:</strong> ${date}</p>
                <p><strong>Giờ:</strong> ${hour}</p>
                <p><strong>Giá:</strong> ${formatCurrency(price)}đ</p>
            </div>
            <div class="right-column">
                <p><strong>Người đặt:</strong> ${userInfo.HoTen}</p>
                <p><strong>Email:</strong> ${userInfo.Email}</p>
                <p><strong>SĐT:</strong> ${userInfo.SDT}</p>
            </div>
        </div>
      `;
      selectedFields.appendChild(fieldInfo);
  });
  totalPriceElement.textContent = `Tổng giá: ${formatCurrency(total)}đ`;
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("pay-btn").addEventListener("click", function() {
        let paymentMethod = document.getElementById("payment-method").value;
        let qrForm = document.getElementById("qr-form");

        if (paymentMethod === "bank") {
            qrForm.style.display = "block"; // Hiện mã QR khi chọn chuyển khoản
        } else {
            qrForm.style.display = "none"; // Ẩn nếu chọn phương thức khác
        }
    });
});

function generateQRCode() {
  let qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = ""; // Xóa mã QR cũ

  let totalAmount = document.getElementById("total-price").innerText.trim() || "100000"; // Giá mặc định
  let accountNumber = "0123456789"; // STK
  let accountName = "TRAN HA"; // Chủ tài khoản
  let bankCode = "VCB"; // Vietcombank

  // 🔥 Tạo dữ liệu QR theo chuẩn Napas
  let qrData = `00020101021238560010A00000072701240006970407${bankCode}0110${accountNumber}0210${accountName}530370454054${totalAmount}6304`;

  console.log("QR Length:", qrData.length); // Debug độ dài

  if (qrData.length > 990) {
      console.error("❌ Dữ liệu QR quá dài! Rút gọn...");
      qrData = qrData.substring(0, 988); // Cắt ngắn nếu cần
  }

  // 🔹 Tạo mã QR với sửa lỗi thấp
  new QRCode(qrContainer, {
      text: qrData,
      width: 180,
      height: 180,
      correctLevel: QRCode.CorrectLevel.L // Giảm sửa lỗi xuống mức L
  });
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
