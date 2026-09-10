/*
 * =====================================================
 * TEST: FRESH #pageContent FOR PAGE 04 RECIPES
 * วันที่ 2026-09-10
 *
 * เป้าหมาย:
 * สร้าง #pageContent ใหม่เฉพาะตอนเปิด inventoryRecipes
 * เพื่อพิสูจน์ว่าอาการ iPad ที่หายหลัง Refresh
 * เกิดจากการ reuse scroll container เดิมหรือไม่
 *
 * หน้าอื่นไม่เปลี่ยน logic
 * =====================================================
 */

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
        class="inventory-menu-grid"
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

    /*
     * RECIPES เปิดแบบ Dynamic บน iPad/Safari
     * ให้ Router เป็นผู้สั่ง LOAD หลังจากหน้าใหม่ settle
     * เพื่อไม่ให้ MutationObserver โหลดตารางใน frame แรก
     */
    if(pageName === "inventoryRecipes"){
      POS.inventoryRecipesOpening = true;
    }

    /*
     * สร้าง HTML ของหน้าที่ต้องการก่อน
     */
    const html = await page();

    /*
     * ใช้พื้นที่แสดงผลหลักของระบบ
     * #pageContent คือ scroll container หลักของระบบ
     *
     * TEST:
     * เฉพาะ PAGE 04 สูตร ให้สร้าง #pageContent ใหม่ทั้งตัว
     * เพื่อจำลองพฤติกรรมตอน Refresh โดยไม่แตะหน้าอื่น
     */
    const content =
      document.querySelector("#pageContent");

    let renderHost = content;

    if(
      pageName === "inventoryRecipes" &&
      content
    ){
      const freshContent =
        content.cloneNode(false);

      freshContent.innerHTML = "";

      content.replaceWith(freshContent);

      renderHost = freshContent;
    }

    /*
     * PAGE 04 สูตร:
     * ใช้ #pageContent ตัวใหม่โดยตรง
     *
     * หน้าอื่น:
     * ใช้ logic เดิม 100%
     */
    const current =
      pageName === "inventoryRecipes"
        ? null
        : document.querySelector(
            ".inventory-page, .inventory-subpage"
          );

    if(current){

      current.outerHTML = html;

    }else if(renderHost){

      /*
       * ใส่ HTML ลงในพื้นที่หลัก
       */
      renderHost.innerHTML = html;

    }else{

      /*
       * fallback เดิม เผื่อระบบบางหน้ามีโครงสร้างต่างกัน
       */
      const fallback =
        document.querySelector(
          "#app, #mainContent, .main-content, .content"
        );

      if(fallback){

        fallback.innerHTML = html;

      }else{

        console.error(
          "ไม่พบพื้นที่สำหรับแสดงหน้า Stock"
        );

        return;
      }
    }

    /*
     * =================================================
     * PAGE 04 : สูตร
     * =================================================
     *
     * รอ 2 frame ให้ Safari/iPad สร้าง layout/paint
     * ของหน้าใหม่ก่อน แล้วจึง render ตาราง
     */
    if(
      pageName === "inventoryRecipes" &&
      typeof POS.inventoryRecipesLoad === "function"
    ){

      await new Promise(function(resolve){
        requestAnimationFrame(function(){
          requestAnimationFrame(resolve);
        });
      });

      const recipesHost =
        document.querySelector("#pageContent");

      if(recipesHost){
        void recipesHost.offsetHeight;
      }

      POS.inventoryRecipesOpening = false;
      await POS.inventoryRecipesLoad();
    }


    /*
     * =================================================
     * PAGE 01 : วัตถุดิบ
     * =================================================
     *
     * หลังจาก HTML เข้า DOM แล้ว
     * สั่งโหลดข้อมูลโดยตรง ไม่รอ MutationObserver
     */
    if(
      pageName === "inventoryItems" &&
      typeof POS.inventoryItemsLoad === "function"
    ){

      /*
       * รอให้ browser สร้าง layout ของหน้าใหม่ก่อน
       */
      await new Promise(function(resolve){

        requestAnimationFrame(function(){

          requestAnimationFrame(resolve);

        });

      });

      /*
       * โหลดข้อมูลวัตถุดิบโดยตรง
       */
      await POS.inventoryItemsLoad();

      /*
       * ให้ scroll container คำนวณความสูงใหม่
       */
      const scrollHost =
        document.querySelector("#pageContent");

      if(scrollHost){

        void scrollHost.offsetHeight;

      }

    }

  }catch(error){

    if(pageName === "inventoryRecipes"){
      POS.inventoryRecipesOpening = false;
    }

    console.error(
      "เปิดหน้า Stock ไม่สำเร็จ:",
      error
    );

  }

};