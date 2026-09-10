/* ============================================================
   POS CHILL - RECIPES
   🧪 NEW CODE / UPDATE TEST 12 • 60 ROW REAL RENDER + ESCAPE
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
            สูตรอาหารและการใช้วัตถุดิบ • 🧪 NEW CODE / UPDATE TEST 12 • 60 ROW REAL RENDER + ESCAPE • 🧪 NEW CODE / UPDATE TEST 12 • 60 ROW REAL RENDER + ESCAPE
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

          <table style="
            width:100%;
            border-collapse:collapse;
            min-width:980px;
          ">

            <thead>
              <tr style="
                background:#f8fafc;
                border-bottom:1px solid #e2e8f0;
              ">

                <th style="
                  padding:12px;
                  text-align:left;
                  white-space:nowrap;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  รหัสสูตร
                </th>

                <th style="
                  padding:12px;
                  text-align:left;
                  white-space:nowrap;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  ชื่อสูตร
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
                  white-space:nowrap;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  จำนวนวัตถุดิบ
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
                  white-space:nowrap;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  สถานะ
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
                  white-space:nowrap;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
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
                    background:#fff1f2;
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
                    กด “เพิ่มสูตร” เพื่อเริ่มสร้างสูตรอาหาร
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

  const searchInput =
    document.getElementById(
      "posInventoryRecipesSearch"
    );

  const keyword =
    String(
      searchInput?.value || ""
    )
      .trim()
      .toLowerCase();

  const recipes =
    Array.isArray(
      POS.inventoryRecipesData
    )
      ? POS.inventoryRecipesData
      : [];

  const grouped = new Map();

  recipes.forEach(function(item){

    const menuId =
      String(
        item?.menu_id || ""
      );

    if(!menuId){
      return;
    }

    if(!grouped.has(menuId)){
      grouped.set(
        menuId,
        {
          menu_id: menuId,
          menu_sku:
            item?.menu_sku || "-",
          menu_name:
            item?.menu_name || "-",
          items: []
        }
      );
    }

    grouped
      .get(menuId)
      .items
      .push(item);

  });


  let rows =
    Array.from(
      grouped.values()
    );


  if(keyword){

    rows =
      rows.filter(function(group){

        const menuText =
          (
            String(group.menu_sku || "") +
            " " +
            String(group.menu_name || "")
          )
            .toLowerCase();

        return menuText.includes(keyword);

      });

  }


  rows.sort(function(a,b){

    return String(a.menu_name || "")
      .localeCompare(
        String(b.menu_name || ""),
        "th"
      );

  });


  const totalRecipes =
    rows.length;

  const activeRecipes =
    Array.from(
      grouped.values()
    ).length;

  const ingredientCount =
    new Set(
      recipes
        .map(x => String(x?.ingredient_id || ""))
        .filter(Boolean)
    ).size;


  const totalEl =
    document.getElementById(
      "posInventoryRecipesTotal"
    );

  const activeEl =
    document.getElementById(
      "posInventoryRecipesActive"
    );

  const ingredientEl =
    document.getElementById(
      "posInventoryRecipesIngredients"
    );

  const listCountEl =
    document.getElementById(
      "posInventoryRecipesListCount"
    );


  if(totalEl){
    totalEl.textContent =
      String(totalRecipes);
  }

  if(activeEl){
    activeEl.textContent =
      String(activeRecipes);
  }

  if(ingredientEl){
    ingredientEl.textContent =
      String(ingredientCount);
  }

  if(listCountEl){
    listCountEl.textContent =
      String(rows.length) +
      " รายการ";
  }


  if(!rows.length){

    body.innerHTML = `
      <tr>
        <td colspan="5"
            style="
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
            background:#fff1f2;
            font-size:25px;
          ">
            🍳
          </div>

          <div style="
            font-size:15px;
            font-weight:800;
            color:#64748b;
          ">
            ${keyword
              ? "ไม่พบสูตรที่ค้นหา"
              : "ยังไม่มีข้อมูลสูตร"}
          </div>

          <div style="
            margin-top:5px;
            font-size:13px;
            color:#94a3b8;
          ">
            ${keyword
              ? "ลองเปลี่ยนคำค้นหา"
              : "กด “เพิ่มสูตร” เพื่อเริ่มสร้างสูตรอาหาร"}
          </div>

        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    rows.map(function(group){

      return `
        <tr style="
          border-bottom:1px solid #eef1f4;
        ">

          <td style="
            padding:14px 12px;
            font-size:13px;
            white-space:nowrap;
            color:#64748b;
            font-weight:700;
          ">
            ${POS.inventoryRecipesEscape(
              group.menu_sku
            )}
          </td>

          <td style="
            padding:14px 12px;
            font-size:14px;
            white-space:nowrap;
            color:#1f2937;
            font-weight:800;
          ">
            ${POS.inventoryRecipesEscape(
              group.menu_name
            )}
          </td>

          <td style="
            padding:14px 12px;
            text-align:center;
            white-space:nowrap;
            font-size:14px;
            font-weight:800;
            color:#2563eb;
          ">
            ${group.items.length}
            รายการ
          </td>

          <td style="
            padding:14px 12px;
            text-align:center;
            white-space:nowrap;
          ">
            <span style="
              display:inline-block;
              min-width:72px;
              padding:6px 10px;
              border-radius:999px;
              background:#e8f6ec;
              color:#267a3d;
              font-size:12px;
              font-weight:800;
            ">
              ใช้งาน
            </span>
          </td>

          <td style="
            padding:14px 12px;
            text-align:center;
            white-space:nowrap;
          ">
            <button
              type="button"
              onclick="POS.inventoryRecipesOpenManage('${String(group.menu_id).replace(/'/g,"\\'")}')"
              style="
                min-height:36px;
                padding:0 12px;
                border-radius:8px;
                border:1px solid #d7dee8;
                background:#fff;
                color:#334155;
                font-weight:700;
                cursor:pointer;
              "
            >
              ⚙️ จัดการ
            </button>
          </td>

        </tr>
      `;

    }).join("");

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
