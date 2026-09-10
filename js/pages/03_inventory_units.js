window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   STOCK PAGE 03 : UNITS
   หน่วยซื้อ / การแปลงหน่วย
   - หน่วยหลัก = หน่วยฐานของสต็อก
   - หน่วยซื้อ = หน่วยที่ใช้ตอนรับสินค้า
   - ตัวคูณ = จำนวนหน่วยฐานต่อ 1 หน่วยซื้อ
   ===================================================== */

POS.inventoryUnitsData =
  POS.inventoryUnitsData || [];


/* =====================================================
   PAGE
   ===================================================== */

POS.pages.inventoryUnits = async function(){

  // =====================================================
  // AUTO LOAD BACKEND WHEN PAGE 03 IS RENDERED
  // =====================================================

  if(POS.inventoryUnitsLoadObserver){
    try{
      POS.inventoryUnitsLoadObserver.disconnect();
    }catch(e){}
  }

  const loadUnitsPage = function(){
    const tableBody =
      document.getElementById("inventoryUnitsTableBody");

    if(tableBody){
      if(POS.inventoryUnitsLoad){
        POS.inventoryUnitsLoad();
      }
      return true;
    }

    return false;
  };

  if(!loadUnitsPage() && document.body){
    POS.inventoryUnitsLoadObserver =
      new MutationObserver(function(){
        if(loadUnitsPage()){
          try{
            POS.inventoryUnitsLoadObserver.disconnect();
          }catch(e){}
        }
      });

    POS.inventoryUnitsLoadObserver.observe(
      document.body,
      { childList:true, subtree:true }
    );
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
            📏 หน่วยซื้อ
          </h1>

          <p class="page-subtitle" style="
            margin:0;
            color:#64748b;
            font-size:15px;
          ">
            กำหนดหน่วยซื้อและตัวคูณจากหน่วยหลัก
          </p>
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        ">

          <button
            type="button"
            onclick="POS.inventoryBackToMain()"
            style="
              white-space:nowrap;
              padding:11px 18px;
              border-radius:10px;
              border:1px solid #d7dce2;
              background:#fff;
              color:#374151;
              font-weight:800;
              cursor:pointer;
            "
          >
            ← กลับ
          </button>

          <button
            type="button"
            onclick="POS.inventoryUnitsOpenAdd()"
            style="
              white-space:nowrap;
              padding:11px 18px;
              border-radius:10px;
              border:1px solid #b8d9c2;
              background:#e8f6ec;
              color:#267a3d;
              font-weight:800;
              cursor:pointer;
            "
          >
            ➕ เพิ่มหน่วยซื้อ
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

        <div class="card">
          <div style="
            color:#64748b;
            font-size:14px;
            margin-bottom:7px;
          ">
            🧂 วัตถุดิบที่กำหนดหน่วยซื้อ
          </div>

          <div
            id="inventoryUnitsIngredientCount"
            style="
              font-size:26px;
              font-weight:800;
              color:#1f2937;
            "
          >
            0
          </div>
        </div>


        <div class="card">
          <div style="
            color:#64748b;
            font-size:14px;
            margin-bottom:7px;
          ">
            📦 หน่วยซื้อทั้งหมด
          </div>

          <div
            id="inventoryUnitsCount"
            style="
              font-size:26px;
              font-weight:800;
              color:#1f2937;
            "
          >
            0
          </div>
        </div>


        <div class="card">
          <div style="
            color:#64748b;
            font-size:14px;
            margin-bottom:7px;
          ">
            🔢 การแปลงหน่วย
          </div>

          <div
            id="inventoryUnitsConversionCount"
            style="
              font-size:26px;
              font-weight:800;
              color:#1f2937;
            "
          >
            0
          </div>
        </div>

      </div>


      <!-- =================================================
           MAIN LIST
           ================================================= -->
      <div class="card" style="
        border:1px solid #eef1f4;
        border-radius:18px;
        box-shadow:0 8px 25px rgba(15,23,42,.06);
        overflow:hidden;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
          padding:20px;
          border-bottom:1px solid #eef1f4;
        ">

          <div>
            <div style="
              font-size:19px;
              font-weight:800;
              color:#1f2937;
            ">
              📏 รายการหน่วยซื้อ
            </div>

            <div style="
              margin-top:4px;
              color:#94a3b8;
              font-size:13px;
            ">
              ตัวอย่าง ลัง 12 = 12 ขวด, ลัง 24 = 24 ขวด
            </div>
          </div>

          <button
            type="button"
            onclick="POS.inventoryUnitsLoad && POS.inventoryUnitsLoad()"
            style="
              white-space:nowrap;
              padding:9px 14px;
              border-radius:9px;
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


        <div style="
          padding:16px 20px;
          background:#fafbfc;
          border-bottom:1px solid #f0f2f4;
        ">
          <input
            id="inventoryUnitsSearch"
            type="text"
            placeholder="🔎 ค้นหาวัตถุดิบ / หน่วยซื้อ..."
            oninput="POS.inventoryUnitsRender()"
            style="
              width:100%;
              box-sizing:border-box;
              padding:11px 14px;
              border:1px solid #dfe3e8;
              border-radius:10px;
              background:#fff;
              font-size:14px;
              outline:none;
            "
          >
        </div>


        <div style="
          width:100%;
          overflow-x:auto;
        ">

          <table style="
            width:100%;
            min-width:850px;
            border-collapse:collapse;
          ">

            <thead>
              <tr style="
                border-bottom:2px solid #eef1f4;
                text-align:left;
              ">
                <th style="padding:13px 14px;">#</th>
                <th style="padding:13px 14px;">วัตถุดิบ</th>
                <th style="padding:13px 14px;">หน่วยหลัก</th>
                <th style="padding:13px 14px;">หน่วยซื้อ</th>
                <th style="padding:13px 14px;text-align:right;">
                  ตัวคูณ
                </th>
                <th style="padding:13px 14px;">
                  ความหมาย
                </th>
                <th style="padding:13px 14px;text-align:center;">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody id="inventoryUnitsTableBody">

              <tr>
                <td colspan="7" style="
                  padding:55px 20px;
                  text-align:center;
                ">

                  <div style="
                    width:64px;
                    height:64px;
                    margin:0 auto 14px;
                    border-radius:50%;
                    background:#f1f5f9;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:30px;
                  ">
                    📏
                  </div>

                  <div style="
                    font-size:17px;
                    font-weight:800;
                    color:#475569;
                    margin-bottom:6px;
                  ">
                    ยังไม่มีหน่วยซื้อ
                  </div>

                  <div style="
                    color:#94a3b8;
                    font-size:14px;
                  ">
                    กดปุ่ม <strong>➕ เพิ่มหน่วยซื้อ</strong>
                    เพื่อเริ่มกำหนดหน่วย
                  </div>

                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <!-- =================================================
           ADD / EDIT MODAL
           ================================================= -->
      <div
        id="inventoryUnitsModal"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:10000;
          align-items:center;
          justify-content:center;
          padding:20px;
          box-sizing:border-box;
          background:rgba(15,23,42,.42);
          backdrop-filter:blur(2px);
        "
      >

        <div style="
          width:100%;
          max-width:620px;
          max-height:92vh;
          background:#fff;
          border-radius:20px;
          box-shadow:0 24px 70px rgba(15,23,42,.22);
          overflow:hidden;
          display:flex;
          flex-direction:column;
        ">

          <!-- MODAL HEADER -->
          <div style="
            padding:20px 24px;
            border-bottom:1px solid #eef1f4;
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">

            <div>
              <div
                id="inventoryUnitsModalTitle"
                style="
                  font-size:23px;
                  font-weight:800;
                  color:#1f2937;
                "
              >
                📏 เพิ่มหน่วยซื้อ
              </div>

              <div style="
                margin-top:4px;
                color:#94a3b8;
                font-size:13px;
              ">
                กำหนดว่าหน่วยซื้อ 1 หน่วย เท่ากับกี่หน่วยหลัก
              </div>
            </div>

            <button
              type="button"
              onclick="POS.inventoryUnitsCloseModal()"
              style="
                width:38px;
                height:38px;
                border:1px solid #e2e8f0;
                border-radius:10px;
                background:#fff;
                color:#64748b;
                font-size:20px;
                cursor:pointer;
              "
            >
              ✕
            </button>

          </div>


          <!-- FORM -->
          <div style="
            padding:20px 24px 24px;
            overflow-y:auto;
          ">

            <div
              id="inventoryUnitsFormMessage"
              style="
                display:none;
                margin-bottom:15px;
                padding:11px 13px;
                border-radius:10px;
                background:#fff7ed;
                border:1px solid #fed7aa;
                color:#9a3412;
                font-size:14px;
                font-weight:700;
              "
            ></div>


            <div style="
              margin-bottom:17px;
            ">

              <label style="
                display:block;
                margin-bottom:7px;
                font-weight:700;
                color:#374151;
              ">
                วัตถุดิบ
              </label>

              <select
                id="inventoryUnitsIngredient"
                onchange="POS.inventoryUnitsIngredientChanged()"
                style="
                  width:100%;
                  box-sizing:border-box;
                  padding:11px 13px;
                  border:1px solid #dfe3e8;
                  border-radius:10px;
                  background:#fff;
                  font-size:14px;
                "
              >
                <option value="">-- เลือกวัตถุดิบ --</option>
              </select>

            </div>


            <div style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:14px;
              margin-bottom:17px;
            ">

              <div>

                <label style="
                  display:block;
                  margin-bottom:7px;
                  font-weight:700;
                  color:#374151;
                ">
                  หน่วยหลัก (ฐาน)
                </label>

                <input
                  id="inventoryUnitsBaseUnit"
                  type="text"
                  readonly
                  placeholder="หน่วยหลัก"
                  style="
                    width:100%;
                    box-sizing:border-box;
                    padding:11px 13px;
                    border:1px solid #e2e8f0;
                    border-radius:10px;
                    background:#f8fafc;
                    color:#64748b;
                    font-size:14px;
                  "
                >

              </div>


              <div>

                <label style="
                  display:block;
                  margin-bottom:7px;
                  font-weight:700;
                  color:#374151;
                ">
                  หน่วยซื้อ
                </label>

                <input
                  id="inventoryUnitsName"
                  type="text"
                  placeholder="เช่น ลัง 12"
                  style="
                    width:100%;
                    box-sizing:border-box;
                    padding:11px 13px;
                    border:1px solid #dfe3e8;
                    border-radius:10px;
                    background:#fff;
                    font-size:14px;
                  "
                >

              </div>

            </div>


            <div style="
              padding:16px;
              border:1px solid #e7ecef;
              border-radius:14px;
              background:#fafcfd;
              margin-bottom:17px;
            ">

              <div style="
                font-size:16px;
                font-weight:800;
                color:#1f2937;
                margin-bottom:12px;
              ">
                🔢 การแปลงหน่วย
              </div>

              <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:14px;
                align-items:end;
              ">

                <div>

                  <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:700;
                    color:#374151;
                  ">
                    ตัวคูณ
                  </label>

                  <input
                    id="inventoryUnitsMultiplier"
                    type="number"
                    min="0.000001"
                    step="any"
                    placeholder="12"
                    oninput="POS.inventoryUnitsUpdatePreview()"
                    style="
                      width:100%;
                      box-sizing:border-box;
                      padding:11px 13px;
                      border:1px solid #dfe3e8;
                      border-radius:10px;
                      background:#fff;
                      font-size:14px;
                    "
                  >

                </div>


                <div
                  id="inventoryUnitsPreview"
                  style="
                    min-height:43px;
                    display:flex;
                    align-items:center;
                    padding:10px 13px;
                    box-sizing:border-box;
                    border:1px solid #e2e8f0;
                    border-radius:10px;
                    background:#f8fafc;
                    color:#64748b;
                    font-size:14px;
                    font-weight:700;
                  "
                >
                  ตัวอย่าง: 1 หน่วยซื้อ = ? หน่วยหลัก
                </div>

              </div>

            </div>


            <div style="
              padding:13px 14px;
              border-radius:11px;
              background:#f0fdf4;
              border:1px solid #bbf7d0;
              color:#166534;
              font-size:13px;
              line-height:1.6;
            ">
              💡 ตัวอย่าง: ถ้าหน่วยหลักเป็น <strong>ขวด</strong>
              และหน่วยซื้อเป็น <strong>ลัง 12</strong>
              ให้ใส่ตัวคูณ <strong>12</strong>
              ระบบจะถือว่า 1 ลัง = 12 ขวด
            </div>

          </div>


          <!-- FOOTER -->
          <div style="
            padding:16px 24px 20px;
            border-top:1px solid #eef1f4;
            display:flex;
            justify-content:flex-end;
            gap:10px;
            background:#fff;
          ">

            <button
              type="button"
              onclick="POS.inventoryUnitsCloseModal()"
              style="
                min-width:100px;
                padding:11px 18px;
                border-radius:10px;
                border:1px solid #d7dce2;
                background:#fff;
                color:#4b5563;
                font-weight:700;
                cursor:pointer;
              "
            >
              ❌ ยกเลิก
            </button>

            <button
              type="button"
              onclick="POS.inventoryUnitsSave()"
              style="
                min-width:130px;
                padding:11px 18px;
                border-radius:10px;
                border:1px solid #b8d9c2;
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

      </div>

    </div>
  `;
};


/* =====================================================
   OPEN MODAL
   ===================================================== */

POS.inventoryUnitsEditingId = null;

POS.inventoryUnitsOpenAdd = function(){

  const modal =
    document.getElementById("inventoryUnitsModal");

  if(!modal){
    return;
  }

  POS.inventoryUnitsEditingId = null;

  const title =
    document.getElementById("inventoryUnitsModalTitle");

  if(title){
    title.textContent = "📏 เพิ่มหน่วยซื้อ";
  }

  POS.inventoryUnitsPrepareIngredientSelect();

  const ingredient =
    document.getElementById("inventoryUnitsIngredient");

  const name =
    document.getElementById("inventoryUnitsName");

  const multiplier =
    document.getElementById("inventoryUnitsMultiplier");

  if(ingredient){
    ingredient.value = "";
  }

  if(name){
    name.value = "";
  }

  if(multiplier){
    multiplier.value = "";
  }

  POS.inventoryUnitsIngredientChanged();
  POS.inventoryUnitsSetMessage("");

  modal.style.display = "flex";
};


/* =====================================================
   CLOSE MODAL
   ===================================================== */

POS.inventoryUnitsCloseModal = function(){

  const modal =
    document.getElementById("inventoryUnitsModal");

  if(modal){
    modal.style.display = "none";
  }

  POS.inventoryUnitsEditingId = null;
};


/* =====================================================
   PREPARE INGREDIENT SELECT
   ใช้ข้อมูลจาก PAGE 01 ที่ผ่านแล้ว
   ===================================================== */

POS.inventoryUnitsPrepareIngredientSelect = function(){

  const select =
    document.getElementById("inventoryUnitsIngredient");

  if(!select){
    return;
  }

  select.innerHTML =
    `<option value="">-- เลือกวัตถุดิบ --</option>`;

  const items =
    Array.isArray(POS.inventoryItemsData)
      ? POS.inventoryItemsData
      : [];

  items.forEach(function(item){

    const option =
      document.createElement("option");

    option.value =
      String(item?.id || "");

    option.textContent =
      String(item?.sku || "-") +
      " — " +
      String(item?.name || "-");

    option.dataset.baseUnit =
      String(item?.base_unit || "");

    select.appendChild(option);
  });
};


/* =====================================================
   INGREDIENT CHANGED
   ===================================================== */

POS.inventoryUnitsIngredientChanged = function(){

  const select =
    document.getElementById("inventoryUnitsIngredient");

  const baseUnit =
    document.getElementById("inventoryUnitsBaseUnit");

  const selected =
    select?.options[
      select.selectedIndex
    ];

  if(baseUnit){
    baseUnit.value =
      selected?.dataset?.baseUnit || "";
  }

  POS.inventoryUnitsUpdatePreview();
};


/* =====================================================
   PREVIEW
   ===================================================== */

POS.inventoryUnitsUpdatePreview = function(){

  const preview =
    document.getElementById("inventoryUnitsPreview");

  const baseUnit =
    document.getElementById("inventoryUnitsBaseUnit");

  const multiplier =
    document.getElementById("inventoryUnitsMultiplier");

  if(!preview){
    return;
  }

  const unit =
    String(baseUnit?.value || "").trim();

  const factor =
    Number(multiplier?.value || 0);

  if(!unit || !Number.isFinite(factor) || factor <= 0){

    preview.textContent =
      "ตัวอย่าง: 1 หน่วยซื้อ = ? หน่วยหลัก";

    return;
  }

  preview.textContent =
    `1 หน่วยซื้อ = ${factor.toLocaleString(
      "th-TH",
      {
        maximumFractionDigits:6
      }
    )} ${unit}`;
};


/* =====================================================
   FORM MESSAGE
   ===================================================== */

POS.inventoryUnitsSetMessage = function(message){

  const el =
    document.getElementById(
      "inventoryUnitsFormMessage"
    );

  if(!el){
    return;
  }

  el.textContent =
    String(message || "");

  el.style.display =
    message
      ? "block"
      : "none";
};


/* =====================================================
   SAVE
   บันทึกลง Backend จริง
   ===================================================== */

POS.inventoryUnitsSave = async function(){

  const ingredient =
    document.getElementById(
      "inventoryUnitsIngredient"
    );

  const nameInput =
    document.getElementById(
      "inventoryUnitsName"
    );

  const multiplierInput =
    document.getElementById(
      "inventoryUnitsMultiplier"
    );

  const selected =
    ingredient?.options[
      ingredient.selectedIndex
    ];

  const ingredientId =
    String(
      ingredient?.value || ""
    );

  const unitName =
    String(
      nameInput?.value || ""
    ).trim();

  const baseUnit =
    String(
      selected?.dataset?.baseUnit || ""
    ).trim();

  const multiplier =
    Number(
      multiplierInput?.value || 0
    );


  if(!ingredientId){
    POS.inventoryUnitsSetMessage(
      "กรุณาเลือกวัตถุดิบก่อน"
    );
    return;
  }


  if(!baseUnit){
    POS.inventoryUnitsSetMessage(
      "วัตถุดิบนี้ยังไม่มีหน่วยหลัก"
    );
    return;
  }


  if(!unitName){
    POS.inventoryUnitsSetMessage(
      "กรุณากรอกชื่อหน่วยซื้อ"
    );
    return;
  }


  if(
    !Number.isFinite(multiplier) ||
    multiplier <= 0
  ){
    POS.inventoryUnitsSetMessage(
      "กรุณากรอกตัวคูณให้มากกว่า 0"
    );
    return;
  }


  POS.inventoryUnitsSetMessage(
    "กำลังบันทึก..."
  );

  try{

    let result;

    const payload = {
      ingredient_id: ingredientId,
      unit_name: unitName,
      multiple: multiplier,
      base_qty: 1,
      cost_per_unit: 0
    };


    if(POS.inventoryUnitsEditingId){

      result =
        await POS.api.purchaseUnitUpdate({
          id: POS.inventoryUnitsEditingId,
          ingredient_id: ingredientId,
          unit_name: unitName,
          multiple: multiplier,
          base_qty: 1,
          cost_per_unit: 0,
          active: true
        });

    }else{

      result =
        await POS.api.purchaseUnitAdd(
          payload
        );
    }


    if(!result?.success){
      POS.inventoryUnitsSetMessage(
        result?.error ||
        "ไม่สามารถบันทึกหน่วยซื้อได้"
      );
      return;
    }


    POS.inventoryUnitsCloseModal();

    await POS.inventoryUnitsLoad();

  }catch(error){

    console.error(
      "inventoryUnitsSave error:",
      error
    );

    POS.inventoryUnitsSetMessage(
      error?.message ||
      "ไม่สามารถบันทึกหน่วยซื้อได้"
    );
  }

};


/* =====================================================
   EDIT
   ===================================================== */

POS.inventoryUnitsEdit = function(id){

  const item =
    POS.inventoryUnitsData.find(
      function(row){
        return String(row.id) ===
          String(id);
      }
    );

  if(!item){
    return;
  }

  const modal =
    document.getElementById(
      "inventoryUnitsModal"
    );

  if(!modal){
    return;
  }

  POS.inventoryUnitsEditingId =
    item.id;

  const title =
    document.getElementById(
      "inventoryUnitsModalTitle"
    );

  if(title){
    title.textContent =
      "✏️ แก้ไขหน่วยซื้อ";
  }

  POS.inventoryUnitsPrepareIngredientSelect();

  const ingredient =
    document.getElementById(
      "inventoryUnitsIngredient"
    );

  const name =
    document.getElementById(
      "inventoryUnitsName"
    );

  const multiplier =
    document.getElementById(
      "inventoryUnitsMultiplier"
    );

  if(ingredient){
    ingredient.value =
      String(item.ingredient_id || "");
  }

  POS.inventoryUnitsIngredientChanged();

  if(name){
    name.value =
      String(item.unit_name || "");
  }

  if(multiplier){
    multiplier.value =
      String(
        item.multiple ??
        item.multiplier ??
        1
      );
  }

  POS.inventoryUnitsUpdatePreview();
  POS.inventoryUnitsSetMessage("");

  modal.style.display = "flex";
};


/* =====================================================
   DELETE
   ลบจาก Backend จริง
   ===================================================== */

POS.inventoryUnitsDelete = async function(id){

  const index =
    POS.inventoryUnitsData.findIndex(
      function(row){
        return String(row.id) ===
          String(id);
      }
    );

  if(index < 0){
    return;
  }

  try{

    const result =
      await POS.api.purchaseUnitDelete(id);

    if(!result?.success){
      console.error(
        "inventoryUnitsDelete error:",
        result?.error
      );
      return;
    }

    await POS.inventoryUnitsLoad();

  }catch(error){

    console.error(
      "inventoryUnitsDelete exception:",
      error
    );
  }
};


/* =====================================================
   RENDER
   ===================================================== */

POS.inventoryUnitsRender = function(){

  const body =
    document.getElementById(
      "inventoryUnitsTableBody"
    );

  if(!body){
    return;
  }

  const search =
    String(
      document.getElementById(
        "inventoryUnitsSearch"
      )?.value || ""
    ).trim().toLowerCase();


  const items =
    Array.isArray(POS.inventoryUnitsData)
      ? POS.inventoryUnitsData
      : [];


  const filtered =
    items.filter(function(item){

      if(!search){
        return true;
      }

      const text =
        [
          item?.ingredient_name,
          item?.base_unit,
          item?.unit_name
        ]
          .join(" ")
          .toLowerCase();

      return text.includes(search);
    });


  const ingredientIds =
    new Set(
      items.map(function(item){
        return String(
          item?.ingredient_id || ""
        );
      })
    );


  const ingredientCountEl =
    document.getElementById(
      "inventoryUnitsIngredientCount"
    );

  const countEl =
    document.getElementById(
      "inventoryUnitsCount"
    );

  const conversionCountEl =
    document.getElementById(
      "inventoryUnitsConversionCount"
    );


  if(ingredientCountEl){
    ingredientCountEl.textContent =
      ingredientIds.size.toLocaleString("th-TH");
  }

  if(countEl){
    countEl.textContent =
      items.length.toLocaleString("th-TH");
  }

  if(conversionCountEl){
    conversionCountEl.textContent =
      items.length.toLocaleString("th-TH");
  }


  if(!filtered.length){

    body.innerHTML = `
      <tr>
        <td colspan="7" style="
          padding:55px 20px;
          text-align:center;
        ">

          <div style="
            font-size:34px;
            margin-bottom:10px;
          ">
            📏
          </div>

          <div style="
            font-size:17px;
            font-weight:800;
            color:#475569;
            margin-bottom:6px;
          ">
            ${
              search
                ? "ไม่พบรายการที่ค้นหา"
                : "ยังไม่มีหน่วยซื้อ"
            }
          </div>

          <div style="
            color:#94a3b8;
            font-size:14px;
          ">
            ${
              search
                ? "ลองเปลี่ยนคำค้นหา"
                : "กดปุ่ม ➕ เพิ่มหน่วยซื้อ เพื่อเริ่มกำหนดหน่วย"
            }
          </div>

        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    filtered.map(function(item,index){

      const factor =
        Number(item?.multiplier || 0);

      const baseUnit =
        POS.inventoryUnitsEscapeHtml(
          item?.base_unit || ""
        );

      const unitName =
        POS.inventoryUnitsEscapeHtml(
          item?.unit_name || ""
        );

      const ingredientName =
        POS.inventoryUnitsEscapeHtml(
          item?.ingredient_name || "-"
        );

      return `
        <tr style="
          border-bottom:1px solid #eef1f4;
        ">

          <td style="
            padding:14px;
            color:#94a3b8;
            font-weight:700;
          ">
            ${index + 1}
          </td>


          <td style="
            padding:14px;
          ">
            <div style="
              font-weight:800;
              color:#1f2937;
            ">
              ${ingredientName}
            </div>
          </td>


          <td style="
            padding:14px;
            color:#64748b;
          ">
            ${baseUnit}
          </td>


          <td style="
            padding:14px;
            font-weight:800;
            color:#1f2937;
          ">
            ${unitName}
          </td>


          <td style="
            padding:14px;
            text-align:right;
            font-weight:800;
            color:#1f2937;
          ">
            ${factor.toLocaleString(
              "th-TH",
              {
                maximumFractionDigits:6
              }
            )}
          </td>


          <td style="
            padding:14px;
            color:#64748b;
          ">
            1 ${unitName} = ${factor.toLocaleString(
              "th-TH",
              {
                maximumFractionDigits:6
              }
            )} ${baseUnit}
          </td>


          <td style="
            padding:14px;
            text-align:center;
            white-space:nowrap;
          ">

            <button
              type="button"
              onclick="POS.inventoryUnitsEdit('${POS.inventoryUnitsEscapeAttr(item.id)}')"
              style="
                width:36px;
                height:36px;
                border:1px solid #dbeafe;
                border-radius:9px;
                background:#eff6ff;
                color:#2563eb;
                cursor:pointer;
                font-weight:800;
                margin-right:5px;
              "
              title="แก้ไข"
            >
              ✏️
            </button>

            <button
              type="button"
              onclick="POS.inventoryUnitsDelete('${POS.inventoryUnitsEscapeAttr(item.id)}')"
              style="
                width:36px;
                height:36px;
                border:1px solid #f0caca;
                border-radius:9px;
                background:#fff5f5;
                color:#c0392b;
                cursor:pointer;
                font-weight:800;
              "
              title="ลบ"
            >
              🗑️
            </button>

          </td>

        </tr>
      `;

    }).join("");

};


/* =====================================================
   LOAD
   โหลดจาก Backend จริง
   ===================================================== */

POS.inventoryUnitsLoad = async function(){

  try{

    if(!POS.api?.purchaseUnitsList){
      console.error(
        "inventoryUnitsLoad: purchaseUnitsList ไม่พร้อมใช้งาน"
      );
      POS.inventoryUnitsRender();
      return;
    }

    const result =
      await POS.api.purchaseUnitsList();

    if(!result?.success){
      console.error(
        "inventoryUnitsLoad error:",
        result?.error
      );
      POS.inventoryUnitsRender();
      return;
    }

    const rows =
      Array.isArray(result.data)
        ? result.data
        : [];

    POS.inventoryUnitsData =
      rows.map(function(row){

        const ingredientName =
          String(
            row?.name ||
            row?.ingredient_name ||
            "-"
          );

        return {
          id: row?.id,
          ingredient_id: row?.ingredient_id,
          ingredient_name: ingredientName,
          sku: row?.sku || "",
          base_unit: row?.base_unit || "",
          unit_name: row?.unit_name || "",
          multiplier: Number(
            row?.multiple ??
            row?.multiplier ??
            1
          ),
          multiple: Number(
            row?.multiple ??
            row?.multiplier ??
            1
          ),
          base_qty: Number(
            row?.base_qty ?? 1
          ),
          cost_per_unit: Number(
            row?.cost_per_unit ?? 0
          ),
          active: row?.active !== false,
          created_at: row?.created_at,
          updated_at: row?.updated_at
        };
      });

    POS.inventoryUnitsRender();

  }catch(error){

    console.error(
      "inventoryUnitsLoad exception:",
      error
    );

    POS.inventoryUnitsRender();
  }

};


/* =====================================================
   ESCAPE
   ===================================================== */

POS.inventoryUnitsEscapeHtml = function(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

};

POS.inventoryUnitsEscapeAttr = function(value){

  return POS.inventoryUnitsEscapeHtml(value)
    .replace(/`/g,"&#096;");

};


/* =====================================================
   AUTO RENDER
   ===================================================== */

POS.inventoryUnitsRender();

