POS.pages.inventory = async function(){

  return `
    <div class="inventory-page">

      <h1 class="page-title">📦 สต็อก</h1>

      <p class="page-subtitle">
        จัดการวัตถุดิบ / ซื้อเข้า / หน่วย / สูตร / Movement / ตรวจนับ
      </p>

      <!-- =================================================
           STOCK MENU
           ================================================= -->

      <div
        style="
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:18px;
          margin-top:24px;
        "
      >

        <!-- วัตถุดิบ -->
        <div
          class="card"
          style="
            min-height:120px;
            display:flex;
            align-items:center;
            gap:18px;
            padding:24px;
            cursor:pointer;
            transition:transform .15s ease, box-shadow .15s ease;
          "
          onclick="POS.openInventorySubPage && POS.openInventorySubPage('inventoryItems')"
        >
          <div
            style="
              width:58px;
              height:58px;
              border-radius:16px;
              background:#eef7ff;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            "
          >📋</div>

          <div>
            <div style="font-size:19px;font-weight:700;">
              วัตถุดิบ
            </div>

            <div
              style="
                margin-top:5px;
                color:#777;
                font-size:14px;
              "
            >
              รายการวัตถุดิบและยอดคงเหลือ
            </div>
          </div>
        </div>


        <!-- ซื้อเข้า -->
        <div
          class="card"
          style="
            min-height:120px;
            display:flex;
            align-items:center;
            gap:18px;
            padding:24px;
            cursor:pointer;
            transition:transform .15s ease, box-shadow .15s ease;
          "
          onclick="POS.openInventorySubPage && POS.openInventorySubPage('inventoryPurchase')"
        >
          <div
            style="
              width:58px;
              height:58px;
              border-radius:16px;
              background:#f1f8ed;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            "
          >🛒</div>

          <div>
            <div style="font-size:19px;font-weight:700;">
              ซื้อเข้า
            </div>

            <div
              style="
                margin-top:5px;
                color:#777;
                font-size:14px;
              "
            >
              รับวัตถุดิบเข้าสู่สต็อก
            </div>
          </div>
        </div>


        <!-- หน่วย -->
        <div
          class="card"
          style="
            min-height:120px;
            display:flex;
            align-items:center;
            gap:18px;
            padding:24px;
            cursor:pointer;
            transition:transform .15s ease, box-shadow .15s ease;
          "
          onclick="POS.openInventorySubPage && POS.openInventorySubPage('inventoryUnits')"
        >
          <div
            style="
              width:58px;
              height:58px;
              border-radius:16px;
              background:#fff7e8;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            "
          >📏</div>

          <div>
            <div style="font-size:19px;font-weight:700;">
              หน่วย
            </div>

            <div
              style="
                margin-top:5px;
                color:#777;
                font-size:14px;
              "
            >
              จัดการหน่วยและการแปลงหน่วย
            </div>
          </div>
        </div>


        <!-- สูตร -->
        <div
          class="card"
          style="
            min-height:120px;
            display:flex;
            align-items:center;
            gap:18px;
            padding:24px;
            cursor:pointer;
            transition:transform .15s ease, box-shadow .15s ease;
          "
          onclick="POS.openInventorySubPage && POS.openInventorySubPage('inventoryRecipes')"
        >
          <div
            style="
              width:58px;
              height:58px;
              border-radius:16px;
              background:#fff0f0;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            "
          >🍳</div>

          <div>
            <div style="font-size:19px;font-weight:700;">
              สูตร
            </div>

            <div
              style="
                margin-top:5px;
                color:#777;
                font-size:14px;
              "
            >
              สูตรอาหารและการใช้วัตถุดิบ
            </div>
          </div>
        </div>


        <!-- Movement -->
        <div
          class="card"
          style="
            min-height:120px;
            display:flex;
            align-items:center;
            gap:18px;
            padding:24px;
            cursor:pointer;
            transition:transform .15s ease, box-shadow .15s ease;
          "
          onclick="POS.openInventorySubPage && POS.openInventorySubPage('inventoryMovement')"
        >
          <div
            style="
              width:58px;
              height:58px;
              border-radius:16px;
              background:#f3efff;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            "
          >📦</div>

          <div>
            <div style="font-size:19px;font-weight:700;">
              Movement
            </div>

            <div
              style="
                margin-top:5px;
                color:#777;
                font-size:14px;
              "
            >
              ประวัติการเคลื่อนไหวของสต็อก
            </div>
          </div>
        </div>


        <!-- ตรวจนับ -->
        <div
          class="card"
          style="
            min-height:120px;
            display:flex;
            align-items:center;
            gap:18px;
            padding:24px;
            cursor:pointer;
            transition:transform .15s ease, box-shadow .15s ease;
          "
          onclick="POS.openInventorySubPage && POS.openInventorySubPage('inventoryCount')"
        >
          <div
            style="
              width:58px;
              height:58px;
              border-radius:16px;
              background:#eefbf5;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            "
          >🔍</div>

          <div>
            <div style="font-size:19px;font-weight:700;">
              ตรวจนับ
            </div>

            <div
              style="
                margin-top:5px;
                color:#777;
                font-size:14px;
              "
            >
              ตรวจสอบและปรับยอดสต็อก
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
};


/* =====================================================
   OPEN STOCK SUB PAGE
   ===================================================== */

POS.openInventorySubPage = async function(pageName){

  const page = POS.pages[pageName];

  if(typeof page !== "function"){
    console.error(
      "ไม่พบหน้า Stock:",
      pageName
    );
    return;
  }

  try{

    const html = await page();

    /*
     * หา container หลักของหน้าปัจจุบัน
     * โดยใช้ element ที่มี inventory-page / inventory-subpage
     */

    const current =
      document.querySelector(
        ".inventory-page, .inventory-subpage"
      );

    if(current){

      current.outerHTML = html;

      return;
    }

    /*
     * fallback:
     * ถ้าไม่พบ ให้หาพื้นที่ content หลัก
     */

    const content =
      document.querySelector(
        "#app, #mainContent, .main-content, .content"
      );

    if(content){

      content.innerHTML = html;

      return;
    }

    console.error(
      "ไม่พบพื้นที่สำหรับแสดงหน้า Stock"
    );

  }catch(error){

    console.error(
      "เปิดหน้า Stock ไม่สำเร็จ:",
      error
    );

  }

};