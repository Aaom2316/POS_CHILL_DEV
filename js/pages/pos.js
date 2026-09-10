POS.pages.pos = async function () {

  try {

    // =====================================================
    // BUSINESS DATE
    // ใช้วันทำการจาก Backend
    // ไม่ใช้วันที่เครื่องสำหรับ "วัน" ของบิล
    // =====================================================

    const systemData =
      await POS.api.systemSettings();

    const businessDateSetting =
      (systemData?.settings || [])
        .find(
          item =>
            String(item?.key || "").trim() ===
            "BUSINESS_DATE"
        );

    const businessDate =
      String(
        businessDateSetting?.value ||
        ""
      ).trim();

    if(
      !/^\d{4}-\d{2}-\d{2}$/.test(
        businessDate
      )
    ){

      throw new Error(
        "INVALID_BUSINESS_DATE"
      );

    }

    window.POS.businessDate =
      businessDate;


    // =====================================================
    // STORAGE
    // =====================================================

    const CART_STORAGE_KEY =
      "POS_CHILL_CART";

    const PENDING_BILLS_STORAGE_KEY =
      "POS_CHILL_PENDING_BILLS";


    // =====================================================
    // LOAD CART
    // =====================================================

    if(!Array.isArray(window.POS.cart)){

      try{

        const savedCart =
          localStorage.getItem(
            CART_STORAGE_KEY
          );

        window.POS.cart =
          savedCart
            ? JSON.parse(savedCart)
            : [];

      }catch(error){

        console.error(
          "LOAD CART ERROR:",
          error
        );

        window.POS.cart = [];

      }

    }


    // =====================================================
    // LOAD PENDING BILLS
    // =====================================================
    //
    // FIX:
    // บิลค้างต้องอ่านจาก Backend เพื่อให้ทุกเครื่องเห็นข้อมูลชุดเดียวกัน
    // localStorage ใช้เป็น cache สำรองเท่านั้น
    // =====================================================

    // โหลดจาก Backend ทุกครั้งที่เปิดหน้า POS
    // เพื่อไม่ให้ข้อมูลเก่าจาก window.POS / localStorage
    // ทำให้เครื่องอื่นไม่เห็นบิลค้างล่าสุด
    try{

      // ---------------------------------------------
      // LOAD PENDING SALES FROM BACKEND
      // ---------------------------------------------

      const salesResult =
        await POS.api.salesList();

        if(
          salesResult &&
          salesResult.success === true &&
          Array.isArray(salesResult.sales)
        ){

          const menusResult =
            await POS.api.menus();

          const menus =
            menusResult?.menus || [];

          const bills = {};

          salesResult.sales
            .filter(
              row =>
                String(
                  row.payment_status || ""
                ).toUpperCase() === "UNPAID"
            )
            .forEach(row => {

              const billId =
                String(
                  row.remark || ""
                ).trim();

              if(!billId){
                return;
              }

              const menu =
                menus.find(
                  m =>
                    String(m.id) ===
                    String(row.menu_id)
                );

              if(!bills[billId]){

                bills[billId] = {
                  billId:
                    billId,

                  createdAt:
                    row.sold_at ||
                    row.created_at ||
                    null,

                    customer_name:
                      String(
                        row.customer_name || ""
                      ).trim(),

                  items: [],

                  total: 0,

                  status:
                    "UNPAID"
                };

              }else if(
                !bills[billId].customer_name &&
                row.customer_name
              ){

                bills[billId].customer_name =
                  String(
                    row.customer_name || ""
                  ).trim();

              }

              bills[billId].items.push({

                sku:
                  menu?.sku ||
                  row.sku ||
                  "",

                name:
                  menu?.name ||
                  row.menu_name ||
                  "ไม่พบชื่อเมนู",

                price:
                  Number(
                    row.unit_price || 0
                  ),

                emoji:
                  menu?.emoji ||
                  "🍹",

                qty:
                  Number(
                    row.qty || 0
                  )

              });

              bills[billId].total +=
                Number(
                  row.total || 0
                );

            });

          window.POS.pendingBills =
            Object.values(bills);

          // ---------------------------------------------
          // เก็บเป็น cache สำรองของเครื่องนี้
          // ---------------------------------------------

          savePendingBills();

        }else{

          // ---------------------------------------------
          // BACKEND ใช้งานไม่ได้ → ใช้ cache เดิม
          // ---------------------------------------------

          const savedBills =
            localStorage.getItem(
              PENDING_BILLS_STORAGE_KEY
            );

          window.POS.pendingBills =
            savedBills
              ? JSON.parse(savedBills)
              : [];

        }

      }catch(error){

        console.error(
          "LOAD PENDING BILLS ERROR:",
          error
        );

        // ---------------------------------------------
        // FALLBACK: ใช้ cache เดิมถ้า Backend error
        // ---------------------------------------------

        try{

          const savedBills =
            localStorage.getItem(
              PENDING_BILLS_STORAGE_KEY
            );

          window.POS.pendingBills =
            savedBills
              ? JSON.parse(savedBills)
              : [];

        }catch(cacheError){

          console.error(
            "LOAD PENDING BILLS CACHE ERROR:",
            cacheError
          );

          window.POS.pendingBills = [];

        }

      }



    // =====================================================
    // SAVE CART
    // =====================================================

    function saveCart(){

      try{

        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(
            window.POS.cart || []
          )
        );

      }catch(error){

        console.error(
          "SAVE CART ERROR:",
          error
        );

      }

    }


    // =====================================================
    // SAVE PENDING BILLS
    // =====================================================

    function savePendingBills(){

      try{

        localStorage.setItem(
          PENDING_BILLS_STORAGE_KEY,
          JSON.stringify(
            window.POS.pendingBills || []
          )
        );

      }catch(error){

        console.error(
          "SAVE PENDING BILLS ERROR:",
          error
        );

      }

    }


    // =====================================================
    // GENERATE BILL ID
    // =====================================================

    function generateBillId(
      businessDateValue
    ){

      const dateKey =
        String(
          businessDateValue ||
          window.POS.businessDate ||
          ""
        )
        .replace(/\D/g,"");

      const random =
        Math.floor(
          Math.random() * 1000
        )
        .toString()
        .padStart(3,"0");


      return "B" +
        dateKey +
        random;

    }


    // =====================================================
    // BUSINESS DATE + CURRENT TIME
    // วันใช้ BUSINESS_DATE
    // เวลาใช้เวลาจริง ณ ตอนสร้างบิล
    // =====================================================

    function getBusinessDateTime(){

      const now =
        new Date();

      const parts =
        new Intl.DateTimeFormat(
          "en-GB",
          {
            timeZone:
              "Asia/Bangkok",

            hour:
              "2-digit",

            minute:
              "2-digit",

            second:
              "2-digit",

            hour12:
              false
          }
        )
        .formatToParts(now);

      const getPart =
        type =>
          parts.find(
            part =>
              part.type === type
          )?.value || "00";

      const milliseconds =
        String(
          now.getMilliseconds()
        )
        .padStart(3,"0");

      return (
        businessDate +
        "T" +
        getPart("hour") +
        ":" +
        getPart("minute") +
        ":" +
        getPart("second") +
        "." +
        milliseconds +
        "+07:00"
      );

    }


    // =====================================================
    // GET CART TOTAL
    // =====================================================

    function getCartTotal(){

      return (
        window.POS.cart || []
      ).reduce(
        (sum,item) =>
          sum +
          (
            Number(item.price || 0) *
            Number(item.qty || 0)
          ),
        0
      );

    }


    // =====================================================
    // GET CART QTY
    // =====================================================

    function getCartQty(){

      return (
        window.POS.cart || []
      ).reduce(
        (sum,item) =>
          sum +
          Number(item.qty || 0),
        0
      );

    }


    // =====================================================
    // LOAD MENU
    // =====================================================

    const res =
      await POS.api.menus();

    const menus =
      res.menus || [];


    // =====================================================
    // NO MENU
    // =====================================================

    if(!menus.length){

      return `

        <h1 class="page-title">
          POS
        </h1>

        <p class="page-subtitle">
          เลือกเมนู
        </p>

        <div class="panel">
          ยังไม่มีเมนูที่เปิดขาย
        </div>

      `;

    }


    // =====================================================
    // GROUP MENU
    // =====================================================

    const groups = {};


    menus.forEach(menu => {

      const category =
        menu.category || "อื่นๆ";


      if(!groups[category]){

        groups[category] = [];

      }


      groups[category].push(menu);

    });


    // =====================================================
    // HTML
    // =====================================================

    let html = `

      <h1 class="page-title">
        POS
      </h1>

      <p class="page-subtitle">
        เลือกเมนู
      </p>

      <!-- ===================================================
                POS TABS
            =================================================== -->

            <div class="pos-tabs">

              <button
                type="button"
                class="pos-tab active"
                data-pos-tab="sell"
              >
                🛒 ขายสินค้า
              </button>

              <button
                type="button"
                class="pos-tab"
                data-pos-tab="pending"
              >
                🟡 บิลค้างจ่าย
              </button>

              <button
                type="button"
                class="pos-tab"
                data-pos-tab="paid"
              >
                🧾 รายการบิลขายแล้ว
              </button>

            </div>


      <!-- =================================================
           CURRENT CART
           ================================================= -->

      <div class="panel pos-cart-panel">

        <div class="pos-cart-header">

          <h2 class="pos-cart-title">
            🛒 ตะกร้าปัจจุบัน
          </h2>

          <div
            id="posCartCount"
            class="pos-cart-count"
          >
            0 รายการ
          </div>

        </div>


        <div id="posCartItems">

          <div class="pos-cart-empty">
            ยังไม่มีสินค้าในตะกร้า
          </div>

        </div>


        <div
          id="posCartTotal"
          class="pos-cart-total"
          style="display:none;"
        >

          <span>
            รวมทั้งหมด
          </span>

          <strong>
            0 บาท
          </strong>

        </div>


        <!-- =================================================
             PAYMENT ACTION
             ================================================= -->

        <div
          id="posPaymentActions"
          class="pos-payment-actions"
          style="display:none;"
        >

          <button
            type="button"
            id="posPendingBtn"
            class="pos-pending-btn"
          >
            🟡 ค้างจ่าย
          </button>


          <button
            type="button"
            id="posCurrentCartPay"
            class="pos-pay-btn"
          >
            🟢 รับชำระ
          </button>

        </div>

      </div>


      <!-- =================================================
           PENDING BILLS
           ================================================= -->

      <div
        id="posPendingBillsPanel"
        class="panel pos-pending-panel"
        style="display:none;"
      >

        <div class="pos-pending-header">

          <h2 class="pos-pending-title">
            🟡 บิลค้างจ่าย
          </h2>

          <div
            id="posPendingCount"
            class="pos-pending-count"
          >
            0 บิล
          </div>

        </div>


        <div id="posPendingBills">

        <div class="pos-cart-empty">
          ยังไม่มีบิลค้างจ่าย
        </div>

        </div>

      </div>

            <!-- =================================================
           PAID BILLS
           ================================================= -->

      <div
        id="posPaidBillsPanel"
        class="panel pos-paid-panel"
        style="display:none;"
      >

        <div class="pos-pending-header">

          <h2 class="pos-pending-title">
            🧾 รายการบิลขายแล้ว
          </h2>

          <div
            id="posPaidBillsCount"
            class="pos-pending-count"
          >
            0 บิล
          </div>

        </div>


        <div id="posPaidBills">

          <div class="pos-cart-empty">
            ยังไม่มีรายการบิลขาย
          </div>

        </div>

      </div>

    `;


    // =====================================================
    // MENU
    // =====================================================

    Object.keys(groups).forEach(category => {

      html += `

        <div class="panel pos-category">

          <h2 class="pos-category-title">
            ${category}
          </h2>

          <div class="pos-menu-grid">

      `;


      groups[category].forEach(menu => {

        html += `

          <button
            type="button"
            class="pos-menu-card"

            data-sku="${menu.sku}"
            data-name="${menu.name}"
            data-price="${menu.price}"
            data-emoji="${menu.emoji || "🍹"}"
          >

            <div class="pos-menu-emoji">
              ${menu.emoji || "🍹"}
            </div>

            <div class="pos-menu-name">
              ${menu.name}
            </div>

            <div class="pos-menu-price">
              ${Number(menu.price).toLocaleString("th-TH")}
              บาท
            </div>

          </button>

        `;

      });


      html += `

          </div>

        </div>

      `;

    });


    // =====================================================
    // PENDING BILL DETAIL MODAL
    // =====================================================

    html += `

      <div
        id="posPendingBillModal"
        class="pos-pending-bill-modal"
        style="display:none;"
      >

        <div class="pos-pending-bill-box">

          <button
            type="button"
            id="posPendingBillClose"
            class="pos-pending-bill-close"
          >
            ×
          </button>


          <div class="pos-pending-bill-title">
            🟡 บิลค้างจ่าย
          </div>


          <div
            id="posPendingBillId"
            class="pos-pending-bill-id-large"
          >
            บิล
          </div>

          <div
            id="posPendingBillSaleDate"
            class="pos-pending-bill-sale-date"
          >
            📅 วันที่ขาย -
          </div>

          
          <div class="pos-pending-customer-field">

            <label
              for="posPendingBillCustomerName"
              class="pos-pending-customer-label"
            >
              👤 ชื่อลูกค้า
            </label>

            <input
              type="text"
              id="posPendingBillCustomerName"
              class="pos-pending-customer-input"
              placeholder="กรอกชื่อลูกค้า"
              autocomplete="off"
            />

          </div>

<div 
            id="posPendingBillCount"
            style="
              margin-top:-12px;
              margin-bottom:16px;
              color:#64748b;
              font-size:14px;
              font-weight:700;
            "
          >
            0 รายการ
          </div>


          <div
            id="posPendingBillItems"
            class="pos-pending-bill-items"
          >
          </div>


          <div class="pos-pending-bill-total-large">

            <span>
              ยอดรวม
            </span>

            <strong
              id="posPendingBillTotal"
            >
              0 บาท
            </strong>

          </div>


          <button
            type="button"
            id="posPendingBillAddMenu"
            class="pos-pending-bill-add-menu"
          >
            ＋ เพิ่มเมนู
          </button>

          <button
            type="button"
            id="posPendingBillPay"
            class="pos-pending-bill-pay"
          >
            🟢 รับชำระ
          </button>

        </div>

      </div>

    `;

        // =====================================================
    // CONFIRM PAYMENT MODAL
    // =====================================================

        html += `

      <div
        id="posConfirmPaymentModal"
        class="pos-confirm-payment-modal"
        style="display:none;"
      >

        <div class="pos-confirm-payment-box">

          <button
            type="button"
            id="posConfirmPaymentClose"
            class="pos-confirm-payment-close"
          >
            ×
          </button>


          <div class="pos-confirm-payment-icon">
            💵
          </div>


          <div class="pos-confirm-payment-title">
            รับชำระ
          </div>


          <div
            id="posConfirmPaymentBill"
            class="pos-confirm-payment-bill"
          >
            บิล
          </div>


          <div
            id="posConfirmPaymentItems"
            class="pos-confirm-payment-items"
          >
          </div>


          <div class="pos-confirm-payment-total-box">

            <div class="pos-confirm-payment-total-label">
              ยอดที่ต้องชำระ
            </div>


            <div
              id="posConfirmPaymentTotal"
              class="pos-confirm-payment-total"
            >
              0 บาท
            </div>

          </div>


          <div class="pos-confirm-payment-actions">

            <button
              type="button"
              id="posConfirmPaymentCancel"
              class="pos-confirm-payment-cancel"
            >
              ยกเลิก
            </button>


            <button
              type="button"
              id="posConfirmPaymentOk"
              class="pos-confirm-payment-ok"
            >
              ยืนยันรับชำระ
            </button>

          </div>

        </div>

      </div>

    `;


    // =====================================================
    // QUANTITY MODAL
    // =====================================================

    html += `

      <div
        id="posQtyModal"
        class="pos-qty-modal"
        style="display:none;"
      >

        <div class="pos-qty-box">

          <button
            type="button"
            id="posQtyClose"
            class="pos-qty-close"
          >
            ×
          </button>


          <div
  id="posQtyMode"
  style="
    font-size:14px;
    font-weight:700;
    color:#6b7280;
    margin-bottom:8px;
  "
>
  🛒 เพิ่มเข้าตะกร้าขายปกติ
</div>


<div
  id="posQtyEmoji"
  class="pos-qty-emoji"
>
  🍹
</div>


<div
  id="posQtyName"
  class="pos-qty-name"
>
  เมนู
</div>


          <div
            id="posQtyPrice"
            class="pos-qty-price"
          >
            0 บาท
          </div>


          <div class="pos-qty-control">

            <button
              type="button"
              id="posQtyMinus"
              class="pos-qty-btn"
            >
              −
            </button>


            <div
              id="posQtyValue"
              class="pos-qty-value"
            >
              1
            </div>


            <button
              type="button"
              id="posQtyPlus"
              class="pos-qty-btn"
            >
              +
            </button>

          </div>


          <button
            type="button"
            id="posQtyConfirm"
            class="pos-qty-confirm"
          >
            เพิ่มรายการ
          </button>

        </div>

      </div>


<style>

      /* ===================================================
   POS TABS
  =================================================== */

  .pos-tabs{
    display:flex;
    gap:10px;
    margin:20px 0;
    padding:6px;
    background:#ffffff;
    border-radius:14px;
    box-shadow:0 2px 10px rgba(0,0,0,0.05);
  }

  .pos-tab{
  flex:1;
  border:none;
  background:transparent;
  padding:14px 18px;
  border-radius:10px;
  font-size:16px;
  font-weight:600;
  color:#64748b;
  cursor:pointer;
  transition:all .2s ease;
}

.pos-tab:hover{
  background:#f1f5f9;
}

.pos-tab.active{
  background:#e8f8ee;
  color:#008f63;
}

/* ===================================================
   POS TAB CONTENT
=================================================== */

.pos-tab-content{
  display:none;
}

.pos-tab-content.active{
  display:block;
}

        /* =================================================
           CART
           ================================================= */

        .pos-cart-panel{
          margin-top:18px;
        }


        .pos-cart-header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
        }


        .pos-cart-title{
          margin:0;
          font-size:20px;
        }


        .pos-cart-count{
          color:#6b7280;
          font-size:14px;
          font-weight:700;
        }


        .pos-cart-empty{
          padding:22px 0;
          color:#6b7280;
          text-align:center;
        }


        .pos-cart-item{
          display:grid;

          grid-template-columns:
            1fr
            auto
            auto
            auto;

          gap:15px;

          align-items:center;

          padding:14px 0;

          border-bottom:1px solid #eee;
        }


        .pos-cart-item-name{
          font-size:16px;
          font-weight:800;
        }


        .pos-cart-item-detail{
          margin-top:4px;
          font-size:13px;
          color:#6b7280;
        }


        .pos-cart-item-total{
          font-size:17px;
          font-weight:800;
          color:#008f68;
          white-space:nowrap;
        }


        .pos-cart-total{
          display:flex;

          justify-content:space-between;

          align-items:center;

          padding-top:18px;

          margin-top:4px;

          font-size:18px;

          font-weight:800;
        }


        .pos-cart-total strong{
          font-size:24px;
          color:#008f68;
        }


        /* =================================================
           PAYMENT BUTTONS
           ================================================= */

        .pos-payment-actions{
          display:grid;

          grid-template-columns:
            1fr
            1fr;

          gap:12px;

          margin-top:18px;

          padding-top:18px;

          border-top:1px solid #eee;
        }


        .pos-pending-btn,
        .pos-pay-btn{

          border:0;

          border-radius:12px;

          padding:15px;

          font-family:inherit;

          font-size:17px;

          font-weight:800;

          cursor:pointer;

        }


        .pos-pending-btn{

          background:#fef3c7;

          color:#92400e;

        }


        .pos-pending-btn:active{

          transform:scale(.98);

        }


        .pos-pay-btn{

          background:#dcfce7;

          color:#166534;

        }


        .pos-pay-btn:disabled{

          opacity:.45;

          cursor:not-allowed;

        }


        /* =================================================
           PENDING BILLS
           ================================================= */

        .pos-pending-panel{

          margin-top:18px;

        }


        .pos-pending-header{

          display:flex;

          justify-content:space-between;

          align-items:center;

          gap:15px;

          margin-bottom:12px;

        }


        .pos-pending-title{

          margin:0;

          font-size:20px;

        }


        .pos-pending-count{

          color:#6b7280;

          font-size:14px;

          font-weight:700;

        }


        .pos-pending-empty{

          padding:20px;

          text-align:center;

          color:#6b7280;

        }


        .pos-pending-bill{

          display:grid;

          grid-template-columns:
            1fr
            auto
            auto;

          align-items:center;

          gap:15px;

          padding:15px 0;

          border-bottom:1px solid #eee;

          cursor:pointer;

        }


        .pos-pending-bill:last-child{

          border-bottom:0;

        }


        .pos-pending-bill-id{

          font-size:16px;

          font-weight:800;

        }


        .pos-pending-bill-info{

          margin-top:4px;

          color:#6b7280;

          font-size:13px;

        }


        .pos-pending-bill-total{

          color:#92400e;

          font-size:18px;

          font-weight:800;

          white-space:nowrap;

        }


        .pos-pending-status{

          display:inline-block;

          margin-top:5px;

          padding:4px 9px;

          border-radius:999px;

          background:#fef3c7;

          color:#92400e;

          font-size:12px;

          font-weight:800;

        }


        /* =================================================
           MENU
           ================================================= */

        .pos-category{

          margin-top:18px;

        }


        .pos-category-title{

          margin:0 0 16px 0;

          font-size:20px;

        }


        .pos-menu-grid{

          display:grid;

          grid-template-columns:
            repeat(auto-fill,minmax(150px,1fr));

          gap:14px;

        }


        .pos-menu-card{

          border:0;

          background:#fff;

          border-radius:16px;

          padding:18px 12px;

          min-height:155px;

          cursor:pointer;

          box-shadow:
            0 3px 15px #0000000d;

          font-family:inherit;

          transition:
            transform .12s ease,
            box-shadow .12s ease;

        }


        .pos-menu-card:hover{

          transform:translateY(-2px);

          box-shadow:
            0 6px 18px #00000018;

        }


        .pos-menu-card:active{

          transform:scale(.98);

        }


        .pos-menu-emoji{

          font-size:42px;

          line-height:1;

          margin-bottom:12px;

        }


        .pos-menu-name{

          font-size:16px;

          font-weight:700;

          line-height:1.4;

          color:#111827;

        }


        .pos-menu-price{

          margin-top:8px;

          font-size:18px;

          font-weight:800;

          color:#008f68;

        }

        /* =================================================
            PENDING BILL DETAIL MODAL
            ================================================= */

          .pos-pending-bill-modal{

            position:fixed;

            inset:0;

            background:#00000055;

            display:flex;

            align-items:center;

            justify-content:center;

            z-index:10000;

            padding:20px;

          }


          .pos-pending-bill-box{

            position:relative;

            width:100%;

            max-width:520px;

            max-height:85vh;

            overflow:auto;

            background:#fff;

            border-radius:20px;

            padding:28px 24px;

            box-shadow:
              0 15px 40px #00000025;

          }


          .pos-pending-bill-close{

            position:absolute;

            right:14px;

            top:10px;

            width:38px;

            height:38px;

            border:0;

            background:#f3f4f6;

            border-radius:50%;

            font-size:25px;

            cursor:pointer;

          }


          .pos-pending-bill-title{

            font-size:22px;

            font-weight:800;

            margin-bottom:5px;

          }


          .pos-pending-bill-id-large{

            color:#6b7280;

            font-size:14px;

            font-weight:700;

            margin-bottom:4px;

          }


          .pos-pending-bill-sale-date{

            color:#64748b;

            font-size:14px;

            font-weight:700;

            margin-bottom:16px;

          }


          
          .pos-pending-customer-field{

            margin-bottom:16px;

          }

          .pos-pending-customer-label{

            display:block;

            margin-bottom:7px;

            color:#374151;

            font-size:14px;

            font-weight:800;

          }

          .pos-pending-customer-input{

            width:100%;

            box-sizing:border-box;

            padding:12px 14px;

            border:1px solid #d1d5db;

            border-radius:10px;

            background:#fff;

            color:#111827;

            font-family:inherit;

            font-size:16px;

            outline:none;

          }

          .pos-pending-customer-input:focus{

            border-color:#94a3b8;

            box-shadow:0 0 0 3px #94a3b820;

          }

.pos-pending-detail-item{

            display:grid;

            grid-template-columns:
              1fr
              auto
              auto;

            gap:15px;

            align-items:center;

            padding:13px 0;

            border-bottom:1px solid #eee;

          }


          .pos-pending-detail-name{

            font-size:16px;

            font-weight:700;

          }


          .pos-pending-detail-qty{

            color:#6b7280;

            font-weight:700;

            white-space:nowrap;

          }


          .pos-pending-detail-total{

            font-size:16px;

            font-weight:800;

            color:#008f68;

            white-space:nowrap;

          }


          .pos-pending-bill-total-large{

            display:flex;

            justify-content:space-between;

            align-items:center;

            padding-top:20px;

            margin-top:5px;

            font-size:18px;

            font-weight:800;

          }


          .pos-pending-bill-total-large strong{

            font-size:25px;

            color:#008f68;

          }


          .pos-pending-bill-pay{

            width:100%;

            border:0;

            border-radius:12px;

            padding:15px;

            margin-top:20px;

            background:#dcfce7;

            color:#166534;

            font-family:inherit;

            font-size:18px;

            font-weight:800;

          }


          .pos-pending-bill-pay:disabled{

            opacity:.45;

            cursor:not-allowed;

          }


        /* =================================================
           QUANTITY MODAL
           ================================================= */

        .pos-qty-modal{

          position:fixed;

          inset:0;

          background:#00000055;

          display:flex;

          align-items:center;

          justify-content:center;

          z-index:9999;

          padding:20px;

        }


        .pos-qty-box{

          position:relative;

          width:100%;

          max-width:360px;

          background:#fff;

          border-radius:20px;

          padding:28px 24px;

          text-align:center;

          box-shadow:
            0 15px 40px #00000025;

        }


        .pos-qty-close{

          position:absolute;

          right:14px;

          top:10px;

          width:38px;

          height:38px;

          border:0;

          background:#f3f4f6;

          border-radius:50%;

          font-size:25px;

          cursor:pointer;

        }


        .pos-qty-emoji{

          font-size:55px;

          margin-top:8px;

        }


        .pos-qty-name{

          font-size:22px;

          font-weight:800;

          margin-top:10px;

        }


        .pos-qty-price{

          font-size:18px;

          font-weight:700;

          color:#008f68;

          margin-top:6px;

        }


        .pos-qty-control{

          display:flex;

          align-items:center;

          justify-content:center;

          gap:20px;

          margin:28px 0;

        }


        .pos-qty-btn{

          width:52px;

          height:52px;

          border:0;

          border-radius:14px;

          background:#f3f4f6;

          font-size:30px;

          font-weight:800;

          cursor:pointer;

        }


        .pos-qty-value{

          min-width:50px;

          font-size:30px;

          font-weight:800;

        }


        .pos-qty-confirm{

          width:100%;

          border:0;

          border-radius:12px;

          padding:14px;

          background:#a8dca8;

          color:#14532d;

          font-size:18px;

          font-weight:800;

          cursor:pointer;

        }


        /* =================================================
           CART QUANTITY
           ================================================= */

        .pos-cart-qty-control{

          display:flex;

          align-items:center;

          justify-content:center;

          gap:8px;

        }


        .pos-cart-qty-btn{

          width:34px;

          height:34px;

          border:0;

          border-radius:9px;

          background:#f3f4f6;

          color:#111827;

          font-size:20px;

          font-weight:800;

          cursor:pointer;

        }


        .pos-cart-qty-btn:active{

          transform:scale(.95);

        }


        .pos-cart-qty{

          min-width:28px;

          text-align:center;

          font-size:16px;

        }


        .pos-cart-delete{

          width:38px;

          height:38px;

          border:0;

          border-radius:9px;

          background:#fee2e2;

          cursor:pointer;

          font-size:17px;

        }


        .pos-cart-delete:active{

          transform:scale(.95);

        }


        /* =================================================
           MOBILE
           ================================================= */

        @media(max-width:700px){

          .pos-menu-grid{

            grid-template-columns:
              repeat(2,minmax(0,1fr));

            gap:10px;

          }


          .pos-menu-card{

            min-height:140px;

            padding:14px 8px;

          }


          .pos-menu-emoji{

            font-size:36px;

          }


          .pos-menu-name{

            font-size:14px;

          }


          .pos-menu-price{

            font-size:16px;

          }


          .pos-cart-item{

            grid-template-columns:
              1fr
              auto;

            gap:8px;

          }


          .pos-cart-item-total{

            grid-column:2;

          }


          .pos-payment-actions{

            grid-template-columns:
              1fr;

          }


          .pos-pending-bill{

            grid-template-columns:
              1fr
              auto;

          }


          .pos-pending-bill-total{

            grid-column:2;

          }

        }

        /* =================================================
   CONFIRM PAYMENT MODAL
   ================================================= */

.pos-confirm-payment-modal{

  position:fixed;

  inset:0;

  background:rgba(15,23,42,.45);

  display:flex;

  align-items:center;

  justify-content:center;

  z-index:10002;

  padding:20px;

}


.pos-confirm-payment-box{

  position:relative;

  width:100%;

  max-width:430px;

  max-height:90vh;

  overflow-y:auto;

  background:#fff;

  border-radius:22px;

  padding:32px 28px 26px;

  text-align:center;

  box-shadow:
    0 20px 60px rgba(0,0,0,.20);

  animation:
    posConfirmPaymentShow .18s ease-out;

}


@keyframes posConfirmPaymentShow{

  from{

    opacity:0;

    transform:
      scale(.94)
      translateY(10px);

  }

  to{

    opacity:1;

    transform:
      scale(1)
      translateY(0);

  }

}


.pos-confirm-payment-close{

  position:absolute;

  right:14px;

  top:12px;

  width:40px;

  height:40px;

  border:0;

  border-radius:50%;

  background:#f3f4f6;

  color:#111827;

  font-size:25px;

  cursor:pointer;

}


.pos-confirm-payment-close:hover{

  background:#e5e7eb;

}


.pos-confirm-payment-icon{

  width:64px;

  height:64px;

  margin:0 auto 12px;

  display:flex;

  align-items:center;

  justify-content:center;

  border-radius:50%;

  background:#dcfce7;

  font-size:34px;

}


.pos-confirm-payment-title{

  font-size:25px;

  font-weight:800;

  color:#172033;

}


.pos-confirm-payment-bill{

  margin-top:6px;

  color:#6b7280;

  font-size:14px;

  font-weight:700;

}


.pos-confirm-payment-message{

  margin-top:22px;

  font-size:17px;

  color:#374151;

}


.pos-confirm-payment-total{

  margin-top:6px;

  font-size:32px;

  font-weight:900;

  color:#008f68;

}


.pos-confirm-payment-actions{

  display:grid;

  grid-template-columns:1fr 1fr;

  gap:12px;

  margin-top:26px;

}


.pos-confirm-payment-cancel{

  border:0;

  border-radius:12px;

  padding:14px;

  background:#f3f4f6;

  color:#374151;

  font-family:inherit;

  font-size:17px;

  font-weight:800;

  cursor:pointer;

}


.pos-confirm-payment-cancel:hover{

  background:#e5e7eb;

}


.pos-confirm-payment-ok{

  border:0;

  border-radius:12px;

  padding:14px;

  background:#a8dca8;

  color:#14532d;

  font-family:inherit;

  font-size:17px;

  font-weight:800;

  cursor:pointer;

}


.pos-confirm-payment-ok:hover{

  background:#94d494;

}

/* =================================================
   PENDING BILL - ADD MENU BUTTON
   ================================================= */

.pos-pending-bill-add-menu{

  width:100%;

  margin-top:14px;

  padding:13px 18px;

  border:0;

  border-radius:12px;

  background:#f3f4f6;

  color:#1f2937;

  font-size:16px;

  font-weight:700;

  cursor:pointer;

  transition:
    transform .12s ease,
    background .12s ease,
    box-shadow .12s ease;

}


.pos-pending-bill-add-menu:hover{

  background:#e5e7eb;

  box-shadow:
    0 4px 12px #00000012;

}


.pos-pending-bill-add-menu:active{

  transform:scale(.98);

}


/* =================================================
   PENDING BILL - PAY BUTTON
   ================================================= */

.pos-pending-bill-pay{

  width:100%;

  margin-top:12px;

  padding:15px 18px;

  border:0;

  border-radius:14px;

  background:#dcfce7;

  color:#166534;

  font-size:18px;

  font-weight:800;

  cursor:pointer;

  transition:
    transform .12s ease,
    background .12s ease,
    box-shadow .12s ease;

}


.pos-pending-bill-pay:hover{

  background:#bbf7d0;

  box-shadow:
    0 5px 14px #00000014;

}


.pos-pending-bill-pay:active{

  transform:scale(.98);

}

/* =================================================
   PENDING BILL ITEM CONTROLS
   ================================================= */

.pos-pending-detail-controls{

  display:flex;

  align-items:center;

  justify-content:center;

  gap:8px;

}


.pos-pending-detail-controls button{

  width:36px;

  height:36px;

  border:0;

  border-radius:10px;

  background:#f3f4f6;

  color:#374151;

  font-size:20px;

  font-weight:800;

  cursor:pointer;

}


.pos-pending-detail-controls button:active{

  transform:scale(.95);

}


.pos-pending-detail-qty-value{

  min-width:28px;

  text-align:center;

  font-size:17px;

}


.pos-pending-detail-delete{

  margin-left:4px;

  background:#fee2e2 !important;

}


.pos-pending-detail-total{

  min-width:85px;

  text-align:right;

  color:#008f68;

  font-weight:800;

}

.pos-confirm-payment-items{
  margin-top:20px;
  text-align:left;

  max-height:45vh;
  overflow-y:auto;
  padding-right:6px;
}


.pos-confirm-payment-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;

  padding:14px 0;

  border-bottom:1px solid #e5e7eb;
}


.pos-confirm-payment-item-left{
  min-width:0;
}


.pos-confirm-payment-item-name{
  font-size:20px;
  font-weight:800;
  color:#0f172a;
}


.pos-confirm-payment-item-qty{
  margin-top:5px;

  font-size:17px;
  font-weight:600;

  color:#64748b;
}


.pos-confirm-payment-item-total{
  flex-shrink:0;

  font-size:20px;
  font-weight:800;

  color:#0f172a;
}


.pos-confirm-payment-total-box{
  margin-top:20px;

  padding:18px 20px;

  border-radius:18px;

  background:#ecfdf5;
  border:1px solid #bbf7d0;

  text-align:center;
}


.pos-confirm-payment-total-label{
  font-size:17px;
  font-weight:700;

  color:#64748b;
}


.pos-confirm-payment-total{
  margin-top:5px;

  font-size:40px;
  font-weight:900;

  color:#059669;
}

      </style>

    `;


    // =====================================================
    // EVENTS
    // =====================================================

    setTimeout(() => {

      const modal =
        document.getElementById(
          "posQtyModal"
        );


      const close =
        document.getElementById(
          "posQtyClose"
        );


      const minus =
        document.getElementById(
          "posQtyMinus"
        );


      const plus =
        document.getElementById(
          "posQtyPlus"
        );


      const qtyConfirm =
        document.getElementById(
          "posQtyConfirm"
        );


      const qtyValue =
        document.getElementById(
          "posQtyValue"
        );


      const emoji =
        document.getElementById(
          "posQtyEmoji"
        );


      const name =
        document.getElementById(
          "posQtyName"
        );


      const price =
        document.getElementById(
          "posQtyPrice"
        );


      const pendingBtn =
        document.getElementById(
          "posPendingBtn"
        );


      const payBtn =
        document.getElementById(
          "posPayBtn"
        );


      let qty = 1;

      let selectedMenu = null;

      let pendingAddBillId = null;


      // ===================================================
      // RENDER CART
      // ===================================================

function renderCart(){

        const cartItems =
          document.getElementById(
            "posCartItems"
          );


        const cartCount =
          document.getElementById(
            "posCartCount"
          );


        const cartTotal =
          document.getElementById(
            "posCartTotal"
          );

          const paymentActions =
        document.getElementById(
          "posPaymentActions"
        );


        if(!cartItems){
          return;
        }


        const cart =
          window.POS.cart || [];


        const totalQty =
          getCartQty();


        cartCount.textContent =
          `${totalQty} รายการ`;


        if(!cart.length){

          cartItems.innerHTML = `

            <div class="pos-cart-empty">
              ยังไม่มีสินค้าในตะกร้า
            </div>

          `;


          cartTotal.style.display =
            "none";


          paymentActions.style.display =
            "none";


          return;

        }


        let html = "";

        let grandTotal = 0;


        cart.forEach(item => {

          const itemTotal =
            Number(item.price || 0) *
            Number(item.qty || 0);


          grandTotal +=
            itemTotal;


          html += `

            <div
              class="pos-cart-item"
              data-sku="${item.sku}"
            >

              <div>

                <div class="pos-cart-item-name">
                  ${item.emoji}
                  ${item.name}
                </div>

                <div class="pos-cart-item-detail">
                  ${Number(item.price).toLocaleString("th-TH")}
                  บาท / หน่วย
                </div>

              </div>


              <div class="pos-cart-qty-control">

                <button
                  type="button"
                  class="pos-cart-qty-btn"
                  data-cart-action="minus"
                  data-sku="${item.sku}"
                >
                  −
                </button>


                <strong class="pos-cart-qty">
                  ${item.qty}
                </strong>


                <button
                  type="button"
                  class="pos-cart-qty-btn"
                  data-cart-action="plus"
                  data-sku="${item.sku}"
                >
                  +
                </button>

              </div>


              <div class="pos-cart-item-total">

                ${itemTotal.toLocaleString("th-TH")}
                บาท

              </div>


              <button
                type="button"
                class="pos-cart-delete"
                data-cart-action="delete"
                data-sku="${item.sku}"
                title="ลบสินค้า"
              >
                🗑️
              </button>

            </div>

          `;

        });


        cartItems.innerHTML =
          html;


        cartTotal.style.display =
          "flex";


        cartTotal.innerHTML = `

          <span>
            รวมทั้งหมด
          </span>

          <strong>
            ${grandTotal.toLocaleString("th-TH")}
            บาท
          </strong>

        `;


        paymentActions.style.display =
          "grid";

      }


      // ===================================================
      // RENDER PENDING BILLS
      // ===================================================

      function renderPendingBills(){

        const panel =
          document.getElementById(
            "posPendingBillsPanel"
          );


        const container =
          document.getElementById(
            "posPendingBills"
          );


        const count =
          document.getElementById(
            "posPendingCount"
          );


        if(!panel || !container){
          return;
        }


        const bills =
        (window.POS.pendingBills || [])
          .filter(
            bill =>
              bill.status === "UNPAID"
          );


        count.textContent =
          `${bills.length} บิล`;


        if(!bills.length){

          panel.style.display = "block";

container.innerHTML = `
  <div class="pos-cart-empty">
    ยังไม่มีบิลค้างจ่าย
  </div>
`;

          return;

        }


        panel.style.display =
          "block";


        container.innerHTML =
          bills.map(bill => {

            const itemQty =
              (bill.items || [])
                .reduce(
                  (sum,item) =>
                    sum +
                    Number(item.qty || 0),
                  0
                );


            return `

              <div
                class="pos-pending-bill"
                data-bill-id="${bill.billId}"
                data-pending-bill="true"
              >

                <div>

                  <div class="pos-pending-bill-id">
                    บิล ${bill.billId}
                  </div>


                  <div class="pos-pending-bill-info">

                    ${itemQty} รายการ

                    <span
                      class="pos-pending-status"
                    >
                      ค้างจ่าย
                    </span>

                    <span
                style="
                  margin-left:8px;
                  color:#64748b;
                "
              >
                กดเพื่อดูรายละเอียด →
              </span>

                  </div>

                </div>


                <div class="pos-pending-bill-total">

                  ${Number(bill.total || 0)
                    .toLocaleString("th-TH")}
                  บาท

                </div>

              </div>

            `;

          }).join("");

      }
      
      window.POS.renderPendingBills =
  renderPendingBills;




      // ===================================================
// UPDATE PENDING BILL TO SALES
// ===================================================

window.POS.updatePendingBillSales =
  function(bill){

    return (async () => {

      const menusRes =
        await POS.api.menus();

      const menus =
        menusRes?.menus || [];


      const salesItems =
        (bill.items || []).map(item => {

          const menu =
            menus.find(
              m =>
                String(m.sku) ===
                String(item.sku)
            );


          if(!menu){

            throw new Error(
              "ไม่พบเมนู SKU: " +
              item.sku
            );

          }


          return {

            menu_id:
              menu.id,

            qty:
              Number(item.qty || 0)

          };

        });


      return await POS.api.sales({

        action:
          "UPDATE_PENDING",

        bill_id:
          bill.billId,

        items:
          salesItems,

        customer_name:
          String(
            bill.customer_name || ""
          ).trim()

      });

    })();

  };




      // ===================================================
      // FORMAT PENDING BILL SALE DATE
      // ===================================================

      function formatPendingBillSaleDate(value){

        const raw =
          String(value || "").trim();

        if(!raw){
          return "📅 วันที่ขาย -";
        }

        // -----------------------------------------------------
        // TIMESTAMP
        // แปลงเวลาให้เป็นเวลาไทย Asia/Bangkok
        // -----------------------------------------------------
        if(
          /T\d{2}:\d{2}/.test(raw) ||
          / \d{2}:\d{2}/.test(raw)
        ){

          const date =
            new Date(raw);

          if(!Number.isNaN(date.getTime())){

            const parts =
              new Intl.DateTimeFormat(
                "en-GB",
                {
                  timeZone:"Asia/Bangkok",
                  year:"numeric",
                  month:"2-digit",
                  day:"2-digit",
                  hour:"2-digit",
                  minute:"2-digit",
                  hour12:false
                }
              ).formatToParts(date);

            const getPart =
              type =>
                parts.find(
                  part =>
                    part.type === type
                )?.value || "";

            const day =
              getPart("day");

            const month =
              getPart("month");

            const year =
              Number(
                getPart("year")
              ) + 543;

            const hour =
              getPart("hour");

            const minute =
              getPart("minute");

            if(
              day &&
              month &&
              year &&
              hour &&
              minute
            ){

              return (
                "📅 วันที่ขาย " +
                day +
                "/" +
                month +
                "/" +
                year +
                " " +
                hour +
                ":" +
                minute +
                " น."
              );

            }

          }

        }

        // -----------------------------------------------------
        // DATE ONLY
        // ถ้าไม่มีเวลา ให้แสดงเฉพาะวันที่เหมือนเดิม
        // -----------------------------------------------------
        const match =
          raw.match(
            /^(\d{4})-(\d{2})-(\d{2})/
          );

        if(!match){
          return "📅 วันที่ขาย -";
        }

        const year =
          Number(match[1]) + 543;

        const dateText =
          match[3] +
          "/" +
          match[2] +
          "/" +
          year;

        return (
          "📅 วันที่ขาย " +
          dateText
        );

      }


      // ===================================================
      // OPEN PENDING BILL DETAIL
      // ===================================================

      function openPendingBill(billId){

        const bills =
          window.POS.pendingBills || [];


        const bill =
          bills.find(
            item =>
              item.billId === billId
          );


        if(!bill){
          return;
        }


        const modal =
          document.getElementById(
            "posPendingBillModal"
          );


        const billIdEl =
          document.getElementById(
            "posPendingBillId"
          );

        const billSaleDateEl =
          document.getElementById(
            "posPendingBillSaleDate"
          );

          
        const billCustomerNameEl =
          document.getElementById(
            "posPendingBillCustomerName"
          );

          const billCountEl =
        document.getElementById(
          "posPendingBillCount"
        );



        const itemsEl =
          document.getElementById(
            "posPendingBillItems"
          );


        const totalEl =
          document.getElementById(
            "posPendingBillTotal"
          );


        if(!modal){
          return;
        }


        // -----------------------------------------------
        // Bill ID
        // -----------------------------------------------

        billIdEl.textContent =
          `บิล ${bill.billId}`;

        if(billSaleDateEl){

          billSaleDateEl.textContent =
            formatPendingBillSaleDate(
              bill.createdAt
            );

        }

          
        if(billCustomerNameEl){

          billCustomerNameEl.value =
            String(
              bill.customer_name || ""
            );

          billCustomerNameEl.onchange =
            async () => {

              const oldCustomerName =
                String(
                  bill.customer_name || ""
                );

              const newCustomerName =
                String(
                  billCustomerNameEl.value || ""
                ).trim();

              if(
                oldCustomerName ===
                newCustomerName
              ){

                return;

              }

              bill.customer_name =
                newCustomerName;

              billCustomerNameEl.disabled =
                true;

              try{

                await window.POS
                  .updatePendingBillSales(
                    bill
                  );

                savePendingBills();
                renderPendingBills();

              }catch(error){

                bill.customer_name =
                  oldCustomerName;

                billCustomerNameEl.value =
                  oldCustomerName;

                console.error(
                  "UPDATE PENDING CUSTOMER NAME ERROR:",
                  error
                );

                alert(
                  "บันทึกชื่อลูกค้าไม่สำเร็จ\n\n" +
                  (
                    error?.message ||
                    "กรุณาลองใหม่อีกครั้ง"
                  )
                );

              }finally{

                billCustomerNameEl.disabled =
                  false;

              }

            };

        }

          if(billCountEl){

            const billItemQty =
              (bill.items || [])
                .reduce(
                  (sum,item) =>
                    sum +
                    Number(item.qty || 0),
                  0
                );

            billCountEl.textContent =
              `${billItemQty} รายการ`;

          }


        // -----------------------------------------------
        // Items
        // -----------------------------------------------

        const items =
          bill.items || [];


        if(!items.length){

          itemsEl.innerHTML = `

            <div class="pos-cart-empty">
              ไม่มีรายการสินค้า
            </div>

          `;

        }else{

          itemsEl.innerHTML =
  items.map((item, index) => {

    const itemTotal =
      Number(item.price || 0) *
      Number(item.qty || 0);


    return `

      <div
        class="pos-pending-detail-item"
        data-item-index="${index}"
      >

        <div
          class="pos-pending-detail-name"
        >
          ${item.emoji || "🍹"}
          ${item.name}
        </div>


        <div
          class="pos-pending-detail-controls"
        >

          <button
            type="button"
            class="pos-pending-detail-minus"
            data-index="${index}"
          >
            −
          </button>


          <strong
            class="pos-pending-detail-qty-value"
          >
            ${item.qty}
          </strong>


          <button
            type="button"
            class="pos-pending-detail-plus"
            data-index="${index}"
          >
            +
          </button>


          <button
            type="button"
            class="pos-pending-detail-delete"
            data-index="${index}"
          >
            🗑️
          </button>

        </div>


        <div
          class="pos-pending-detail-total"
        >
          ${itemTotal.toLocaleString("th-TH")}
          บาท
        </div>

      </div>

    `;

  }).join("");

        }


        // -----------------------------------------------
        // Total
        // -----------------------------------------------

        totalEl.textContent =
          `${Number(bill.total || 0).toLocaleString("th-TH")} บาท`;


        // -----------------------------------------------
        // เปิด Modal
        // -----------------------------------------------

        modal.style.display =
          "flex";

                  // =================================================
        // ปุ่มลดจำนวน
        // =================================================

        itemsEl
          .querySelectorAll(
            ".pos-pending-detail-minus"
          )
          .forEach(button => {

            button.onclick =
              event => {

                event.preventDefault();
                event.stopPropagation();


                const index =
                  Number(
                    button.dataset.index
                  );


                const item =
                  bill.items[index];


                if(!item){
                  return;
                }


                const qty =
                  Number(
                    item.qty || 0
                  );


                if(qty <= 1){
                  return;
                }


                const oldQty =
  Number(qty || 0);


if(oldQty <= 1){
  return;
}


item.qty =
  oldQty - 1;


bill.total =
  bill.items.reduce(
    (sum, item) => {

      return sum +
        (
          Number(item.price || 0) *
          Number(item.qty || 0)
        );

    },
    0
  );


savePendingBills();

renderPendingBills();


window.POS
  .updatePendingBillSales(bill)

  .then(() => {

    openPendingBill(
      billId
    );

  })

  .catch(error => {

    console.error(
      "UPDATE PENDING SALES ERROR:",
      error
    );


    item.qty =
      oldQty;


    bill.total =
      bill.items.reduce(
        (sum, item) => {

          return sum +
            (
              Number(item.price || 0) *
              Number(item.qty || 0)
            );

        },
        0
      );


    savePendingBills();

    renderPendingBills();

    openPendingBill(
      billId
    );


    alert(
      "อัปเดต Sales ไม่สำเร็จ\n\n" +
      (
        error?.message ||
        "กรุณาลองใหม่อีกครั้ง"
      )
    );

  });

              };

          });


        // =================================================
        // ปุ่มเพิ่มจำนวน
        // =================================================

        itemsEl
          .querySelectorAll(
            ".pos-pending-detail-plus"
          )
          .forEach(button => {

            button.onclick =
              event => {

                event.preventDefault();
                event.stopPropagation();


                const index =
                  Number(
                    button.dataset.index
                  );


                const item =
                  bill.items[index];


                if(!item){
                  return;
                }


                const qty =
                  Number(
                    item.qty || 0
                  );


                const oldQty =
  Number(item.qty || 0);


// -----------------------------------------------
// เพิ่มจำนวนในหน้าจอ
// -----------------------------------------------

item.qty =
  oldQty + 1;


bill.total =
  bill.items.reduce(
    (sum, item) =>
      sum +
      (
        Number(item.price || 0) *
        Number(item.qty || 0)
      ),
    0
  );


// -----------------------------------------------
// แสดงผลทันที
// -----------------------------------------------

savePendingBills();

renderPendingBills();


// -----------------------------------------------
// อัปเดต Sales
// -----------------------------------------------

window.POS
  .updatePendingBillSales(bill)

  .then(() => {

    // -------------------------------------------
    // อัปเดต Modal ที่กำลังเปิดอยู่
    // -------------------------------------------

    openPendingBill(billId);

  })

  .catch(error => {

    console.error(
      "UPDATE PENDING SALES ERROR:",
      error
    );


    // -------------------------------------------
    // ถ้า Backend ไม่ผ่าน ให้ย้อนจำนวนกลับ
    // -------------------------------------------

    item.qty =
      oldQty;


    bill.total =
      bill.items.reduce(
        (sum, item) =>
          sum +
          (
            Number(item.price || 0) *
            Number(item.qty || 0)
          ),
        0
      );


    savePendingBills();

    renderPendingBills();

    openPendingBill(billId);


    alert(
      "อัปเดต Sales ไม่สำเร็จ\n\n" +
      (
        error?.message ||
        "กรุณาลองใหม่อีกครั้ง"
      )
    );

  });

              };

          });


        // =================================================
        // ปุ่มลบรายการ
        // =================================================

        itemsEl
          .querySelectorAll(
            ".pos-pending-detail-delete"
          )
          .forEach(button => {

            button.onclick =
              event => {

                event.preventDefault();
                event.stopPropagation();


                const index =
                  Number(
                    button.dataset.index
                  );


                if(
                  !Number.isInteger(index) ||
                  !bill.items[index]
                ){
                  return;
                }

    // -----------------------------------------------
// เก็บข้อมูลเดิมไว้ เผื่อ Backend ไม่ผ่าน
// -----------------------------------------------

const oldItems =
  [...bill.items];


// -----------------------------------------------
// ลบรายการออกจากบิล
// -----------------------------------------------

bill.items.splice(
  index,
  1
);


// -----------------------------------------------
// คำนวณยอดใหม่
// -----------------------------------------------

bill.total =
  bill.items.reduce(
    (sum, item) => {

      return sum +
        (
          Number(item.price || 0) *
          Number(item.qty || 0)
        );

    },
    0
  );


// -----------------------------------------------
// แสดงผลหน้า POS
// -----------------------------------------------

savePendingBills();

renderPendingBills();


// -----------------------------------------------
// อัปเดต Sales
// -----------------------------------------------

window.POS
  .updatePendingBillSales(bill)

  .then(() => {

    // -------------------------------------------
    // ถ้าลบรายการสุดท้าย
    // -------------------------------------------

    if(
      !bill.items ||
      bill.items.length === 0
    ){

      window.POS.pendingBills =
        window.POS.pendingBills.filter(
          item =>
            item.billId !== bill.billId
        );


      savePendingBills();


      const pendingModal =
        document.getElementById(
          "posPendingBillModal"
        );


      if(pendingModal){

        pendingModal.style.display =
          "none";

      }


      renderPendingBills();

      // -----------------------------------------------
// ไม่มีบิลแล้ว
// แต่ยังให้หน้า "บิลค้างจ่าย"
// แสดงหัวข้อ + 0 บิล
// -----------------------------------------------

const pendingPanel =
  document.getElementById(
    "posPendingBillsPanel"
  );

const pendingCount =
  document.getElementById(
    "posPendingCount"
  );

if(pendingPanel){

  pendingPanel.style.display =
    "block";

}

if(pendingCount){

  pendingCount.textContent =
    "0 บิล";

}

      return;

    }


    // -------------------------------------------
    // ยังมีรายการเหลือ
    // วาด Modal ใหม่
    // -------------------------------------------

    openPendingBill(
      bill.billId
    );

  })

  .catch(error => {

    console.error(
      "UPDATE PENDING SALES ERROR:",
      error
    );


    // -------------------------------------------
    // Backend ไม่ผ่าน → คืนรายการเดิม
    // -------------------------------------------

    bill.items =
      oldItems;


    bill.total =
      bill.items.reduce(
        (sum, item) => {

          return sum +
            (
              Number(item.price || 0) *
              Number(item.qty || 0)
            );

        },
        0
      );


    savePendingBills();

    renderPendingBills();

    openPendingBill(
      bill.billId
    );


    alert(
      "ลบรายการไม่สำเร็จ\n\n" +
      (
        error?.message ||
        "กรุณาลองใหม่อีกครั้ง"
      )
    );

  });

  };

          });

          

          // ===================================================
// PENDING BILL PAYMENT
// ===================================================

const paymentBtn =
  document.getElementById(
    "posPendingBillPay"
  );


if(paymentBtn){

  // รีเซ็ตปุ่มทุกครั้งที่เปิดบิล
  paymentBtn.disabled =
    false;

  paymentBtn.textContent =
    "🟢 รับชำระ";


  paymentBtn.onclick =
    async () => {

      // -----------------------------------------------
      // ป้องกันกดซ้ำ
      // -----------------------------------------------

      if(paymentBtn.disabled){
        return;
      }


      paymentBtn.disabled =
        true;

      paymentBtn.textContent =
        "กำลังบันทึก...";


      try{

        // ---------------------------------------------
        // ส่ง billId เข้า Backend
        // ---------------------------------------------

        const result =
          await POS.api.salesPay(
            bill.billId
          );


        // ---------------------------------------------
        // ตรวจผลลัพธ์
        // ---------------------------------------------

        if(
          !result ||
          result.success !== true
        ){

          throw new Error(
            result?.error ||
            "รับชำระไม่สำเร็จ"
          );

        }


        // ---------------------------------------------
        // Backend สำเร็จ
        // ค่อยลบบิลออกจาก Pending
        // ---------------------------------------------

        window.POS.pendingBills =
          (
            window.POS.pendingBills || []
          ).filter(
            item =>
              item.billId !==
              bill.billId
          );


        savePendingBills();


        // ---------------------------------------------
        // ปิด Modal รายละเอียด
        // ---------------------------------------------

        modal.style.display =
          "none";


        // ---------------------------------------------
        // ปิด Modal ยืนยัน ถ้ามี
        // ---------------------------------------------

        const confirmModal =
          document.getElementById(
            "posConfirmPaymentModal"
          );


        if(confirmModal){

          confirmModal.style.display =
            "none";

        }


        // ---------------------------------------------
        // รีเฟรชรายการบิลค้าง
        // ---------------------------------------------

        renderPendingBills();


        console.log(
          "PENDING BILL PAID:",
          result
        );


      }catch(error){

        console.error(
          "PENDING BILL PAYMENT ERROR:",
          error
        );


        alert(
          "รับชำระไม่สำเร็จ\n\n" +
          (
            error?.message ||
            "กรุณาลองใหม่อีกครั้ง"
          )
        );


        // ---------------------------------------------
        // ให้กดใหม่ได้
        // ---------------------------------------------

        paymentBtn.disabled =
          false;

        paymentBtn.textContent =
          "🟢 รับชำระ";

      }

    };

}

      }


      // ===================================================
// ADD MENU TO PENDING BILL
// ===================================================

const pendingBillAddMenu =
  document.getElementById(
    "posPendingBillAddMenu"
  );


if(pendingBillAddMenu){

  pendingBillAddMenu.addEventListener(
    "click",
    () => {

      const billIdEl =
        document.getElementById(
          "posPendingBillId"
        );


      if(!billIdEl){
        return;
      }


      const billId =
        billIdEl.textContent
          .replace(
            "บิล ",
            ""
          )
          .trim();


      if(!billId){
        return;
      }


      const bill =
        (window.POS.pendingBills || [])
          .find(
            item =>
              item.billId ===
              billId &&
              item.status ===
              "UNPAID"
          );


      if(!bill){

        alert(
          "ไม่พบบิลค้างจ่าย"
        );

        return;

      }


      // ---------------------------------------------
      // เปิดโหมดเพิ่มเมนูเข้าบิลนี้
      // ---------------------------------------------

      pendingAddBillId =
        bill.billId;

        // ---------------------------------------------
        // กลับไปหน้า ขายสินค้า
        // ---------------------------------------------

        const sellTab =
          document.querySelector(
            '.pos-tab[data-pos-tab="sell"]'
          );

        if(sellTab){

          sellTab.click();

        }


      // ---------------------------------------------
      // ปิด Pending Bill Modal
      // ---------------------------------------------

      const pendingModal =
        document.getElementById(
          "posPendingBillModal"
        );


      if(pendingModal){

        pendingModal.style.display =
          "none";

      }

    }
  );

}


      // ===================================================
      // INITIAL RENDER
      // ===================================================

      renderCart();

      renderPendingBills();

      // -----------------------------------------------
// เริ่มต้นที่แท็บ ขายสินค้า
// ซ่อนบิลค้างไว้ก่อน
// -----------------------------------------------

const initialPendingPanel =
  document.getElementById(
    "posPendingBillsPanel"
  );

if(initialPendingPanel){

  initialPendingPanel.style.display =
    "none";

}

      // ===================================================
      // CLICK PENDING BILL
      // ===================================================

      const pendingBillsContainer =
        document.getElementById(
          "posPendingBills"
        );


      if(pendingBillsContainer){

        pendingBillsContainer.addEventListener(
          "click",
          event => {

            const billElement =
              event.target.closest(
                "[data-pending-bill='true']"
              );


            if(!billElement){
              return;
            }


            const billId =
              billElement.dataset.billId;


            openPendingBill(
              billId
            );

          }
        );

      }

      // ===================================================
      // CLOSE PENDING BILL MODAL
      // ===================================================

      const pendingBillModal =
        document.getElementById(
          "posPendingBillModal"
        );


      const pendingBillClose =
        document.getElementById(
          "posPendingBillClose"
        );


      if(pendingBillClose){

        pendingBillClose.addEventListener(
          "click",
          () => {

            pendingBillModal.style.display =
              "none";

          }
        );

      }


      if(pendingBillModal){

        pendingBillModal.addEventListener(
          "click",
          event => {

            if(
              event.target ===
              pendingBillModal
            ){

              pendingBillModal.style.display =
                "none";

            }

          }
        );

      }


      // ===================================================
      // MENU CLICK
      // ===================================================

      document
        .querySelectorAll(
          ".pos-menu-card"
        )
        .forEach(card => {

          card.addEventListener(
            "click",
            () => {

              selectedMenu = {

                sku:
                  card.dataset.sku,

                name:
                  card.dataset.name,

                price:
                  Number(
                    card.dataset.price
                  ),

                emoji:
                  card.dataset.emoji

              };


              qty = 1;

              const qtyMode =
  document.getElementById(
    "posQtyMode"
  );


if(qtyMode){

  if(pendingAddBillId){

    qtyMode.textContent =
      "🟡 เพิ่มเข้าบิลค้างจ่าย";

    qtyMode.style.color =
      "#a16207";

  }else{

    qtyMode.textContent =
      "🛒 เพิ่มเข้าตะกร้าขายปกติ";

    qtyMode.style.color =
      "#15803d";

  }

}


              emoji.textContent =
                selectedMenu.emoji;


              name.textContent =
                selectedMenu.name;


              price.textContent =
                `${selectedMenu.price.toLocaleString("th-TH")} บาท`;


              qtyValue.textContent =
                qty;


              modal.style.display =
                "flex";

            }
          );

        });


      // ===================================================
      // MINUS MODAL
      // ===================================================

      minus.addEventListener(
        "click",
        () => {

          if(qty > 1){

            qty--;

            qtyValue.textContent =
              qty;

          }

        }
      );


      // ===================================================
      // PLUS MODAL
      // ===================================================

      plus.addEventListener(
        "click",
        () => {

          qty++;

          qtyValue.textContent =
            qty;

        }
      );


      // ===================================================
      // CLOSE MODAL
      // ===================================================

      close.addEventListener(
        "click",
        () => {

          modal.style.display =
            "none";

          selectedMenu =
            null;

            pendingAddBillId =
            null;

        }
      );


      // ===================================================
      // ADD TO CART
      // ===================================================

      qtyConfirm.addEventListener(
  "click",
  async () => {

    if(!selectedMenu){
      return;
    }


    // =================================================
    // ADD MENU TO EXISTING PENDING BILL
    // =================================================

    if(pendingAddBillId){

      const bill =
        (window.POS.pendingBills || [])
          .find(
            item =>
              item.billId ===
              pendingAddBillId
          );


      if(!bill){

        alert(
          "ไม่พบบิลค้างจ่าย"
        );

        pendingAddBillId =
          null;

        selectedMenu =
          null;

        modal.style.display =
          "none";

        return;

      }


      const addQty =
        Number(qty || 0);


      if(
        !Number.isFinite(addQty) ||
        addQty <= 0
      ){

        return;

      }


      qtyConfirm.disabled =
        true;


      qtyConfirm.textContent =
        "กำลังบันทึก...";


      try{

        // ---------------------------------------------
        // SAVE NEW SALE ITEM TO BACKEND
        // ---------------------------------------------

        const result =
          await POS.api.sales({

            items: [

              {
                menu_id:
                  menus.find(
                    m =>
                      String(m.sku) ===
                      String(selectedMenu.sku)
                  )?.id,

                qty:
                  addQty

              }

            ],

            payment_status:
              "UNPAID",

            remark:
              bill.billId,

            customer_name:
              String(
                bill.customer_name || ""
              ).trim()

        });


        if(
          !result ||
          result.success !== true
        ){

          throw new Error(
            result?.error ||
            "SAVE_PENDING_ITEM_FAILED"
          );

        }


        // ---------------------------------------------
        // UPDATE LOCAL BILL
        // ---------------------------------------------

        if(!Array.isArray(bill.items)){

          bill.items =
            [];

        }


        const existing =
          bill.items.find(
            item =>
              String(item.sku) ===
              String(selectedMenu.sku)
          );


        if(existing){

          existing.qty =
            Number(existing.qty || 0) +
            addQty;

        }else{

          bill.items.push({

            sku:
              selectedMenu.sku,

            name:
              selectedMenu.name,

            price:
              Number(selectedMenu.price || 0),

            emoji:
              selectedMenu.emoji || "🍹",

            qty:
              addQty

          });

        }


        // ---------------------------------------------
        // UPDATE BILL TOTAL
        // ---------------------------------------------

        bill.total =
          bill.items.reduce(
            (sum, item) => {

              return sum +
                (
                  Number(item.price || 0) *
                  Number(item.qty || 0)
                );

            },
            0
          );


        // ---------------------------------------------
        // SAVE LOCAL PENDING BILL
        // ---------------------------------------------

        savePendingBills();


        // ---------------------------------------------
        // RESET ADD MODE
        // ---------------------------------------------

        pendingAddBillId =
          null;

        selectedMenu =
          null;


        modal.style.display =
          "none";


        // ---------------------------------------------
        // RESET BUTTON
        // ---------------------------------------------

        qtyConfirm.disabled =
          false;

        qtyConfirm.textContent =
          "เพิ่มรายการ";


        // ---------------------------------------------
        // REFRESH
        // ---------------------------------------------

        renderCart();

        renderPendingBills();

// ---------------------------------------------
// เปลี่ยนด้านหลังเป็นหน้า บิลค้างจ่าย
// ---------------------------------------------

const pendingTab =
  document.querySelector(
    '.pos-tab[data-pos-tab="pending"]'
  );

document
  .querySelectorAll(
    ".pos-tab"
  )
  .forEach(tab => {

    tab.classList.remove(
      "active"
    );

  });


if(pendingTab){

  pendingTab.classList.add(
    "active"
  );

}


// ซ่อนหน้าขายสินค้า

const cartPanel =
  document.querySelector(
    ".pos-cart-panel"
  );

if(cartPanel){

  cartPanel.style.display =
    "none";

}


document
  .querySelectorAll(
    ".pos-category"
  )
  .forEach(panel => {

    panel.style.display =
      "none";

  });


// แสดงหน้าบิลค้าง

const pendingPanel =
  document.getElementById(
    "posPendingBillsPanel"
  );

if(pendingPanel){

  pendingPanel.style.display =
    "block";

}


// ---------------------------------------------
// เปิดบิลเดิม
// ---------------------------------------------

openPendingBill(
  bill.billId
);


      }catch(error){

        console.error(
          "PENDING BILL ADD MENU ERROR:",
          error
        );


        alert(
          "เพิ่มเมนูไม่สำเร็จ\n\n" +
          (
            error?.message ||
            "กรุณาลองใหม่อีกครั้ง"
          )
        );


        qtyConfirm.disabled =
          false;

        qtyConfirm.textContent =
          "เพิ่มรายการ";

      }


      return;

    }


    // =================================================
    // NORMAL POS CART
    // =================================================

    const cart =
      window.POS.cart;


    const existing =
      cart.find(
        item =>
          item.sku ===
          selectedMenu.sku
      );


    if(existing){

      existing.qty +=
        qty;

    }else{

      cart.push({

        sku:
          selectedMenu.sku,

        name:
          selectedMenu.name,

        price:
          selectedMenu.price,

        emoji:
          selectedMenu.emoji,

        qty:
          qty

      });

    }


    saveCart();

    renderCart();


    modal.style.display =
      "none";


    selectedMenu =
      null;

  }
);


      // ===================================================
      // CART + / - / DELETE
      // ===================================================

      const cartItems =
        document.getElementById(
          "posCartItems"
        );


      cartItems.addEventListener(
        "click",
        event => {

          const button =
            event.target.closest(
              "[data-cart-action]"
            );


          if(!button){
            return;
          }


          const sku =
            button.dataset.sku;


          const action =
            button.dataset.cartAction;


          const cart =
            window.POS.cart;


          const index =
            cart.findIndex(
              item =>
                item.sku === sku
            );


          if(index === -1){
            return;
          }


          if(action === "plus"){

            cart[index].qty++;

          }


          if(action === "minus"){

            if(
              cart[index].qty > 1
            ){

              cart[index].qty--;

            }

          }


          if(action === "delete"){

            cart.splice(
              index,
              1
            );

          }


          saveCart();


          renderCart();

        }
      );


      // ===================================================
// PENDING PAYMENT
// ===================================================

pendingBtn.addEventListener(
  "click",
  async () => {

    const cart =
      window.POS.cart || [];


    if(!cart.length){
      return;
    }


    const total =
      getCartTotal();


    if(total <= 0){
      return;
    }


    // -----------------------------------------------
    // COPY CART ITEMS
    // -----------------------------------------------

    const items =
      cart.map(item => ({

        sku:
          item.sku,

        name:
          item.name,

        price:
          Number(item.price || 0),

        emoji:
          item.emoji || "🍹",

        qty:
          Number(item.qty || 0)

      }));


    // -----------------------------------------------
    // CREATE BILL
    // -----------------------------------------------

    const bill = {

      billId:
        generateBillId(
          businessDate
        ),

      createdAt:
        getBusinessDateTime(),

      items:
        items,

      total:
        total,

      
      customer_name:
        "",

      status:
        "UNPAID"

    };


    try{

      // ---------------------------------------------
      // PREPARE SALES ITEMS
      // ---------------------------------------------

      const salesItems =
        items.map(item => {

          const menu =
            menus.find(
              m =>
                String(m.sku) ===
                String(item.sku)
            );


          if(!menu){

            throw new Error(
              "MENU_NOT_FOUND: " +
              item.sku
            );

          }


          const qty =
            Number(item.qty || 0);


          if(
            !Number.isFinite(qty) ||
            qty <= 0
          ){

            throw new Error(
              "INVALID_QTY"
            );

          }


          return {

            menu_id:
              menu.id,

            qty:
              qty

          };

        });


      // ---------------------------------------------
      // SAVE SALES AS UNPAID
      // ---------------------------------------------

      const result =
        await POS.api.sales({

          items:
            salesItems,

          payment_status:
            "UNPAID",

          remark:
            bill.billId

        });


      // ---------------------------------------------
      // CHECK API RESULT
      // ---------------------------------------------

      if(
        !result ||
        result.success !== true
      ){

        throw new Error(
          result?.error ||
          "SAVE_PENDING_BILL_FAILED"
        );

      }


      // ---------------------------------------------
      // SAVE LOCAL PENDING BILL
      // ONLY AFTER BACKEND SUCCESS
      // ---------------------------------------------

      window.POS.pendingBills.push(
        bill
      );


      savePendingBills();


      // ---------------------------------------------
      // CLEAR CART
      // ONLY AFTER BACKEND SUCCESS
      // ---------------------------------------------

      window.POS.cart =
        [];


      saveCart();

      // --------------------------------------------
      // ล้างตะกร้าบนหน้าจอทันที
      // --------------------------------------------
      const paymentActions =
        document.getElementById(
          "posPaymentActions"
        );

      if(paymentActions){

        paymentActions.style.display =
          "none";

      }


      // ---------------------------------------------
      // REFRESH
      // ---------------------------------------------

      renderCart();

      renderPendingBills();// -----------------------------------------------
// สลับไปแท็บ บิลค้างจ่าย
// -----------------------------------------------

const pendingTab =
  document.querySelector(
    '.pos-tab[data-pos-tab="pending"]'
  );

if(pendingTab){

  pendingTab.click();

}


      console.log(
        "PENDING BILL SAVED:",
        result
      );


    }catch(error){

      // ---------------------------------------------
      // DO NOT CLEAR CART
      // ---------------------------------------------

      console.error(
        "PENDING BILL ERROR:",
        error
      );


      alert(
        "บันทึกบิลค้างไม่สำเร็จ\n\n" +
        (
          error?.message ||
          "กรุณาลองใหม่อีกครั้ง"
        )
      );

    }

  }
);
      

// ===================================================
// CURRENT CART PAYMENT
// ===================================================

if(!window.POS.currentCartPayBound){

  window.POS.currentCartPayBound = true;

  window.POS.currentCartPaymentBusy =
    false;


  document.addEventListener(
    "click",
    event => {

      // ------------------------------------------------
      // ปุ่มรับชำระตะกร้าปัจจุบัน
      // ------------------------------------------------

      const currentCartPay =
        event.target.closest(
          "#posCurrentCartPay"
        );


      if(!currentCartPay){
        return;
      }


      // ------------------------------------------------
      // ป้องกันเปิดรับชำระซ้ำ
      // ------------------------------------------------

      if(window.POS.currentCartPaymentBusy){
        return;
      }


      // ------------------------------------------------
      // อ่านตะกร้าปัจจุบัน
      // ------------------------------------------------

      const currentCart =
        Array.isArray(window.POS.cart)
          ? window.POS.cart.map(item => ({
              ...item
            }))
          : [];


      if(!currentCart.length){
        return;
      }


      const total =
        currentCart.reduce(
          (sum, item) =>
            sum +
            (
              Number(item.price || 0) *
              Number(item.qty || 0)
            ),
          0
        );


      if(total <= 0){
        return;
      }


      // ------------------------------------------------
      // สร้างรายการสำหรับแสดงใน Modal
      // ------------------------------------------------

      const items =
        currentCart.map(item => ({

          sku:
            item.sku,

          name:
            item.name,

          price:
            Number(item.price || 0),

          emoji:
            item.emoji || "🍹",

          qty:
            Number(item.qty || 0)

        }));


      const bill = {

        billId:
          generateBillId(
            businessDate
          ),

        createdAt:
          getBusinessDateTime(),

        items:
          items,

        total:
          total,

        status:
          "PAID"

      };


      // ------------------------------------------------
      // หา Modal
      // ------------------------------------------------

      const confirmModal =
        document.getElementById(
          "posConfirmPaymentModal"
        );


      const confirmBill =
        document.getElementById(
          "posConfirmPaymentBill"
        );


      const confirmTotal =
        document.getElementById(
          "posConfirmPaymentTotal"
        );

        const confirmItems =
        document.getElementById(
          "posConfirmPaymentItems"
        );


      const confirmOk =
        document.getElementById(
          "posConfirmPaymentOk"
        );


      const confirmCancel =
        document.getElementById(
          "posConfirmPaymentCancel"
        );


      const confirmClose =
        document.getElementById(
          "posConfirmPaymentClose"
        );


      if(
        !confirmModal ||
        !confirmBill ||
        !confirmTotal ||
        !confirmOk
      ){

        console.error(
          "POS PAYMENT MODAL NOT FOUND"
        );

        return;

      }


      // ------------------------------------------------
      // สำคัญ:
      // รีเซ็ตปุ่มทุกครั้งที่เปิด Modal
      // ป้องกันครั้งที่ 2 ค้างสถานะเดิม
      // ------------------------------------------------

      confirmOk.disabled =
        false;

      confirmOk.textContent =
        "ยืนยันรับชำระ";


      // ------------------------------------------------
      // แสดงข้อมูล
      // ------------------------------------------------

      confirmBill.innerHTML = `
      <div>
        บิล ${bill.billId}
      </div>

      <div
        style="
          margin-top:8px;
          font-size:17px;
          font-weight:700;
          color:#64748b;
        "
      >
        ${items.reduce(
          (sum, item) =>
            sum + Number(item.qty || 0),
          0
        )} รายการ
      </div>
    `;


if(confirmItems){

  confirmItems.innerHTML =
    items.map(item => {

      const itemTotal =
        Number(item.price || 0) *
        Number(item.qty || 0);

      return `

        <div
          class="pos-confirm-payment-item"
        >

          <div
            class="pos-confirm-payment-item-left"
          >

            <div
              class="pos-confirm-payment-item-name"
            >
              ${item.emoji || "🍹"}
              ${item.name || "-"}
            </div>


            <div
              class="pos-confirm-payment-item-qty"
            >
              ${item.qty} ×
              ${Number(
                item.price || 0
              ).toLocaleString("th-TH")} บาท
            </div>

          </div>


          <div
            class="pos-confirm-payment-item-total"
          >
            ${itemTotal.toLocaleString(
              "th-TH"
            )} บาท
          </div>

        </div>

      `;

    }).join("");

}


confirmTotal.textContent =
  `${Number(
    bill.total || 0
  ).toLocaleString("th-TH")} บาท`;


      confirmModal.style.display =
        "flex";


      // ------------------------------------------------
      // ปิด Modal
      // ------------------------------------------------

      const closeConfirm =
        () => {

          if(
            window.POS.currentCartPaymentBusy
          ){
            return;
          }


          confirmModal.style.display =
            "none";

        };


      confirmCancel.onclick =
        closeConfirm;


      if(confirmClose){

        confirmClose.onclick =
          closeConfirm;

      }


      // ------------------------------------------------
      // ยืนยันรับชำระ
      // ------------------------------------------------

      confirmOk.onclick =
        async () => {

          // ----------------------------------------------
          // ป้องกันกดซ้ำ
          // ----------------------------------------------

          if(
            window.POS.currentCartPaymentBusy
          ){

            return;

          }


          window.POS.currentCartPaymentBusy =
            true;


          confirmOk.disabled =
            true;


          confirmOk.textContent =
            "กำลังบันทึก...";


          try{

            // --------------------------------------------
            // ตรวจตะกร้าที่ใช้ทำรายการ
            // ใช้ snapshot ที่เก็บไว้ตอนเปิด Modal
            // --------------------------------------------

            if(!currentCart.length){

              throw new Error(
                "ตะกร้าว่าง"
              );

            }


            // --------------------------------------------
            // ดึงเมนูจาก Backend
            // --------------------------------------------

            const menusRes =
              await POS.api.menus();


            const menus =
              menusRes?.menus || [];


            if(!menus.length){

              throw new Error(
                "ไม่พบข้อมูลเมนูจาก Backend"
              );

            }


            // --------------------------------------------
            // เตรียม Sales Items
            // --------------------------------------------

            const salesItems =
              currentCart.map(item => {

                const menu =
                  menus.find(
                    menu =>
                      String(menu.sku) ===
                      String(item.sku)
                  );


                if(!menu){

                  throw new Error(
                    "ไม่พบเมนู SKU: " +
                    item.sku
                  );

                }


                const qty =
                  Number(item.qty || 0);


                if(
                  !Number.isFinite(qty) ||
                  qty <= 0
                ){

                  throw new Error(
                    "จำนวนสินค้าไม่ถูกต้อง: " +
                    item.name
                  );

                }


                return {

                  menu_id:
                    menu.id,

                  qty:
                    qty

                };

              });


            // --------------------------------------------
            // ส่ง Sales API
            // --------------------------------------------

            const result =
              await POS.api.sales({

                items:
                  salesItems

              });


            // --------------------------------------------
            // ตรวจผลลัพธ์
            // --------------------------------------------

            if(
              !result ||
              result.success !== true
            ){

              throw new Error(
                result?.error ||
                "บันทึกการขายไม่สำเร็จ"
              );

            }


            // --------------------------------------------
            // สำเร็จจริง
            // ค่อยล้างตะกร้า
            // --------------------------------------------

            window.POS.cart =
              [];


            saveCart();


            // --------------------------------------------
            // ปิด Modal
            // --------------------------------------------

            confirmModal.style.display =
              "none";


            // --------------------------------------------
            // รีเซ็ตปุ่ม
            // --------------------------------------------

            confirmOk.disabled =
              false;


            confirmOk.textContent =
              "ยืนยันรับชำระ";


            // --------------------------------------------
            // รีเซ็ตสถานะ
            // เพื่อให้รับชำระครั้งต่อไปได้
            // --------------------------------------------

            window.POS.currentCartPaymentBusy =
              false;


            // --------------------------------------------
            // รีเฟรชตะกร้า
            // --------------------------------------------

            renderCart();

            console.log(
              "POS SALES SUCCESS:",
              result
            );


          }catch(error){

            // --------------------------------------------
            // API ล้มเหลว
            // ห้ามล้างตะกร้า
            // --------------------------------------------

            console.error(
              "POS SALES ERROR:",
              error
            );


            alert(
              "บันทึกการขายไม่สำเร็จ\n\n" +
              (
                error?.message ||
                "กรุณาลองใหม่อีกครั้ง"
              )
            );


            // --------------------------------------------
            // พร้อมให้กดใหม่
            // --------------------------------------------

            window.POS.currentCartPaymentBusy =
              false;


            confirmOk.disabled =
              false;


            confirmOk.textContent =
              "ยืนยันรับชำระ";

          }

        };

    }
  );

}

// ===================================================
// RECEIVE PENDING BILL PAYMENT
// ===================================================

if(!window.POS.pendingBillPayBound){

  window.POS.pendingBillPayBound = true;


  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "#posPendingBillPay"
        );


      if(!button){
        return;
      }


      // -----------------------------------------------
      // หยุด click นี้ทันที
      // -----------------------------------------------

      event.preventDefault();
      event.stopImmediatePropagation();


      // -----------------------------------------------
      // หา Bill ID
      // -----------------------------------------------

      const billIdElement =
        document.getElementById(
          "posPendingBillId"
        );


      if(!billIdElement){
        return;
      }


      const billId =
        billIdElement.textContent
          .replace("บิล ","")
          .trim();


      if(!billId){
        return;
      }


      // -----------------------------------------------
      // หา Bill
      // -----------------------------------------------

      const bills =
        window.POS.pendingBills || [];


      const bill =
        bills.find(
          item =>
            item.billId === billId &&
            item.status === "UNPAID"
        );


      if(!bill){

        alert(
          "ไม่พบบิลค้างจ่าย"
        );

        return;

      }


      // =================================================
      // เปิดหน้าต่างยืนยันหลังจาก click แรกจบแล้ว
      // =================================================

      setTimeout(
        () => {

          const confirmModal =
            document.getElementById(
              "posConfirmPaymentModal"
            );


          const confirmBill =
            document.getElementById(
              "posConfirmPaymentBill"
            );


          const confirmTotal =
            document.getElementById(
              "posConfirmPaymentTotal"
            );


          const confirmOk =
            document.getElementById(
              "posConfirmPaymentOk"
            );


          const confirmCancel =
            document.getElementById(
              "posConfirmPaymentCancel"
            );


          const confirmClose =
            document.getElementById(
              "posConfirmPaymentClose"
            );


          if(!confirmModal){
            return;
          }


          if(!confirmOk){
            return;
          }


          // ---------------------------------------------
          // แสดงข้อมูล
          // ---------------------------------------------

          confirmBill.textContent =
            `บิล ${bill.billId}`;


          confirmTotal.textContent =
            `${Number(
              bill.total || 0
            ).toLocaleString("th-TH")} บาท`;

            const confirmItems =
          document.getElementById(
            "posConfirmPaymentItems"
          );

        if(confirmItems){

          const items =
            bill.items || [];

          confirmItems.innerHTML =
            items.map(item => {

              const itemTotal =
                Number(item.price || 0) *
                Number(item.qty || 0);

              return `
                <div
                  class="pos-confirm-payment-item"
                >

                  <div
                    class="pos-confirm-payment-item-left"
                  >

                    <div
                      class="pos-confirm-payment-item-name"
                    >
                      ${item.emoji || "🍹"}
                      ${item.name || "-"}
                    </div>

                    <div
                      class="pos-confirm-payment-item-qty"
                    >
                      ${Number(item.qty || 0)} ×
                      ${Number(
                        item.price || 0
                      ).toLocaleString("th-TH")} บาท
                    </div>

                  </div>

                  <div
                    class="pos-confirm-payment-item-total"
                  >
                    ${itemTotal.toLocaleString("th-TH")}
                    บาท
                  </div>

                </div>
              `;

            }).join("");

        }


          // ---------------------------------------------
          // สำคัญ
          // ปลดสถานะ disabled ก่อน
          // ---------------------------------------------

          confirmOk.disabled =
            false;


          confirmOk.textContent =
            "🟢 รับชำระ";


          // ---------------------------------------------
          // ล้าง onclick เดิม
          // ---------------------------------------------

          confirmOk.onclick =
            null;


          // ---------------------------------------------
          // เปิด Modal
          // ---------------------------------------------

          confirmModal.style.display =
            "flex";


          // ---------------------------------------------
          // ปุ่มยกเลิก
          // ---------------------------------------------

          if(confirmCancel){

            confirmCancel.onclick =
              event => {

                event.preventDefault();
                event.stopPropagation();


                confirmModal.style.display =
                  "none";

              };

          }


          // ---------------------------------------------
          // ปุ่ม X
          // ---------------------------------------------

          if(confirmClose){

            confirmClose.onclick =
              event => {

                event.preventDefault();
                event.stopPropagation();


                confirmModal.style.display =
                  "none";

              };

          }


          // ---------------------------------------------
          // ยืนยันรับชำระ
          //
          // จะทำงานเฉพาะเมื่อผู้ใช้คลิกปุ่มนี้
          // หลังจาก Modal เปิดแล้วเท่านั้น
          // ---------------------------------------------

          confirmOk.onclick =
            async event => {

              event.preventDefault();
              event.stopPropagation();


              if(confirmOk.disabled){
                return;
              }


              confirmOk.disabled =
                true;


              confirmOk.textContent =
                "กำลังบันทึก...";


              try{

                // -----------------------------------------
                // ส่งไป Backend
                // -----------------------------------------

                const result =
                  await POS.api.salesPay(
                    bill.billId
                  );


                if(
                  !result ||
                  result.success !== true
                ){

                  throw new Error(
                    result?.error ||
                    "รับชำระไม่สำเร็จ"
                  );

                }


                // -----------------------------------------
                // Backend สำเร็จ
                // -----------------------------------------

                bill.status =
                  "PAID";


                bill.paidAt =
                  new Date().toISOString();


                savePendingBills();


                // -----------------------------------------
                // ปิด Modal ยืนยัน
                // -----------------------------------------

                confirmModal.style.display =
                  "none";


                // -----------------------------------------
                // ปิด Modal บิลค้าง
                // -----------------------------------------

                const pendingModal =
                  document.getElementById(
                    "posPendingBillModal"
                  );


                if(pendingModal){

                  pendingModal.style.display =
                    "none";

                }


                // -----------------------------------------
                // รีเฟรชรายการ
                // -----------------------------------------

                renderPendingBills();


                // -----------------------------------------
// ให้หน้าบิลค้างยังคงแสดงอยู่
// แม้จ่ายบิลสุดท้ายแล้ว
// -----------------------------------------

const pendingPanel =
  document.getElementById(
    "posPendingBillsPanel"
  );

if(pendingPanel){

  pendingPanel.style.display =
    "block";

}


                console.log(
                  "PENDING BILL PAYMENT SUCCESS:",
                  result
                );


              }catch(error){

                console.error(
                  "PENDING BILL PAYMENT ERROR:",
                  error
                );


                alert(
                  "รับชำระไม่สำเร็จ\n\n" +
                  (
                    error?.message ||
                    "กรุณาลองใหม่อีกครั้ง"
                  )
                );


                confirmOk.disabled =
                  false;


                confirmOk.textContent =
                  "🟢 รับชำระ";

              }

            };

        },
        0
      );

    },
    true
  );

}


    }, 0);


    return html;


  } catch(error){

    console.error(
      "POS MENU ERROR:",
      error
    );


    return `

      <h1 class="page-title">
        POS
      </h1>

      <p class="page-subtitle">
        เลือกเมนู
      </p>

      <div class="panel">

        เกิดข้อผิดพลาด:
        ${error.message || error}

      </div>

    `;

  }

};


// ===================================================
// RENDER PAID BILLS
// ===================================================

async function renderPaidBills(){

  const container =
    document.getElementById(
      "posPaidBills"
    );

  const countEl =
    document.getElementById(
      "posPaidBillsCount"
    );


  if(!container){
    return;
  }


  container.innerHTML = `
    <div class="pos-cart-empty">
      กำลังโหลดรายการบิลขาย...
    </div>
  `;


  try{

    // -----------------------------------------------
    // LOAD SALES
    // -----------------------------------------------

    const result =
      await POS.api.salesList();


    if(
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        "LOAD_PAID_BILLS_FAILED"
      );

    }

    // -----------------------------------------------
// LOAD MENUS
// -----------------------------------------------

const menusRes =
  await POS.api.menus();

const menus =
  menusRes?.menus || [];


    const sales =
  Array.isArray(result.sales)
    ? result.sales.filter(
        row =>
          String(
            row.payment_status || ""
          ).toUpperCase() === "PAID"
      )
    : [];


    // -----------------------------------------------
    // GROUP BY BILL
    // remark = billId
    // -----------------------------------------------

    const bills = {};


    sales.forEach(row => {

      const billId =
        String(
          row.remark || row.id || ""
        ).trim();


      if(!billId){
        return;
      }


      if(!bills[billId]){

  bills[billId] = {

    billId:
      billId,

    soldAt:
      row.sold_at,

      // วันที่ / เวลาที่ชำระเงินจริง
  paidAt:
    row.paid_at || null,

    total:
      0,

    items:
      0,

    detailItems:
      []

  };

}


bills[billId].total +=
  Number(
    row.total || 0
  );


bills[billId].items +=
  Number(
    row.qty || 0
  );

  // -----------------------------------------------
// เก็บวันที่ชำระเงินจริง
// -----------------------------------------------

if(
  row.paid_at
){

  bills[billId].paidAt =
    row.paid_at;

}


// -----------------------------------------------
// เก็บรายการสินค้าในบิล
// -----------------------------------------------

const menu =
  menus.find(
    m =>
      String(m.id) ===
      String(row.menu_id)
  );


bills[billId].detailItems.push({

  name:
    menu?.name ||
    "ไม่พบชื่อเมนู",

  emoji:
    menu?.emoji ||
    "🍹",

  qty:
    Number(
      row.qty || 0
    ),

  price:
    Number(
      row.unit_price || 0
    ),

  total:
    Number(
      row.total || 0
    )

});

    });


    const billList =
      Object.values(
        bills
      );

      // -----------------------------------------------
// เก็บรายการบิลขายแล้วไว้สำหรับเปิดดูรายละเอียด
// -----------------------------------------------

window.POS.paidBills =
  billList;


    // -----------------------------------------------
    // COUNT
    // -----------------------------------------------

    if(countEl){

      countEl.textContent =
        `${billList.length} บิล`;

    }


    // -----------------------------------------------
    // EMPTY
    // -----------------------------------------------

    if(!billList.length){

      container.innerHTML = `
        <div class="pos-cart-empty">
          ยังไม่มีรายการบิลขาย
        </div>
      `;

      return;

    }


    // -----------------------------------------------
    // RENDER
    // -----------------------------------------------

    container.innerHTML =
      billList
        .map(bill => {

          const date =
            bill.soldAt
              ? new Date(
                  bill.soldAt
                ).toLocaleString(
                  "th-TH"
                )
              : "-";


          return `

            <div
  class="pos-pending-bill-row"
  data-paid-bill="true"
  data-bill-id="${bill.billId}"
  style="cursor:pointer;"
>

              <div>

                <div
                  class="pos-pending-bill-id"
                >
                  บิล ${bill.billId}
                </div>


                <div
                  class="pos-pending-bill-info"
                >

                  ${bill.items} รายการ

                  <span
                    class="pos-pending-status"
                  >
                    ชำระแล้ว
                  </span>

                  <span
                style="
                  margin-left:8px;
                  color:#64748b;
                "
              >
                กดเพื่อดูรายละเอียด →
              </span>

                </div>


                <div
                  style="
                    margin-top:6px;
                    font-size:13px;
                    color:#777;
                  "
                >
                  ${date}
                </div>

              </div>


              <div
                class="pos-pending-bill-total"
              >
                ${Number(
                  bill.total || 0
                ).toLocaleString("th-TH")}
                บาท
              </div>

            </div>

          `;

        })
        .join("");


  }catch(error){

    console.error(
      "RENDER PAID BILLS ERROR:",
      error
    );


    if(countEl){

      countEl.textContent =
        "0 บิล";

    }


    container.innerHTML = `
      <div class="pos-cart-empty">
        โหลดรายการบิลขายไม่สำเร็จ
      </div>
    `;

  }

}


window.POS.renderPaidBills =
  renderPaidBills;


// ===================================================
// OPEN PAID BILL DETAIL
// ดูอย่างเดียว
// ===================================================

function openPaidBillDetail(billId){

  const bills =
    window.POS.paidBills || [];


  const bill =
    bills.find(
      item =>
        item.billId === billId
    );


  if(!bill){
    return;
  }


  // -----------------------------------------------
  // สร้าง Modal ถ้ายังไม่มี
  // -----------------------------------------------

  let modal =
    document.getElementById(
      "posPaidBillDetailModal"
    );


  if(!modal){

    modal =
      document.createElement(
        "div"
      );

    modal.id =
      "posPaidBillDetailModal";

    modal.className =
      "pos-pending-bill-modal";


    modal.innerHTML = `

      <div
        class="pos-pending-bill-box"
      >

        <button
          type="button"
          id="posPaidBillDetailClose"
          class="pos-pending-bill-close"
        >
          ×
        </button>


        <div
          class="pos-pending-bill-title"
        >
          🧾 รายละเอียดบิลขายแล้ว
        </div>


        <div
          id="posPaidBillDetailId"
          class="pos-pending-bill-id-large"
        >
        </div>


        <div
          id="posPaidBillDetailDate"
          style="
            margin-top:8px;
            color:#64748b;
            font-size:17px;
          "
        >
        </div>


        <div
          id="posPaidBillDetailItems"
          class="pos-pending-bill-items"
          style="
            margin-top:28px;
          "
        >
        </div>


        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-top:20px;
            padding-top:20px;
            border-top:2px solid #eee;
          "
        >

          <strong
            style="
              font-size:19px;
            "
          >
            รวมทั้งหมด
          </strong>


          <strong
            id="posPaidBillDetailTotal"
            style="
              color:#059669;
              font-size:30px;
              font-weight:900;
            "
          >
          </strong>

        </div>


        <div
          style="
            margin-top:18px;
            text-align:center;
            color:#059669;
            font-size:19px;
            font-weight:800;
          "
        >
          🟢 ชำระแล้ว
        </div>


      </div>

    `;


    document.body.appendChild(
      modal
    );


    // ---------------------------------------------
    // ปุ่มปิด
    // ---------------------------------------------

    const closeBtn =
      document.getElementById(
        "posPaidBillDetailClose"
      );


    if(closeBtn){

      closeBtn.onclick =
        () => {

          modal.style.display =
            "none";

        };

    }


    // ---------------------------------------------
    // คลิกพื้นหลังเพื่อปิด
    // ---------------------------------------------

    modal.addEventListener(
      "click",
      event => {

        if(
          event.target ===
          modal
        ){

          modal.style.display =
            "none";

        }

      }
    );

  }


  const billIdEl =
    document.getElementById(
      "posPaidBillDetailId"
    );


  const dateEl =
    document.getElementById(
      "posPaidBillDetailDate"
    );


  const itemsEl =
    document.getElementById(
      "posPaidBillDetailItems"
    );


  const totalEl =
    document.getElementById(
      "posPaidBillDetailTotal"
    );


  // -----------------------------------------------
  // รายการสินค้า
  // -----------------------------------------------

  const items =
    bill.detailItems || [];


  // -----------------------------------------------
  // จำนวนรายการรวม
  // -----------------------------------------------

  const itemQty =
    items.reduce(
      (sum, item) =>
        sum + Number(
          item.qty || 0
        ),
      0
    );


  // -----------------------------------------------
  // Bill ID + จำนวนรายการ
  // -----------------------------------------------

  billIdEl.innerHTML = `

    <div>
      บิล ${bill.billId}
    </div>

    <div
      style="
        margin-top:8px;
        font-size:17px;
        font-weight:500;
        color:#64748b;
      "
    >
      ${itemQty} รายการ
    </div>

  `;


  // -----------------------------------------------
  // วันที่ / เวลา
  // -----------------------------------------------

  let dateText = "-";


  const dateValue =
  bill.soldAt;


  if(dateValue){

    const date =
      new Date(
        dateValue
      );


    if(
      !Number.isNaN(
        date.getTime()
      )
    ){

      const day =
        String(
          date.getDate()
        ).padStart(2,"0");


      const month =
        String(
          date.getMonth() + 1
        ).padStart(2,"0");


      const year =
        date.getFullYear() + 543;


      const hour =
        String(
          date.getHours()
        ).padStart(2,"0");


      const minute =
        String(
          date.getMinutes()
        ).padStart(2,"0");


      const second =
        String(
          date.getSeconds()
        ).padStart(2,"0");


      dateText =
        `${day}/${month}/${year} ${hour}:${minute}:${second}`;

    }

  }


  dateEl.innerHTML = `
  📅 วันที่ขาย
  ${dateText}
`;


if(bill.paidAt){

  let paidText = "-";

  const paidDate =
    new Date(
      bill.paidAt
    );

  if(
    !Number.isNaN(
      paidDate.getTime()
    )
  ){

    const day =
      String(
        paidDate.getDate()
      ).padStart(2,"0");

    const month =
      String(
        paidDate.getMonth() + 1
      ).padStart(2,"0");

    const year =
      paidDate.getFullYear() + 543;

    const hour =
      String(
        paidDate.getHours()
      ).padStart(2,"0");

    const minute =
      String(
        paidDate.getMinutes()
      ).padStart(2,"0");

    const second =
      String(
        paidDate.getSeconds()
      ).padStart(2,"0");

    paidText =
      `${day}/${month}/${year} ${hour}:${minute}:${second}`;

  }

  dateEl.innerHTML += `
    <div style="margin-top:8px;">
      💳 วันที่ชำระ
      ${paidText}
    </div>
  `;

}


  // -----------------------------------------------
  // รายการสินค้า
  // -----------------------------------------------

  itemsEl.innerHTML =
    items.map(
      item => {

        const qty =
          Number(
            item.qty || 0
          );


        const price =
          Number(
            item.price || 0
          );


        const total =
          Number(
            item.total || 0
          );


        return `

          <div
            class="pos-pending-detail-item"
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              padding:14px 0;
              border-bottom:1px solid #eee;
            "
          >

            <div>

              <div
                class="pos-pending-detail-name"
                style="
                  font-size:19px;
                  font-weight:800;
                  color:#0f172a;
                "
              >
                ${item.emoji || "🍹"}
                ${item.name || "-"}
              </div>


              <div
                style="
                  margin-top:5px;
                  font-size:17px;
                  color:#64748b;
                "
              >
                ${qty} ×
                ${price.toLocaleString("th-TH")}
                บาท
              </div>

            </div>


            <div
              style="
                margin-left:auto;
                font-size:20px;
                font-weight:900;
                color:#0f172a;
                white-space:nowrap;
              "
            >
              ${total.toLocaleString("th-TH")}
              บาท
            </div>

          </div>

        `;

      }
    ).join("");


  // -----------------------------------------------
  // ยอดรวม
  // -----------------------------------------------

  totalEl.textContent =
    `${Number(
      bill.total || 0
    ).toLocaleString("th-TH")} บาท`;


  // -----------------------------------------------
  // เปิด Modal
  // -----------------------------------------------

  modal.style.display =
    "flex";

}


window.POS.openPaidBillDetail =
  openPaidBillDetail;


  // ===================================================
// CLICK PAID BILL
// ===================================================

if(!window.POS.paidBillsBound){

  window.POS.paidBillsBound =
    true;


  document.addEventListener(
    "click",
    event => {

      const billElement =
        event.target.closest(
          "[data-paid-bill='true']"
        );


      if(!billElement){
        return;
      }


      const billId =
        billElement.dataset.billId;


      if(!billId){
        return;
      }


      window.POS.openPaidBillDetail(
        billId
      );

    }
  );

}




// ===================================================
// POS TAB SWITCH
// ===================================================

if(!window.POS.posTabsBound){

  window.POS.posTabsBound = true;


  document.addEventListener(
    "click",
    event => {

      const tab =
        event.target.closest(
          ".pos-tab"
        );


      if(!tab){
        return;
      }


      const tabName =
        tab.dataset.posTab;


      if(!tabName){
        return;
      }


      // -----------------------------------------------
      // เปลี่ยนสี Tab
      // -----------------------------------------------

      document
        .querySelectorAll(
          ".pos-tab"
        )
        .forEach(button => {

          button.classList.remove(
            "active"
          );

        });


      tab.classList.add(
        "active"
      );


      // -----------------------------------------------
      // หาของเดิมในหน้า POS
      // -----------------------------------------------

      const cartPanel =
        document.querySelector(
          ".pos-cart-panel"
        );


      const menuPanels =
        document.querySelectorAll(
          ".pos-category"
        );


      const pendingPanel =
        document.getElementById(
          "posPendingBillsPanel"
        );

      const paidPanel =
        document.getElementById(
          "posPaidBillsPanel"
        );


      // -----------------------------------------------
      // TAB : ขายสินค้า
      // -----------------------------------------------

      if(tabName === "sell"){

        if(cartPanel){

          cartPanel.style.display =
            "block";

        }


        menuPanels.forEach(panel => {

          panel.style.display =
            "block";

        });


        if(pendingPanel){

          pendingPanel.style.display =
            "none";

        }

        if(paidPanel){

          paidPanel.style.display =
            "none";

        }

      }


      // -----------------------------------------------
      // TAB : บิลค้างจ่าย
      // -----------------------------------------------

      if(tabName === "pending"){

  if(cartPanel){

    cartPanel.style.display =
      "none";

  }


  menuPanels.forEach(panel => {

    panel.style.display =
      "none";

  });

  // -----------------------------------------------
  // วาดบิลค้าง
  // -----------------------------------------------

   window.POS.renderPendingBills();

  if(pendingPanel){

    pendingPanel.style.display =
      "block";

  }

  if(paidPanel){

    paidPanel.style.display =
      "none";

  }

}


      // -----------------------------------------------
      // TAB : รายการบิลขายแล้ว
      // -----------------------------------------------

      if(tabName === "paid"){

  if(cartPanel){

    cartPanel.style.display =
      "none";

  }


  menuPanels.forEach(panel => {

    panel.style.display =
      "none";

  });


  if(pendingPanel){

    pendingPanel.style.display =
      "none";

  }


  if(paidPanel){

    paidPanel.style.display =
      "block";

  }


  // -----------------------------------------------
  // โหลดรายการบิลขายแล้ว
  // -----------------------------------------------

  window.POS.renderPaidBills();

}


      window.POS.activePosTab =
        tabName;

    }
  );

}