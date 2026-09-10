POS.pages.settings = async function(){
  const data = await POS.api.systemSettings();
  const rows = (data.settings || []).map(x =>
    `<tr><td>${x.key}</td><td>${x.value}</td></tr>`
  ).join("");

  return `<h1 class="page-title">ตั้งค่า</h1>
  <p class="page-subtitle">ตั้งค่าระบบสำหรับ OWNER</p>
  <div class="panel table-wrap">
    <table class="table">
      <thead><tr><th>Key</th><th>Value</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
};
