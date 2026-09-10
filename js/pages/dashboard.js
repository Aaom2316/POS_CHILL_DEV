POS.pages = POS.pages || {};
POS.pages.dashboard = async function(){
  const data = await POS.api.systemSettings();
  const map = {};
  (data.settings || []).forEach(x => map[x.key] = x.value);

  return `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">${map.SHOP_NAME || "-"}</p>

    <div class="grid grid-3">
      <div class="card"><div class="card-label">ชื่อร้าน</div><div class="card-value">${map.SHOP_NAME || "-"}</div></div>
      <div class="card"><div class="card-label">วันที่ทำการ</div><div class="card-value">${map.BUSINESS_DATE || "-"}</div></div>
    </div>

    <div class="panel">
      <h2>สถานะระบบ</h2>
      <div class="badge">System API เชื่อมต่อสำเร็จ ✓</div>
    </div>`;
};
