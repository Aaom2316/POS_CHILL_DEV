/* ============================================================
   POS CHILL - RECIPES
   🧪 NEW CODE / UPDATE TEST 14 • 60 ROW NO TABLE
   TEST 11: RECIPES + 60 ROW MOCK DATA + REAL RENDER
   ============================================================ */

window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   STOCK PAGE 05 : MOVEMENT
   ===================================================== */

POS.pages.inventoryRecipes = async function(){

  /*
   * ตอนเปิดผ่าน Stock Router จะให้ Router เป็นผู้ LOAD หลัง DOM settle
   * เพื่อไม่ให้โหลดซ้ำกับ setTimeout ของ page factory
   * กรณีเรียก page factory โดยตรงจึงยัง LOAD แบบเดิมได้
   */
  if(!POS.inventoryRecipesOpening){
    setTimeout(function(){
      if(typeof POS.inventoryRecipesLoad === "function"){
        POS.inventoryRecipesLoad();
      }
    }, 0);
  }

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
          ">
            สูตรอาหารและการใช้วัตถุดิบ • 🧪 NEW CODE / UPDATE TEST 14 • 60 ROW NO TABLE • 🧪 NEW CODE / UPDATE TEST 14 • 60 ROW NO TABLE
          </p>
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        ">

          <button
            id="posInventoryRecipesBackBtn"
            class="btn-secondary"
            type="button"
            onclick="POS.inventoryBackToMain()"
            style="
              min-height:42px;
              padding:0 16px;
              border-radius:10px;
              font-weight:700;
            "
          >
            ← กลับหน้าสต็อก
          </button>

          <button
            id="posInventoryRecipesAddBtn"
            class="btn-primary"
            type="button"
            onclick="POS.inventoryRecipesOpenAdd()"
            style="
              min-height:42px;
              padding:0 18px;
              border-radius:10px;
              font-weight:700;
              background:#e8f6ec;
              color:#267a3d;
              border:1px solid #b9dec3;
            "
          >
            ➕ เพิ่มสูตร
          </button>

        </div>

      </div>


      <!-- =================================================
           SUMMARY
           ================================================= -->
      <div style="
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
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
            color:#94a3b8;
            font-size:13px;
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
            margin-top:3px;
            color:#94a3b8;
            font-size:12px;
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
            color:#94a3b8;
            font-size:13px;
            font-weight:700;
          ">
            ใช้งานอยู่
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
            margin-top:3px;
            color:#94a3b8;
            font-size:12px;
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
            color:#94a3b8;
            font-size:13px;
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
            margin-top:3px;
            color:#94a3b8;
            font-size:12px;
          ">
            รายการ
          </div>
        </div>

      </div>


      <!-- =================================================
           SEARCH
           ================================================= -->
      <div class="card" style="
        margin-bottom:20px;
      ">

        <div style="
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          gap:14px;
          align-items:end;
        ">

          <div>

            <label style="
              display:block;
              margin-bottom:7px;
              color:#475569;
              font-size:13px;
              font-weight:700;
            ">
              🔎 ค้นหาสูตร
            </label>

            <input
              id="posInventoryRecipesSearch"
              type="text"
              placeholder="ค้นหาชื่อสูตร / รหัสสูตร"
              style="
                width:100%;
                height:43px;
                box-sizing:border-box;
                padding:0 13px;
                border:1px solid #d7dee8;
                border-radius:9px;
                outline:none;
                font-size:14px;
              "
            >

          </div>

          <button
            id="posInventoryRecipesRefreshBtn"
            class="btn-secondary"
            type="button"
            style="
              min-height:43px;
              padding:0 15px;
              border-radius:9px;
              font-weight:700;
            "
          >
            🔄 รีเฟรช
          </button>

        </div>

      </div>


      <!-- =================================================
           RECIPE LIST
           ================================================= -->
      <div class="card" style="
        padding:0;
        overflow:hidden;
      ">

        <div style="
          padding:18px 18px 14px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
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
              color:#94a3b8;
              font-size:12px;
            ">
              จัดการสูตรและวัตถุดิบที่ใช้ในแต่ละเมนู
            </div>

          </div>

          <div id="posInventoryRecipesListCount" style="
            padding:7px 11px;
            border-radius:999px;
            background:#f8fafc;
            color:#64748b;
            font-size:12px;
            font-weight:700;
            white-space:nowrap;
          ">
            0 รายการ
          </div>

        </div>


        <div style="
          overflow-x:auto;
        ">
          <div style="
            width:100%;
          ">

            <div style="
              display:grid;
              grid-template-columns:180px minmax(240px,1fr) 180px 150px 150px;
              min-width:980px;
              padding:12px;
              box-sizing:border-box;
              background:#f8fafc;
              border-bottom:1px solid #e2e8f0;
              color:#475569;
              font-size:12px;
              font-weight:800;
            ">
              <div>รหัสสูตร</div>
              <div>ชื่อสูตร</div>
              <div style="text-align:center;">จำนวนวัตถุดิบ</div>
              <div style="text-align:center;">สถานะ</div>
              <div style="text-align:center;">จัดการ</div>
            </div>

            <div
              id="posInventoryRecipesTableBody"
              style="width:100%;"
            >
              <div style="
                padding:60px 20px;
                text-align:center;
              ">
                กำลังโหลดข้อมูลสูตร...
              </div>
            </div>

          </div>
</div>

      </div>

    </div>
  `;
};


POS.inventoryRecipesEscape = function(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

};


/* =====================================================
   RECIPES : LOAD
   ===================================================== */

POS.inventoryRecipesLoad = async function(){

  const body =
    document.getElementById(
      "posInventoryRecipesTableBody"
    );

  if(!body){
    return;
  }

  /* =====================================================
     TEST 10 : 60 ROW MOCK DATA
     - ไม่เรียก API
     - สร้างข้อมูลสูตรทดสอบ 60 แถวโดยตรง
     - ใช้ Recipes RENDER จริง
     - จุดประสงค์: วัดการวาด/เลื่อนหน้า 60 แถว
     ===================================================== */

  POS.inventoryRecipesMenus = [];
  POS.inventoryRecipesIngredients = [];

  POS.inventoryRecipesData = [];

  for(let i = 1; i <= 60; i++){

    POS.inventoryRecipesData.push({
      id: "TEST-RECIPE-" + i,
      menu_id: "TEST-MENU-" + i,
      menu_sku: "TEST" + String(i).padStart(3, "0"),
      menu_name: "สูตรทดสอบ " + String(i).padStart(2, "0"),
      ingredient_id: "TEST-ING-" + i,
      ingredient_sku: "TING" + String(i).padStart(3, "0"),
      ingredient_name: "วัตถุดิบทดสอบ " + String(i).padStart(2, "0"),
      qty: 1,
      base_unit: "ชิ้น",
      is_active: 1
    });

  }

  POS.inventoryRecipesRender();

};




/* =====================================================
   RENDER
   ===================================================== */

POS.inventoryRecipesRender = function(){

  const body =
    document.getElementById(
      "posInventoryRecipesTableBody"
    );

  if(!body){
    return;
  }

  const recipes =
    Array.isArray(POS.inventoryRecipesData)
      ? POS.inventoryRecipesData
      : [];

  body.innerHTML =
    recipes.map(function(item){

      return `
        <div style="
          display:grid;
          grid-template-columns:180px minmax(240px,1fr) 180px 150px 150px;
          min-width:980px;
          padding:14px 12px;
          box-sizing:border-box;
          border-bottom:1px solid #eef1f4;
          font-size:14px;
          color:#1f2937;
          align-items:center;
        ">
          <div>${String(item.menu_sku || "-")}</div>
          <div>${String(item.menu_name || "-")}</div>
          <div style="text-align:center;">1 รายการ</div>
          <div style="text-align:center;">ใช้งาน</div>
          <div style="text-align:center;">ทดสอบ</div>
        </div>
      `;

    }).join("");

  const totalEl =
    document.getElementById("posInventoryRecipesTotal");
  const activeEl =
    document.getElementById("posInventoryRecipesActive");
  const ingredientEl =
    document.getElementById("posInventoryRecipesIngredients");
  const listCountEl =
    document.getElementById("posInventoryRecipesListCount");

  if(totalEl) totalEl.textContent = String(recipes.length);
  if(activeEl) activeEl.textContent = String(recipes.length);
  if(ingredientEl) ingredientEl.textContent = String(recipes.length);
  if(listCountEl) listCountEl.textContent = String(recipes.length) + " รายการ";
};


/* =====================================================
   SUMMARY
   ===================================================== */

POS.inventoryMovementUpdateSummary = function(rows){

  const total =
    rows.length;

  const purchase =
    rows.filter(
      row =>
        String(row.movement_type || "") ===
        "PURCHASE"
    ).length;

  const sale =
    rows.filter(
      row =>
        String(row.movement_type || "") ===
        "SALE"
    ).length;

  const adjustment =
    rows.filter(
      row =>
        [
          "ADJUSTMENT",
          "STOCKTAKE"
        ].includes(
          String(row.movement_type || "")
        )
    ).length;

  const setText = (id, value) => {

    const el =
      document.getElementById(id);

    if(el){
      el.textContent =
        String(value);
    }
  };

  setText(
    "posInventoryRecipesTotal",
    total
  );

  setText(
    "posInventoryRecipesActive",
    purchase
  );

  setText(
    "posInventoryRecipesIngredients",
    sale
  );

  setText(
    "posMovementAdjustCount",
    adjustment
  );

  setText(
    "posInventoryRecipesListCount",
    `${total} รายการ`
  );
};


/* =====================================================
   HELPERS
   ===================================================== */

POS.inventoryMovementTypeInfo = function(type){

  switch(type){

    case "PURCHASE":
      return {
        label:"รับเข้า",
        bg:"#ecfdf3",
        color:"#267a3d",
        qtyColor:"#267a3d"
      };

    case "SALE":
      return {
        label:"ขาย / เบิก",
        bg:"#fef2f2",
        color:"#c0392b",
        qtyColor:"#c0392b"
      };

    case "ADJUSTMENT":
      return {
        label:"ปรับสต็อก",
        bg:"#eff6ff",
        color:"#2563eb",
        qtyColor:"#2563eb"
      };

    case "STOCKTAKE":
      return {
        label:"ตรวจนับสต็อก",
        bg:"#f5f3ff",
        color:"#7c3aed",
        qtyColor:"#7c3aed"
      };

    default:
      return {
        label:type || "-",
        bg:"#f8fafc",
        color:"#64748b",
        qtyColor:"#64748b"
      };
  }
};


POS.inventoryMovementFormatNumber = function(value){

  const number =
    Number(value);

  if(!Number.isFinite(number)){
    return "0";
  }

  return number.toLocaleString(
    "th-TH",
    {
      maximumFractionDigits:6
    }
  );
};


POS.inventoryMovementFormatQty = function(
  value,
  unit
){

  const number =
    POS.inventoryMovementFormatNumber(
      value
    );

  return `${number} ${
    POS.inventoryMovementEscape(
      unit || ""
    )
  }`;
};


POS.inventoryMovementFormatDateTime = function(value){

  if(!value){
    return "-";
  }

  const date =
    new Date(value);

  if(Number.isNaN(date.getTime())){
    return String(value);
  }

  return date.toLocaleString(
    "th-TH",
    {
      year:"numeric",
      month:"2-digit",
      day:"2-digit",
      hour:"2-digit",
      minute:"2-digit"
    }
  );
};


POS.inventoryMovementEscape = function(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
};
