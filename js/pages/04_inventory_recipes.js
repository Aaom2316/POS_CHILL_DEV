window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   STOCK PAGE 04 : RECIPES
   UI + MOCK DATA — ยังไม่ดึงข้อมูลจริง
   โครงสร้าง UI ยึด Stock Page 05 : Movement
   ===================================================== */

POS.pages.inventoryRecipes = async function(){

  /* =====================================================
     MOCK DATA TEST — ยังไม่ใช้ API
     สร้างข้อมูลจำลอง 100 แถวหลัง DOM ถูกสร้าง
     ===================================================== */
  setTimeout(function(){
    const tbody = document.getElementById("posInventoryRecipesTableBody");
    if(!tbody) return;

    const rows = Array.from({length:100}, function(_, i){
      const n = i + 1;
      const active = (n % 7 !== 0);
      const ingredients = 2 + (n % 6);

      return `
        <tr style="border-bottom:1px solid #eef1f4;">
          <td style="
            padding:13px 12px;
            font-weight:700;
            color:#334155;
            white-space:nowrap;
          ">REC-${String(n).padStart(3,"0")}</td>

          <td style="
            padding:13px 12px;
            color:#334155;
            white-space:nowrap;
          ">สูตรทดสอบรายการที่ ${n}</td>

          <td style="
            padding:13px 12px;
            text-align:center;
            color:#475569;
            white-space:nowrap;
          ">${ingredients}</td>

          <td style="
            padding:13px 12px;
            white-space:nowrap;
          ">
            <span style="
              display:inline-block;
              padding:5px 10px;
              border-radius:999px;
              font-size:12px;
              font-weight:700;
              background:${active ? "#dcfce7" : "#fee2e2"};
              color:${active ? "#166534" : "#991b1b"};
            ">
              ${active ? "ใช้งาน" : "ปิดใช้งาน"}
            </span>
          </td>

          <td style="
            padding:13px 12px;
            white-space:nowrap;
          ">
            <button
              type="button"
              style="
                border:1px solid #e5e7eb;
                background:#fff;
                border-radius:8px;
                padding:7px 11px;
                font-size:13px;
                font-weight:700;
                color:#334155;
              "
            >⚙️ จัดการ</button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = rows;

    const total = document.getElementById("posInventoryRecipesTotal");
    const active = document.getElementById("posInventoryRecipesActive");
    const ingredients = document.getElementById("posInventoryRecipesIngredients");
    const count = document.getElementById("posInventoryRecipesListCount");

    if(total) total.textContent = "100";
    if(active) active.textContent = String(rows.match(/ใช้งาน/g)?.length || 0);
    if(ingredients) ingredients.textContent = "32";
    if(count) count.textContent = "100 รายการ";
  }, 0);

  return `
    <div class="inventory-subpage">

      <!-- =================================================
           HEADER
           ================================================= -->
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:20px;
        margin-bottom:22px;
      ">

        <div>
          <h1 class="page-title" style="
            margin:0 0 5px;
            font-size:30px;
            font-weight:800;
            color:#1f2937;
          ">
            🍳 สูตร
          </h1>

          <p class="page-subtitle" style="
            margin:0;
            color:#64748b;
            font-size:15px;
          ">
            จัดการสูตรอาหารและวัตถุดิบ
          </p>
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:8px;
        ">
          <button
            type="button"
            class="btn-secondary"
            onclick="POS.inventoryBackToMain()"
            style="
              padding:11px 18px;
              border-radius:10px;
              border:1px solid #d7dce2;
              background:#fff;
              color:#374151;
              font-weight:700;
              cursor:pointer;
            "
          >
            ← กลับ
          </button>

          <button
            id="posInventoryRecipesRefreshBtn"
            type="button"
            class="btn-secondary"
            style="
              padding:11px 18px;
              border-radius:10px;
              border:1px solid #d7dce2;
              background:#fff;
              color:#374151;
              font-weight:700;
              cursor:pointer;
            "
          >
            🔄 รีเฟรช
          </button>

          <button
            id="posInventoryRecipesAddBtn"
            type="button"
            style="
              padding:11px 18px;
              border-radius:10px;
              border:1px solid #267a3d;
              background:#267a3d;
              color:#fff;
              font-weight:700;
              cursor:pointer;
            "
          >
            ＋ เพิ่มสูตร
          </button>
        </div>

      </div>


      <!-- =================================================
           SUMMARY
           ================================================= -->
      <div style="
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:16px;
        margin-bottom:20px;
      ">

        <div style="
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:14px;
          padding:18px;
          box-shadow:0 2px 8px rgba(15,23,42,.04);
        ">
          <div style="
            font-size:13px;
            color:#94a3b8;
            font-weight:700;
          ">
            สูตรทั้งหมด
          </div>

          <div id="posInventoryRecipesTotal" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#1f2937;
          ">
            0
          </div>

          <div style="
            margin-top:4px;
            font-size:12px;
            color:#94a3b8;
          ">
            สูตร
          </div>
        </div>


        <div style="
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:14px;
          padding:18px;
          box-shadow:0 2px 8px rgba(15,23,42,.04);
        ">
          <div style="
            font-size:13px;
            color:#94a3b8;
            font-weight:700;
          ">
            สูตรใช้งาน
          </div>

          <div id="posInventoryRecipesActive" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#267a3d;
          ">
            0
          </div>

          <div style="
            margin-top:4px;
            font-size:12px;
            color:#94a3b8;
          ">
            สูตร
          </div>
        </div>


        <div style="
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:14px;
          padding:18px;
          box-shadow:0 2px 8px rgba(15,23,42,.04);
        ">
          <div style="
            font-size:13px;
            color:#94a3b8;
            font-weight:700;
          ">
            วัตถุดิบที่ใช้
          </div>

          <div id="posInventoryRecipesIngredients" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#2563eb;
          ">
            0
          </div>

          <div style="
            margin-top:4px;
            font-size:12px;
            color:#94a3b8;
          ">
            รายการ
          </div>
        </div>


        <div style="
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:14px;
          padding:18px;
          box-shadow:0 2px 8px rgba(15,23,42,.04);
        ">
          <div style="
            font-size:13px;
            color:#94a3b8;
            font-weight:700;
          ">
            รายการที่แสดง
          </div>

          <div id="posInventoryRecipesListCount" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#7c3aed;
          ">
            0
          </div>

          <div style="
            margin-top:4px;
            font-size:12px;
            color:#94a3b8;
          ">
            รายการ
          </div>
        </div>

      </div>


      <!-- =================================================
           FILTER / SEARCH
           ================================================= -->
      <div class="card" style="
        margin-bottom:20px;
        padding:18px;
      ">

        <div style="
          display:grid;
          grid-template-columns:minmax(240px,1.7fr) auto;
          gap:12px;
          align-items:end;
        ">

          <div>
            <label style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:700;
              color:#475569;
            ">
              🔎 ค้นหา
            </label>

            <input
              id="posInventoryRecipesSearch"
              type="text"
              placeholder="ค้นหารหัสสูตร / ชื่อสูตร"
              style="
                width:100%;
                box-sizing:border-box;
                height:43px;
                padding:0 13px;
                border:1px solid #d7dce2;
                border-radius:10px;
                background:#fff;
                color:#1f2937;
                outline:none;
              "
            >
          </div>

          <div style="
            height:43px;
            display:flex;
            align-items:center;
          ">
            <span style="
              font-size:13px;
              color:#94a3b8;
            ">
              ค้นหาสูตรอาหาร
            </span>
          </div>

        </div>

      </div>


      <!-- =================================================
           RECIPES LIST
           ================================================= -->
      <div class="card" style="
        padding:0;
        overflow:hidden;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          padding:18px 20px;
          border-bottom:1px solid #eef1f4;
        ">

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
              color:#1f2937;
            ">
              📋 รายการสูตร
            </div>

            <div style="
              margin-top:4px;
              font-size:13px;
              color:#94a3b8;
            ">
              สูตรอาหารและรายการวัตถุดิบที่ใช้
            </div>
          </div>

          <div id="posInventoryRecipesListBadge" style="
            padding:7px 11px;
            border-radius:999px;
            background:#f8fafc;
            color:#64748b;
            font-size:12px;
            font-weight:700;
          ">
            0 รายการ
          </div>

        </div>


        <div style="
          overflow-x:auto;
        ">

          <table style="
            width:100%;
            border-collapse:collapse;
            min-width:980px;
          ">

            <thead>
              <tr style="
                background:#f8fafc;
                border-bottom:1px solid #e5e7eb;
              ">

                <th style="
                  padding:13px 12px;
                  text-align:left;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  รหัสสูตร
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:left;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  ชื่อสูตร
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:center;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  จำนวนวัตถุดิบ
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:center;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  สถานะ
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:center;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  จัดการ
                </th>

              </tr>
            </thead>


            <tbody id="posInventoryRecipesTableBody">

              <tr>
                <td colspan="5" style="
                  padding:60px 20px;
                  text-align:center;
                ">

                  <div style="
                    width:56px;
                    height:56px;
                    margin:0 auto 12px;
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#f1f5f9;
                    font-size:25px;
                  ">
                    🍳
                  </div>

                  <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#64748b;
                  ">
                    ยังไม่มีข้อมูลสูตร
                  </div>

                  <div style="
                    margin-top:5px;
                    font-size:13px;
                    color:#94a3b8;
                  ">
                    หน้านี้กำลังแสดงเฉพาะ UI
                  </div>

                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  `;
};
