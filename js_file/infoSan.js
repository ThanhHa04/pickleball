document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM đã sẵn sàng, gọi loadSchedule()");
  loadSchedule();
});

async function loadSchedule() {
  console.log("loadSchedule() đã được gọi");
  try {
    const response = await fetch('http://localhost:3000/lichsan');
    if (!response.ok) {
      throw new Error('Lỗi khi tải dữ liệu lịch');
    }
    const data = await response.json();
    const schedule = {};
    data.forEach(item => {
      const { NgayDat, GioBatDau, IDSan, Gia, TrangThai } = item;
      if (!schedule[NgayDat]) schedule[NgayDat] = {};
      if (!schedule[NgayDat][GioBatDau]) schedule[NgayDat][GioBatDau] = {};
      schedule[NgayDat][GioBatDau][IDSan] = { Gia, TrangThai };
    });
    let dateList = Object.keys(schedule);
    dateList.sort((a, b) => new Date(a) - new Date(b));
    if (!dateList.length) {
      console.warn("Không có dữ liệu lịch trong Firestore!");
      const table = document.getElementById("scheduleTable");
      table.innerHTML = "<tr><td colspan='99'>Không có dữ liệu lịch!</td></tr>";
      return;
    }
    
    const allCourts = new Set();
    data.forEach(item => {
      if (item.IDSan) allCourts.add(item.IDSan);
    });
    const courts = Array.from(allCourts).sort();
  
    const hours = [];
    for (let h = 6; h <= 22; h++) {
      const hourStr = (h < 10 ? "0" + h : h) + ":00";
      hours.push(hourStr);
    }
    
    renderSchedule(dateList, hours, schedule, courts);
  } catch (error) {
    console.error("Lỗi tải lịch:", error);
  }
}

function renderSchedule(dateList, hours, schedule, courts) {
  const table = document.getElementById("scheduleTable");
  const theadRow = table.querySelector("thead tr");
  const tbody = table.querySelector("tbody");

  while (theadRow.children.length > 1) {
    theadRow.removeChild(theadRow.lastChild);
  }
  dateList.forEach(date => {
    const th = document.createElement("th");
    th.textContent = formatDate(date);
    theadRow.appendChild(th);
  });

  tbody.innerHTML = "";
  hours.forEach(hour => {
    const tr = document.createElement("tr");
    const tdHour = document.createElement("td");
    tdHour.className = "hour-col";
    tdHour.textContent = hour;
    tr.appendChild(tdHour);

    dateList.forEach(date => {
      const td = document.createElement("td");
      if (schedule[date] && schedule[date][hour]) {
        courts.forEach(san => {
          const slot = schedule[date][hour][san];
          const div = document.createElement("div");
          div.className = "court-info";
          if (slot) {
            div.innerHTML = `<span class="court-id">${san}: </span>
                             <span class="price">${slot.Gia}đ</span>
                             <span class="${slot.TrangThai === 'Đã đặt' ? 'booked' : ''}">
                               (${slot.TrangThai})
                             </span>`;
          } else {
            div.textContent = `${san}: -`;
          }
          td.appendChild(div);
        });
      } else {
        td.textContent = "-";
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

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
function organizeSchedule(data) {
  const schedule = {};
  data.forEach(item => {
    const { NgayDat, GioBatDau, IDSan, Gia, TrangThai } = item;
    if (!schedule[NgayDat]) schedule[NgayDat] = {};
    if (!schedule[NgayDat][GioBatDau]) schedule[NgayDat][GioBatDau] = {};
    schedule[NgayDat][GioBatDau][IDSan] = { Gia, TrangThai };
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
function formatDate(dateStr) {
  const parts = dateStr.split("-");
  return parts[2] + "/" + parts[1];
}
