window.POS = window.POS || {};

POS.render = async function(){
  const app = document.getElementById("app");
  const session = await POS.auth.session();

  if(!session){
    app.innerHTML = `
      <div class="login">
        <div class="box">
          <div class="brand">🍹 ล้างไป ชิลล์ไป</div>
          <p>เข้าสู่ระบบ</p>
          <label>อีเมล</label>
          <input id="loginEmail" type="email">
          <label>รหัสผ่าน</label>
          <input id="loginPassword" type="password">
          <button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="POS.login()">เข้าสู่ระบบ</button>
          <p id="loginError" style="color:#b91c1c"></p>
        </div>
      </div>`;
    return;
  }

// ===================================================
// โหลดสิทธิ์ผู้ใช้
// ===================================================

await POS.loadUserRole();

  const route = location.hash.replace("#","") || "dashboard";
  const page = POS.pages[route] || POS.pages.dashboard;

  try{
    const system = await POS.api.systemSettings();
    const map = {};
    (system.settings || []).forEach(x => map[x.key] = x.value);

    app.innerHTML = `
      <div class="app-shell">
        ${POS.renderSidebar()}
        <section class="main-area">
          ${POS.renderHeader(map.SHOP_NAME || "POS CHILL")}
          <main class="content" id="pageContent"></main>
        </section>
      </div>`;

    document.getElementById("pageContent").innerHTML = await page();
    document.querySelectorAll(".nav-item").forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + route);
    });
  }catch(e){
    app.innerHTML = `<div class="content"><div class="panel">เกิดข้อผิดพลาด: ${e.message}</div></div>`;
  }
};

POS.login = async function(){
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try{
    await POS.auth.login(email,password);
    location.hash = "#dashboard";
    POS.render();
  }catch(e){
    document.getElementById("loginError").textContent = e.message;
  }
};

POS.logout = async function(){
  await POS.auth.logout();
  location.hash = "";
  POS.render();
};

window.addEventListener("hashchange", POS.render);
POS.render();
