/* =====================================================
   POS CHILL RECIPES — STEP 4 TEST
   ใช้โครงสร้าง UI ของ STOCK PAGE 05 : MOVEMENT
   + MOCK DATA 100 แถว
   ไม่มี API / ไม่มี CRUD / ไม่มี modal
   ===================================================== */

window.POS = window.POS || {};
POS.pages = POS.pages || {};

POS.pages.inventoryRecipes = async function(){
  setTimeout(() => {}, 0);

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
            📋 สูตร
          </h1>

          <p class="page-subtitle" style="
            margin:0;
            color:#64748b;
            font-size:15px;
          ">
            รายการสูตรสินค้า
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
            onclick=""
            style=
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
            รับเข้า
          </div>

          <div id="posMovementPurchaseCount" style="
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
            เบิก / ลด
          </div>

          <div id="posMovementSaleCount" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#c0392b;
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
            ปรับสต็อก
          </div>

          <div id="posMovementAdjustCount" style="
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
          grid-template-columns:minmax(240px,1.7fr) minmax(170px,1fr) minmax(170px,1fr) auto;
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
              placeholder="ค้นหาหมวดหมู่ / SKU / จัดการ"
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


          <div>
            <label style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:700;
              color:#475569;
            ">
              ชื่อสูตรสูตร
            </label>

            <select
              id="posMovementType"
              style="
                width:100%;
                box-sizing:border-box;
                height:43px;
                padding:0 12px;
                border:1px solid #d7dce2;
                border-radius:10px;
                background:#fff;
                color:#1f2937;
              "
            >
              <option value="">ทั้งหมด</option>
              <option value="PURCHASE">รับเข้า</option>
              <option value="SALE">ขาย / เบิก</option>
              <option value="ADJUSTMENT">ปรับสต็อก</option>
            </select>
          </div>


          <div>
            <label style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:700;
              color:#475569;
            ">
              ช่วงSKU
            </label>

            <input
              id="posMovementDate"
              type="date"
              style="
                width:100%;
                box-sizing:border-box;
                height:43px;
                padding:0 12px;
                border:1px solid #d7dce2;
                border-radius:10px;
                background:#fff;
                color:#1f2937;
              "
            >
          </div>


          <button
            id="posInventoryRecipesSearchBtn"
            type="button"
            onclick="POS.inventoryMovementRender()"
            style="
              height:43px;
              padding:0 18px;
              border:1px solid #d7dce2;
              border-radius:10px;
              background:#f8fafc;
              color:#374151;
              font-weight:700;
              cursor:pointer;
              white-space:nowrap;
            "
          >
            ค้นหา
          </button>

        </div>

      </div>


      <!-- =================================================
           MOVEMENT LIST
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
              📋 ประวัติสูตร
            </div>

            <div style="
              margin-top:4px;
              font-size:13px;
              color:#94a3b8;
            ">
              รายการรับเข้า / ลดสต็อก / ปรับยอด
            </div>
          </div>

          <div id="posMovementListCount" style="
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
                  วันที่ / เวลา
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:left;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  วัตถุดิบ
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:center;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  ประเภท
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:right;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  วัตถุดิบ
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:right;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  สถานะ
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:right;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  อัปเดต
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:left;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  เลขอ้างอิง
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:left;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  หมายเหตุ
                </th>

              </tr>
            </thead>


            <tbody id="posInventoryRecipesTableBody">
  <tr>
    <td colspan="8" style="padding:60px 20px;text-align:center;">
      <div style="font-size:15px;font-weight:800;color:#64748b;">
        กำลังสร้างข้อมูลทดสอบ...
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


/* =====================================================
   STEP 4 : MOVEMENT UI STRUCTURE + MOCK DATA
   ไม่มี API / ไม่มี CRUD / ไม่มี modal
   ===================================================== */
setTimeout(function(){
  const tbody = document.getElementById("posInventoryRecipesTableBody");
  if(!tbody) return;

  const mockCount = 70 + (new Date().getSeconds() % 31); // 70–100 แถว เปลี่ยนทุกครั้งที่โหลด
    const rows = Array.from({length:mockCount}, function(_, i){
    const n = i + 1;
    const active = n % 7 !== 0;
    return `
      <tr style="border-bottom:1px solid #eef1f4;">
        <td style="padding:13px 12px;white-space:nowrap;font-weight:700;color:#334155;">REC-${String(n).padStart(3,"0")}</td>
        <td style="padding:13px 12px;white-space:nowrap;color:#334155;">สูตรทดสอบ ${n}</td>
        <td style="padding:13px 12px;white-space:nowrap;color:#475569;">${["อาหาร","เครื่องดื่ม","ของหวาน"][n%3]}</td>
        <td style="padding:13px 12px;text-align:right;white-space:nowrap;color:#475569;">${2 + n%6}</td>
        <td style="padding:13px 12px;white-space:nowrap;color:#475569;">รายการ</td>
        <td style="padding:13px 12px;white-space:nowrap;">
          <span style="display:inline-block;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;background:${active ? "#dcfce7" : "#fee2e2"};color:${active ? "#166534" : "#991b1b"};">
            ${active ? "ใช้งาน" : "ปิดใช้งาน"}
          </span>
        </td>
        <td style="padding:13px 12px;white-space:nowrap;color:#64748b;">10/09/2026</td>
        <td style="padding:13px 12px;white-space:nowrap;">
          <button type="button" style="padding:7px 11px;border:1px solid #d7dce2;border-radius:8px;background:#fff;font-weight:700;color:#374151;">
            ⚙️ จัดการ
          </button>
        </td>
      </tr>`;
  }).join("");

  tbody.innerHTML = rows;


  const title = document.querySelector(".inventory-subpage .page-title");
  if(title){
    title.innerHTML = `📋 สูตร <span style="font-size:12px;font-weight:700;color:#94a3b8;">TEST ${mockCount}</span>`;
  }

  const total = document.getElementById("posInventoryRecipesTotal");
  if(total) total.textContent = String(mockCount);
}, 0);
