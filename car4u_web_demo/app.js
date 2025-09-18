/* Car4U — demo app (vanilla JS, no backend) */
const $ = (sel, scope=document) => scope.querySelector(sel);
const $$ = (sel, scope=document) => [...scope.querySelectorAll(sel)];

const state = {
  cars: [
    {
      id: "vios2022",
      name: "Toyota Vios 2022",
      city: ["Hà Nội", "Hồ Chí Minh"],
      pricePerDay: 800000,
      rating: 4.9,
      seats: 5,
      transmission: "Tự động",
      kmPerDay: 300,
      deposit: 2000000,
      hero: [1,2,3],
      tags: ["Sedan", "Tiết kiệm", "Phổ thông"]
    },
    {
      id: "mazda3",
      name: "Mazda 3 2022",
      city: ["Hà Nội"],
      pricePerDay: 1200000,
      rating: 4.8,
      seats: 5,
      transmission: "Tự động",
      kmPerDay: 300,
      deposit: 2000000,
      hero: [1,2,3],
      tags: ["Sedan", "Êm ái"]
    },
    {
      id: "vf5",
      name: "VinFast VF5",
      city: ["Hồ Chí Minh", "Đà Nẵng"],
      pricePerDay: 1000000,
      rating: 4.7,
      seats: 5,
      transmission: "Tự động",
      kmPerDay: 250,
      deposit: 3000000,
      hero: [1,2,3],
      tags: ["Crossover", "EV"]
    },
    {
      id: "kia-morning",
      name: "Kia Morning 2020",
      city: ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh"],
      pricePerDay: 300000,
      rating: 4.6,
      seats: 4,
      transmission: "Tự động",
      kmPerDay: 200,
      deposit: 1500000,
      hero: [1,2,3],
      tags: ["Nhỏ gọn", "Đô thị"]
    }
  ],
  filters: {},
  selection: null,
  booking: null,
  idempotencyKey: null
};

const fmt = new Intl.NumberFormat('vi-VN');
const money = v => fmt.format(v) + "đ";
const byId = id => state.cars.find(c => c.id === id);

function init() {
  $("#year").textContent = new Date().getFullYear();
  $("#homeLink").addEventListener("click", (e)=>{ e.preventDefault(); showOnly("#searchSection"); $("#resultsSection").hidden = true; });
  $("#btnSearch").addEventListener("click", onSearch);
  $("#searchForm").addEventListener("submit", (e)=>{ e.preventDefault(); onSearch(); });

  $("#btnBack").addEventListener("click",(e)=>{e.preventDefault(); $("#checkoutSection").hidden=true; $("#resultsSection").hidden=false;});
  $("#btnHome").addEventListener("click", ()=> { showOnly("#searchSection"); $("#resultsSection").hidden = true; });
  $("#btnTrack").addEventListener("click", ()=> alert("Demo: trang theo dõi đơn chưa tích hợp."));

  $("#btnConfirm").addEventListener("click", onConfirmBooking);

  $("#vehicleDialog").addEventListener("close", ()=>{
    // Reset toggles for next open
    $("#insCheckbox").checked = false;
    $("#seatCheckbox").checked = false;
  });

  // Default datetime: now rounded + 1h / + 25h
  const now = new Date();
  now.setMinutes(0,0,0);
  const pickup = new Date(now.getTime() + 60*60*1000);
  const ret = new Date(pickup.getTime() + 24*60*60*1000);
  $("#pickupDt").value = isoLocal(pickup);
  $("#returnDt").value = isoLocal(ret);

  // If there is a pending booking in storage (simulating recovery)
  const pending = localStorage.getItem("car4u:lastOrder");
  if (pending) {
    console.info("Pending order found:", pending);
  }
}

function isoLocal(d) {
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function onSearch() {
  const city = $("#city").value;
  const pickup = new Date($("#pickupDt").value);
  const ret = new Date($("#returnDt").value);
  const sort = $("#sort").value;

  if (!city || !$("#pickupDt").value || !$("#returnDt").value) {
    alert("Vui lòng chọn đầy đủ thành phố và thời gian.");
    return;
  }
  if (ret <= pickup) {
    alert("Thời gian trả xe phải sau thời gian nhận xe.");
    return;
  }

  state.filters = { city, pickup, ret, sort };
  const days = Math.max(1, Math.round((ret - pickup)/(1000*60*60*24)));
  $("#resultsTitle").textContent = `Xe sẵn sàng tại ${city}`;
  $("#resultsRange").textContent = `Khoảng thời gian: ${pickup.toLocaleString('vi-VN')} → ${ret.toLocaleString('vi-VN')} • ${days} ngày`;

  let list = state.cars.filter(c => c.city.includes(city));

  // Sort
  if (sort === "priceAsc") list.sort((a,b)=>a.pricePerDay-b.pricePerDay);
  if (sort === "priceDesc") list.sort((a,b)=>b.pricePerDay-a.pricePerDay);
  if (sort === "ratingDesc") list.sort((a,b)=>b.rating-a.rating);

  renderResults(list, days);
  $("#resultsSection").hidden = false;
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderResults(list, days) {
  const root = $("#results");
  root.innerHTML = "";
  if (!list.length) {
    root.innerHTML = `<div class="inline-note">Không có xe phù hợp. Thử đổi bộ lọc hoặc thời gian.</div>`;
    return;
  }
  for (const c of list) {
    const el = document.createElement("article");
    el.className = "vehicle-card";
    el.innerHTML = `
      <div class="hero ph" role="img" aria-label="Ảnh xe"></div>
      <div class="title">${c.name}</div>
      <div class="meta">${c.transmission} • ${c.seats} chỗ • ${c.kmPerDay} km/ngày</div>
      <div class="flex between center">
        <div class="price">${money(c.pricePerDay)}/ngày</div>
        <div class="pill">★ ${c.rating.toFixed(1)}</div>
      </div>
      <div class="flex wrap" style="gap:.4rem;margin:.2rem 0;">
        ${c.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="flex end">
        <button class="btn" data-id="${c.id}">Chi tiết</button>
      </div>
    `;
    el.querySelector("button").addEventListener("click", ()=> openVehicle(c, days));
    root.appendChild(el);
  }
}

function openVehicle(c, days) {
  state.selection = { id: c.id, days, addons: {ins:false, seat:false} };
  $("#dlgTitle").textContent = c.name;
  $("#dlgPrice").textContent = `${money(c.pricePerDay)}/ngày • ${days} ngày`;
  $("#dlgRating").textContent = `★ ${c.rating.toFixed(1)}`;
  $("#dlgDeposit").textContent = money(c.deposit);
  $("#dlgBullets").innerHTML = `
    <li>Số chỗ: ${c.seats}</li>
    <li>Hộp số: ${c.transmission}</li>
    <li>Km/ngày: ${c.kmPerDay}</li>
  `;

  const hero = $("#dlgHero");
  hero.innerHTML = "";
  for (let i=0;i<3;i++){
    const ph = document.createElement("div");
    ph.className = "ph";
    hero.appendChild(ph);
  }

  // Addon events
  $("#insCheckbox").onchange = (e)=> { state.selection.addons.ins = e.target.checked; updateTotal(); };
  $("#seatCheckbox").onchange = (e)=> { state.selection.addons.seat = e.target.checked; updateTotal(); };

  $("#btnBook").onclick = onStartCheckout;
  updateTotal();

  const dlg = $("#vehicleDialog");
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open","");
}

function updateTotal() {
  const c = byId(state.selection.id);
  const days = state.selection.days;
  let total = c.pricePerDay * days;
  if (state.selection.addons.ins) total += Math.round(0.12 * c.pricePerDay) * days; // bảo hiểm mở rộng ~12%
  if (state.selection.addons.seat) total += 50000 * days;
  $("#dlgTotal").textContent = `Tổng tạm tính: ${money(total)}`;
  state.selection.total = total;
}

function showOnly(sel) {
  for (const sec of $$("main section")) sec.hidden = true;
  $(sel).hidden = false;
}

function onStartCheckout() {
  const c = byId(state.selection.id);
  const {pickup, ret} = state.filters;
  const idKey = cryptoRandom();
  state.idempotencyKey = idKey;

  $("#vehicleDialog").close();
  showOnly("#checkoutSection");

  $("#checkoutSummary").innerHTML = `
    <div><strong>Xe:</strong> ${c.name} • <span class="pill">★ ${c.rating.toFixed(1)}</span></div>
    <div><strong>Thời gian:</strong> ${pickup.toLocaleString('vi-VN')} → ${ret.toLocaleString('vi-VN')}</div>
    <div><strong>Đặt cọc:</strong> ${money(c.deposit)}</div>
    <div><strong>Tổng tạm tính:</strong> ${money(state.selection.total)}</div>
  `;

  $("#checkoutNote").textContent = "Gợi ý: Chọn phương thức đặt cọc, tải ảnh giấy tờ và đồng ý điều khoản để tiếp tục.";
}

function onConfirmBooking(e){
  e.preventDefault();
  const btn = $("#btnConfirm");
  if (btn.disabled) return; // idempotency UI guard

  // validations (demo)
  const pay = $$('input[name="pay"]:checked').map(x=>x.value)[0];
  if (!pay){ alert("Chọn phương thức đặt cọc."); return; }
  if (!$("#cccdFront").files.length || !$("#cccdBack").files.length || !$("#drv").files.length){
    alert("Vui lòng tải ảnh CCCD (trước/sau) và GPLX."); return;
  }
  if (!$("#terms").checked){ alert("Bạn cần đồng ý Điều khoản thuê xe."); return; }

  // Double-click prevention + fake async flow
  btn.disabled = true;
  btn.textContent = "Đang xử lý…";

  // Simulate sporadic payment failure / timeout rates
  const simulate = Math.random();
  setTimeout(()=>{
    if (simulate < 0.07){ // timeout
      btn.disabled = false;
      btn.textContent = "Xác nhận đặt xe";
      $("#checkoutNote").textContent = "Timeout cổng thanh toán. Thử lại hoặc chọn phương thức khác.";
      $("#checkoutNote").style.color = "var(--warn)";
      return;
    }
    if (simulate >= 0.07 && simulate < 0.12){ // decline
      btn.disabled = false;
      btn.textContent = "Xác nhận đặt xe";
      $("#checkoutNote").textContent = "Thanh toán bị từ chối. Vui lòng thử lại hoặc chọn COD.";
      $("#checkoutNote").style.color = "var(--err)";
      return;
    }

    // success — create booking
    createBooking(pay);
  }, 900 + Math.random()*600);
}

function createBooking(pay){
  const id = "CR-" + new Date().toISOString().slice(2,10).replace(/-/g,"") + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
  const c = byId(state.selection.id);
  const order = {
    id,
    carId: c.id,
    carName: c.name,
    city: state.filters.city,
    pickup: state.filters.pickup.toISOString(),
    return: state.filters.ret.toISOString(),
    days: state.selection.days,
    total: state.selection.total,
    deposit: c.deposit,
    pay,
    key: state.idempotencyKey
  };
  localStorage.setItem("car4u:lastOrder", JSON.stringify(order));

  $("#orderInfo").innerHTML = `
    <div><strong>Mã đơn:</strong> ${order.id}</div>
    <div><strong>Xe:</strong> ${order.carName}</div>
    <div><strong>Điểm nhận:</strong> ${order.city}</div>
    <div><strong>Thời gian:</strong> ${new Date(order.pickup).toLocaleString('vi-VN')} → ${new Date(order.return).toLocaleString('vi-VN')}</div>
    <div><strong>Tổng tạm tính:</strong> ${money(order.total)} • <strong>Đặt cọc:</strong> ${money(order.deposit)} (${order.pay === "cod" ? "COD" : "Thẻ/Ví"})</div>
  `;

  showOnly("#thankyouSection");
  $("#btnConfirm").disabled = false;
  $("#btnConfirm").textContent = "Xác nhận đặt xe";
}

function cryptoRandom(){
  // simple uuid-ish
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

document.addEventListener("DOMContentLoaded", init);
