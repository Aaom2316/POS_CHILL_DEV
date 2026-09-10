window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   STOCK PAGE 02 : PURCHASE
   รับสินค้าเข้าแบบ "บิล"
   - 1 บิล = หลายรายการวัตถุดิบ
   - เพิ่มรายการเข้าบิลก่อน
   - ตรวจรายการทั้งหมด
   - ค่อยบันทึกบิลทีเดียว
   ===================================================== */

POS.inventoryPurchaseDraftItems =
  POS.inventoryPurchaseDraftItems || [];

/* =====================================================
   PURCHASE UNITS CACHE
   ===================================================== */

POS.inventoryPurchaseUnitsData =
  POS.inventoryPurchaseUnitsData || [];


/* =====================================================
   PAGE
   ===================================================== */

POS.pages.inventoryPurchase = async function(){

  setTimeout(function(){
    if(typeof POS.inventoryPurchaseLoad === "function"){
      POS.inventoryPurchaseLoad();
    }
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
            🛒 ซื้อเข้า
          </h1>

          <p class="page-subtitle" style="
            margin:0;
            color:#64748b;
            font-size:15px;
          ">
            รับวัตถุดิบเข้าสู่สต็อก
          </p>
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
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
              font-weight:700;
              cursor:pointer;
            "
          >
            ← กลับ
          </button>

          <button
            type="button"
            onclick="POS.inventoryPurchaseOpenAdd()"
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
            ➕ รับสินค้าเข้า
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

        <div class="card">
          <div style="color:#64748b;font-size:14px;margin-bottom:7px;">
            📥 รายการรับเข้าทั้งหมด
          </div>
          <div id="inventoryPurchaseTotal"
            style="font-size:26px;font-weight:800;color:#1f2937;">
            0
          </div>
        </div>

        <div class="card">
          <div style="color:#64748b;font-size:14px;margin-bottom:7px;">
            📦 จำนวนที่รับเข้า
          </div>
          <div id="inventoryPurchaseQty"
            style="font-size:26px;font-weight:800;color:#1f2937;">
            0
          </div>
        </div>

        <div class="card">
          <div style="color:#64748b;font-size:14px;margin-bottom:7px;">
            🧾 จำนวนบิล
          </div>
          <div id="inventoryPurchaseBills"
            style="font-size:26px;font-weight:800;color:#1f2937;">
            0
          </div>
        </div>

        <div class="card">
          <div style="color:#64748b;font-size:14px;margin-bottom:7px;">
            💰 มูลค่ารับเข้ารวม
          </div>
          <div id="inventoryPurchaseValue"
            style="font-size:26px;font-weight:800;color:#1f2937;">
            0.00 บาท
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
              📥 รายการรับเข้า
            </div>

            <div style="
              margin-top:4px;
              color:#94a3b8;
              font-size:13px;
            ">
              ประวัติการรับวัตถุดิบเข้าสู่สต็อก
            </div>
          </div>

          <button
            type="button"
            onclick="POS.inventoryPurchaseLoad && POS.inventoryPurchaseLoad()"
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
            id="inventoryPurchaseSearch"
            type="text"
            placeholder="🔎 ค้นหาเลขที่รับเข้า / วัตถุดิบ..."
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


        <div style="width:100%;overflow-x:auto;">

          <table style="
            width:100%;
            min-width:950px;
            border-collapse:collapse;
          ">

            <thead>
              <tr style="
                border-bottom:2px solid #eef1f4;
                text-align:left;
              ">

                <th style="padding:13px 14px;">#</th>
                <th style="padding:13px 14px;">เลขที่รับเข้า</th>
                <th style="padding:13px 14px;">วันที่</th>
                <th style="padding:13px 14px;">ร้านค้า</th>

                <th style="
                  padding:13px 14px;
                  text-align:right;
                ">
                  รวม
                </th>

                <th style="
                  padding:13px 14px;
                  text-align:center;
                ">
                  สถานะ
                </th>

              </tr>
            </thead>

            <tbody id="inventoryPurchaseTableBody">

              <tr>
                <td colspan="6" style="
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
                    📥
                  </div>

                  <div style="
                    font-size:17px;
                    font-weight:800;
                    color:#475569;
                    margin-bottom:6px;
                  ">
                    ยังไม่มีรายการรับเข้า
                  </div>

                  <div style="
                    color:#94a3b8;
                    font-size:14px;
                  ">
                    กดปุ่ม <strong>➕ รับสินค้าเข้า</strong>
                    เพื่อเริ่มสร้างบิล
                  </div>

                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <!-- =================================================
           PURCHASE BILL DETAIL MODAL
           ================================================= -->
      <div
        id="inventoryPurchaseDetailModal"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:10001;
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
          max-width:900px;
          max-height:92vh;
          background:#fff;
          border-radius:20px;
          box-shadow:0 24px 70px rgba(15,23,42,.22);
          overflow:hidden;
          display:flex;
          flex-direction:column;
        ">
          <div style="
            padding:20px 24px;
            border-bottom:1px solid #eef1f4;
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">
            <div>
              <div style="font-size:23px;font-weight:800;color:#1f2937;">
                🧾 รายละเอียดบิลรับเข้า
              </div>
              <div id="inventoryPurchaseDetailSubtitle"
                style="margin-top:4px;color:#94a3b8;font-size:13px;">
                รายละเอียดรายการรับวัตถุดิบ
              </div>
            </div>
            <button type="button"
              onclick="POS.inventoryPurchaseCloseDetail()"
              style="
                width:38px;height:38px;border:1px solid #e2e8f0;
                border-radius:10px;background:#fff;color:#64748b;
                font-size:20px;cursor:pointer;
              ">✕</button>
          </div>
          <div id="inventoryPurchaseDetailContent"
            style="padding:20px 24px 24px;overflow-y:auto;"></div>
        </div>
      </div>


      <!-- =================================================
           PURCHASE BILL MODAL
           ================================================= -->
      <div
        id="inventoryPurchaseModal"
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
          max-width:760px;
          max-height:92vh;
          background:#fff;
          border-radius:20px;
          box-shadow:0 24px 70px rgba(15,23,42,.22);
          overflow:hidden;
          display:flex;
          flex-direction:column;
        ">

          <!-- BILL HEADER -->
          <div style="
            padding:20px 24px;
            border-bottom:1px solid #eef1f4;
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">

            <div>
              <div style="
                font-size:23px;
                font-weight:800;
                color:#1f2937;
              ">
                🛒 ซื้อสินค้าเข้า
              </div>

              <div style="
                margin-top:4px;
                color:#94a3b8;
                font-size:13px;
              ">
                เพิ่มหลายรายการในบิลเดียว แล้วบันทึกพร้อมกัน
              </div>
            </div>

            <button
              type="button"
              onclick="POS.inventoryPurchaseCloseAdd()"
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


          <!-- BILL INFO -->
          <div style="
            padding:20px 24px 8px;
            overflow-y:auto;
          ">

            <div style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:14px;
              margin-bottom:18px;
            ">

              <div>
                <label style="
                  display:block;
                  margin-bottom:7px;
                  font-weight:700;
                  color:#374151;
                ">
                  วันที่
                </label>

                <input
                  id="inventoryPurchaseDate"
                  type="date"
                  style="
                    width:100%;
                    box-sizing:border-box;
                    padding:11px 13px;
                    border:1px solid #dfe3e8;
                    border-radius:10px;
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
                  เลขที่บิล
                </label>

                <input
                  id="inventoryPurchaseNumber"
                  type="text"
                  readonly
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

            </div>


            <div style="margin-bottom:20px;">

              <label style="
                display:block;
                margin-bottom:7px;
                font-weight:700;
                color:#374151;
              ">
                ร้านค้า
              </label>

              <input
                id="inventoryPurchaseSupplier"
                type="text"
                placeholder="เช่น ร้านวัตถุดิบ ABC"
                style="
                  width:100%;
                  box-sizing:border-box;
                  padding:11px 13px;
                  border:1px solid #dfe3e8;
                  border-radius:10px;
                  font-size:14px;
                "
              >

            </div>


            <!-- ADD ITEM -->
            <div style="
              padding:18px;
              border:1px solid #e7ecef;
              border-radius:15px;
              background:#fafcfd;
              margin-bottom:18px;
            ">

              <div style="
                font-size:17px;
                font-weight:800;
                color:#1f2937;
                margin-bottom:14px;
              ">
                📦 เพิ่มรายการเข้าบิล
              </div>


              <div style="
                display:grid;
                grid-template-columns:2fr 1fr;
                gap:12px;
                margin-bottom:12px;
              ">

                <div>
                  <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:700;
                    color:#374151;
                    font-size:14px;
                  ">
                    วัตถุดิบ
                  </label>

                  <select
                    id="inventoryPurchaseIngredient"
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


                <div>
                  <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:700;
                    color:#374151;
                    font-size:14px;
                  ">
                    หน่วย
                  </label>

                  <select
                    id="inventoryPurchaseUnit"
                    disabled
                    style="
                      width:100%;
                      box-sizing:border-box;
                      padding:11px 13px;
                      border:1px solid #dfe3e8;
                      border-radius:10px;
                      background:#f8fafc;
                      color:#64748b;
                      font-size:14px;
                    "
                  >
                    <option value="">-- เลือกหน่วย --</option>
                  </select>
                </div>

              </div>


              <div style="
                display:grid;
                grid-template-columns:1fr 1fr 1fr;
                gap:12px;
                align-items:end;
              ">

                <div>
                  <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:700;
                    color:#374151;
                    font-size:14px;
                  ">
                    จำนวน
                  </label>

                  <input
                    id="inventoryPurchaseQuantity"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    style="
                      width:100%;
                      box-sizing:border-box;
                      padding:11px 13px;
                      border:1px solid #dfe3e8;
                      border-radius:10px;
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
                    font-size:14px;
                  ">
                    ราคารวม
                  </label>

                  <input
                    id="inventoryPurchaseCost"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    style="
                      width:100%;
                      box-sizing:border-box;
                      padding:11px 13px;
                      border:1px solid #dfe3e8;
                      border-radius:10px;
                      font-size:14px;
                    "
                  >
                </div>


                <button
                  type="button"
                  onclick="POS.inventoryPurchaseAddItem()"
                  style="
                    min-height:43px;
                    padding:10px 15px;
                    border:1px solid #b8d9c2;
                    border-radius:10px;
                    background:#e8f6ec;
                    color:#267a3d;
                    font-weight:800;
                    cursor:pointer;
                  "
                >
                  ➕ เพิ่มเข้าบิล
                </button>

              </div>

            </div>


            <!-- BILL ITEMS -->
            <div style="
              margin-bottom:18px;
            ">

              <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
                margin-bottom:10px;
              ">

                <div style="
                  font-size:17px;
                  font-weight:800;
                  color:#1f2937;
                ">
                  📋 รายการในบิล
                </div>

                <div
                  id="inventoryPurchaseDraftCount"
                  style="
                    padding:5px 10px;
                    border-radius:999px;
                    background:#f1f5f9;
                    color:#64748b;
                    font-size:13px;
                    font-weight:700;
                  "
                >
                  0 รายการ
                </div>

              </div>


              <div
                id="inventoryPurchaseDraftList"
                style="
                  border:1px dashed #d7dde3;
                  border-radius:12px;
                  overflow:hidden;
                  background:#fff;
                "
              >
                <div style="
                  padding:25px 15px;
                  text-align:center;
                  color:#94a3b8;
                  font-size:14px;
                ">
                  ยังไม่มีรายการในบิล
                </div>
              </div>

            </div>


            <!-- BILL TOTAL -->
            <div style="
              display:flex;
              justify-content:flex-end;
              margin-bottom:18px;
            ">

              <div style="
                width:100%;
                max-width:340px;
                padding:16px 18px;
                border-radius:14px;
                background:#f8fafc;
                border:1px solid #e7edf2;
              ">

                <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  gap:15px;
                ">
                  <span style="
                    color:#64748b;
                    font-weight:700;
                  ">
                    ยอดรวมทั้งบิล
                  </span>

                  <strong
                    id="inventoryPurchaseDraftTotal"
                    style="
                      font-size:23px;
                      color:#1f2937;
                    "
                  >
                    0.00 บาท
                  </strong>
                </div>

              </div>

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
              onclick="POS.inventoryPurchaseCloseAdd()"
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
              onclick="POS.inventoryPurchaseSave()"
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
              💾 บันทึกบิล
            </button>

          </div>

        </div>

      </div>

    </div>
  `;
};


/* =====================================================
   OPEN BILL
   ===================================================== */

POS.inventoryPurchaseOpenAdd = async function(){

  const modal =
    document.getElementById(
      "inventoryPurchaseModal"
    );

  if(!modal){
    return;
  }


  /*
     เริ่มบิลใหม่ทุกครั้งที่กด "รับสินค้าเข้า"
  */
  POS.inventoryPurchaseDraftItems = [];


  const now = new Date();

  const yyyy = now.getFullYear();
  const mm =
    String(now.getMonth() + 1).padStart(2,"0");
  const dd =
    String(now.getDate()).padStart(2,"0");


  const dateInput =
    document.getElementById(
      "inventoryPurchaseDate"
    );

  const numberInput =
    document.getElementById(
      "inventoryPurchaseNumber"
    );

  const supplierInput =
    document.getElementById(
      "inventoryPurchaseSupplier"
    );


  if(dateInput){
    dateInput.value =
      `${yyyy}-${mm}-${dd}`;
  }


  if(numberInput){
    numberInput.value =
      "กำลังตรวจสอบ...";
  }


  if(supplierInput){
    supplierInput.value = "";
  }


  await POS.inventoryPurchasePrepareIngredientSelect();

  POS.inventoryPurchaseRenderDraft();

  modal.style.display = "flex";


  /*
     ตรวจสอบเลขที่บิลล่าสุดจากฐานข้อมูลจริง
     แล้วค่อยสร้างเลขถัดไป
  */
  if(numberInput){

    try{

      numberInput.value =
        await POS.inventoryPurchaseNextBillNumber();

    }catch(error){

      console.error(
        "inventoryPurchaseNextBillNumber error:",
        error
      );

      numberInput.value = "";

      POS.inventoryPurchaseSetFormMessage(
        error?.message ||
        "ไม่สามารถตรวจสอบเลขที่บิลล่าสุดได้"
      );

    }

  }

};


/* =====================================================
   PURCHASE BILL DETAIL
   ===================================================== */
POS.inventoryPurchaseCloseDetail = function(){
  const modal = document.getElementById("inventoryPurchaseDetailModal");
  if(modal) modal.style.display = "none";
};

POS.inventoryPurchaseOpenDetail = function(billId){
  const modal = document.getElementById("inventoryPurchaseDetailModal");
  const content = document.getElementById("inventoryPurchaseDetailContent");
  if(!modal || !content) return;

  const id = String(billId || "").trim();
  if(!id) return;

  const bills = Array.isArray(POS.inventoryPurchaseBillsData)
    ? POS.inventoryPurchaseBillsData : [];
  const items = Array.isArray(POS.inventoryPurchaseItemsData)
    ? POS.inventoryPurchaseItemsData : [];
  const ingredients = Array.isArray(POS.inventoryPurchaseIngredientsData)
    ? POS.inventoryPurchaseIngredientsData : [];
  const units = Array.isArray(POS.inventoryPurchaseUnitsData)
    ? POS.inventoryPurchaseUnitsData : [];

  const bill = bills.find(function(item){
    return String(item?.id || "") === id;
  });
  if(!bill) return;

  const billItems = items.filter(function(item){
    return String(item?.bill_id || "") === id;
  });

  const ingredientMap = {};
  ingredients.forEach(function(item){
    ingredientMap[String(item?.id || "")] = item;
  });

  const unitMap = {};
  units.forEach(function(item){
    unitMap[String(item?.id || "")] = item;
  });

  const subtitle = document.getElementById("inventoryPurchaseDetailSubtitle");
  if(subtitle){
    subtitle.textContent =
      `${String(bill?.bill_no || "-")} • ${String(bill?.supplier || "-")}`;
  }

  const rowsHtml = billItems.length
    ? billItems.map(function(item,index){
        const ingredient =
          ingredientMap[String(item?.ingredient_id || "")] || {};
        const unit =
          unitMap[String(item?.purchase_unit_id || "")] || {};

        const qty = Number(item?.qty || 0);
        const baseQty = Number(item?.base_qty || 0);
        const unitCost = Number(item?.unit_cost || 0);
        const total = Number(item?.total || 0);

        return `
          <tr style="border-bottom:1px solid #eef1f4;">
            <td style="padding:13px 10px;color:#64748b;">${index + 1}</td>
            <td style="padding:13px 10px;">
              <div style="font-weight:800;color:#334155;">
                ${POS.inventoryPurchaseEscapeHtml(String(ingredient?.name || "-"))}
              </div>
              <div style="margin-top:3px;font-size:12px;color:#94a3b8;">
                ${POS.inventoryPurchaseEscapeHtml(String(ingredient?.sku || "-"))}
              </div>
            </td>
            <td style="padding:13px 10px;white-space:nowrap;color:#475569;">
              ${POS.inventoryPurchaseEscapeHtml(String(unit?.unit_name || "-"))}
            </td>
            <td style="padding:13px 10px;text-align:right;white-space:nowrap;">
              ${qty.toLocaleString("th-TH")}
            </td>
            <td style="padding:13px 10px;text-align:right;white-space:nowrap;">
              ${baseQty.toLocaleString("th-TH")}
            </td>
            <td style="padding:13px 10px;text-align:right;white-space:nowrap;">
              ${unitCost.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td style="padding:13px 10px;text-align:right;font-weight:800;white-space:nowrap;">
              ${total.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="7" style="padding:35px;text-align:center;color:#94a3b8;">
         ไม่พบรายการสินค้าในบิลนี้
       </td></tr>`;

  const billTotal = Number(bill?.total || 0);

  content.innerHTML = `
    <div style="
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:12px;
      margin-bottom:18px;
    ">
      <div style="padding:14px;border:1px solid #e7edf2;border-radius:12px;background:#f8fafc;">
        <div style="font-size:12px;color:#94a3b8;">เลขที่บิล</div>
        <div style="margin-top:4px;font-weight:800;color:#1f2937;">
          ${POS.inventoryPurchaseEscapeHtml(String(bill?.bill_no || "-"))}
        </div>
      </div>
      <div style="padding:14px;border:1px solid #e7edf2;border-radius:12px;background:#f8fafc;">
        <div style="font-size:12px;color:#94a3b8;">วันที่</div>
        <div style="margin-top:4px;font-weight:800;color:#1f2937;">
          ${POS.inventoryPurchaseEscapeHtml(String(bill?.purchase_date || "-"))}
        </div>
      </div>
      <div style="padding:14px;border:1px solid #e7edf2;border-radius:12px;background:#f8fafc;">
        <div style="font-size:12px;color:#94a3b8;">ร้านค้า</div>
        <div style="margin-top:4px;font-weight:800;color:#1f2937;">
          ${POS.inventoryPurchaseEscapeHtml(String(bill?.supplier || "-"))}
        </div>
      </div>
    </div>

    <div style="border:1px solid #e7edf2;border-radius:14px;overflow:auto;">
      <table style="width:100%;min-width:760px;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e7edf2;">
            <th style="padding:12px 10px;text-align:left;">#</th>
            <th style="padding:12px 10px;text-align:left;">วัตถุดิบ</th>
            <th style="padding:12px 10px;text-align:left;">หน่วยซื้อ</th>
            <th style="padding:12px 10px;text-align:right;">จำนวน</th>
            <th style="padding:12px 10px;text-align:right;">หน่วยหลัก</th>
            <th style="padding:12px 10px;text-align:right;">ต้นทุน/หน่วยหลัก</th>
            <th style="padding:12px 10px;text-align:right;">ราคารวม</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>

    <div style="margin-top:18px;display:flex;justify-content:flex-end;">
      <div style="min-width:280px;padding:16px 18px;border-radius:14px;background:#f8fafc;border:1px solid #e7edf2;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:15px;">
          <span style="color:#64748b;font-weight:700;">ยอดรวมทั้งบิล</span>
          <strong style="font-size:23px;color:#1f2937;">
            ${billTotal.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})} บาท
          </strong>
        </div>
      </div>
    </div>

    ${
      String(bill?.remark || "").trim()
        ? `<div style="margin-top:16px;padding:14px 16px;border-radius:12px;background:#fffbeb;border:1px solid #f5e6a8;color:#475569;">
             <strong>หมายเหตุ:</strong>
             ${POS.inventoryPurchaseEscapeHtml(String(bill.remark))}
           </div>`
        : ""
    }
  `;

  modal.style.display = "flex";
};


/* =====================================================
   LOAD PURCHASE BILLS
   โหลดรายการรับเข้าจากฐานข้อมูลจริง
   ===================================================== */

POS.inventoryPurchaseLoad = async function(){

  const tableBody =
    document.getElementById(
      "inventoryPurchaseTableBody"
    );

  if(!tableBody){
    return;
  }

  try{

    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="
          padding:55px 20px;
          text-align:center;
          color:#94a3b8;
        ">
          กำลังโหลดรายการรับเข้า...
        </td>
      </tr>
    `;

    /*
       โหลดผ่าน Purchase Edge Function
       เพื่ออ่าน purchase_bills / purchase_items / ingredients
       ผ่าน Service Role และไม่ติด RLS ของ Browser
    */
    if(!POS.supabase){
      throw new Error(
        "ไม่พบการเชื่อมต่อฐานข้อมูล"
      );
    }

    const result =
      await POS.supabase.functions.invoke(
        "purchase",
        {
          method:"GET"
        }
      );

    if(result.error){
      throw new Error(
        result.error.message ||
        "โหลดรายการรับเข้าไม่สำเร็จ"
      );
    }

    if(result.data?.success === false){
      throw new Error(
        result.data?.error ||
        "โหลดรายการรับเข้าไม่สำเร็จ"
      );
    }

    const data =
      result.data?.data || {};

    const bills =
      Array.isArray(data.bills)
        ? data.bills
        : [];

    const items =
      Array.isArray(data.items)
        ? data.items
        : [];

    const ingredients =
      Array.isArray(data.ingredients)
        ? data.ingredients
        : [];

    POS.inventoryPurchaseBillsData = bills;
    POS.inventoryPurchaseItemsData = items;
    POS.inventoryPurchaseIngredientsData = ingredients;

    const ingredientMap = {};

    ingredients.forEach(function(item){

      ingredientMap[
        String(item?.id || "")
      ] = {
        name:
          String(item?.name || "-"),
        sku:
          String(item?.sku || "-")
      };

    });

    const itemGroups = {};

    items.forEach(function(item){

      const billId =
        String(item?.bill_id || "");

      if(!billId){
        return;
      }

      if(!itemGroups[billId]){
        itemGroups[billId] = [];
      }

      itemGroups[billId].push(item);

    });

    const rows =
      bills.map(function(bill,index){

        const billId =
          String(bill?.id || "");

        const billItems =
          itemGroups[billId] || [];

        const names =
          billItems.map(function(item){

            const ingredient =
              ingredientMap[
                String(item?.ingredient_id || "")
              ];

            return ingredient
              ? ingredient.name
              : "-";

          });

        const uniqueNames =
          [...new Set(names)];

        return {
          index:
            index + 1,

          id:
            billId,

          bill_no:
            String(bill?.bill_no || "-"),

          purchase_date:
            String(bill?.purchase_date || "-"),

          supplier:
            String(bill?.supplier || "-"),

          item_count:
            billItems.length,

          item_text:
            uniqueNames.length
              ? uniqueNames.join(", ")
              : "-",

          total:
            Number(bill?.total || 0)

        };

      });

    const searchInput =
      document.getElementById(
        "inventoryPurchaseSearch"
      );

    const renderRows = function(){

      const keyword =
        String(
          searchInput?.value || ""
        )
          .trim()
          .toLowerCase();

      const filtered =
        rows.filter(function(row){

          if(!keyword){
            return true;
          }

          return (
            row.bill_no
              .toLowerCase()
              .includes(keyword) ||

            row.purchase_date
              .toLowerCase()
              .includes(keyword) ||

            row.supplier
              .toLowerCase()
              .includes(keyword) ||

            row.item_text
              .toLowerCase()
              .includes(keyword)
          );

        });

      if(!filtered.length){

        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="
              padding:55px 20px;
              text-align:center;
              color:#94a3b8;
            ">
              ${
                rows.length
                  ? "ไม่พบรายการที่ค้นหา"
                  : "ยังไม่มีรายการรับเข้า"
              }
            </td>
          </tr>
        `;

        return;
      }

      tableBody.innerHTML =
        filtered.map(function(row){

          return `
            <tr style="
              border-bottom:1px solid #eef1f4;
            ">

              <td style="
                padding:14px;
                color:#64748b;
              ">
                ${row.index}
              </td>

              <td style="
                padding:14px;
                font-weight:800;
                color:#1f2937;
              ">
                <button
                  type="button"
                  onclick="POS.inventoryPurchaseOpenDetail('${row.id}')"
                  style="
                    border:0;
                    padding:0;
                    background:transparent;
                    color:#2563eb;
                    font-weight:800;
                    cursor:pointer;
                    text-decoration:underline;
                    text-underline-offset:3px;
                    font-size:inherit;
                  "
                >
                  ${POS.inventoryPurchaseEscapeHtml(
                    row.bill_no
                  )}
                </button>
              </td>

              <td style="
                padding:14px;
                color:#475569;
                white-space:nowrap;
              ">
                ${POS.inventoryPurchaseEscapeHtml(
                  row.purchase_date
                )}
              </td>

              <td style="
                padding:14px;
                color:#475569;
              ">
                ${POS.inventoryPurchaseEscapeHtml(
                  row.supplier
                )}
              </td>

              <td style="
                padding:14px;
                text-align:right;
                font-weight:800;
                color:#1f2937;
                white-space:nowrap;
              ">
                ${row.total.toLocaleString(
                  "th-TH",
                  {
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                  }
                )} บาท
              </td>

              <td style="
                padding:14px;
                text-align:center;
              ">
                <span style="
                  display:inline-block;
                  padding:5px 10px;
                  border-radius:999px;
                  background:#e8f6ec;
                  color:#267a3d;
                  font-size:12px;
                  font-weight:800;
                ">
                  รับเข้าแล้ว
                </span>
              </td>

            </tr>
          `;

        }).join("");

    };

    renderRows();

    if(searchInput){

      if(
        searchInput._inventoryPurchaseSearchHandler
      ){
        searchInput.removeEventListener(
          "input",
          searchInput._inventoryPurchaseSearchHandler
        );
      }

      searchInput._inventoryPurchaseSearchHandler =
        renderRows;

      searchInput.addEventListener(
        "input",
        renderRows
      );

    }

    const totalEl =
      document.getElementById(
        "inventoryPurchaseTotal"
      );

    const qtyEl =
      document.getElementById(
        "inventoryPurchaseQty"
      );

    const billsEl =
      document.getElementById(
        "inventoryPurchaseBills"
      );

    const valueEl =
      document.getElementById(
        "inventoryPurchaseValue"
      );

    const totalQty =
      items.reduce(
        function(sum,item){
          return sum +
            Number(item?.qty || 0);
        },
        0
      );

    const totalValue =
      bills.reduce(
        function(sum,bill){
          return sum +
            Number(bill?.total || 0);
        },
        0
      );

    if(totalEl){
      totalEl.textContent =
        items.length.toLocaleString(
          "th-TH"
        );
    }

    if(qtyEl){
      qtyEl.textContent =
        totalQty.toLocaleString(
          "th-TH"
        );
    }

    if(billsEl){
      billsEl.textContent =
        bills.length.toLocaleString(
          "th-TH"
        );
    }

    if(valueEl){
      valueEl.textContent =
        totalValue.toLocaleString(
          "th-TH",
          {
            minimumFractionDigits:2,
            maximumFractionDigits:2
          }
        ) + " บาท";
    }

  }catch(error){

    console.error(
      "inventoryPurchaseLoad error:",
      error
    );

    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="
          padding:55px 20px;
          text-align:center;
          color:#c0392b;
          font-weight:700;
        ">
          โหลดรายการรับเข้าไม่สำเร็จ
        </td>
      </tr>
    `;

  }
};

/* =====================================================
   BILL NUMBER
   อ่านเลขล่าสุดจาก purchase_bills โดยตรง
   ไม่ใช้ localStorage
   ===================================================== */

POS.inventoryPurchaseNextBillNumber = async function(){

  if(!POS.supabase){

    throw new Error(
      "ไม่พบการเชื่อมต่อฐานข้อมูล"
    );

  }


  /*
     อ่านเลขบิลถัดไปผ่าน Purchase Edge Function
     เพื่อให้ใช้ Service Role อ่าน purchase_bills ได้จริง
     ไม่พึ่ง RLS ของ Browser และไม่ใช้ localStorage
  */
  const result =
    await POS.supabase.functions.invoke(
      "purchase",
      {
        method: "GET"
      }
    );


  if(result.error){

    throw new Error(
      "ตรวจสอบเลขที่บิลล่าสุดไม่สำเร็จ: " +
      (result.error.message || "เกิดข้อผิดพลาด")
    );

  }


  const billNo =
    String(
      result.data?.data?.bill_no ||
      ""
    ).trim();


  if(!billNo){

    throw new Error(
      "ไม่พบเลขที่บิลถัดไปจากฐานข้อมูล"
    );

  }


  return billNo;

};


/* =====================================================
   PREPARE INGREDIENT SELECT
   ===================================================== */

POS.inventoryPurchasePrepareIngredientSelect = async function(){

  const select =
    document.getElementById(
      "inventoryPurchaseIngredient"
    );

  const unitSelect =
    document.getElementById(
      "inventoryPurchaseUnit"
    );

  if(!select){
    return;
  }


  /*
     ใช้ Backend ชุดเดียวกับหน้า "หน่วยซื้อ"
     เพื่อให้รายการหน่วยซื้อที่แสดงตรงกับฐานข้อมูลจริง
  */
  POS.inventoryPurchaseUnitsData = [];

  if(POS.api?.purchaseUnitsList){

    try{

      const unitResult =
        await POS.api.purchaseUnitsList();

      if(unitResult?.success){

        POS.inventoryPurchaseUnitsData =
          Array.isArray(unitResult.data)
            ? unitResult.data
            : [];

      }else{

        console.error(
          "inventoryPurchasePrepareIngredientSelect purchaseUnitsList error:",
          unitResult?.error
        );

      }

    }catch(error){

      console.error(
        "inventoryPurchasePrepareIngredientSelect purchaseUnitsList exception:",
        error
      );

    }

  }


  select.innerHTML =
    `<option value="">-- เลือกวัตถุดิบ --</option>`;


  if(unitSelect){

    unitSelect.innerHTML =
      `<option value="">-- เลือกหน่วย --</option>`;

    unitSelect.value = "";
    unitSelect.disabled = true;

  }


  const items =
    Array.isArray(
      POS.inventoryItemsData
    )
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

    select.appendChild(option);

  });


  select.onchange =
    function(){

      const ingredientId =
        String(select.value || "");

      if(unitSelect){

        unitSelect.innerHTML =
          `<option value="">-- เลือกหน่วย --</option>`;

        unitSelect.value = "";
        unitSelect.disabled = true;

      }

      if(!ingredientId){
        return;
      }


      const selectedUnits =
        POS.inventoryPurchaseUnitsData
          .filter(function(unit){
            return String(
              unit?.ingredient_id || ""
            ) === ingredientId;
          });


      /*
         มีหน่วยซื้อแล้ว ให้เลือกได้ทันที
         และเลือกหน่วย active เป็นค่าเริ่มต้น
      */
      if(unitSelect && selectedUnits.length){

        selectedUnits.forEach(function(unit){

          const option =
            document.createElement("option");

          option.value =
            String(unit?.id || "");

          option.textContent =
            String(unit?.unit_name || "-");

          unitSelect.appendChild(option);

        });

        unitSelect.disabled = false;


        const activeUnit =
          selectedUnits.find(function(unit){
            return unit?.active !== false;
          }) ||
          selectedUnits[0] ||
          null;


        if(activeUnit){

          unitSelect.value =
            String(activeUnit?.id || "");

        }

      }

    };

};

/* =====================================================
   ADD ITEM TO BILL
   ===================================================== */

POS.inventoryPurchaseAddItem = function(){

  const select =
    document.getElementById(
      "inventoryPurchaseIngredient"
    );

  const quantityInput =
    document.getElementById(
      "inventoryPurchaseQuantity"
    );

  const costInput =
    document.getElementById(
      "inventoryPurchaseCost"
    );

  const unitSelect =
    document.getElementById(
      "inventoryPurchaseUnit"
    );


  const selected =
    select?.options[
      select.selectedIndex
    ];


  const ingredientId =
    String(
      select?.value || ""
    );

  const purchaseUnitId =
    String(
      unitSelect?.value || ""
    );

  const selectedUnitData =
    POS.inventoryPurchaseUnitsData.find(function(unit){
      return String(unit?.id || "") === purchaseUnitId;
    }) || null;


  const quantity =
    Number(
      quantityInput?.value || 0
    );

  /*
     ตัวคูณของหน่วยซื้อที่พนักงานเลือก
     เช่น 1 ลัง12 = 12 ขวด

     ใช้ multiple เป็นหลัก
     ถ้า backend ของหน่วยส่ง multiple มาเป็น 1/ไม่มีค่า
     ให้ใช้ base_qty ของหน่วยเป็นตัวคูณแทน
  */
  let multiple =
    Number(selectedUnitData?.multiple);

  if(
    !Number.isFinite(multiple) ||
    multiple <= 0 ||
    multiple === 1
  ){
    const unitBaseQty =
      Number(selectedUnitData?.base_qty);

    if(
      Number.isFinite(unitBaseQty) &&
      unitBaseQty > 1
    ){
      multiple = unitBaseQty;
    }else{
      multiple = 1;
    }
  }

  const baseQty =
    quantity * multiple;


  const totalCost =
    Number(
      costInput?.value || 0
    );


  if(!ingredientId){
    POS.inventoryPurchaseSetFormMessage(
      "กรุณาเลือกวัตถุดิบก่อนเพิ่มเข้าบิล"
    );
    return;
  }


  if(!purchaseUnitId){
    POS.inventoryPurchaseSetFormMessage(
      "กรุณาเลือกหน่วยก่อนเพิ่มเข้าบิล"
    );
    return;
  }


  if(!Number.isFinite(quantity) || quantity <= 0){
    POS.inventoryPurchaseSetFormMessage(
      "กรุณากรอกจำนวนให้มากกว่า 0"
    );
    return;
  }


  if(!Number.isFinite(totalCost) || totalCost < 0){
    POS.inventoryPurchaseSetFormMessage(
      "ราคารวมไม่ถูกต้อง"
    );
    return;
  }


  // ราคาต่อหน่วยคำนวณภายในระบบจากราคารวม ÷ จำนวน
  const unitCost =
    totalCost / quantity;


  const item = {
    ingredient_id:
      ingredientId,

    sku:
      String(
        selected?.textContent || "-"
      ).split(" — ")[0],

    name:
      String(
        selected?.textContent || "-"
      ).split(" — ").slice(1).join(" — ") || "-",

    purchase_unit_id:
      purchaseUnitId,

    unit:
      String(
        selectedUnitData?.unit_name || ""
      ).trim(),

    quantity:
      quantity,

    multiple:
      multiple,

    base_qty:
      baseQty,

    cost:
      unitCost,

    total:
      totalCost
  };


  POS.inventoryPurchaseDraftItems.push(item);

  POS.inventoryPurchaseRenderDraft();


  /*
     ล้างเฉพาะช่องรายการ
     เพื่อให้เพิ่มรายการถัดไปได้ทันที
  */
  if(select){
    select.value = "";
  }

  if(unitSelect){
    unitSelect.innerHTML =
      `<option value="">-- เลือกหน่วย --</option>`;

    unitSelect.value = "";
    unitSelect.disabled = true;
  }

  if(quantityInput){
    quantityInput.value = "";
  }

  if(costInput){
    costInput.value = "";
  }


  POS.inventoryPurchaseSetFormMessage("");

};


/* =====================================================
   RENDER BILL ITEMS
   ===================================================== */

POS.inventoryPurchaseRenderDraft = function(){

  const list =
    document.getElementById(
      "inventoryPurchaseDraftList"
    );

  const countEl =
    document.getElementById(
      "inventoryPurchaseDraftCount"
    );

  const totalEl =
    document.getElementById(
      "inventoryPurchaseDraftTotal"
    );


  const items =
    Array.isArray(
      POS.inventoryPurchaseDraftItems
    )
      ? POS.inventoryPurchaseDraftItems
      : [];


  const total =
    items.reduce(
      function(sum,item){
        return sum +
          Number(item?.total || 0);
      },
      0
    );


  if(countEl){
    countEl.textContent =
      `${items.length.toLocaleString("th-TH")} รายการ`;
  }


  if(totalEl){
    totalEl.textContent =
      total.toLocaleString(
        "th-TH",
        {
          minimumFractionDigits:2,
          maximumFractionDigits:2
        }
      ) +
      " บาท";
  }


  if(!list){
    return;
  }


  if(!items.length){

    list.innerHTML = `
      <div style="
        padding:25px 15px;
        text-align:center;
        color:#94a3b8;
        font-size:14px;
      ">
        ยังไม่มีรายการในบิล
      </div>
    `;

    return;
  }


  list.innerHTML =
    items.map(function(item,index){

      return `
        <div style="
          display:grid;
          grid-template-columns:40px 1fr auto auto 36px;
          gap:10px;
          align-items:center;
          padding:13px 14px;
          border-bottom:${index < items.length - 1 ? "1px solid #eef1f4" : "0"};
        ">

          <div style="
            width:30px;
            height:30px;
            border-radius:50%;
            background:#f1f5f9;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:13px;
            font-weight:800;
            color:#64748b;
          ">
            ${index + 1}
          </div>


          <div style="min-width:0;">

            <div style="
              font-weight:800;
              color:#1f2937;
              white-space:nowrap;
              overflow:hidden;
              text-overflow:ellipsis;
            ">
              ${POS.inventoryPurchaseEscapeHtml(item.name)}
            </div>

            <div style="
              margin-top:3px;
              color:#94a3b8;
              font-size:12px;
            ">
              ${POS.inventoryPurchaseEscapeHtml(item.sku)}
              ·
              ${POS.inventoryPurchaseEscapeHtml(item.unit)}
            </div>

          </div>


          <div style="
            text-align:right;
            white-space:nowrap;
            color:#475569;
            font-size:14px;
          ">
            ${Number(item.quantity).toLocaleString("th-TH")}
            ${POS.inventoryPurchaseEscapeHtml(item.unit)}
          </div>


          <div style="
            min-width:95px;
            text-align:right;
            font-weight:800;
            color:#1f2937;
            white-space:nowrap;
          ">
            ${Number(item.total).toLocaleString(
              "th-TH",
              {
                minimumFractionDigits:2,
                maximumFractionDigits:2
              }
            )}
          </div>


          <button
            type="button"
            onclick="POS.inventoryPurchaseRemoveItem(${index})"
            title="ลบรายการนี้"
            style="
              width:34px;
              height:34px;
              border:1px solid #f0caca;
              border-radius:8px;
              background:#fff5f5;
              color:#c0392b;
              cursor:pointer;
              font-weight:800;
            "
          >
            🗑️
          </button>

        </div>
      `;

    }).join("");

};


/* =====================================================
   REMOVE ITEM
   ===================================================== */

POS.inventoryPurchaseRemoveItem = function(index){

  const items =
    POS.inventoryPurchaseDraftItems;

  if(!Array.isArray(items)){
    return;
  }


  if(index < 0 || index >= items.length){
    return;
  }


  items.splice(index,1);

  POS.inventoryPurchaseRenderDraft();

};


/* =====================================================
   FORM MESSAGE
   ไม่ใช้ browser alert
   ===================================================== */

POS.inventoryPurchaseSetFormMessage = function(message){

  let el =
    document.getElementById(
      "inventoryPurchaseFormMessage"
    );


  if(!el){

    const modal =
      document.getElementById(
        "inventoryPurchaseModal"
      );

    if(!modal){
      return;
    }


    el =
      document.createElement("div");

    el.id =
      "inventoryPurchaseFormMessage";

    el.style.cssText = `
      margin:0 24px 14px;
      padding:11px 13px;
      border-radius:10px;
      background:#fff7ed;
      border:1px solid #fed7aa;
      color:#9a3412;
      font-size:14px;
      font-weight:700;
      display:none;
    `;


    const footer =
      modal.querySelector(
        'button[onclick="POS.inventoryPurchaseSave()"]'
      )?.parentElement;


    if(footer){
      modal.querySelector(
        "div"
      );
    }


    const scrollArea =
      modal.querySelector(
        'input[id="inventoryPurchaseDate"]'
      )?.closest("div[style*='overflow-y:auto']");


    if(scrollArea){
      scrollArea.insertBefore(
        el,
        scrollArea.firstChild
      );
    }else{
      modal.insertBefore(
        el,
        modal.lastElementChild
      );
    }

  }


  el.textContent =
    String(message || "");

  el.style.display =
    message
      ? "block"
      : "none";

};


/* =====================================================
   ESCAPE HTML
   ===================================================== */

POS.inventoryPurchaseEscapeHtml = function(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

};


/* =====================================================
   CLOSE BILL
   ===================================================== */

POS.inventoryPurchaseCloseAdd = function(){

  const modal =
    document.getElementById(
      "inventoryPurchaseModal"
    );

  if(modal){
    modal.style.display = "none";
  }

};


/* =====================================================
   SAVE BILL
   จุดนี้ยังไม่เชื่อม Backend
   ===================================================== */

POS.inventoryPurchaseSave = async function(){

  const items =
    Array.isArray(
      POS.inventoryPurchaseDraftItems
    )
      ? POS.inventoryPurchaseDraftItems
      : [];


  const supplier =
    String(
      document.getElementById(
        "inventoryPurchaseSupplier"
      )?.value || ""
    ).trim();


  const billNo =
    String(
      document.getElementById(
        "inventoryPurchaseNumber"
      )?.value || ""
    ).trim();


  const purchaseDate =
    String(
      document.getElementById(
        "inventoryPurchaseDate"
      )?.value || ""
    ).trim();


  if(!supplier){
    POS.inventoryPurchaseSetFormMessage(
      "กรุณากรอกร้านค้าก่อนบันทึกบิล"
    );
    return;
  }


  if(!items.length){
    POS.inventoryPurchaseSetFormMessage(
      "กรุณาเพิ่มรายการเข้าบิลอย่างน้อย 1 รายการ"
    );
    return;
  }


  if(!billNo){
    POS.inventoryPurchaseSetFormMessage(
      "ไม่พบเลขที่บิล"
    );
    return;
  }


  if(!purchaseDate){
    POS.inventoryPurchaseSetFormMessage(
      "ไม่พบวันที่รับเข้า"
    );
    return;
  }


  const saveButton =
    document.querySelector(
      '#inventoryPurchaseModal button[onclick="POS.inventoryPurchaseSave()"]'
    );


  if(saveButton){
    saveButton.disabled = true;
    saveButton.style.opacity = "0.65";
    saveButton.style.cursor = "not-allowed";
  }


  try{

    POS.inventoryPurchaseSetFormMessage(
      "กำลังบันทึกบิล..."
    );


    const result =
      await POS.api.purchaseAdd({

        bill_no:
          billNo,

        purchase_date:
          purchaseDate,

        supplier:
          supplier,

        remark:
          "",

        items:
          items.map(function(item){
            return {
              ingredient_id:
                item.ingredient_id,

              purchase_unit_id:
                item.purchase_unit_id,

              quantity:
                Number(item.quantity || 0),

              multiple:
                Number(item.multiple || 1),

              base_qty:
                Number(item.base_qty || item.quantity || 0),

              total:
                Number(item.total || 0)
            };
          })
      });


    if(!result || result.success === false){
      throw new Error(
        result?.error ||
        result?.message ||
        "ไม่สามารถบันทึกบิลได้"
      );
    }



    POS.inventoryPurchaseDraftItems = [];

    POS.inventoryPurchaseSetFormMessage("");

    POS.inventoryPurchaseCloseAdd();

    if(typeof POS.inventoryPurchaseLoad === "function"){
      await POS.inventoryPurchaseLoad();
    }


    if(typeof POS.inventoryPurchaseShowSuccess === "function"){
      POS.inventoryPurchaseShowSuccess(
        "บันทึกบิลเรียบร้อยแล้ว",
        "เลขที่บิล " + billNo + " บันทึกเข้าสต็อกแล้ว"
      );
    }


  }catch(error){

    console.error(
      "inventoryPurchaseSave error:",
      error
    );

    POS.inventoryPurchaseSetFormMessage(
      error?.message ||
      "ไม่สามารถบันทึกบิลได้"
    );

  }finally{

    if(saveButton){
      saveButton.disabled = false;
      saveButton.style.opacity = "1";
      saveButton.style.cursor = "pointer";
    }

  }

};
