window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   STOCK PAGE 04 : RECIPES
   ===================================================== */

POS.pages.inventoryRecipes = async function(){
  return `
    <div class="inventory-subpage">

      <!-- TEST 33 : HEADER H1 ONLY -->
      <div>
        <h1 class="page-title" style="
          margin:0 0 5px;
          font-size:30px;
          font-weight:800;
          color:#1f2937;
        ">
          🍳 สูตร
        </h1>
      </div>

           SUMMARY
           ================================================= -->
      <div style="
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:16px;
        margin-bottom:20px;
      ">

        <div class="card" style="
          margin:0;
          min-height:108px;
          box-sizing:border-box;
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


        <div class="card" style="
          margin:0;
          min-height:108px;
          box-sizing:border-box;
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


        <div class="card" style="
          margin:0;
          min-height:108px;
          box-sizing:border-box;
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
          border-top:1px solid #eef1f4;
        ">

          <table style="
            width:100%;
            min-width:900px;
            border-collapse:collapse;
          ">

            <thead>
              <tr style="
                background:#f8fafc;
                border-bottom:1px solid #e2e8f0;
              ">

                <th style="
                  padding:12px;
                  text-align:left;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  รหัสสูตร
                </th>

                <th style="
                  padding:12px;
                  text-align:left;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  ชื่อสูตร
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  จำนวนวัตถุดิบ
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  สถานะ
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
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


/* =====================================================
   RECIPES : DATA
   ===================================================== */

POS.inventoryRecipesData = [];
POS.inventoryRecipesMenus = [];
POS.inventoryRecipesIngredients = [];


/* =====================================================
   RECIPES : ESCAPE HTML
   ===================================================== */

POS.inventoryRecipesEscape = function(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

};


/* =====================================================
   RECIPES : SHOW MESSAGE
   ===================================================== */

POS.inventoryRecipesMessage = function(
  title,
  message
){

  const old =
    document.getElementById(
      "posInventoryRecipesDialog"
    );

  if(old){
    old.remove();
  }

  const dialog =
    document.createElement("div");

  dialog.id =
    "posInventoryRecipesDialog";

  dialog.style.cssText = `
    position:fixed;
    inset:0;
    z-index:100001;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(15,23,42,.52);
    backdrop-filter:blur(3px);
  `;

  dialog.innerHTML = `
    <div style="
      width:min(440px,100%);
      background:#fff;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 25px 70px rgba(15,23,42,.28);
      border:1px solid rgba(226,232,240,.9);
    ">

      <div style="
        padding:24px 24px 20px;
        text-align:center;
      ">

        <div style="
          width:58px;
          height:58px;
          margin:0 auto 14px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#eaf7ee;
          color:#267a3d;
          font-size:28px;
          box-shadow:0 8px 22px rgba(38,122,61,.12);
        ">
          ✓
        </div>

        <div style="
          font-size:20px;
          font-weight:800;
          color:#1f2937;
          line-height:1.4;
        ">
          ${POS.inventoryRecipesEscape(title || "สูตร")}
        </div>

        <div style="
          margin-top:7px;
          font-size:14px;
          color:#64748b;
          line-height:1.7;
        ">
          ${POS.inventoryRecipesEscape(message || "")}
        </div>

      </div>

      <div style="
        padding:15px 24px 20px;
        border-top:1px solid #eef1f4;
        display:flex;
        justify-content:center;
      ">

        <button
          type="button"
          id="posInventoryRecipesDialogOk"
          style="
            min-width:92px;
            min-height:42px;
            padding:0 20px;
            border:0;
            border-radius:11px;
            background:#267a3d;
            color:#fff;
            font-size:14px;
            font-weight:800;
            cursor:pointer;
            box-shadow:0 6px 16px rgba(38,122,61,.18);
          "
        >
          ตกลง
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(dialog);

  const close =
    function(){
      dialog.remove();
    };

  dialog.querySelector(
    "#posInventoryRecipesDialogOk"
  ).onclick = close;

  dialog.addEventListener(
    "click",
    function(event){
      if(event.target === dialog){
        close();
      }
    }
  );

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
   RECIPES : RENDER
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
          ">
            <span style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
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
   RECIPES : MODAL
   ===================================================== */

POS.inventoryRecipesCloseModal = function(){

  const modal =
    document.getElementById(
      "posInventoryRecipesModal"
    );

  if(modal){
    modal.remove();
  }

};


POS.inventoryRecipesEnsureModal = function(){

  let modal =
    document.getElementById(
      "posInventoryRecipesModal"
    );

  if(modal){
    return modal;
  }


  modal =
    document.createElement("div");

  modal.id =
    "posInventoryRecipesModal";

  modal.style.cssText = `
    position:fixed;
    inset:0;
    z-index:99999;
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(15,23,42,.48);
  `;

  modal.innerHTML = `
    <div style="
      width:min(720px,100%);
      max-height:90vh;
      overflow:auto;
      background:#fff;
      border-radius:18px;
      box-shadow:0 25px 70px rgba(15,23,42,.22);
    ">

      <div style="
        padding:20px 22px;
        border-bottom:1px solid #eef1f4;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
      ">

        <div>
          <div
            id="posInventoryRecipesModalTitle"
            style="
              font-size:20px;
              font-weight:800;
              color:#1f2937;
            "
          >
            ➕ เพิ่มสูตร
          </div>

          <div
            id="posInventoryRecipesModalSubtitle"
            style="
              margin-top:4px;
              font-size:12px;
              color:#94a3b8;
            "
          >
            เพิ่มวัตถุดิบที่ใช้ในเมนู
          </div>
        </div>

        <button
          id="posInventoryRecipesModalClose"
          type="button"
          style="
            width:36px;
            height:36px;
            border:0;
            border-radius:50%;
            background:#f1f5f9;
            color:#64748b;
            font-size:18px;
            cursor:pointer;
          "
        >
          ×
        </button>

      </div>


      <div style="padding:22px;">

        <div
          id="posInventoryRecipesFormArea"
          style="
            display:grid;
            gap:15px;
          "
        >

          <div>
            <label style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:800;
              color:#475569;
            ">
              เมนู
            </label>

            <select
              id="posInventoryRecipesMenuSelect"
              style="
                width:100%;
                height:44px;
                padding:0 12px;
                border:1px solid #d7dee8;
                border-radius:9px;
                background:#fff;
                font-size:14px;
                outline:none;
              "
            ></select>
          </div>


          <div>
            <label style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:800;
              color:#475569;
            ">
              วัตถุดิบ
            </label>

            <select
              id="posInventoryRecipesIngredientSelect"
              style="
                width:100%;
                height:44px;
                padding:0 12px;
                border:1px solid #d7dee8;
                border-radius:9px;
                background:#fff;
                font-size:14px;
                outline:none;
              "
            ></select>

            <div
              id="posInventoryRecipesExistingArea"
              style="
                display:none;
                margin-top:10px;
                padding:12px;
                border:1px solid #e2e8f0;
                border-radius:10px;
                background:#f8fafc;
              "
            ></div>
          </div>


          <div>
            <label style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:800;
              color:#475569;
            ">
              จำนวนที่ใช้ต่อ 1 เมนู
            </label>

            <div style="
              display:flex;
              align-items:center;
              gap:10px;
            ">

              <input
                id="posInventoryRecipesQtyInput"
                type="number"
                min="0.000001"
                step="any"
                inputmode="decimal"
                placeholder="เช่น 0.25"
                style="
                  flex:1;
                  height:44px;
                  box-sizing:border-box;
                  padding:0 12px;
                  border:1px solid #d7dee8;
                  border-radius:9px;
                  font-size:15px;
                  outline:none;
                "
              >

              <span
                id="posInventoryRecipesUnitLabel"
                style="
                  min-width:80px;
                  color:#64748b;
                  font-size:13px;
                  font-weight:800;
                "
              >
                หน่วยหลัก
              </span>

            </div>

            <div style="
              margin-top:6px;
              font-size:12px;
              color:#94a3b8;
            ">
              จำนวนจะถูกบันทึกเป็นหน่วยหลักของวัตถุดิบ
            </div>
          </div>


          <div
            id="posInventoryRecipesFormMessage"
            style="
              display:none;
              padding:11px 13px;
              border-radius:9px;
              background:#fff7ed;
              color:#c2410c;
              font-size:13px;
              font-weight:700;
            "
          ></div>

        </div>


        <div
          id="posInventoryRecipesManageArea"
          style="
            display:none;
          "
        ></div>

      </div>


      <div style="
        padding:16px 22px;
        border-top:1px solid #eef1f4;
        display:flex;
        justify-content:flex-end;
        gap:10px;
      ">

        <button
          id="posInventoryRecipesModalCancel"
          type="button"
          style="
            min-height:40px;
            padding:0 15px;
            border-radius:9px;
            border:1px solid #d7dee8;
            background:#fff;
            color:#475569;
            font-weight:700;
            cursor:pointer;
          "
        >
          ปิด
        </button>

        <button
          id="posInventoryRecipesModalSave"
          type="button"
          style="
            min-height:40px;
            padding:0 18px;
            border-radius:9px;
            border:1px solid #b9dec3;
            background:#e8f6ec;
            color:#267a3d;
            font-weight:800;
            cursor:pointer;
          "
        >
          💾 บันทึก
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(
    "#posInventoryRecipesModalClose"
  ).onclick =
    POS.inventoryRecipesCloseModal;

  modal.querySelector(
    "#posInventoryRecipesModalCancel"
  ).onclick =
    POS.inventoryRecipesCloseModal;

  modal.addEventListener(
    "click",
    function(event){

      if(event.target === modal){
        POS.inventoryRecipesCloseModal();
      }

    }
  );

  return modal;

};


/* =====================================================
   RECIPES : FILL SELECTS
   ===================================================== */

POS.inventoryRecipesFillSelects = function(){

  const menuSelect =
    document.getElementById(
      "posInventoryRecipesMenuSelect"
    );

  const ingredientSelect =
    document.getElementById(
      "posInventoryRecipesIngredientSelect"
    );

  if(!menuSelect || !ingredientSelect){
    return;
  }


  menuSelect.innerHTML =
    `<option value="">-- เลือกเมนู --</option>` +
    POS.inventoryRecipesMenus
      .map(function(item){

        return `
          <option value="${POS.inventoryRecipesEscape(item.id)}">
            ${POS.inventoryRecipesEscape(item.sku || "-")}
            — 
            ${POS.inventoryRecipesEscape(item.name || "-")}
          </option>
        `;

      })
      .join("");


  function renderIngredientsForMenu(){

    const menuId =
      String(
        menuSelect.value || ""
      );

    const usedIngredientIds =
      new Set(
        POS.inventoryRecipesData
          .filter(function(recipe){
            return String(
              recipe?.menu_id || ""
            ) === menuId;
          })
          .map(function(recipe){
            return String(
              recipe?.ingredient_id || ""
            );
          })
          .filter(Boolean)
      );


    ingredientSelect.innerHTML =
      `<option value="">-- เลือกวัตถุดิบ --</option>` +
      POS.inventoryRecipesIngredients
        .filter(function(item){
          return !usedIngredientIds.has(
            String(item?.id || "")
          );
        })
        .map(function(item){

          return `
            <option
              value="${POS.inventoryRecipesEscape(item.id)}"
              data-unit="${POS.inventoryRecipesEscape(item.base_unit || "")}"
            >
              ${POS.inventoryRecipesEscape(item.sku || "-")}
              —
              ${POS.inventoryRecipesEscape(item.name || "-")}
            </option>
          `;

        })
        .join("");

  }


  function renderExistingIngredientsForMenu(){

    const existingArea =
      document.getElementById(
        "posInventoryRecipesExistingArea"
      );

    if(!existingArea){
      return;
    }

    const menuId =
      String(
        menuSelect.value || ""
      );

    if(!menuId){
      existingArea.style.display = "none";
      existingArea.innerHTML = "";
      return;
    }

    const existingRecipes =
      POS.inventoryRecipesData
        .filter(function(recipe){
          return String(
            recipe?.menu_id || ""
          ) === menuId;
        });

    existingArea.style.display = "block";

    if(!existingRecipes.length){
      existingArea.innerHTML = `
        <div style="
          font-size:13px;
          font-weight:800;
          color:#64748b;
        ">
          📋 วัตถุดิบที่มีอยู่ในสูตร
        </div>
        <div style="
          margin-top:6px;
          font-size:12px;
          color:#94a3b8;
        ">
          ยังไม่มีวัตถุดิบในสูตรนี้
        </div>
      `;
      return;
    }

    existingArea.innerHTML = `
      <div style="
        font-size:13px;
        font-weight:800;
        color:#334155;
        margin-bottom:8px;
      ">
        📋 วัตถุดิบที่มีอยู่ในสูตร
      </div>

      <div style="
        display:grid;
        gap:6px;
      ">
        ${existingRecipes.map(function(recipe){
          return `
            <div style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:12px;
              padding:8px 10px;
              border-radius:8px;
              background:#fff;
              border:1px solid #eef1f4;
            ">
              <div style="
                min-width:0;
                font-size:13px;
                font-weight:700;
                color:#334155;
              ">
                ${POS.inventoryRecipesEscape(recipe.ingredient_name || recipe.ingredient_sku || "-")}
              </div>
              <div style="
                flex-shrink:0;
                font-size:12px;
                font-weight:800;
                color:#64748b;
              ">
                ${Number(recipe.qty || 0).toLocaleString("th-TH", {maximumFractionDigits:6})}
                ${POS.inventoryRecipesEscape(recipe.base_unit || "")} / 1 เมนู
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }


  menuSelect.onchange =
    function(){

      renderIngredientsForMenu();
      renderExistingIngredientsForMenu();

      const unitLabel =
        document.getElementById(
          "posInventoryRecipesUnitLabel"
        );

      if(unitLabel){
        unitLabel.textContent =
          "หน่วยหลัก";
      }

    };


  ingredientSelect.onchange =
    function(){

      const option =
        ingredientSelect.options[
          ingredientSelect.selectedIndex
        ];

      const unit =
        option?.dataset?.unit || "หน่วยหลัก";

      const unitLabel =
        document.getElementById(
          "posInventoryRecipesUnitLabel"
        );

      if(unitLabel){
        unitLabel.textContent =
          unit;
      }

    };

};


/* =====================================================
   RECIPES : ADD MODAL
   ===================================================== */

POS.inventoryRecipesOpenAdd = function(){

  const modal =
    POS.inventoryRecipesEnsureModal();

  const title =
    document.getElementById(
      "posInventoryRecipesModalTitle"
    );

  const subtitle =
    document.getElementById(
      "posInventoryRecipesModalSubtitle"
    );

  const formArea =
    document.getElementById(
      "posInventoryRecipesFormArea"
    );

  const manageArea =
    document.getElementById(
      "posInventoryRecipesManageArea"
    );

  const saveButton =
    document.getElementById(
      "posInventoryRecipesModalSave"
    );


  if(title){
    title.textContent =
      "➕ เพิ่มวัตถุดิบในสูตร";
  }

  if(subtitle){
    subtitle.textContent =
      "เลือกเมนู วัตถุดิบ และจำนวนที่ใช้ต่อ 1 เมนู";
  }

  if(formArea){
    formArea.style.display =
      "grid";
  }

  if(manageArea){
    manageArea.style.display =
      "none";
  }

  if(saveButton){
    saveButton.style.display =
      "inline-flex";

    saveButton.textContent =
      "💾 บันทึก";
  }


  POS.inventoryRecipesFillSelects();


  const menuSelect =
    document.getElementById(
      "posInventoryRecipesMenuSelect"
    );

  const ingredientSelect =
    document.getElementById(
      "posInventoryRecipesIngredientSelect"
    );

  const qtyInput =
    document.getElementById(
      "posInventoryRecipesQtyInput"
    );

  if(menuSelect){
    menuSelect.value = "";
    menuSelect.dispatchEvent(
      new Event("change")
    );
  }

  if(ingredientSelect){
    ingredientSelect.value = "";
  }

  if(qtyInput){
    qtyInput.value = "";
  }

  const unitLabel =
    document.getElementById(
      "posInventoryRecipesUnitLabel"
    );

  if(unitLabel){
    unitLabel.textContent =
      "หน่วยหลัก";
  }

  const message =
    document.getElementById(
      "posInventoryRecipesFormMessage"
    );

  if(message){
    message.style.display =
      "none";
    message.textContent =
      "";
  }


  saveButton.onclick =
    async function(){

      const menuId =
        String(
          menuSelect?.value || ""
        );

      const ingredientId =
        String(
          ingredientSelect?.value || ""
        );

      const qty =
        Number(
          qtyInput?.value || 0
        );


      if(!menuId){
        POS.inventoryRecipesFormError(
          "กรุณาเลือกเมนู"
        );
        return;
      }

      if(!ingredientId){
        POS.inventoryRecipesFormError(
          "กรุณาเลือกวัตถุดิบ"
        );
        return;
      }

      if(!Number.isFinite(qty) || qty <= 0){
        POS.inventoryRecipesFormError(
          "กรุณากรอกจำนวนให้มากกว่า 0"
        );
        return;
      }


      const duplicateRecipe =
        POS.inventoryRecipesData.some(
          function(recipe){
            return String(
              recipe?.menu_id || ""
            ) === menuId &&
            String(
              recipe?.ingredient_id || ""
            ) === ingredientId;
          }
        );

      if(duplicateRecipe){
        POS.inventoryRecipesFormError(
          "วัตถุดิบนี้มีอยู่ในสูตรของเมนูนี้แล้ว"
        );
        return;
      }


      saveButton.disabled =
        true;

      saveButton.style.opacity =
        ".65";


      try{

        const result =
          await POS.api.recipeAdd({
            menu_id:
              menuId,

            ingredient_id:
              ingredientId,

            qty:
              qty
        });


        if(
          !result ||
          result.success !== true
        ){
          throw new Error(
            result?.error ||
            result?.message ||
            "บันทึกสูตรไม่สำเร็จ"
          );
        }


        POS.inventoryRecipesCloseModal();

        await POS.inventoryRecipesLoad();

        POS.inventoryRecipesMessage(
          "บันทึกสูตรเรียบร้อย",
          "เพิ่มวัตถุดิบเข้าในสูตรแล้ว"
        );

      }catch(error){

        console.error(
          "recipeAdd error:",
          error
        );

        POS.inventoryRecipesFormError(
          error?.message ||
          "บันทึกสูตรไม่สำเร็จ"
        );

      }finally{

        saveButton.disabled =
          false;

        saveButton.style.opacity =
          "1";

      }

    };


  modal.style.display =
    "flex";

};


/* =====================================================
   RECIPES : FORM ERROR
   ===================================================== */

POS.inventoryRecipesFormError = function(message){

  const box =
    document.getElementById(
      "posInventoryRecipesFormMessage"
    );

  if(!box){
    return;
  }

  box.textContent =
    String(message || "");

  box.style.display =
    "block";

};


/* =====================================================
   RECIPES : MANAGE MENU
   ===================================================== */

POS.inventoryRecipesOpenManage = function(menuId){

  const modal =
    POS.inventoryRecipesEnsureModal();

  const group =
    POS.inventoryRecipesData.filter(
      function(item){

        return String(
          item?.menu_id || ""
        ) === String(menuId);

      }
    );

  if(!group.length){
    POS.inventoryRecipesMessage(
      "ไม่พบสูตร",
      "ไม่พบข้อมูลสูตรของเมนูนี้"
    );
    return;
  }


  const first =
    group[0];

  const title =
    document.getElementById(
      "posInventoryRecipesModalTitle"
    );

  const subtitle =
    document.getElementById(
      "posInventoryRecipesModalSubtitle"
    );

  const formArea =
    document.getElementById(
      "posInventoryRecipesFormArea"
    );

  const manageArea =
    document.getElementById(
      "posInventoryRecipesManageArea"
    );

  const saveButton =
    document.getElementById(
      "posInventoryRecipesModalSave"
    );


  if(title){
    title.textContent =
      "⚙️ จัดการสูตร";
  }

  if(subtitle){
    subtitle.textContent =
      String(first.menu_name || "-");
  }

  if(formArea){
    formArea.style.display =
      "none";
  }

  if(saveButton){
    saveButton.style.display =
      "none";
  }

  if(manageArea){
    manageArea.style.display =
      "block";

    manageArea.innerHTML =
      `
        <div style="
          display:grid;
          gap:10px;
        ">

          ${
            group.map(function(item){

              return `
                <div style="
                  padding:14px;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                  display:flex;
                  align-items:center;
                  justify-content:space-between;
                  gap:12px;
                ">

                  <div style="
                    min-width:0;
                  ">

                    <div style="
                      font-size:14px;
                      font-weight:800;
                      color:#1f2937;
                    ">
                      ${POS.inventoryRecipesEscape(
                        item.ingredient_name || "-"
                      )}
                    </div>

                    <div style="
                      margin-top:4px;
                      font-size:12px;
                      color:#94a3b8;
                    ">
                      ${POS.inventoryRecipesEscape(
                        item.ingredient_sku || "-"
                      )}
                      ·
                      ใช้
                      ${Number(item.qty || 0).toLocaleString(
                        "th-TH",
                        {
                          maximumFractionDigits:6
                        }
                      )}
                      ${POS.inventoryRecipesEscape(
                        item.base_unit || ""
                      )}
                      / 1 เมนู
                    </div>

                  </div>


                  <div style="
                    display:flex;
                    align-items:center;
                    gap:7px;
                    flex-shrink:0;
                  ">

                    <button
                      type="button"
                      data-recipe-edit="${POS.inventoryRecipesEscape(item.id)}"
                      style="
                        width:36px;
                        height:36px;
                        border-radius:8px;
                        border:1px solid #d7dee8;
                        background:#fff;
                        cursor:pointer;
                      "
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      data-recipe-delete="${POS.inventoryRecipesEscape(item.id)}"
                      style="
                        width:36px;
                        height:36px;
                        border-radius:8px;
                        border:1px solid #fecaca;
                        background:#fff5f5;
                        cursor:pointer;
                      "
                    >
                      🗑️
                    </button>

                  </div>

                </div>
              `;

            }).join("")
          }

        </div>
      `;


    manageArea
      .querySelectorAll(
        "[data-recipe-edit]"
      )
      .forEach(function(button){

        button.onclick =
          function(){

            const id =
              button.getAttribute(
                "data-recipe-edit"
              );

            POS.inventoryRecipesEdit(
              id
            );

          };

      });


    manageArea
      .querySelectorAll(
        "[data-recipe-delete]"
      )
      .forEach(function(button){

        button.onclick =
          function(){

            const id =
              button.getAttribute(
                "data-recipe-delete"
              );

            POS.inventoryRecipesDelete(
              id
            );

          };

      });

  }


  modal.style.display =
    "flex";

};


/* =====================================================
   RECIPES : EDIT
   ===================================================== */

POS.inventoryRecipesEdit = function(id){

  const item =
    POS.inventoryRecipesData.find(
      function(row){

        return String(
          row?.id || ""
        ) === String(id);

      }
    );

  if(!item){
    POS.inventoryRecipesMessage(
      "ไม่พบรายการ",
      "ไม่พบรายการสูตรที่ต้องการแก้ไข"
    );
    return;
  }


  const modal =
    POS.inventoryRecipesEnsureModal();

  const title =
    document.getElementById(
      "posInventoryRecipesModalTitle"
    );

  const subtitle =
    document.getElementById(
      "posInventoryRecipesModalSubtitle"
    );

  const formArea =
    document.getElementById(
      "posInventoryRecipesFormArea"
    );

  const manageArea =
    document.getElementById(
      "posInventoryRecipesManageArea"
    );

  const saveButton =
    document.getElementById(
      "posInventoryRecipesModalSave"
    );


  if(title){
    title.textContent =
      "✏️ แก้ไขจำนวน";
  }

  if(subtitle){
    subtitle.textContent =
      String(
        item.ingredient_name || "-"
      );
  }

  if(formArea){
    formArea.style.display =
      "grid";
  }

  if(manageArea){
    manageArea.style.display =
      "none";
  }

  if(saveButton){
    saveButton.style.display =
      "inline-flex";

    saveButton.textContent =
      "💾 บันทึก";
  }


  POS.inventoryRecipesFillSelects();


  const menuSelect =
    document.getElementById(
      "posInventoryRecipesMenuSelect"
    );

  const ingredientSelect =
    document.getElementById(
      "posInventoryRecipesIngredientSelect"
    );

  const qtyInput =
    document.getElementById(
      "posInventoryRecipesQtyInput"
    );

  if(menuSelect){
    menuSelect.value =
      String(item.menu_id || "");

    menuSelect.disabled =
      true;
  }

  if(ingredientSelect){
    ingredientSelect.value =
      String(item.ingredient_id || "");

    ingredientSelect.disabled =
      true;

    ingredientSelect.dispatchEvent(
      new Event("change")
    );
  }

  if(qtyInput){
    qtyInput.value =
      Number(item.qty || 0);
  }


  const message =
    document.getElementById(
      "posInventoryRecipesFormMessage"
    );

  if(message){
    message.style.display =
      "none";
    message.textContent =
      "";
  }


  saveButton.onclick =
    async function(){

      const qty =
        Number(
          qtyInput?.value || 0
        );

      if(!Number.isFinite(qty) || qty <= 0){
        POS.inventoryRecipesFormError(
          "กรุณากรอกจำนวนให้มากกว่า 0"
        );
        return;
      }


      saveButton.disabled =
        true;

      saveButton.style.opacity =
        ".65";


      try{

        const result =
          await POS.api.recipeUpdate({
            id:
              id,

            qty:
              qty
          });


        if(
          !result ||
          result.success !== true
        ){
          throw new Error(
            result?.error ||
            result?.message ||
            "แก้ไขสูตรไม่สำเร็จ"
          );
        }


        POS.inventoryRecipesCloseModal();

        await POS.inventoryRecipesLoad();

        POS.inventoryRecipesMessage(
          "แก้ไขสูตรเรียบร้อย",
          "จำนวนวัตถุดิบถูกบันทึกแล้ว"
        );

      }catch(error){

        console.error(
          "recipeUpdate error:",
          error
        );

        POS.inventoryRecipesFormError(
          error?.message ||
          "แก้ไขสูตรไม่สำเร็จ"
        );

      }finally{

        saveButton.disabled =
          false;

        saveButton.style.opacity =
          "1";

      }

    };


  modal.style.display =
    "flex";

};


/* =====================================================
   RECIPES : CONFIRM DIALOG
   ===================================================== */

POS.inventoryRecipesConfirm = function(
  title,
  message
){

  return new Promise(function(resolve){

    const old =
      document.getElementById(
        "posInventoryRecipesConfirm"
      );

    if(old){
      old.remove();
    }

    const dialog =
      document.createElement("div");

    dialog.id =
      "posInventoryRecipesConfirm";

    dialog.style.cssText = `
      position:fixed;
      inset:0;
      z-index:100002;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(15,23,42,.52);
      backdrop-filter:blur(3px);
    `;

    dialog.innerHTML = `
      <div style="
        width:min(460px,100%);
        background:#fff;
        border-radius:20px;
        overflow:hidden;
        box-shadow:0 25px 70px rgba(15,23,42,.28);
        border:1px solid rgba(226,232,240,.9);
      ">

        <div style="
          padding:24px 24px 20px;
          text-align:center;
        ">

          <div style="
            width:58px;
            height:58px;
            margin:0 auto 14px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#fff7ed;
            color:#ea580c;
            font-size:28px;
            box-shadow:0 8px 22px rgba(234,88,12,.12);
          ">
            !
          </div>

          <div style="
            font-size:20px;
            font-weight:800;
            color:#1f2937;
            line-height:1.4;
          ">
            ${POS.inventoryRecipesEscape(title || "ยืนยัน")}
          </div>

          <div style="
            margin-top:7px;
            font-size:14px;
            color:#64748b;
            line-height:1.7;
          ">
            ${POS.inventoryRecipesEscape(message || "")}
          </div>

        </div>

        <div style="
          padding:15px 24px 20px;
          border-top:1px solid #eef1f4;
          display:flex;
          justify-content:center;
          gap:10px;
        ">

          <button
            type="button"
            id="posInventoryRecipesConfirmCancel"
            style="
              min-width:92px;
              min-height:42px;
              padding:0 18px;
              border:1px solid #d7dee8;
              border-radius:11px;
              background:#fff;
              color:#475569;
              font-size:14px;
              font-weight:800;
              cursor:pointer;
            "
          >
            ยกเลิก
          </button>

          <button
            type="button"
            id="posInventoryRecipesConfirmOk"
            style="
              min-width:92px;
              min-height:42px;
              padding:0 18px;
              border:1px solid #fecaca;
              border-radius:11px;
              background:#fff1f2;
              color:#dc2626;
              font-size:14px;
              font-weight:800;
              cursor:pointer;
            "
          >
            ลบรายการ
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(dialog);

    let done = false;

    const finish =
      function(value){

        if(done){
          return;
        }

        done = true;
        dialog.remove();
        resolve(value);

      };

    dialog.querySelector(
      "#posInventoryRecipesConfirmCancel"
    ).onclick =
      function(){
        finish(false);
      };

    dialog.querySelector(
      "#posInventoryRecipesConfirmOk"
    ).onclick =
      function(){
        finish(true);
      };

    dialog.addEventListener(
      "click",
      function(event){

        if(event.target === dialog){
          finish(false);
        }

      }
    );

  });

};


/* =====================================================
   RECIPES : DELETE
   ===================================================== */

POS.inventoryRecipesDelete = async function(id){

  const item =
    POS.inventoryRecipesData.find(
      function(row){

        return String(
          row?.id || ""
        ) === String(id);

      }
    );

  if(!item){
    return;
  }


  const confirmed =
    await POS.inventoryRecipesConfirm(
      "ยืนยันการลบวัตถุดิบ",
      "ต้องการลบ \"" +
      String(item.ingredient_name || "") +
      "\" ออกจากสูตรใช่หรือไม่?"
    );

  if(!confirmed){
    return;
  }


  try{

    const result =
      await POS.api.recipeDelete(
        id
      );

    if(
      !result ||
      result.success !== true
    ){
      throw new Error(
        result?.error ||
        result?.message ||
        "ลบรายการสูตรไม่สำเร็จ"
      );
    }


    await POS.inventoryRecipesLoad();

    const remaining =
      POS.inventoryRecipesData.filter(
        function(row){
          return String(row?.menu_id || "") === String(item.menu_id || "");
        }
      );

    if(remaining.length){
      POS.inventoryRecipesOpenManage(
        item.menu_id
      );
    }else{
      POS.inventoryRecipesCloseModal();
    }

  }catch(error){

    console.error(
      "recipeDelete error:",
      error
    );

    POS.inventoryRecipesMessage(
      "ลบรายการไม่สำเร็จ",
      error?.message ||
      "ไม่สามารถลบรายการสูตรได้"
    );

  }

};


/* =====================================================
   RECIPES : INIT
   ===================================================== */

POS.inventoryRecipesInit = function(){

  const addButton =
    document.getElementById(
      "posInventoryRecipesAddBtn"
    );

  const refreshButton =
    document.getElementById(
      "posInventoryRecipesRefreshBtn"
    );

  const searchInput =
    document.getElementById(
      "posInventoryRecipesSearch"
    );


  if(addButton){
    addButton.onclick =
      function(){

        POS.inventoryRecipesOpenAdd();

      };
  }


  if(refreshButton){
    refreshButton.onclick =
      function(){

        POS.inventoryRecipesLoad();

      };
  }


  if(searchInput){
    searchInput.oninput =
      function(){

        POS.inventoryRecipesRender();

      };
  }


  POS.inventoryRecipesLoad();

};


/* =====================================================
   RECIPES : AUTO INIT
   ===================================================== */

/*
 * หน้า Recipes ถูกสร้างแบบ Dynamic
 *
 * ใช้ MutationObserver เพื่อจับตอนที่หน้า Recipes
 * ถูกสร้าง/เปิดจริงทุกครั้ง
 *
 * จุดนี้แก้เฉพาะปัญหา:
 * "ต้องรีโหลดหน้า ถึงข้อมูลสูตรจะขึ้น"
 *
 * ไม่แตะ LOAD / API / MODAL / CRUD ส่วนอื่น
 */

(function initRecipesWhenReady(){

  let initializedTableBody = null;

  function tryInit(){

    const tableBody =
      document.getElementById(
        "posInventoryRecipesTableBody"
      );

    if(!tableBody){
      return;
    }

    /*
     * INIT เฉพาะเมื่อเป็น DOM ของหน้า Recipes
     * ที่เพิ่งถูกสร้างใหม่
     */
    if(initializedTableBody === tableBody){
      return;
    }

    initializedTableBody = tableBody;

    POS.inventoryRecipesInit();

  }


  /*
   * กรณีหน้า Recipes มีอยู่แล้วตอน JS ถูกโหลด
   */
  tryInit();


  /*
   * กรณีผู้ใช้กดเข้าหน้า Recipes ภายหลัง
   * ซึ่ง DOM ถูกสร้างแบบ Dynamic
   */
  const observer =
    new MutationObserver(function(){

      tryInit();

    });


  if(document.body){

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

})();
