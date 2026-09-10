window.POS = window.POS || {};
POS.pages = POS.pages || {};

POS.inventoryItemsEditingSku = null;
POS.inventoryItemsEditingId = null;
POS.inventoryItemsData = [];
POS.inventoryPurchaseUnitsData = [];

/* =====================================================
   STOCK PAGE 01 : INGREDIENTS
   ===================================================== */

POS.pages.inventoryItems = async function(){

  return `
    <div class="inventory-subpage">

      <!-- =================================================
           HEADER
           ================================================= -->

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:20px;
          margin-bottom:22px;
        "
      >

        <div>

          <h1 class="page-title">
            📋 วัตถุดิบ
          </h1>

          <p class="page-subtitle">
            รายการวัตถุดิบและยอดคงเหลือ
          </p>

        </div>


        <div
          style="
            display:flex;
            align-items:center;
            gap:10px;
          "
        >

          <!-- กลับ -->
          <button
            type="button"
            onclick="POS.inventoryBackToMain()"
            style="
              white-space:nowrap;
              padding:11px 18px;
              border-radius:10px;
              font-weight:700;
              border:1px solid #d7dce2;
              background:#ffffff;
              color:#333;
              cursor:pointer;
            "
          >
            ← กลับ
          </button>


          <!-- เพิ่มวัตถุดิบ -->
          <button
            type="button"
            onclick="POS.inventoryItemsOpenAdd()"
            style="
              white-space:nowrap;
              padding:11px 18px;
              border-radius:10px;
              font-weight:700;
              border:1px solid #b8d9c2;
              background:#e8f6ec;
              color:#267a3d;
              cursor:pointer;
            "
          >
            ➕ เพิ่มวัตถุดิบ
          </button>

        </div>

      </div>


      <!-- =================================================
           SUMMARY
           ================================================= -->

      <div
        style="
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:16px;
          margin-bottom:20px;
        "
      >

        <div class="card">
          <div
            style="
              color:#777;
              font-size:14px;
              margin-bottom:7px;
            "
          >
            📋 วัตถุดิบทั้งหมด
          </div>

          <div
            id="inventoryItemsTotal"
            style="
              font-size:26px;
              font-weight:800;
            "
          >
            -
          </div>
        </div>


        <div class="card">
          <div
            style="
              color:#777;
              font-size:14px;
              margin-bottom:7px;
            "
          >
            ⚠️ ใกล้หมด
          </div>

          <div
            id="inventoryItemsLow"
            style="
              font-size:26px;
              font-weight:800;
            "
          >
            -
          </div>
        </div>


        <div class="card">
          <div
            style="
              color:#777;
              font-size:14px;
              margin-bottom:7px;
            "
          >
            🔴 หมดสต็อก
          </div>

          <div
            id="inventoryItemsEmpty"
            style="
              font-size:26px;
              font-weight:800;
            "
          >
            -
          </div>
        </div>


        <div class="card">
          <div
            style="
              color:#777;
              font-size:14px;
              margin-bottom:7px;
            "
          >
            💰 มูลค่าสต็อก
          </div>

          <div
            id="inventoryItemsValue"
            style="
              font-size:26px;
              font-weight:800;
            "
          >
            -
          </div>
        </div>

      </div>


      <!-- =================================================
           MAIN LIST
           ================================================= -->

      <div class="card">

        <!-- SEARCH / FILTER -->

        <div
          style="
            display:flex;
            align-items:center;
            gap:10px;
            margin-bottom:18px;
          "
        >

          <div style="flex:1;">

            <input
              id="inventoryItemsSearch"
              type="text"
              placeholder="🔎 ค้นหาวัตถุดิบ..."
              oninput="POS.inventoryItemsFilter()"
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px 14px;
                border:1px solid #ddd;
                border-radius:10px;
                font-size:15px;
                outline:none;
              "
            >

          </div>


          <select
            id="inventoryItemsStatus"
            onchange="POS.inventoryItemsFilter()"
            style="
              min-width:160px;
              padding:11px 12px;
              border:1px solid #ddd;
              border-radius:10px;
              background:#fff;
              font-size:15px;
            "
          >

            <option value="">ทุกสถานะ</option>
            <option value="normal">🟢 ปกติ</option>
            <option value="low">🟠 ใกล้หมด</option>
            <option value="empty">🔴 หมดสต็อก</option>

          </select>


          <button
            type="button"
            class="btn-secondary"
            onclick="POS.inventoryItemsLoad()"
            style="
              white-space:nowrap;
              padding:11px 15px;
              border-radius:10px;
            "
          >
            🔄 รีเฟรช
          </button>

        </div>


        <!-- TABLE -->

        <div
          style="
            width:100%;
            overflow-x:auto;
          "
        >

          <table
            style="
              width:100%;
              border-collapse:collapse;
              min-width:850px;
            "
          >

            <thead>

              <tr
                style="
                  border-bottom:2px solid #eee;
                  text-align:left;
                "
              >

                <th style="padding:13px 10px;">
                  #
                </th>

                <th style="padding:13px 10px;">
                  รหัส
                </th>

                <th style="padding:13px 10px;">
                  วัตถุดิบ
                </th>

                <th
                  style="
                    padding:13px 10px;
                    text-align:right;
                  "
                >
                  คงเหลือ
                </th>

                <th
                  style="
                    padding:13px 10px;
                    text-align:right;
                  "
                >
                  ขั้นต่ำ
                </th>

                <th style="padding:13px 10px;">
                  หน่วย
                </th>

                <th style="padding:13px 10px;">
                  สถานะ
                </th>

                <th
                  style="
                    padding:13px 10px;
                    text-align:center;
                  "
                >
                  จัดการ
                </th>

              </tr>

            </thead>


            <tbody id="inventoryItemsTableBody">

              <tr>

                <td
                  colspan="8"
                  style="
                    padding:45px 20px;
                    text-align:center;
                    color:#888;
                  "
                >
                  กำลังเตรียมรายการวัตถุดิบ...
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
        id="inventoryItemsModal"
        style="
          display:none;
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.35);
          z-index:9999;
          align-items:center;
          justify-content:center;
          padding:20px;
          box-sizing:border-box;
        "
      >

        <div
          style="
            width:100%;
            max-width:520px;
            background:#fff;
            border-radius:18px;
            box-shadow:0 20px 60px rgba(0,0,0,.18);
            overflow:hidden;
          "
        >

          <div
            style="
              padding:18px 22px;
              border-bottom:1px solid #eee;
              display:flex;
              justify-content:space-between;
              align-items:center;
            "
          >

            <div
              id="inventoryItemsModalTitle"
              style="
                font-size:19px;
                font-weight:800;
              "
            >
              ➕ เพิ่มวัตถุดิบ
            </div>


            <button
              type="button"
              onclick="POS.inventoryItemsCloseModal()"
              style="
                border:0;
                background:transparent;
                font-size:22px;
                cursor:pointer;
              "
            >
              ✕
            </button>

          </div>


          <div style="padding:22px;">

            <label
              style="
                display:block;
                margin-bottom:6px;
                font-weight:700;
              "
            >
              ชื่อวัตถุดิบ
            </label>

            <input
              id="inventoryItemName"
              type="text"
              placeholder="เช่น หมูสันนอก"
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px 13px;
                border:1px solid #ddd;
                border-radius:9px;
                margin-bottom:15px;
              "
            >


            <label
              style="
                display:block;
                margin-bottom:6px;
                font-weight:700;
              "
            >
              หน่วยหลัก
            </label>

            <input
              id="inventoryItemUnit"
              type="text"
              placeholder="เช่น kg, g, ลิตร, ขวด"
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px 13px;
                border:1px solid #ddd;
                border-radius:9px;
                margin-bottom:15px;
              "
            >


            <label
              style="
                display:block;
                margin-bottom:6px;
                font-weight:700;
              "
            >
              สต็อกขั้นต่ำ
            </label>

            <input
              id="inventoryItemMinimum"
              type="number"
              step="any"
              min="0"
              value="0"
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px 13px;
                border:1px solid #ddd;
                border-radius:9px;
              "
            >

          </div>


          <div
            style="
              padding:16px 22px;
              border-top:1px solid #eee;
              display:flex;
              justify-content:flex-end;
              gap:10px;
            "
          >

            <button
              type="button"
              onclick="POS.inventoryItemsCloseModal()"
              style="
                white-space:nowrap;
                min-width:82px;
                padding:11px 18px;
                border-radius:10px;
                font-weight:700;
                border:1px solid #d5d9df;
                background:#ffffff;
                color:#4b5563;
                cursor:pointer;
                transition:all .15s ease;
                box-shadow:0 1px 2px rgba(0,0,0,.04);
              "
              onmouseover="
                this.style.background='#f5f6f8';
                this.style.borderColor='#c5cad2';
                this.style.color='#374151';
              "
              onmouseout="
                this.style.background='#ffffff';
                this.style.borderColor='#d5d9df';
                this.style.color='#4b5563';
              "
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onclick="POS.inventoryItemsSave()"
              style="
                white-space:nowrap;
                padding:11px 18px;
                border-radius:10px;
                font-weight:700;
                border:1px solid #b8d9c2;
                background:#e8f6ec;
                color:#267a3d;
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
   BACK TO STOCK MAIN
   ===================================================== */

POS.inventoryBackToMain = async function(){

  try{

    const page = POS.pages.inventory;

    if(typeof page !== "function"){
      console.error(
        "ไม่พบหน้า Stock หลัก"
      );
      return;
    }

    const html = await page();

    const current =
      document.querySelector(
        ".inventory-subpage, .inventory-page"
      );

    if(current){

      current.outerHTML = html;

      return;
    }

    console.error(
      "ไม่พบพื้นที่แสดงหน้า Stock"
    );

  }catch(error){

    console.error(
      "กลับหน้าสต็อกไม่สำเร็จ:",
      error
    );

  }

};


/* =====================================================
   OPEN ADD
   ===================================================== */

POS.inventoryItemsOpenAdd = function(){

  POS.inventoryItemsEditingSku = null;

  const modal =
    document.getElementById(
      "inventoryItemsModal"
    );

  if(!modal){
    return;
  }

  const title =
    document.getElementById(
      "inventoryItemsModalTitle"
    );

  if(title){
    title.textContent =
      "➕ เพิ่มวัตถุดิบ";
  }

  document.getElementById(
    "inventoryItemName"
  ).value = "";

  document.getElementById(
    "inventoryItemUnit"
  ).value = "";

  document.getElementById(
    "inventoryItemMinimum"
  ).value = "0";

  modal.style.display =
    "flex";
};


/* =====================================================
   CLOSE MODAL
   ===================================================== */

POS.inventoryItemsCloseModal = function(){

  const modal =
    document.getElementById(
      "inventoryItemsModal"
    );

  if(modal){
    modal.style.display =
      "none";
  }

};


/* =====================================================
   SUCCESS MODAL
   ใช้แทน browser alert สำหรับบันทึก/แก้ไข
   ===================================================== */

POS.inventoryItemsShowSuccess = function(options = {}){

  const title =
    String(
      options.title ||
      "ดำเนินการเรียบร้อย"
    );

  const message =
    String(
      options.message ||
      ""
    );

  const detail =
    String(
      options.detail ||
      ""
    );


  let modal =
    document.getElementById(
      "inventoryItemsSuccessModal"
    );


  if(!modal){

    modal =
      document.createElement("div");

    modal.id =
      "inventoryItemsSuccessModal";

    modal.innerHTML = `
      <div
        style="
          width:100%;
          max-width:430px;
          background:#ffffff;
          border-radius:20px;
          box-shadow:0 24px 70px rgba(0,0,0,.22);
          overflow:hidden;
          transform:translateY(0);
        "
      >

        <div
          style="
            padding:26px 26px 20px;
            text-align:center;
          "
        >

          <div
            style="
              width:64px;
              height:64px;
              margin:0 auto 15px;
              border-radius:50%;
              background:#e8f6ec;
              color:#267a3d;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:34px;
              font-weight:800;
            "
          >
            ✓
          </div>

          <div
            id="inventoryItemsSuccessTitle"
            style="
              font-size:21px;
              font-weight:800;
              color:#1f2937;
              margin-bottom:9px;
            "
          ></div>

          <div
            id="inventoryItemsSuccessMessage"
            style="
              font-size:15px;
              line-height:1.65;
              color:#6b7280;
              white-space:pre-line;
            "
          ></div>

          <div
            id="inventoryItemsSuccessDetail"
            style="
              margin-top:14px;
              padding:12px 14px;
              border-radius:11px;
              background:#f7faf8;
              color:#374151;
              font-size:14px;
              line-height:1.65;
              text-align:left;
              white-space:pre-line;
            "
          ></div>

        </div>

        <div
          style="
            padding:14px 22px 20px;
            border-top:1px solid #eef0f2;
            text-align:center;
          "
        >

          <button
            id="inventoryItemsSuccessButton"
            type="button"
            style="
              width:100%;
              padding:11px 18px;
              border:1px solid #b8d9c2;
              border-radius:10px;
              background:#e8f6ec;
              color:#267a3d;
              font-size:15px;
              font-weight:800;
              cursor:pointer;
              transition:all .15s ease;
            "
            onmouseover="
              this.style.background='#d9f0df';
            "
            onmouseout="
              this.style.background='#e8f6ec';
            "
          >
            ตกลง
          </button>

        </div>

      </div>
    `;


    modal.style.cssText = `
      display:flex;
      position:fixed;
      inset:0;
      z-index:10001;
      align-items:center;
      justify-content:center;
      padding:20px;
      box-sizing:border-box;
      background:rgba(15,23,42,.42);
      backdrop-filter:blur(2px);
    `;


    document.body.appendChild(modal);


    const button =
      document.getElementById(
        "inventoryItemsSuccessButton"
      );

    if(button){

      button.onclick =
        function(){

          modal.remove();

        };

    }


    modal.addEventListener(
      "click",
      function(event){

        if(event.target === modal){
          modal.remove();
        }

      }
    );

  }


  const titleEl =
    document.getElementById(
      "inventoryItemsSuccessTitle"
    );

  const messageEl =
    document.getElementById(
      "inventoryItemsSuccessMessage"
    );

  const detailEl =
    document.getElementById(
      "inventoryItemsSuccessDetail"
    );


  if(titleEl){
    titleEl.textContent =
      title;
  }

  if(messageEl){
    messageEl.textContent =
      message;
  }

  if(detailEl){

    detailEl.textContent =
      detail;

    detailEl.style.display =
      detail
        ? "block"
        : "none";

  }


  modal.style.display =
    "flex";

};


/* =====================================================
   CONFIRM MODAL
   ใช้แทน browser confirm สำหรับลบ
   ===================================================== */

POS.inventoryItemsShowConfirm = function(options = {}){

  const title =
    String(
      options.title ||
      "ยืนยันการดำเนินการ"
    );

  const message =
    String(
      options.message ||
      ""
    );

  let modal =
    document.getElementById(
      "inventoryItemsConfirmModal"
    );

  if(modal){
    modal.remove();
  }

  modal =
    document.createElement("div");

  modal.id =
    "inventoryItemsConfirmModal";

  modal.style.cssText = `
    display:flex;
    position:fixed;
    inset:0;
    z-index:10002;
    align-items:center;
    justify-content:center;
    padding:20px;
    box-sizing:border-box;
    background:rgba(15,23,42,.42);
    backdrop-filter:blur(2px);
  `;

  modal.innerHTML = `
    <div
      style="
        width:100%;
        max-width:430px;
        background:#ffffff;
        border-radius:20px;
        box-shadow:0 24px 70px rgba(0,0,0,.22);
        overflow:hidden;
      "
    >

      <div
        style="
          padding:26px 26px 20px;
          text-align:center;
        "
      >

        <div
          style="
            width:64px;
            height:64px;
            margin:0 auto 15px;
            border-radius:50%;
            background:#fff5df;
            color:#b9770e;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:30px;
            font-weight:800;
          "
        >
          ?
        </div>

        <div
          id="inventoryItemsConfirmTitle"
          style="
            font-size:21px;
            font-weight:800;
            color:#1f2937;
            margin-bottom:9px;
          "
        ></div>

        <div
          id="inventoryItemsConfirmMessage"
          style="
            font-size:15px;
            line-height:1.65;
            color:#6b7280;
            white-space:pre-line;
          "
        ></div>

      </div>

      <div
        style="
          padding:14px 22px 20px;
          border-top:1px solid #eef0f2;
          display:flex;
          justify-content:flex-end;
          gap:10px;
        "
      >

        <button
          id="inventoryItemsConfirmCancel"
          type="button"
          style="
            min-width:82px;
            padding:11px 18px;
            border-radius:10px;
            font-weight:700;
            border:1px solid #d5d9df;
            background:#ffffff;
            color:#4b5563;
            cursor:pointer;
          "
        >
          ยกเลิก
        </button>

        <button
          id="inventoryItemsConfirmOk"
          type="button"
          style="
            min-width:82px;
            padding:11px 18px;
            border-radius:10px;
            font-weight:700;
            border:1px solid #efc0c0;
            background:#fff1f1;
            color:#c0392b;
            cursor:pointer;
          "
        >
          ตกลง
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById(
    "inventoryItemsConfirmTitle"
  ).textContent = title;

  document.getElementById(
    "inventoryItemsConfirmMessage"
  ).textContent = message;

  return new Promise(function(resolve){

    const close = function(result){

      modal.remove();
      resolve(result);

    };

    document.getElementById(
      "inventoryItemsConfirmCancel"
    ).onclick = function(){

      close(false);

    };

    document.getElementById(
      "inventoryItemsConfirmOk"
    ).onclick = function(){

      close(true);

    };

    modal.addEventListener(
      "click",
      function(event){

        if(event.target === modal){

          close(false);

        }

      }
    );

  });

};


/* =====================================================
   SAVE
   ===================================================== */

POS.inventoryItemsSave = async function(){

  const name =
    String(
      document.getElementById(
        "inventoryItemName"
      )?.value || ""
    ).trim();

  const unit =
    String(
      document.getElementById(
        "inventoryItemUnit"
      )?.value || ""
    ).trim();

  const minimum =
    Number(
      document.getElementById(
        "inventoryItemMinimum"
      )?.value || 0
    );


  if(!name){
    POS.inventoryItemsShowSuccess({
      title:"กรุณาตรวจสอบข้อมูล",
      message:"กรุณากรอกชื่อวัตถุดิบ"
    });
    return;
  }


  if(!unit){
    POS.inventoryItemsShowSuccess({
      title:"กรุณาตรวจสอบข้อมูล",
      message:"กรุณากรอกหน่วยหลัก"
    });
    return;
  }


  if(
    !Number.isFinite(minimum) ||
    minimum < 0
  ){
    POS.inventoryItemsShowSuccess({
      title:"กรุณาตรวจสอบข้อมูล",
      message:"สต็อกขั้นต่ำไม่ถูกต้อง"
    });
    return;
  }


  const isEdit =
    !!POS.inventoryItemsEditingId;


  try{

    let result = null;

    if(isEdit){

      result =
        await POS.api.ingredientUpdate({

          id:
            POS.inventoryItemsEditingId,

          name:
            name,

          base_unit:
            unit,

          minimum:
            minimum

        });

    }else{

      result =
        await POS.api.ingredientAdd({

          name:
            name,

          base_unit:
            unit,

          minimum:
            minimum

        });

    }


    if(
      !result ||
      result.success !== true
    ){
      throw new Error(
        result?.error ||
        result?.message ||
        "บันทึกวัตถุดิบไม่สำเร็จ"
      );
    }


    POS.inventoryItemsEditingSku = null;
    POS.inventoryItemsEditingId = null;

    POS.inventoryItemsCloseModal();

    await POS.inventoryItemsLoad();

    if(isEdit){

      POS.inventoryItemsShowSuccess({

        title:
          "แก้ไขวัตถุดิบเรียบร้อย",

        message:
          "ข้อมูลวัตถุดิบถูกบันทึกลงฐานข้อมูลแล้ว",

        detail:
          "รหัสวัตถุดิบ: " +
          (result?.data?.sku || POS.inventoryItemsEditingSku || "-") +
          "\nชื่อ: " +
          (result?.data?.name || name)

      });

    }else{

      POS.inventoryItemsShowSuccess({

        title:
          "บันทึกวัตถุดิบเรียบร้อย",

        message:
          "เพิ่มวัตถุดิบลงฐานข้อมูลเรียบร้อยแล้ว",

        detail:
          "รหัสวัตถุดิบ: " +
          (result?.data?.sku || "-") +
          "\nชื่อ: " +
          (result?.data?.name || name)

      });

    }

  }catch(error){

    console.error(
      "บันทึกวัตถุดิบไม่สำเร็จ:",
      error
    );

    POS.inventoryItemsShowSuccess({
      title:"บันทึกวัตถุดิบไม่สำเร็จ",
      message:String(error?.message || error)
    });

  }

};


/* =====================================================
   LOAD
   ===================================================== */

POS.inventoryItemsLoad = async function(){

  const body =
    document.getElementById(
      "inventoryItemsTableBody"
    );

  if(!body){
    return;
  }


  body.innerHTML = `
    <tr>
      <td
        colspan="8"
        style="
          padding:45px 20px;
          text-align:center;
          color:#888;
        "
      >
        กำลังโหลดข้อมูลวัตถุดิบ...
      </td>
    </tr>
  `;


  try{

    const result =
      await POS.api.ingredientsList();


    if(
      !result ||
      result.success !== true
    ){
      throw new Error(
        result?.error ||
        result?.message ||
        "โหลดข้อมูลวัตถุดิบไม่สำเร็จ"
      );
    }


    POS.inventoryItemsData =
      Array.isArray(result.data)
        ? result.data
        : [];


    // โหลดหน่วยซื้อสำหรับใช้แสดงสต็อกเป็นหน่วยที่อ่านง่าย
    // ถ้าโหลดหน่วยซื้อไม่ได้ ให้หน้าสต็อกยังทำงานและแสดงหน่วยหลักตามเดิม
    try{

      const unitResult =
        await POS.api.purchaseUnitsList();

      POS.inventoryPurchaseUnitsData =
        unitResult && unitResult.success === true && Array.isArray(unitResult.data)
          ? unitResult.data
          : [];

    }catch(unitError){

      console.warn(
        "โหลดหน่วยซื้อสำหรับแสดงสต็อกไม่สำเร็จ:",
        unitError
      );

      POS.inventoryPurchaseUnitsData = [];

    }


    POS.inventoryItemsRender();

  }catch(error){

    console.error(
      "โหลดวัตถุดิบไม่สำเร็จ:",
      error
    );

    POS.inventoryItemsData = [];

    body.innerHTML = `
      <tr>
        <td
          colspan="8"
          style="
            padding:45px 20px;
            text-align:center;
            color:#c0392b;
          "
        >
          โหลดข้อมูลวัตถุดิบไม่สำเร็จ<br>
          <span style="font-size:13px;">
            ${String(error?.message || error)}
          </span>
        </td>
      </tr>
    `;

  }

};


/* =====================================================
   STOCK DISPLAY UNIT
   แสดงหน่วยใหญ่สุด + หน่วยเล็กสุดเท่านั้น
   เช่น 30 ขวด -> 1 ลัง24 + 6 ขวด
   ไม่ใช้หน่วยกลาง เช่น แพ็ค6 / ลัง12
   ===================================================== */

POS.inventoryItemsFormatStock = function(item){

  const stock = Number(item?.stock ?? 0);
  const baseUnit = String(item?.base_unit || "").trim() || "หน่วย";

  if(!Number.isFinite(stock)){
    return "-";
  }

  if(stock <= 0){
    return "0 " + baseUnit;
  }

  const ingredientId = String(item?.id || "");

  const units =
    (Array.isArray(POS.inventoryPurchaseUnitsData)
      ? POS.inventoryPurchaseUnitsData
      : [])
      .filter(function(unit){

        if(String(unit?.ingredient_id || "") !== ingredientId){
          return false;
        }

        if(unit?.active === false){
          return false;
        }

        const multiple = Number(unit?.multiple ?? 0);

        return Number.isFinite(multiple) && multiple > 0 &&
          String(unit?.unit_name || "").trim() !== "";

      })
      .map(function(unit){
        return {
          name: String(unit.unit_name).trim(),
          multiple: Number(unit.multiple)
        };
      });

  if(!units.length){
    return stock.toLocaleString("th-TH") + " " + baseUnit;
  }

  // หน่วยใหญ่สุด = multiple มากที่สุด
  // หน่วยเล็กสุด = multiple น้อยที่สุด
  units.sort(function(a,b){
    return a.multiple - b.multiple;
  });

  const smallest = units[0];
  const largest = units[units.length - 1];

  // ถ้ามีเพียงหน่วยเดียว ใช้หน่วยนั้นได้เลย
  if(largest.multiple === smallest.multiple){

    const qty = stock / smallest.multiple;

    if(Number.isInteger(qty)){
      return qty.toLocaleString("th-TH") + " " + smallest.name;
    }

    return stock.toLocaleString("th-TH") + " " + baseUnit;
  }

  const largeQty = Math.floor(stock / largest.multiple);
  const remainder = stock - (largeQty * largest.multiple);

  // แสดงหน่วยเล็กสุดเฉพาะส่วนที่เหลือ
  const smallQty = Math.floor(remainder / smallest.multiple);
  const finalRemainder = remainder - (smallQty * smallest.multiple);

  const parts = [];

  if(largeQty > 0){
    parts.push(
      largeQty.toLocaleString("th-TH") + " " + largest.name
    );
  }

  if(smallQty > 0){
    parts.push(
      smallQty.toLocaleString("th-TH") + " " + smallest.name
    );
  }

  // กรณีสต็อกมีเศษที่ไม่สามารถแปลงเป็นหน่วยซื้อเล็กสุดได้
  if(Math.abs(finalRemainder) > 0.0000001){
    parts.push(
      finalRemainder.toLocaleString("th-TH") + " " + baseUnit
    );
  }

  return parts.length
    ? parts.join(" + ")
    : "0 " + smallest.name;

};


/* =====================================================
   RENDER
   ===================================================== */

POS.inventoryItemsRender = function(){

  const body =
    document.getElementById(
      "inventoryItemsTableBody"
    );

  if(!body){
    return;
  }


  const search =
    String(
      document.getElementById(
        "inventoryItemsSearch"
      )?.value || ""
    ).trim().toLowerCase();


  const statusFilter =
    String(
      document.getElementById(
        "inventoryItemsStatus"
      )?.value || ""
    ).trim();


  const allItems =
    Array.isArray(
      POS.inventoryItemsData
    )
      ? POS.inventoryItemsData
      : [];


  let total = 0;
  let low = 0;
  let empty = 0;
  let stockValue = 0;


  allItems.forEach(item => {

    const stock =
      Number(item?.stock ?? 0);

    const minimum =
      Number(item?.minimum ?? 0);

    const cost =
      Number(item?.average_cost ?? 0);

    total++;

    if(stock <= 0){
      empty++;
    }else if(
      minimum > 0 &&
      stock <= minimum
    ){
      low++;
    }

    stockValue +=
      stock * cost;

  });


  const totalEl =
    document.getElementById(
      "inventoryItemsTotal"
    );

  const lowEl =
    document.getElementById(
      "inventoryItemsLow"
    );

  const emptyEl =
    document.getElementById(
      "inventoryItemsEmpty"
    );

  const valueEl =
    document.getElementById(
      "inventoryItemsValue"
    );


  if(totalEl){
    totalEl.textContent =
      total.toLocaleString("th-TH");
  }

  if(lowEl){
    lowEl.textContent =
      low.toLocaleString("th-TH");
  }

  if(emptyEl){
    emptyEl.textContent =
      empty.toLocaleString("th-TH");
  }

  if(valueEl){
    valueEl.textContent =
      stockValue.toLocaleString(
        "th-TH",
        {
          minimumFractionDigits:2,
          maximumFractionDigits:2
        }
      ) + " บาท";
  }


  const filtered =
    allItems.filter(item => {

      const sku =
        String(item?.sku || "")
          .toLowerCase();

      const name =
        String(item?.name || "")
          .toLowerCase();

      const unit =
        String(item?.base_unit || "")
          .toLowerCase();

      const stock =
        Number(item?.stock ?? 0);

      const minimum =
        Number(item?.minimum ?? 0);


      let status = "normal";

      if(stock <= 0){
        status = "empty";
      }else if(
        minimum > 0 &&
        stock <= minimum
      ){
        status = "low";
      }


      const matchSearch =
        !search ||
        sku.includes(search) ||
        name.includes(search) ||
        unit.includes(search);


      const matchStatus =
        !statusFilter ||
        statusFilter === status;


      return (
        matchSearch &&
        matchStatus
      );

    });


  /* ---------------------------------------------------------
     เรียงรายการตามรหัสวัตถุดิบ (SKU) จากน้อยไปมาก
     เช่น ING001 → ING002 → ING003 → ING004 → ING005
     --------------------------------------------------------- */
  filtered.sort(function(a, b){

    const skuA =
      String(a?.sku || "").trim();

    const skuB =
      String(b?.sku || "").trim();

    return skuA.localeCompare(
      skuB,
      undefined,
      {
        numeric:true,
        sensitivity:"base"
      }
    );

  });


  if(!filtered.length){

    body.innerHTML = `
      <tr>
        <td
          colspan="8"
          style="
            padding:45px 20px;
            text-align:center;
            color:#888;
          "
        >
          ${
            allItems.length
              ? "ไม่พบวัตถุดิบตามเงื่อนไขที่ค้นหา"
              : "ยังไม่มีวัตถุดิบ"
          }
        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    filtered.map((item,index) => {

      const stock =
        Number(item?.stock ?? 0);

      const minimum =
        Number(item?.minimum ?? 0);

      let status = "normal";
      let statusText = "🟢 ปกติ";

      if(stock <= 0){

        status = "empty";
        statusText = "🔴 หมดสต็อก";

      }else if(
        minimum > 0 &&
        stock <= minimum
      ){

        status = "low";
        statusText = "🟠 ใกล้หมด";

      }


      const statusStyle =
        status === "empty"
          ? "color:#c0392b;background:#fdecec;"
          : status === "low"
            ? "color:#b9770e;background:#fff5df;"
            : "color:#267a3d;background:#e8f6ec;";


      const id =
        String(item?.id || "");

      const sku =
        String(item?.sku || "-");

      const name =
        String(item?.name || "-");

      const unit =
        String(item?.base_unit || "-");


      const safeId =
        id.replace(/\\/g,"\\\\")
          .replace(/'/g,"\\'");


      return `
        <tr
          style="
            border-bottom:1px solid #f0f0f0;
          "
        >

          <td style="padding:13px 10px;">
            ${index + 1}
          </td>

          <td
            style="
              padding:13px 10px;
              font-weight:700;
            "
          >
            ${sku}
          </td>

          <td style="padding:13px 10px;">
            ${name}
          </td>

          <td
            style="
              padding:13px 10px;
              text-align:right;
              font-weight:700;
            "
          >
            ${POS.inventoryItemsFormatStock(item)}
          </td>

          <td
            style="
              padding:13px 10px;
              text-align:right;
            "
          >
            ${minimum.toLocaleString("th-TH")}
          </td>

          <td style="padding:13px 10px;">
            ${unit}
          </td>

          <td style="padding:13px 10px;">
            <span
              style="
                display:inline-block;
                padding:5px 9px;
                border-radius:999px;
                font-size:13px;
                font-weight:700;
                ${statusStyle}
              "
            >
              ${statusText}
            </span>
          </td>

          <td
            style="
              padding:13px 10px;
              text-align:center;
              white-space:nowrap;
            "
          >

            <button
              type="button"
              onclick="POS.inventoryItemsEdit('${safeId}')"
              style="
                border:1px solid #d7dce2;
                background:#fff;
                color:#374151;
                border-radius:8px;
                padding:7px 10px;
                cursor:pointer;
                font-weight:700;
                margin-right:5px;
              "
            >
              ✏️ แก้ไข
            </button>

            <button
              type="button"
              onclick="POS.inventoryItemsDelete('${safeId}')"
              style="
                border:1px solid #f0caca;
                background:#fff5f5;
                color:#c0392b;
                border-radius:8px;
                padding:7px 10px;
                cursor:pointer;
                font-weight:700;
              "
            >
              🗑️ ลบ
            </button>

          </td>

        </tr>
      `;

    }).join("");

};


/* =====================================================
   FILTER
   ===================================================== */

POS.inventoryItemsFilter = function(){

  POS.inventoryItemsRender();

};


/* =====================================================
   EDIT
   ===================================================== */

POS.inventoryItemsEdit = function(id){

  if(!id){
    return;
  }


  const item =
    POS.inventoryItemsData.find(
      x =>
        String(x?.id || "") ===
        String(id)
    );


  if(!item){

    POS.inventoryItemsShowSuccess({
      title:"ไม่พบวัตถุดิบ",
      message:"ไม่พบวัตถุดิบรายการนี้"
    });

    return;
  }


  POS.inventoryItemsEditingId =
    item.id || null;

  POS.inventoryItemsEditingSku =
    item.sku || null;


  const title =
    document.getElementById(
      "inventoryItemsModalTitle"
    );

  if(title){
    title.textContent =
      "✏️ แก้ไขวัตถุดิบ";
  }


  const nameInput =
    document.getElementById(
      "inventoryItemName"
    );

  const unitInput =
    document.getElementById(
      "inventoryItemUnit"
    );

  const minimumInput =
    document.getElementById(
      "inventoryItemMinimum"
    );


  if(nameInput){
    nameInput.value =
      item.name || "";
  }

  if(unitInput){
    unitInput.value =
      item.base_unit || "";
  }

  if(minimumInput){
    minimumInput.value =
      Number(item.minimum ?? 0);
  }


  const modal =
    document.getElementById(
      "inventoryItemsModal"
    );

  if(modal){
    modal.style.display =
      "flex";
  }

};


/* =====================================================
   DELETE
   ===================================================== */

POS.inventoryItemsDelete = async function(id){

  if(!id){
    return;
  }


  const item =
    POS.inventoryItemsData.find(
      x =>
        String(x?.id || "") ===
        String(id)
    );


  if(!item){
    POS.inventoryItemsShowSuccess({
      title:"ไม่พบวัตถุดิบ",
      message:"ไม่พบวัตถุดิบรายการนี้"
    });
    return;
  }


  const confirmed =
    await POS.inventoryItemsShowConfirm({
      title:"ยืนยันการลบวัตถุดิบ",
      message:
        "ต้องการลบวัตถุดิบ \"" +
        String(item.name || "") +
        "\" ใช่หรือไม่?"
    });

  if(!confirmed){
    return;
  }


  try{

    const result =
      await POS.api.ingredientDelete(
        id
      );


    if(
      !result ||
      result.success !== true
    ){
      throw new Error(
        result?.error ||
        result?.message ||
        "ลบวัตถุดิบไม่สำเร็จ"
      );
    }


    await POS.inventoryItemsLoad();

    POS.inventoryItemsShowSuccess({
      title:"ลบวัตถุดิบเรียบร้อย",
      message:"ลบวัตถุดิบเรียบร้อยแล้ว"
    });

  }catch(error){

    console.error(
      "ลบวัตถุดิบไม่สำเร็จ:",
      error
    );

    POS.inventoryItemsShowSuccess({
      title:"ลบวัตถุดิบไม่สำเร็จ",
      message:String(error?.message || error)
    });

  }

};


/* =====================================================
   AUTO LOAD
   โหลดทุกครั้งที่หน้า 01 ถูกสร้างใหม่
   ไม่ต้องกดปุ่ม "รีเฟรช"
   ===================================================== */

(function(){

  // จำ DOM ของตารางที่โหลดไปแล้ว
  // เมื่อ Router สร้างหน้า 01 ใหม่ tableBody จะเป็นคนละตัว
  let lastLoadedTableBody = null;
  let loadingTableBody = null;

  const loadWhenReady = function(){

    const tableBody =
      document.getElementById(
        "inventoryItemsTableBody"
      );

    if(!tableBody){
      return;
    }

    // DOM เดิมโหลดแล้ว ไม่ต้องโหลดซ้ำ
    if(
      tableBody === lastLoadedTableBody ||
      tableBody === loadingTableBody
    ){
      return;
    }

    loadingTableBody = tableBody;

    Promise.resolve(
      POS.inventoryItemsLoad()
    )
    .catch(function(error){

      console.error(
        "โหลดวัตถุดิบอัตโนมัติไม่สำเร็จ:",
        error
      );

    })
    .finally(function(){

      // ห้าม disconnect observer
      // เพราะหน้า 01 สามารถถูกเปิดใหม่ได้หลายครั้ง
      if(loadingTableBody === tableBody){

        lastLoadedTableBody = tableBody;
        loadingTableBody = null;

      }

    });

  };


  // ---------------------------------------------------------
  // Observer ทำงานต่อเนื่อง
  // รองรับการเข้า/ออกหน้า 01 ได้ทุกครั้ง
  // ---------------------------------------------------------

  if(document.body){

    const observer =
      new MutationObserver(function(){

        loadWhenReady();

      });

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }


  // ---------------------------------------------------------
  // กรณีหน้า 01 มีอยู่แล้วใน DOM ตอน JS ถูกโหลด
  // ---------------------------------------------------------

  loadWhenReady();

})();

