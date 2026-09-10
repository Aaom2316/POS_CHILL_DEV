POS.pages.expenses = async function(){

  // =================================================
  // เตรียมประเภทเริ่มต้น
  // =================================================

  POS.currentExpenseType =
    POS.currentExpenseType === "shop"
      ? "shop"
      : "regular";


  const html = `


    <style>

      /* =================================================
         EXPENSES TABS
         ================================================= */

      .pos-expenses-tabs{

        display:flex;

        width:100%;

        background:#ffffff;

        border-radius:20px;

        padding:10px;

        box-shadow:
          0 8px 20px rgba(0,0,0,0.05);

        gap:10px;

      }


      /* =================================================
         TAB
         ================================================= */

      .pos-expenses-tab{

        flex:1;

        border:none;

        background:transparent;

        border-radius:14px;

        padding:18px 20px;

        font-size:20px;

        font-weight:700;

        color:#64748b;

        cursor:pointer;

        transition:
          background .2s ease,
          color .2s ease;

      }


      /* =================================================
         ACTIVE
         ================================================= */

      .pos-expenses-tab.active{

        background:#dff7eb;

        color:#009b63;

      }


      /* =================================================
         HOVER
         ================================================= */

      .pos-expenses-tab:hover{

        background:#f1f5f9;

      }


      .pos-expenses-tab.active:hover{

        background:#dff7eb;

      }


      /* =================================================
         CONTENT
         ================================================= */

      .pos-expenses-area{

        padding:
          30px
          10px
          10px;

      }


      .pos-expenses-header{

        display:flex;

        align-items:center;

        justify-content:space-between;

        margin-bottom:25px;

      }


      .pos-expenses-title{

        margin:0;

        font-size:26px;

        font-weight:800;

        color:#1e293b;

      }


      /* =================================================
         ADD BUTTON
         ================================================= */

      .pos-expenses-add{

        border:none;

        border-radius:12px;

        padding:12px 20px;

        background:#dff7eb;

        color:#009b63;

        font-size:17px;

        font-weight:800;

        cursor:pointer;

      }


      .pos-expenses-add:hover{

        background:#c9f1dd;

      }


      /* =================================================
         EMPTY
         ================================================= */

      .pos-expenses-empty{

        padding:45px 20px;

        text-align:center;

        color:#64748b;

        font-size:18px;

      }


      /* =================================================
         MODAL
         ================================================= */

      .pos-expense-modal{

        position:fixed;

        inset:0;

        z-index:10000;

        display:none;

        align-items:center;

        justify-content:center;

        background:rgba(
          0,
          0,
          0,
          0.45
        );

        padding:20px;

        box-sizing:border-box;

      }


      .pos-expense-modal-box{

        width:100%;

        max-width:520px;

        max-height:90vh;

        overflow-y:auto;

        background:#ffffff;

        border-radius:22px;

        padding:28px;

        box-sizing:border-box;

        box-shadow:
          0 15px 40px
          rgba(0,0,0,0.18);

        position:relative;

      }


      .pos-expense-modal-close{

        position:absolute;

        top:14px;

        right:18px;

        border:none;

        background:transparent;

        font-size:30px;

        color:#64748b;

        cursor:pointer;

      }


      .pos-expense-modal-title{

        text-align:center;

        font-size:25px;

        font-weight:900;

        color:#1e293b;

        margin-bottom:25px;

      }


      /* =================================================
         FORM
         ================================================= */

      .pos-expense-form-group{

        margin-bottom:18px;

      }


      .pos-expense-form-label{

        display:block;

        margin-bottom:7px;

        font-size:16px;

        font-weight:800;

        color:#334155;

      }


      .pos-expense-form-input{

        width:100%;

        box-sizing:border-box;

        border:1px solid #d1d5db;

        border-radius:12px;

        padding:13px 14px;

        font-family:inherit;

        font-size:17px;

        outline:none;

      }


      .pos-expense-form-input:focus{

        border-color:#34d399;

        box-shadow:
          0 0 0 3px
          rgba(52,211,153,0.15);

      }


      .pos-expense-type{

        padding:13px 15px;

        border-radius:12px;

        background:#ecfdf5;

        color:#059669;

        font-size:17px;

        font-weight:800;

      }


      /* =================================================
         ACTIONS
         ================================================= */

      .pos-expense-actions{

        display:grid;

        grid-template-columns:1fr 1fr;

        gap:10px;

        margin-top:25px;

      }


      .pos-expense-cancel{

        border:none;

        border-radius:12px;

        padding:14px;

        background:#f1f5f9;

        color:#475569;

        font-family:inherit;

        font-size:17px;

        font-weight:800;

        cursor:pointer;

      }


      .pos-expense-save{

        border:none;

        border-radius:12px;

        padding:14px;

        background:#4ade80;

        color:#14532d;

        font-family:inherit;

        font-size:17px;

        font-weight:900;

        cursor:pointer;

      }

    </style>


    <!-- =========================================
         PAGE TITLE
    ========================================== -->

    <h1 class="page-title">
      รายจ่าย
    </h1>


    <p class="page-subtitle">
      จัดการรายจ่ายประจำวันและรายจ่ายร้าน
    </p>


    <!-- =========================================
         MAIN PANEL
    ========================================== -->

    <div class="panel">


      <!-- =========================================
           TABS
      ========================================== -->

      <div class="pos-expenses-tabs">


        <button
          type="button"
          class="pos-expenses-tab
            ${POS.currentExpenseType === "regular"
              ? "active"
              : ""}"
          data-expense-tab="regular"
          onclick="
            POS.expensesSwitchTab('regular')
          "
        >
          💸 รายจ่ายประจำวัน
        </button>


        <button
          type="button"
          class="pos-expenses-tab
            ${POS.currentExpenseType === "shop"
              ? "active"
              : ""}"
          data-expense-tab="shop"
          onclick="
            POS.expensesSwitchTab('shop')
          "
        >
          🏪 รายจ่ายร้าน
        </button>


      </div>


      <!-- =========================================
           REGULAR EXPENSES
      ========================================== -->

      <div
        id="expensesRegularArea"
        class="pos-expenses-area"
        style="
          display:
            ${POS.currentExpenseType === "regular"
              ? "block"
              : "none"};
        "
      >

        <div
          class="pos-expenses-header"
        >

          <h2
            class="pos-expenses-title"
          >
            💸 รายจ่ายประจำวัน
          </h2>


          <button
            type="button"
            class="pos-expenses-add"
            onclick="
              POS.openExpenseModal('regular')
            "
          >
            ＋ เพิ่มรายจ่าย
          </button>

        </div>


        <div
          class="pos-expenses-empty"
        >
          กำลังโหลดรายการ...
        </div>

      </div>


      <!-- =========================================
           SHOP EXPENSES
      ========================================== -->

      <div
        id="expensesShopArea"
        class="pos-expenses-area"
        style="
          display:
            ${POS.currentExpenseType === "shop"
              ? "block"
              : "none"};
        "
      >

        <div
          class="pos-expenses-header"
        >

          <h2
            class="pos-expenses-title"
          >
            🏪 รายจ่ายร้าน
          </h2>


          <button
            type="button"
            class="pos-expenses-add"
            onclick="
              POS.openExpenseModal('shop')
            "
          >
            ＋ เพิ่มรายจ่าย
          </button>

        </div>


        <div
          class="pos-expenses-empty"
        >
          กำลังโหลดรายการ...
        </div>

      </div>


    </div>


    <!-- =========================================
         ADD EXPENSE MODAL
    ========================================== -->

    <div
      id="posExpenseModal"
      class="pos-expense-modal"
    >

      <div
        class="pos-expense-modal-box"
      >


        <button
          type="button"
          class="pos-expense-modal-close"
          onclick="
            POS.closeExpenseModal()
          "
        >
          ×
        </button>


        <div
          class="pos-expense-modal-title"
        >
          💸 เพิ่มรายจ่าย
        </div>


        <!-- TYPE -->

        <div
          class="pos-expense-form-group"
        >

          <label
            class="pos-expense-form-label"
          >
            ประเภทรายจ่าย
          </label>


          <div
            id="posExpenseType"
            class="pos-expense-type"
          >
            💸 รายจ่ายประจำวัน
          </div>

        </div>


        <!-- DATE -->

        <div
          class="pos-expense-form-group"
        >

          <label
            class="pos-expense-form-label"
          >
            วันที่
          </label>


          <input
            type="date"
            id="posExpenseDate"
            class="pos-expense-form-input"
          >

        </div>


        <!-- CATEGORY -->

        <div
          class="pos-expense-form-group"
        >

          <label
            class="pos-expense-form-label"
          >
            หมวดหมู่
          </label>


          <select
            id="posExpenseCategory"
            class="pos-expense-form-input"
          >

            <option value="">
              เลือกหมวดหมู่
            </option>

          </select>

        </div>


        <!-- DESCRIPTION -->

        <div
          class="pos-expense-form-group"
        >

          <label
            class="pos-expense-form-label"
          >
            รายละเอียด
          </label>


          <input
            type="text"
            id="posExpenseDescription"
            class="pos-expense-form-input"
            placeholder="รายละเอียดรายจ่าย"
          >

        </div>


        <!-- AMOUNT -->

        <div
          class="pos-expense-form-group"
        >

          <label
            class="pos-expense-form-label"
          >
            จำนวนเงิน
          </label>


          <input
            type="number"
            id="posExpenseAmount"
            class="pos-expense-form-input"
            min="0"
            step="0.01"
            placeholder="0.00"
          >

        </div>


        <!-- ACTIONS -->

        <div
          class="pos-expense-actions"
        >

          <button
            type="button"
            class="pos-expense-cancel"
            onclick="
              POS.closeExpenseModal()
            "
          >
            ยกเลิก
          </button>


          <button
            type="button"
            class="pos-expense-save"
            onclick="
              POS.saveExpense()
            "
          >
            บันทึกรายจ่าย
          </button>

        </div>


      </div>

    </div>


  `;


  // =================================================
  // สำคัญ
  // ให้หน้า HTML ถูกใส่เข้า DOM ก่อน
  // แล้วค่อยโหลดข้อมูลจาก Backend
  // =================================================

  setTimeout(() => {

    if(
      typeof POS.loadExpenses ===
      "function"
    ){
      POS.loadExpenses();
    }

  }, 100);


  return html;

};

// =================================================
// OPEN EXPENSE MODAL
// =================================================

POS.openExpenseModal = async function(type){

  const modal =
    document.getElementById(
      "posExpenseModal"
    );


  if(!modal){
    return;
  }


  // =================================================
  // เก็บประเภท
  // =================================================

  POS.currentExpenseType =
    type === "shop"
      ? "shop"
      : "regular";


  const typeEl =
    document.getElementById(
      "posExpenseType"
    );


  const dateEl =
    document.getElementById(
      "posExpenseDate"
    );


  const categoryEl =
    document.getElementById(
      "posExpenseCategory"
    );


  const descriptionEl =
    document.getElementById(
      "posExpenseDescription"
    );


  const amountEl =
    document.getElementById(
      "posExpenseAmount"
    );


  // =================================================
  // แสดงประเภท
  // =================================================

  if(typeEl){

    if(
      POS.currentExpenseType ===
      "shop"
    ){

      typeEl.textContent =
        "🏪 รายจ่ายร้าน";

    }else{

      typeEl.textContent =
        "💸 รายจ่ายประจำวัน";

    }

  }


  // =================================================
  // หมวดหมู่ตามประเภท
  // =================================================

  if(categoryEl){

    if(
      POS.currentExpenseType ===
      "shop"
    ){

      categoryEl.innerHTML = `

        <option value="">
          เลือกหมวดหมู่
        </option>

        <option value="ค่าไฟ">
          ⚡ ค่าไฟ
        </option>

        <option value="ค่าน้ำ">
          💧 ค่าน้ำ
        </option>

        <option value="ค่าเช่า">
          🏠 ค่าเช่า
        </option>

        <option value="ค่าแรง">
          👨‍💼 ค่าแรง
        </option>

        <option value="ซื้อสินค้า">
          🛒 ซื้อสินค้า
        </option>

        <option value="ซื้อวัตถุดิบ">
          📦 ซื้อวัตถุดิบ
        </option>

        <option value="ค่าซ่อมแซม">
          🔧 ค่าซ่อมแซม
        </option>

        <option value="ค่าอุปกรณ์">
          🧰 ค่าอุปกรณ์
        </option>

        <option value="ค่าอินเทอร์เน็ต">
          🌐 ค่าอินเทอร์เน็ต
        </option>

        <option value="ค่าโทรศัพท์">
          📱 ค่าโทรศัพท์
        </option>

        <option value="ค่าใช้จ่ายอื่นๆ">
          📋 ค่าใช้จ่ายอื่นๆ
        </option>

      `;

    }else{

      categoryEl.innerHTML = `

        <option value="">
          เลือกหมวดหมู่
        </option>

        <option value="น้ำแข็ง">
          🧊 น้ำแข็ง
        </option>

        <option value="ค่ากับข้าว">
          🍚 ค่ากับข้าว
        </option>

        <option value="ค่าขนม">
          🍪 ค่าขนม
        </option>

        <option value="ซื้อเครื่องดื่ม">
          🥤 ซื้อเครื่องดื่ม
        </option>

        <option value="ของใช้จิปาถะ">
          🛒 ของใช้จิปาถะ
        </option>

        <option value="อื่นๆ">
          📋 อื่นๆ
        </option>

      `;

    }

  }


// =================================================
// วันที่ทำการ
// =================================================

if(dateEl){

  try{

    const result =
      await POS.api.getBusinessDate();

    if(
      result &&
      result.success &&
      result.date
    ){

      dateEl.value =
        result.date;

    }

  }catch(error){

    console.error(
      "LOAD BUSINESS DATE ERROR:",
      error
    );

  }

}


  // =================================================
  // ล้างข้อมูล
  // =================================================

  if(categoryEl){

    categoryEl.value =
      "";

  }


  if(descriptionEl){

    descriptionEl.value =
      "";

  }


  if(amountEl){

    amountEl.value =
      "";

  }


  // =================================================
  // เปิด Modal
  // =================================================

  modal.style.display =
    "flex";

};


// =================================================
// CLOSE EXPENSE MODAL
// =================================================

POS.closeExpenseModal = function(){

  const modal =
    document.getElementById(
      "posExpenseModal"
    );


  if(modal){

    modal.style.display =
      "none";

  }

};


// =================================================
// SELECT PAYMENT STATUS
// =================================================

POS.selectExpenseStatus =
  function(status){

    document
      .querySelectorAll(
        ".pos-expense-status-btn"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.expenseStatus ===
              status
          );

        }
      );


    POS.expensePaymentStatus =
      status;

  };

// =================================================
// EXPENSES TAB
// =================================================

POS.expensesSwitchTab = function(tabName){

  const regularTab =
    document.querySelector(
      '.pos-expenses-tab[data-expense-tab="regular"]'
    );

  const shopTab =
    document.querySelector(
      '.pos-expenses-tab[data-expense-tab="shop"]'
    );


  const regularArea =
    document.getElementById(
      "expensesRegularArea"
    );


  const shopArea =
    document.getElementById(
      "expensesShopArea"
    );


  // =================================================
  // รายจ่ายประจำวัน
  // =================================================

  if(tabName === "regular"){

    if(regularTab){

      regularTab.classList.add(
        "active"
      );

    }


    if(shopTab){

      shopTab.classList.remove(
        "active"
      );

    }


    if(regularArea){

      regularArea.style.display =
        "block";

    }


    if(shopArea){

      shopArea.style.display =
        "none";

    }


    return;

  }


  // =================================================
  // รายจ่ายร้าน
  // =================================================

  if(tabName === "shop"){

    if(regularTab){

      regularTab.classList.remove(
        "active"
      );

    }


    if(shopTab){

      shopTab.classList.add(
        "active"
      );

    }


    if(regularArea){

      regularArea.style.display =
        "none";

    }


    if(shopArea){

      shopArea.style.display =
        "block";

    }


    return;

  }

};

// =================================================
// SAVE EXPENSE
// =================================================

POS.saveExpense = async function(){

  const dateEl =
    document.getElementById(
      "posExpenseDate"
    );


  const categoryEl =
    document.getElementById(
      "posExpenseCategory"
    );


  const descriptionEl =
    document.getElementById(
      "posExpenseDescription"
    );


  const amountEl =
    document.getElementById(
      "posExpenseAmount"
    );


  // =================================================
  // DATA
  // =================================================

  const expenseDate =
    dateEl?.value || "";


  const category =
    categoryEl?.value || "";


  const description =
    descriptionEl?.value?.trim() || "";


  const amount =
    Number(
      amountEl?.value || 0
    );


  const expenseType =
    POS.currentExpenseType === "shop"
      ? "shop"
      : "regular";


  // =================================================
  // VALIDATE
  // =================================================

  if(!expenseDate){

    alert(
      "กรุณาเลือกวันที่"
    );

    return;

  }


  if(!category){

    alert(
      "กรุณาเลือกหมวดหมู่"
    );

    return;

  }


  if(
    !Number.isFinite(amount) ||
    amount <= 0
  ){

    alert(
      "กรุณาใส่จำนวนเงิน"
    );

    return;

  }


  // =================================================
  // DISABLE BUTTON
  // =================================================

  const saveBtn =
    document.querySelector(
      ".pos-expense-save"
    );


  if(saveBtn){

    saveBtn.disabled =
      true;

    saveBtn.textContent =
      "กำลังบันทึก...";

  }


  try{

    // =================================================
    // API
    // =================================================

    const result =
      await POS.api.expenseAdd({

        expense_date:
          expenseDate,

        category:
          category,

        description:
          description,

        amount:
          amount,

        expense_type:
          expenseType,

        remark:
          ""

      });


    // =================================================
    // CHECK RESULT
    // =================================================

    if(
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        "บันทึกรายจ่ายไม่สำเร็จ"
      );

    }


    // =================================================
    // CLOSE MODAL
    // =================================================

    const modal =
      document.getElementById(
        "posExpenseModal"
      );


    if(modal){

      modal.style.display =
        "none";

    }


    // =================================================
    // CLEAR FORM
    // =================================================

    if(categoryEl){

      categoryEl.value =
        "";

    }


    if(descriptionEl){

      descriptionEl.value =
        "";

    }


    if(amountEl){

      amountEl.value =
        "";

    }


    // =================================================
    // ⭐ โหลดรายการใหม่ทันที
    // =================================================

    await POS.loadExpenses();


  }catch(error){

    console.error(
      "SAVE EXPENSE ERROR:",
      error
    );


    alert(
      error?.message ||
      "บันทึกรายจ่ายไม่สำเร็จ"
    );


  }finally{

    // =================================================
    // ENABLE BUTTON
    // =================================================

    if(saveBtn){

      saveBtn.disabled =
        false;

      saveBtn.textContent =
        "บันทึกรายจ่าย";

    }

  }

};

// =================================================
// EXPENSES : LOAD LIST
// =================================================

POS.loadExpenses = async function(){

  try{

    // รอให้หน้า รายจ่ายถูกใส่เข้า DOM จริงก่อน
    let ready = false;

    for(let i = 0; i < 30; i++){

      if(
        document.getElementById("expensesRegularArea") ||
        document.getElementById("expensesShopArea")
      ){
        ready = true;
        break;
      }

      await new Promise(resolve =>
        setTimeout(resolve,100)
      );

    }

    if(!ready){
      throw new Error(
        "ไม่พบพื้นที่แสดงรายการรายจ่าย"
      );
    }

    const result =
      await POS.api.expensesList();

    if(
      !result ||
      result.success !== true
    ){
      throw new Error(
        result?.error ||
        "โหลดรายการรายจ่ายไม่สำเร็จ"
      );
    }

    // รองรับ response จาก Edge Function ทุกแบบ
    // แบบตรง:        { expenses:[...] }
    // แบบห่อ data:   { data:{ expenses:[...] } }
    // แบบห่อซ้อน:    { data:{ data:{ expenses:[...] } } }
    // และกรณี data เป็น array โดยตรง
    let expenses = [];

    if(Array.isArray(result?.expenses)){
      expenses = result.expenses;
    }
    else if(Array.isArray(result?.data?.expenses)){
      expenses = result.data.expenses;
    }
    else if(Array.isArray(result?.data?.data?.expenses)){
      expenses = result.data.data.expenses;
    }
    else if(Array.isArray(result?.data)){
      expenses = result.data;
    }
    else if(Array.isArray(result?.data?.data)){
      expenses = result.data.data;
    }

    // ถ้า Backend แจ้งว่ามีรายการ แต่ frontend หา array ไม่เจอ
    // ให้ถือว่า response ผิดรูปแบบ ไม่แสดงเป็น 0 รายการหลอก
    const serverCount =
      Number(
        result?.count ??
        result?.data?.count ??
        result?.data?.data?.count ??
        0
      );

    if(
      serverCount > 0 &&
      expenses.length === 0
    ){
      throw new Error(
        "Backend พบรายการรายจ่าย แต่รูปแบบข้อมูลที่ส่งกลับมาไม่ถูกต้อง"
      );
    }

    POS.expensesList = expenses;

    // render ทั้ง 2 แท็บทันที
    POS.renderExpenses("regular");
    POS.renderExpenses("shop");

    // กลับมาแสดงแท็บที่ผู้ใช้กำลังเลือก
    const currentType =
      POS.currentExpenseType === "shop"
        ? "shop"
        : "regular";

    const regularArea =
      document.getElementById(
        "expensesRegularArea"
      );

    const shopArea =
      document.getElementById(
        "expensesShopArea"
      );

    if(regularArea){
      regularArea.style.display =
        currentType === "regular"
          ? "block"
          : "none";
    }

    if(shopArea){
      shopArea.style.display =
        currentType === "shop"
          ? "block"
          : "none";
    }

  }catch(error){

    console.error(
      "LOAD EXPENSES ERROR:",
      error
    );

    const area =
      currentExpenseArea();

    if(area){
      area.innerHTML = `
        <div
          class="pos-expense-empty"
        >
          โหลดรายการรายจ่ายไม่สำเร็จ
        </div>
      `;
    }

  }
};

// =================================================
// GET CURRENT AREA
// =================================================

function currentExpenseArea(){

  const type =
    POS.currentExpenseType === "shop"
      ? "shop"
      : "regular";


  return document.getElementById(

    type === "shop"
      ? "expensesShopArea"
      : "expensesRegularArea"

  );

}


// =================================================
// RENDER EXPENSES
// =================================================

POS.renderExpenses = function(type){

  const area =
    document.getElementById(

      type === "shop"
        ? "expensesShopArea"
        : "expensesRegularArea"

    );


  if(!area){

    return;

  }


  const expenses =
    POS.expensesList || [];


  // =================================================
  // FILTER
  // =================================================

  const expenseType =
    type === "shop"
      ? "BUSINESS_EXPENSE"
      : "CASH_EXPENSE";


  // =================================================
  // FILTER
  // รองรับข้อมูลเก่าที่อาจใช้ regular / shop
  // หรือยังไม่มี expense_type
  // =================================================

  const list =
    expenses.filter(item => {

      const itemType =
        String(
          item?.expense_type ||
          ""
        )
          .trim()
          .toUpperCase();

      if(type === "shop"){

        return (
          itemType === "BUSINESS_EXPENSE" ||
          itemType === "SHOP" ||
          itemType === "SHOP_EXPENSE"
        );

      }

      // รายจ่ายประจำวัน
      // ถ้าไม่ได้ระบุว่าเป็นรายจ่ายร้าน
      // ให้ถือเป็นรายจ่ายประจำวัน
      // เพื่อรองรับข้อมูลในฐานข้อมูลที่ใช้ชื่อประเภทต่างกัน
      return (
        itemType !== "BUSINESS_EXPENSE" &&
        itemType !== "SHOP" &&
        itemType !== "SHOP_EXPENSE"
      );

    });


  // =================================================
  // TOTAL
  // =================================================

  const total =
    list.reduce(

      (sum,item) =>

        sum +
        Number(
          item.amount || 0
        ),

      0

    );


  // =================================================
  // TITLE
  // =================================================

  const title =
    type === "shop"
      ? "🏪 รายจ่ายร้าน"
      : "💸 รายจ่ายประจำวัน";


  // =================================================
  // RENDER
  // =================================================

  area.innerHTML = `

    <div
      class="pos-expenses-header"
      style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
        margin-bottom:25px;
      "
    >

      <!-- =========================================
           TITLE
      ========================================== -->

      <h2
        class="pos-expenses-title"
        style="
          margin:0;
          font-size:26px;
          font-weight:800;
          color:#1e293b;
          white-space:nowrap;
        "
      >
        ${title}
      </h2>


      <!-- =========================================
           RIGHT AREA
      ========================================== -->

      <div
        style="
          display:flex;
          align-items:center;
          gap:18px;
        "
      >

        <!-- =======================================
             TOTAL CARD
        ======================================== -->

        <div
          style="
            min-width:220px;
            padding:12px 24px;
            border:2px dashed #34d399;
            border-radius:16px;
            background:#ffffff;
            text-align:center;
            box-sizing:border-box;
          "
        >

          <div
            style="
              font-size:15px;
              font-weight:700;
              color:#64748b;
              margin-bottom:2px;
            "
          >
            รวมทั้งหมด
          </div>


          <div
            style="
              font-size:28px;
              line-height:1.1;
              font-weight:900;
              color:#059669;
            "
          >
            ${total.toLocaleString("th-TH")}
            บาท
          </div>


          <div
            style="
              margin-top:3px;
              font-size:15px;
              color:#64748b;
            "
          >
            ${list.length} รายการ
          </div>

        </div>


        <!-- =======================================
             ADD BUTTON
        ======================================== -->

        <button
          type="button"
          class="pos-expenses-add"
          onclick="
            POS.openExpenseModal('${type}')
          "
          style="
            border:none;
            border-radius:14px;
            padding:18px 24px;
            background:#dff7eb;
            color:#009b63;
            font-size:17px;
            font-weight:800;
            cursor:pointer;
            white-space:nowrap;
          "
        >
          ＋ เพิ่มรายจ่าย
        </button>

      </div>

    </div>


    <!-- =========================================
         LIST
    ========================================== -->

    ${
      !list.length

      ?

      `
        <div
          class="pos-expenses-empty"
        >
          ยังไม่มีรายการรายจ่าย
        </div>
      `

      :

      `

        <div
          class="pos-expenses-list"
          style="
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
          "
        >

          ${

            list.map(item => {

              const amount =
                Number(
                  item.amount || 0
                );


              // -----------------------------------------
              // FORMAT DATE
              // -----------------------------------------

              let date = "-";


              if(
                item.expense_date
              ){

                const parts =
                  String(
                    item.expense_date
                  ).split("-");


                if(
                  parts.length === 3
                ){

                  const year =
                    Number(
                      parts[0]
                    ) + 543;


                  date =
                    `${parts[2]}/${parts[1]}/${year}`;

                }

              }


              return `

                <div
                  class="pos-expense-row"
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:24px 12px;
                    border-bottom:1px solid #e5e7eb;
                  "
                >

                  <!-- =================================
                       LEFT
                  ================================== -->

                  <div
                    class="pos-expense-row-left"
                  >

                    <div
                      class="pos-expense-category"
                      style="
                        font-size:20px;
                        font-weight:800;
                        color:#1e293b;
                      "
                    >
                      ${item.category || "-"}
                    </div>


                    <div
                      class="pos-expense-description"
                      style="
                        margin-top:6px;
                        font-size:16px;
                        color:#64748b;
                      "
                    >
                      ${item.description || "-"}
                    </div>


                    <div
                      class="pos-expense-date"
                      style="
                        margin-top:6px;
                        font-size:14px;
                        color:#94a3b8;
                      "
                    >
                      ${date}
                    </div>

                  </div>


                  <!-- =================================
                       RIGHT
                  ================================== -->

                  <div
                    class="pos-expense-row-right"
                    style="
                      text-align:right;
                      margin-left:20px;
                    "
                  >

                    <div
                      class="pos-expense-amount"
                      style="
                        font-size:22px;
                        font-weight:900;
                        color:#b45309;
                        white-space:nowrap;
                      "
                    >
                      ${amount.toLocaleString("th-TH")}
                      บาท
                    </div>


                    <div
                      class="pos-expense-status"
                      style="
                        margin-top:6px;
                        font-size:14px;
                        color:#059669;
                        font-weight:700;
                      "
                    >
                      🟢 จ่ายแล้ว
                    </div>

                  </div>

                </div>

              `;

            }).join("")

          }

        </div>

      `
    }

  `;

};


// =================================================
// EXPENSES TAB SWITCH
// =================================================

POS.expensesSwitchTab = function(tabName){

  const regularTab =
    document.querySelector(
      '.pos-expenses-tab[data-expense-tab="regular"]'
    );


  const shopTab =
    document.querySelector(
      '.pos-expenses-tab[data-expense-tab="shop"]'
    );


  const regularArea =
    document.getElementById(
      "expensesRegularArea"
    );


  const shopArea =
    document.getElementById(
      "expensesShopArea"
    );


  // =================================================
  // REGULAR
  // =================================================

  if(tabName === "regular"){

    POS.currentExpenseType =
      "regular";


    if(regularTab){

      regularTab.classList.add(
        "active"
      );

    }


    if(shopTab){

      shopTab.classList.remove(
        "active"
      );

    }


    if(regularArea){

      regularArea.style.display =
        "block";

    }


    if(shopArea){

      shopArea.style.display =
        "none";

    }


    POS.renderExpenses(
      "regular"
    );

    // ดึงข้อมูลล่าสุดจาก DATABASE ทุกครั้งที่สลับแท็บ
    POS.loadExpenses();


    return;

  }


  // =================================================
  // SHOP
  // =================================================

  if(tabName === "shop"){

    POS.currentExpenseType =
      "shop";


    if(regularTab){

      regularTab.classList.remove(
        "active"
      );

    }


    if(shopTab){

      shopTab.classList.add(
        "active"
      );

    }


    if(regularArea){

      regularArea.style.display =
        "none";

    }


    if(shopArea){

      shopArea.style.display =
        "block";

    }


    POS.renderExpenses(
      "shop"
    );
    // ดึงข้อมูลล่าสุดจาก DATABASE ทุกครั้งที่สลับแท็บ
    POS.loadExpenses();

  }

};


// =================================================
// CSS
// =================================================

const expenseListStyle =
document.createElement("style");


expenseListStyle.textContent = `

  .pos-expenses-list-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:20px;

    padding:
      10px
      8px;

  }


  .pos-expenses-list-title{

    font-size:26px;

    font-weight:800;

    color:#1e293b;

  }


  .pos-expenses-total{

    font-size:24px;

    font-weight:800;

    color:#059669;

  }


  .pos-expenses-list{

    display:flex;

    flex-direction:column;

    gap:0;

  }


  .pos-expense-row{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:
      18px
      10px;

    border-bottom:
      1px solid #e5e7eb;

  }


  .pos-expense-row-left{

    min-width:0;

  }


  .pos-expense-category{

    font-size:20px;

    font-weight:800;

    color:#1e293b;

  }


  .pos-expense-description{

    margin-top:5px;

    font-size:16px;

    color:#64748b;

  }


  .pos-expense-date{

    margin-top:5px;

    font-size:14px;

    color:#94a3b8;

  }


  .pos-expense-row-right{

    text-align:right;

    margin-left:20px;

  }


  .pos-expense-amount{

    font-size:22px;

    font-weight:800;

    color:#b45309;

    white-space:nowrap;

  }


  .pos-expense-status{

    margin-top:5px;

    font-size:14px;

    color:#059669;

    font-weight:700;

  }


  .pos-expense-empty{

    padding:
      40px
      20px;

    text-align:center;

    color:#94a3b8;

    font-size:18px;

  }

`;


if(
  !document.getElementById(
    "posExpensesListStyle"
  )
){

  expenseListStyle.id =
    "posExpensesListStyle";


  document.head.appendChild(
    expenseListStyle
  );

}
