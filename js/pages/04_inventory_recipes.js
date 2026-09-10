/* ============================================================
   POS CHILL - RECIPES TEST 04
   NEW CODE TEST MARKER
   TEST 04: TRUE RECIPES RENDER BASE
   ============================================================ */

window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   STOCK PAGE 05 : MOVEMENT
   ===================================================== */

POS.pages.inventoryMovement = async function(){
  setTimeout(() => POS.inventoryMovementLoad(), 0);

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
            📦 Movement
          </h1>

          <p class="page-subtitle" style="
            margin:0;
            color:#64748b;
            font-size:15px;
          ">
            ประวัติการเคลื่อนไหวของสต็อก • 🧪 NEW CODE / UPDATE TEST 04
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
            id="posMovementRefreshBtn"
            type="button"
            class="btn-secondary"
            onclick="POS.inventoryMovementLoad()"
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
            การเคลื่อนไหวทั้งหมด
          </div>

          <div id="posMovementTotalCount" style="
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
              id="posMovementSearch"
              type="text"
              placeholder="ค้นหาวัตถุดิบ / SKU / เลขอ้างอิง"
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
              ประเภทการเคลื่อนไหว
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
              ช่วงวันที่
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
            id="posMovementSearchBtn"
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
              📋 ประวัติการเคลื่อนไหว
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
                  จำนวน
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:right;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  ก่อนปรับ
                </th>

                <th style="
                  padding:13px 12px;
                  text-align:right;
                  font-size:12px;
                  color:#64748b;
                  font-weight:800;
                  white-space:nowrap;
                ">
                  หลังปรับ
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


            <tbody id="posMovementTableBody">

              <tr>
                <td colspan="8" style="
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
                    📦
                  </div>

                  <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#64748b;
                  ">
                    ยังไม่มีข้อมูลการเคลื่อนไหว
                  </div>

                  <div style="
                    margin-top:5px;
                    font-size:13px;
                    color:#94a3b8;
                  ">
                    เมื่อมีการรับเข้า เบิกออก หรือปรับสต็อก
                    รายการจะแสดงที่หน้านี้
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

  body.innerHTML = `
    <tr>
      <td colspan="5"
          style="
            padding:55px 20px;
            text-align:center;
            color:#94a3b8;
          ">
        ⏳ กำลังโหลดข้อมูลสูตร...
      </td>
    </tr>
  `;

  try{

    const result =
      await POS.api.recipesList();

    if(
      !result ||
      result.success !== true
    ){
      throw new Error(
        result?.error ||
        result?.message ||
        "ไม่สามารถโหลดข้อมูลสูตรได้"
      );
    }

    const data =
      result.data || {};

    POS.inventoryRecipesData =
      Array.isArray(data.recipes)
        ? data.recipes
        : [];

    POS.inventoryRecipesMenus =
      Array.isArray(data.menus)
        ? data.menus
        : [];

    POS.inventoryRecipesIngredients =
      Array.isArray(data.ingredients)
        ? data.ingredients
        : [];

    POS.inventoryRecipesRender();

  }catch(error){

    console.error(
      "inventoryRecipesLoad error:",
      error
    );

    body.innerHTML = `
      <tr>
        <td colspan="5"
            style="
              padding:55px 20px;
              text-align:center;
            ">

          <div style="
            font-size:28px;
            margin-bottom:8px;
          ">
            ⚠️
          </div>

          <div style="
            font-size:15px;
            font-weight:800;
            color:#64748b;
          ">
            โหลดข้อมูลสูตรไม่สำเร็จ
          </div>

          <div style="
            margin-top:6px;
            font-size:13px;
            color:#94a3b8;
          ">
            ${POS.inventoryRecipesEscape(
              error?.message ||
              "กรุณาลองใหม่อีกครั้ง"
            )}
          </div>

        </td>
      </tr>
    `;
  }

};




/* =====================================================
   RENDER
   ===================================================== */

POS.inventoryRecipesRender = function(){

  const body =
    document.getElementById(
      "posMovementTableBody"
    );

  if(!body){
    return;
  }

  const searchInput =
    document.getElementById(
      "posMovementSearch"
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
      "posMovementTotalCount"
    );

  const activeEl =
    document.getElementById(
      "posMovementPurchaseCount"
    );

  const ingredientEl =
    document.getElementById(
      "posMovementSaleCount"
    );

  const listCountEl =
    document.getElementById(
      "posMovementListCount"
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
    "posMovementTotalCount",
    total
  );

  setText(
    "posMovementPurchaseCount",
    purchase
  );

  setText(
    "posMovementSaleCount",
    sale
  );

  setText(
    "posMovementAdjustCount",
    adjustment
  );

  setText(
    "posMovementListCount",
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

/* =====================================================
   PAGE 04 TEST ALIAS
   ใช้ก้อน Movement เดิม 100% เพื่อทดสอบ
   ไม่เปลี่ยน API / render / DOM / lifecycle ของ Movement
   ===================================================== */
POS.pages.inventoryRecipes = POS.pages.inventoryMovement;
POS.inventoryRecipesLoad = POS.inventoryMovementLoad;
