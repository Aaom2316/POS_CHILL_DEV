window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   TABLE ORDERS STORAGE
   ===================================================== */

POS.TABLE_ORDERS_STORAGE_KEY = "POS_CHILL_TABLE_ORDERS";


POS.ordersLoadStorage = function(){

  if(POS.__tableOrdersLoaded){
    return;
  }

  try{

    const saved =
      localStorage.getItem(
        POS.TABLE_ORDERS_STORAGE_KEY
      );

    POS.tableOrders =
      saved
        ? JSON.parse(saved)
        : {};

  }catch(error){

    console.error(
      "LOAD TABLE ORDERS ERROR:",
      error
    );

    POS.tableOrders = {};

  }

  POS.__tableOrdersLoaded = true;

};


/* =====================================================
   โหลดสถานะโต๊ะจาก DATABASE
   DATABASE = SOURCE OF TRUTH
   Local Storage ใช้เป็น cache เท่านั้น
   ===================================================== */

POS.ordersLoadDatabase = async function(force = false){

  if(!force && POS.__ordersDatabaseLoading){
    return POS.__ordersDatabaseLoading;
  }

  POS.__ordersDatabaseLoading = (async function(){

    try{

      const tableOrders = {};
      const tableBillIds = {};

      [1,2,3,4,5,6].forEach(table => {
        tableOrders[table] = [];
      });


      // -----------------------------------------------
      // โหลดเมนู เพื่อแปลง menu_id เป็นข้อมูลที่หน้าเว็บใช้
      // -----------------------------------------------

      let menuMap =
        POS.__ordersMenuMap || null;

      if(!menuMap){

        const menuResult =
          await POS.api.menus();

        const menus =
          Array.isArray(menuResult?.menus)
            ? menuResult.menus
            : [];

        menuMap = {};

        menus.forEach(menu => {
          menuMap[String(menu.id)] = menu;
        });

        POS.__ordersMenuMap = menuMap;
      }


      // -----------------------------------------------
      // โหลด Orders ของโต๊ะ 1-6 จาก Database พร้อมกัน
      // -----------------------------------------------

      const results = [];

      // โหลดทีละ 2 โต๊ะพร้อมกัน
      // เร็วกว่ารอทีละโต๊ะ แต่ไม่ยิง 6 คำขอพร้อมกัน
      // เพื่อไม่เพิ่มภาระ Auth / Edge Function มากเกินไป
      const tablesToLoad = [1,2,3,4,5,6];

      for(
        let i = 0;
        i < tablesToLoad.length;
        i += 2
      ){

        const batch =
          tablesToLoad.slice(
            i,
            i + 2
          );

        const batchResults =
          await Promise.all(
            batch.map(
              async table => {

                const result =
                  await POS.api.call(
                    POS_CONFIG.FUNCTION_NAMES.ORDERS,
                    {
                      method: "POST",
                      body: {
                        action: "LIST",
                        table_no: table
                      }
                    }
                  );

                return {
                  table,
                  result
                };

              }
            )
          );

        results.push(
          ...batchResults
        );

      }


      // -----------------------------------------------
      // แปลงข้อมูล Database ให้เป็นรูปแบบเดิมของหน้า Orders
      // -----------------------------------------------

      results.forEach(({table, result}) => {

        if(!result || result.success !== true){
          throw new Error(
            result?.error ||
            `โหลดข้อมูลโต๊ะ ${table} ไม่สำเร็จ`
          );
        }

        const rows =
          Array.isArray(result.orders)
            ? result.orders
            : [];

        tableOrders[table] =
          rows.map(row => {

            const menu =
              menuMap[String(row.menu_id)] || {};

            return {
              orderId: row.id,
              billId: String(row.remark || "").trim(),
              id: row.menu_id,
              sku: menu.sku || "",
              name: menu.name || "ไม่พบชื่อเมนู",
              price: Number(
                row.unit_price ??
                menu.price ??
                0
              ),
              emoji: menu.emoji || "🍹",
              qty: Number(row.qty || 0)
            };

          });


        // ---------------------------------------------
        // จำเลขบิลจาก Database ไว้ใช้ตอนเพิ่ม/รับเงิน
        // ---------------------------------------------

        const billId =
          tableOrders[table]
            .map(item => String(item.billId || "").trim())
            .find(Boolean);

        if(billId){
          tableBillIds[table] = billId;
        }

      });


      // -----------------------------------------------
      // Database เป็นข้อมูลหลัก
      // -----------------------------------------------

      POS.tableOrders = tableOrders;
      POS.tableBillIds = tableBillIds;


      // Local Storage เป็น cache หลังโหลด Database สำเร็จเท่านั้น
      POS.ordersSaveStorage();

      POS.__ordersDatabaseLoaded = true;

      console.log(
        "ORDERS DATABASE LOADED:",
        POS.tableOrders
      );

      return true;

    }catch(error){

      console.error(
        "LOAD ORDERS DATABASE ERROR:",
        error
      );

      // Database โหลดไม่ได้ -> ใช้ Local cache ต่อชั่วคราว
      // และไม่ล้างข้อมูลเดิม
      return false;

    }finally{

      POS.__ordersDatabaseLoading = null;

    }

  })();

  return POS.__ordersDatabaseLoading;

};


POS.ordersSaveStorage = function(){

  try{

    localStorage.setItem(
      POS.TABLE_ORDERS_STORAGE_KEY,
      JSON.stringify(
        POS.tableOrders || {}
      )
    );

  }catch(error){

    console.error(
      "SAVE TABLE ORDERS ERROR:",
      error
    );

  }

};

/* =====================================================
   คำนวณข้อมูลสถานะโต๊ะ
   ===================================================== */

POS.ordersGetTableInfo = function(table){

  const items =
    POS.tableOrders?.[table] || [];


  const total =
    items.reduce(
      (sum, item) =>
        sum + (Number(item.price) * Number(item.qty)),
      0
    );


  const qty =
    items.reduce(
      (sum, item) =>
        sum + Number(item.qty),
      0
    );


  return {
    hasItems: items.length > 0,
    qty: qty,
    total: total
  };

};

/* =====================================================
   แสดงสถานะโต๊ะ
   ===================================================== */

POS.ordersRenderTables = function(){

  document
    .querySelectorAll(".orders-table-card")
    .forEach(card => {

      const table =
        Number(card.dataset.table);


      const info =
        POS.ordersGetTableInfo(table);


      const status =
        card.querySelector(
          ".orders-table-status"
        );


      const total =
        card.querySelector(
          ".orders-table-total"
        );


      if(!status || !total){
        return;
      }


      if(info.hasItems){

        // -----------------------------
        // มีรายการ
        // -----------------------------

        status.textContent =
          "มีรายการ";

        status.classList.remove(
          "orders-status-empty"
        );

        status.classList.add(
          "orders-status-active"
        );


        total.textContent =
          info.total.toLocaleString("th-TH")
          + " บาท";

        total.style.display =
          "block";


      }else{

        // -----------------------------
        // ว่าง
        // -----------------------------

        status.textContent =
          "ว่าง";

        status.classList.remove(
          "orders-status-active"
        );

        status.classList.add(
          "orders-status-empty"
        );


        total.textContent =
          "";

        total.style.display =
          "none";

      }

    });

};


/* =====================================================
   เปิดรายละเอียดโต๊ะ
   ===================================================== */

POS.ordersOpenTable = async function(table){

  const tableArea =
    document.getElementById("ordersTableArea");

  const detailArea =
    document.getElementById("ordersDetailArea");

  const detailTable =
    document.getElementById("ordersDetailTable");

  if(!tableArea || !detailArea || !detailTable){
    return;
  }

  POS.currentTable = Number(table);

  detailTable.textContent =
    "โต๊ะ " + table;

  tableArea.style.display = "none";

  detailArea.style.display = "block";

  // -----------------------------------------------
  // แสดงข้อมูลทันทีจาก cache / state ปัจจุบัน
  // แล้วค่อย sync Database เบื้องหลัง
  // ไม่ต้องรอ Server ก่อนเปิดโต๊ะ
  // -----------------------------------------------

  POS.ordersRenderCart();

  POS.ordersLoadDatabase(true)
    .then(() => {
      POS.ordersRenderCart();
      POS.ordersRenderTables();
    })
    .catch(error => {
      console.warn(
        "BACKGROUND ORDERS SYNC ERROR:",
        error
      );
    });

  POS.ordersRenderTables();

};


/* =====================================================
   กลับหน้ารวมโต๊ะ
   ===================================================== */

POS.ordersBackToTables = function(){

  const tableArea =
    document.getElementById("ordersTableArea");

  const detailArea =
    document.getElementById("ordersDetailArea");

  const menuArea =
    document.getElementById("ordersMenuArea");

  if(menuArea){
    menuArea.style.display = "none";
  }

  if(detailArea){
    detailArea.style.display = "none";
  }

  if(tableArea){
    tableArea.style.display = "block";
  }

  POS.currentTable = null;

  // รีเฟรชสถานะและยอดรวมของโต๊ะ
  POS.ordersRenderTables();

};


/* =====================================================
   เปิดหน้าเลือกเมนู
   ===================================================== */

POS.ordersOpenMenu = async function(){

  const detailArea =
    document.getElementById("ordersDetailArea");

  const menuArea =
    document.getElementById("ordersMenuArea");

  const menuContent =
    document.getElementById("ordersMenuContent");

  const menuTable =
    document.getElementById("ordersMenuTable");

  if(
    !detailArea ||
    !menuArea ||
    !menuContent
  ){
    return;
  }

  if(menuTable){

    menuTable.textContent =
      "โต๊ะ " + POS.currentTable;

  }

  detailArea.style.display = "none";

  menuArea.style.display = "block";


  menuContent.innerHTML = `

    <div class="orders-menu-loading">
      กำลังโหลดเมนู...
    </div>

  `;


  try{

    const result =
      await POS.api.menus();

    const menus =
      Array.isArray(result?.menus)
        ? result.menus
        : [];


    if(!menus.length){

      menuContent.innerHTML = `

        <div class="orders-menu-empty">
          ไม่มีเมนูที่เปิดขาย
        </div>

      `;

      return;
    }


    const groups = {};


    menus.forEach(menu => {

      const category =
        menu.category || "อื่นๆ";

      if(!groups[category]){
        groups[category] = [];
      }

      groups[category].push(menu);

    });


    let html = "";


    Object.keys(groups).forEach(category => {

      html += `

        <section class="orders-menu-category">

          <h2 class="orders-menu-category-title">
            ${category}
          </h2>

          <div class="orders-menu-grid">

      `;


      groups[category].forEach(menu => {

        const price =
          Number(menu.price || 0);


        html += `

          <button
            type="button"
            class="orders-menu-card"
            onclick="POS.ordersSelectMenu('${menu.id}')"
          >

            <div class="orders-menu-emoji">
              ${menu.emoji || "🍹"}
            </div>

            <div class="orders-menu-name">
              ${menu.name || ""}
            </div>

            <div class="orders-menu-price">
              ${price.toLocaleString("th-TH")}
              บาท
            </div>

          </button>

        `;

      });


      html += `

          </div>

        </section>

      `;

    });


    menuContent.innerHTML =
      html;


    POS.ordersMenus =
      menus;


  }catch(error){

    console.error(error);


    menuContent.innerHTML = `

      <div class="orders-menu-error">
        เกิดข้อผิดพลาด:
        ${error.message}
      </div>

    `;

  }

};


/* =====================================================
   เลือกเมนู
   ===================================================== */

POS.ordersSelectMenu = function(menuId){

  const menus =
    Array.isArray(POS.ordersMenus)
      ? POS.ordersMenus
      : [];


  const menu =
    menus.find(item =>
      String(item.id) === String(menuId)
    );


  if(!menu){
    return;
  }


  POS.selectedOrderMenu = menu;


  POS.ordersShowQuantity();


};


/* =====================================================
   แสดงตัวเลือกจำนวน
   ===================================================== */

POS.ordersShowQuantity = function(){

  const menu =
    POS.selectedOrderMenu;


  if(!menu){
    return;
  }


  const modal =
    document.getElementById(
      "ordersQuantityModal"
    );


  const emoji =
    document.getElementById(
      "ordersQuantityEmoji"
    );

  const name =
    document.getElementById(
      "ordersQuantityName"
    );

  const price =
    document.getElementById(
      "ordersQuantityPrice"
    );

  const quantity =
    document.getElementById(
      "ordersQuantityValue"
    );


  if(!modal){
    return;
  }


  emoji.textContent =
    menu.emoji || "🍹";


  name.textContent =
    menu.name || "";


  price.textContent =
    Number(menu.price || 0)
      .toLocaleString("th-TH")
      + " บาท";


  quantity.textContent =
    "1";


  POS.ordersQuantity =
    1;


  modal.style.display =
    "flex";

};


/* =====================================================
   ลดจำนวน
   ===================================================== */

POS.ordersQuantityMinus = function(){

  if(!POS.ordersQuantity){
    POS.ordersQuantity = 1;
  }


  if(POS.ordersQuantity <= 1){
    return;
  }


  POS.ordersQuantity--;


  const el =
    document.getElementById(
      "ordersQuantityValue"
    );


  if(el){
    el.textContent =
      POS.ordersQuantity;
  }

};


/* =====================================================
   เพิ่มจำนวน
   ===================================================== */

POS.ordersQuantityPlus = function(){

  if(!POS.ordersQuantity){
    POS.ordersQuantity = 1;
  }


  POS.ordersQuantity++;


  const el =
    document.getElementById(
      "ordersQuantityValue"
    );


  if(el){
    el.textContent =
      POS.ordersQuantity;
  }

};


/* =====================================================
   ยกเลิกเลือกจำนวน
   ===================================================== */

POS.ordersQuantityCancel = function(){

  const modal =
    document.getElementById(
      "ordersQuantityModal"
    );


  if(modal){
    modal.style.display =
      "none";
  }


  POS.selectedOrderMenu =
    null;

  POS.ordersQuantity =
    1;

};


/* =====================================================
   ยืนยันเพิ่มเมนูเข้าโต๊ะ
   บันทึก Orders Database ก่อน
   ===================================================== */

POS.ordersQuantityConfirm = async function(){

  const menu =
    POS.selectedOrderMenu;


  const quantity =
    Number(
      POS.ordersQuantity || 1
    );


  if(
    !menu ||
    quantity <= 0
  ){

    return;

  }


  const table =
    Number(
      POS.currentTable
    );


    // =================================================
// BILL ID ของโต๊ะ
// ใช้ BUSINESS_DATE จาก SYSTEM
// ไม่ใช้วันที่เครื่อง
// =================================================

if(!POS.tableBillIds){

  POS.tableBillIds = {};

}


if(!POS.tableBillIds[table]){

  const systemData =
    await POS.api.systemSettings();

  const settings =
    Array.isArray(
      systemData?.settings
    )
      ? systemData.settings
      : [];

  const businessDateSetting =
    settings.find(
      item =>
        String(
          item?.key || ""
        )
        .trim()
        .toUpperCase()
        ===
        "BUSINESS_DATE"
    );

  const businessDate =
    businessDateSetting?.value
      ? String(
          businessDateSetting.value
        ).substring(0,10)
      : (
          systemData?.business_date ||
          systemData?.businessDate ||
          ""
        );

  if(
    !/^\d{4}-\d{2}-\d{2}$/.test(
      businessDate
    )
  ){

    throw new Error(
      "ไม่พบวันทำการ BUSINESS_DATE"
    );

  }

  const date =
    businessDate.replace(
      /\D/g,
      ""
    );

  const now =
    new Date();

  const time =
    String(
      now.getHours()
    ).padStart(2,"0") +

    String(
      now.getMinutes()
    ).padStart(2,"0") +

    String(
      now.getSeconds()
    ).padStart(2,"0");

  const random =
    Math.floor(
      Math.random() * 1000
    )
    .toString()
    .padStart(3,"0");

  POS.tableBillIds[table] =
    "B" +
    date +
    time +
    random;

}


const billId =
  POS.tableBillIds[table];


  if(!table){

    alert(
      "ไม่พบโต๊ะปัจจุบัน"
    );

    return;

  }


  // =================================================
  // ป้องกันกดซ้ำ
  // =================================================

  if(
    POS.__ordersAdding
  ){

    return;

  }


  POS.__ordersAdding =
    true;


  try{

    // =================================================
    // บันทึกเข้า Orders Database
    // Backend จะกำหนด business_date จาก SYSTEM
    // =================================================

    const result =
  await POS.api.orderAdd({

    table_no:
      table,

    menu_id:
      menu.id,

    qty:
      quantity,

    bill_id:
      billId

  });


    // =================================================
    // ตรวจผล Backend
    // =================================================

    if(
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        "เพิ่มรายการไม่สำเร็จ"
      );

    }


    // =================================================
    // Backend สำเร็จ
    // ค่อยอัปเดตหน้าเว็บ
    // =================================================

    if(!POS.tableOrders){

      POS.tableOrders =
        {};

    }


    if(
      !POS.tableOrders[table]
    ){

      POS.tableOrders[table] =
        [];

    }


    const items =
      POS.tableOrders[table];


    const existing =
      items.find(
        item =>
          String(item.id) ===
          String(menu.id)
      );


    if(existing){

      existing.qty +=
        quantity;

    }else{

      items.push({

        orderId:
          result.order.id,

        billId:
          billId,

        id:
          menu.id,

        sku:
          menu.sku,

        name:
          menu.name,

        price:
          Number(
            menu.price || 0
          ),

        emoji:
          menu.emoji ||
          "🍹",

        qty:
          quantity

      });

    }


    // =================================================
    // เก็บ Local Storage
    // เพื่อให้หน้าเว็บไม่หายทันที
    // =================================================

    POS.tableOrders[table] =
      items;


    POS.ordersSaveStorage();


    // =================================================
    // ปิดจำนวน
    // =================================================

    POS.ordersQuantityCancel();


    // =================================================
    // กลับหน้ารายการโต๊ะ
    // =================================================

    POS.ordersBackFromMenu();


    // =================================================
    // แสดงรายการบนหน้าเว็บ
    // =================================================

    POS.ordersRenderCart();

    POS.ordersRenderTables();


    console.log(
      "ORDER ADD SUCCESS:",
      result
    );


  }catch(error){

    console.error(
      "ORDER ADD ERROR:",
      error
    );


    alert(
      "เพิ่มรายการไม่สำเร็จ\n\n" +
      (
        error?.message ||
        "กรุณาลองใหม่อีกครั้ง"
      )
    );


  }finally{

    POS.__ordersAdding =
      false;

  }

};


/* =====================================================
   แสดงรายการในโต๊ะ
   ===================================================== */

POS.ordersRenderCart = function(){

  const area =
    document.getElementById(
      "ordersCartArea"
    );


  const totalEl =
    document.getElementById(
      "ordersTotalValue"
    );


  const countEl =
    document.getElementById(
      "ordersItemCount"
    );


  if(!area){
    return;
  }


  const table =
    Number(POS.currentTable);


  const items =
    POS.tableOrders?.[table] || [];


  if(countEl){

    const count =
      items.reduce(
        (sum,item) =>
          sum + item.qty,
        0
      );

    countEl.textContent =
      count + " รายการ";

  }


  if(!items.length){

    area.innerHTML = `

      <div class="orders-empty">
        ยังไม่มีรายการ
      </div>

    `;


    if(totalEl){
      totalEl.textContent =
        "0 บาท";
    }


    return;
  }


  let total = 0;


  area.innerHTML =
    items.map(item => {

      const lineTotal =
        item.price * item.qty;


      total +=
        lineTotal;


      return `

        <div
          class="orders-cart-row"
          data-order-menu-id="${item.id}"
        >

          <div class="orders-cart-main">

            <div class="orders-cart-name">

              ${item.emoji}
              ${item.name}

            </div>

            <div class="orders-cart-price">

              ${item.price.toLocaleString("th-TH")}
              บาท / หน่วย

            </div>

          </div>


          <div class="orders-cart-qty-control">

            <button
              type="button"
              class="orders-cart-qty-btn"
              onclick="POS.ordersChangeQty('${item.id}', -1)"
            >
              −
            </button>


            <strong class="orders-cart-qty">

              ${item.qty}

            </strong>


            <button
              type="button"
              class="orders-cart-qty-btn"
              onclick="POS.ordersChangeQty('${item.id}', 1)"
            >
              +
            </button>

          </div>


          <div class="orders-cart-total">

            ${lineTotal.toLocaleString("th-TH")}
            บาท

          </div>


          <button
            type="button"
            class="orders-cart-delete"
            onclick="POS.ordersDeleteItem('${item.id}')"
          >
            🗑️
          </button>

        </div>

      `;

    }).join("");


  if(totalEl){

    totalEl.textContent =
      total.toLocaleString("th-TH")
      + " บาท";

  }

};

/* =====================================================
   เปลี่ยนจำนวนสินค้าในโต๊ะ
   ===================================================== */

POS.ordersChangeQty = function(
  menuId,
  change
){

  const table =
    Number(POS.currentTable);

  const items =
    POS.tableOrders?.[table] || [];

  const item =
    items.find(item =>
      String(item.id) ===
      String(menuId)
    );

  if(!item){
    return;
  }

  if(!item.orderId){

    alert(
      "ไม่พบ Order ID ของรายการนี้"
    );

    return;
  }

  const currentQty =
    Number(item.qty || 0);

  const newQty =
    currentQty +
    Number(change);

  if(newQty < 1){
    return;
  }

  // =================================================
  // UI เปลี่ยนทันที ไม่ต้องรอ Server
  // =================================================

  item.qty =
    newQty;

  POS.tableOrders[table] =
    items;

  POS.ordersSaveStorage();

  POS.ordersRenderCart();

  POS.ordersRenderTables();


  // =================================================
  // ส่ง Database แบบ Queue
  // รองรับการกด + / - รัว ๆ
  // =================================================

  if(!item.__qtyQueue){
    item.__qtyQueue =
      Promise.resolve();
  }

  item.__qtyQueue =
    item.__qtyQueue
      .then(
        async () => {

          const result =
            await POS.api.orderUpdateQty(
              item.orderId,
              Number(item.qty)
            );

          if(
            !result ||
            result.success !== true
          ){

            throw new Error(
              result?.error ||
              "แก้จำนวนไม่สำเร็จ"
            );

          }

          item.qty =
            Number(
              result.order?.qty ??
              item.qty
            );

          item.price =
            Number(
              result.order?.unit_price ??
              item.price ??
              0
            );

          POS.tableOrders[table] =
            items;

          POS.ordersSaveStorage();

          POS.ordersRenderCart();

          POS.ordersRenderTables();

        }
      )
      .catch(
        async error => {

          console.error(
            "ORDER QTY UPDATE ERROR:",
            error
          );

          try{

            POS.__ordersDatabaseLoading =
              null;

            await POS.ordersLoadDatabase();

            POS.ordersRenderCart();

            POS.ordersRenderTables();

          }catch(reloadError){

            console.error(
              "ORDER QTY ROLLBACK ERROR:",
              reloadError
            );

          }

          alert(
            "แก้จำนวนไม่สำเร็จ\n\n" +
            (
              error?.message ||
              "กรุณาลองใหม่อีกครั้ง"
            )
          );

        }
      );

};

/* =====================================================
   ลบสินค้าออกจากโต๊ะ
   ===================================================== */

POS.ordersDeleteItem = async function(menuId){

  const table =
    Number(POS.currentTable);

  const items =
    POS.tableOrders?.[table] || [];

  const index =
    items.findIndex(item =>
      String(item.id) === String(menuId)
    );

  if(index === -1){
    return;
  }

  const item = items[index];

  if(!item.orderId){
    alert("ไม่พบ Order ID ของรายการนี้");
    return;
  }

  if(item.__deleting){
    return;
  }

  item.__deleting = true;

  // ลบจากหน้าจอก่อน เพื่อให้กดแล้วหายทันที
  items.splice(index, 1);
  POS.tableOrders[table] = items;
  POS.ordersSaveStorage();
  POS.ordersRenderCart();
  POS.ordersRenderTables();

  try{

    const result =
      await POS.api.call(
        POS_CONFIG.FUNCTION_NAMES.ORDERS,
        {
          method: "POST",
          body: {
            action: "DELETE",
            order_id: item.orderId
          }
        }
      );

    if(!result || result.success !== true){
      throw new Error(
        result?.error ||
        "ลบรายการไม่สำเร็จ"
      );
    }

    // ถ้าโต๊ะว่างแล้ว ให้บิลเก่าหมดอายุ
    if(
      !POS.tableOrders[table]?.length &&
      POS.tableBillIds
    ){
      delete POS.tableBillIds[table];
    }

    POS.ordersSaveStorage();
    POS.ordersRenderCart();
    POS.ordersRenderTables();

    console.log(
      "ORDER DELETE SUCCESS:",
      result
    );

  }catch(error){

    console.error(
      "ORDER DELETE ERROR:",
      error
    );

    // ถ้าฐานข้อมูลลบไม่สำเร็จ ให้โหลดข้อมูลจริงกลับมา
    try{
      POS.__ordersDatabaseLoading = null;
      await POS.ordersLoadDatabase(true);
      POS.ordersRenderCart();
      POS.ordersRenderTables();
    }catch(loadError){
      console.error(
        "ORDER DELETE RESTORE ERROR:",
        loadError
      );
    }

    alert(
      "ลบรายการไม่สำเร็จ\n\n" +
      (
        error?.message ||
        "กรุณาลองใหม่อีกครั้ง"
      )
    );

  }finally{
    item.__deleting = false;
  }

};

/* =====================================================
   STEP : รับชำระโต๊ะ
   เปิด Modal ยืนยันยอดเท่านั้น
   ยังไม่บันทึก / ยังไม่ล้างรายการ
   ===================================================== */

POS.ordersPayment = function(){

  const table =
    Number(POS.currentTable);

  if(!table){
    return;
  }


  const items =
    POS.tableOrders?.[table] || [];


  if(!items.length){

    alert(
      "โต๊ะนี้ยังไม่มีรายการ"
    );

    return;

  }


  // =================================================
  // ยอดรวม
  // =================================================

  const total =
    items.reduce(
      (sum, item) =>
        sum +
        (
          Number(item.price || 0) *
          Number(item.qty || 0)
        ),
      0
    );


  // =================================================
  // จำนวนรายการ
  // =================================================

  const itemCount =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.qty || 0),
      0
    );


  // =================================================
  // ลบ Modal เดิม
  // =================================================

  const oldModal =
    document.getElementById(
      "ordersPaymentModal"
    );

  if(oldModal){
    oldModal.remove();
  }


  // =================================================
  // สร้างรายการเมนู
  // =================================================

  const itemsHtml =
    items.map(item => {

      const qty =
        Number(item.qty || 0);

      const price =
        Number(item.price || 0);

      const itemTotal =
        qty * price;


      return `

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:15px;
            padding:12px 0;
            border-bottom:1px solid #e5e7eb;
            text-align:left;
          "
        >

          <div
            style="
              flex:1;
              min-width:0;
            "
          >

            <div
              style="
                font-size:17px;
                font-weight:800;
                color:#111827;
              "
            >
              ${item.emoji || "🍹"}
              ${item.name || ""}
            </div>


            <div
              style="
                margin-top:4px;
                color:#64748b;
                font-size:15px;
                font-weight:600;
              "
            >
              ${qty} × ${price.toLocaleString("th-TH")} บาท
            </div>

          </div>


          <div
            style="
              white-space:nowrap;
              font-size:17px;
              font-weight:900;
              color:#111827;
            "
          >
            ${itemTotal.toLocaleString("th-TH")}
            บาท
          </div>

        </div>

      `;

    }).join("");


  // =================================================
  // สร้าง Modal
  // =================================================

  const modal =
    document.createElement("div");

  modal.id =
    "ordersPaymentModal";


  modal.innerHTML = `

    <div
      style="
        position:fixed;
        inset:0;
        background:#00000055;
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:10000;
        padding:20px;
      "
    >

      <div
        style="
          width:100%;
          max-width:520px;
          max-height:90vh;
          overflow-y:auto;
          background:#fff;
          border-radius:20px;
          padding:30px;
          box-sizing:border-box;
          text-align:center;
          box-shadow:0 10px 35px #00000025;
        "
      >

        <!-- ไอคอน -->

        <div
          style="
            font-size:48px;
            margin-bottom:10px;
          "
        >
          💵
        </div>


        <!-- หัวข้อ -->

        <div
          style="
            font-size:24px;
            font-weight:900;
            color:#111827;
          "
        >
          รับชำระ
        </div>


        <!-- โต๊ะ -->

        <div
          style="
            margin-top:8px;
            color:#6b7280;
            font-size:16px;
            font-weight:700;
          "
        >
          โต๊ะ ${table}
        </div>


        <!-- จำนวนรายการ -->

        <div
          style="
            margin-top:22px;
            padding:16px;
            border-radius:14px;
            background:#f9fafb;
            color:#374151;
            font-size:18px;
            font-weight:800;
          "
        >
          ${itemCount} รายการ
        </div>


        <!-- รายการเมนู -->

        <div
          style="
            margin-top:18px;
            text-align:left;
          "
        >

          <div
            style="
              font-size:17px;
              font-weight:900;
              color:#374151;
              margin-bottom:4px;
            "
          >
            รายการ
          </div>


          ${itemsHtml}

        </div>


        <!-- ยอดรวม -->

        <div
          style="
            margin-top:18px;
            padding:20px;
            border-radius:16px;
            background:#f0fdf4;
            border:1px solid #d1fae5;
          "
        >

          <div
            style="
              color:#6b7280;
              font-size:14px;
              font-weight:700;
            "
          >
            ยอดที่ต้องชำระ
          </div>


          <div
            style="
              margin-top:5px;
              color:#008f68;
              font-size:32px;
              font-weight:900;
            "
          >
            ${total.toLocaleString("th-TH")}
            บาท
          </div>

        </div>


        <!-- ปุ่มเดิม -->

        <div
          style="
            display:flex;
            gap:10px;
            margin-top:25px;
          "
        >

          <button
            type="button"
            onclick="POS.ordersPaymentCancel()"
            style="
              flex:1;
              border:0;
              border-radius:12px;
              padding:14px;
              background:#f3f4f6;
              color:#374151;
              font-family:inherit;
              font-size:17px;
              font-weight:800;
              cursor:pointer;
            "
          >
            ยกเลิก
          </button>


          <button
            type="button"
            onclick="POS.ordersPaymentConfirm()"
            style="
              flex:1;
              border:0;
              border-radius:12px;
              padding:14px;
              background:#4ade80;
              color:#14532d;
              font-family:inherit;
              font-size:17px;
              font-weight:900;
              cursor:pointer;
            "
          >
            ยืนยันรับชำระ
          </button>

        </div>

      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );

};


/* =====================================================
   ยกเลิก Modal รับชำระ
   ===================================================== */

POS.ordersPaymentCancel = function(){

  const modal =
    document.getElementById(
      "ordersPaymentModal"
    );


  if(modal){
    modal.remove();
  }

};


/* =====================================================
   ยืนยันรับชำระโต๊ะ
   STEP : บันทึก PAID ลง Orders Database
   ===================================================== */

POS.ordersPaymentConfirm =
  async function(){

    const table =
      Number(
        POS.currentTable
      );


    if(!table){
      return;
    }


    // ================================================
    // รายการในโต๊ะ
    // ================================================

    const items =
      POS.tableOrders?.[table] || [];


    if(!items.length){

      POS.ordersPaymentCancel();

      return;

    }


    // ================================================
    // BILL ID
    // ================================================

    let billId =
      POS.tableBillIds?.[table];


    // ------------------------------------------------
    // ถ้าไม่มี BILL ID ใน Local Storage
    // ให้หา BILL ID จาก Order จริงใน Database
    // เพื่อรองรับบิลเก่าที่ข้ามวันมารับชำระ
    // ------------------------------------------------

    if(!billId){

      const orderId =
        items?.[0]?.orderId;


      if(orderId){

        const billResult =
          await POS.supabase
            .from("orders")
            .select("remark,payment_status")
            .eq(
              "id",
              orderId
            )
            .maybeSingle();


        if(
          !billResult.error &&
          billResult.data?.payment_status === "UNPAID"
        ){

          billId =
            String(
              billResult.data.remark || ""
            ).trim();

        }

      }

    }


    if(!billId){

      alert(
        "ไม่พบเลขบิลของโต๊ะนี้"
      );

      return;

    }


    // ================================================
    // ป้องกันกดซ้ำ
    // ================================================

    if(
      POS.__ordersPaying
    ){

      return;

    }


    POS.__ordersPaying =
      true;


    // ================================================
    // หา Modal
    // ================================================

    const modal =
      document.getElementById(
        "ordersPaymentModal"
      );


    try{

      // ============================================
      // ปิดปุ่มชั่วคราว
      // ============================================

      const confirmButton =
        modal?.querySelector(
          'button[onclick="POS.ordersPaymentConfirm()"]'
        );


      if(confirmButton){

        confirmButton.disabled =
          true;

        confirmButton.textContent =
          "กำลังบันทึก...";

      }


      // ============================================
      // ส่งไป Backend
      // ============================================

      const result =
        await POS.api.orderPay(
          table,
          billId
        );


      // ============================================
      // ตรวจผล
      // ============================================

      if(
        !result ||
        result.success !== true
      ){

        throw new Error(
          result?.error ||
          "รับชำระไม่สำเร็จ"
        );

      }


      console.log(
        "ORDER PAYMENT SUCCESS:",
        result
      );


      // ============================================
      // Backend สำเร็จแล้ว
      // ค่อยล้าง Local
      // ============================================

      POS.tableOrders[table] =
        [];


      // ============================================
      // บิลเก่าใช้จบแล้ว
      // ครั้งหน้าจะสร้างเลขบิลใหม่
      // ============================================

      if(
        POS.tableBillIds
      ){

        delete POS.tableBillIds[
          table
        ];

      }


      // ============================================
      // บันทึก Local Storage
      // ============================================

      POS.ordersSaveStorage();


      // ============================================
      // ปิด Modal
      // ============================================

      if(modal){

        modal.remove();

      }


      // ============================================
      // กลับหน้ารายการโต๊ะ
      // ============================================

      const tableArea =
        document.getElementById(
          "ordersTableArea"
        );

      const detailArea =
        document.getElementById(
          "ordersDetailArea"
        );

      const menuArea =
        document.getElementById(
          "ordersMenuArea"
        );


      if(menuArea){

        menuArea.style.display =
          "none";

      }


      if(detailArea){

        detailArea.style.display =
          "none";

      }


      if(tableArea){

        tableArea.style.display =
          "block";

      }


      // ============================================
      // ล้างโต๊ะปัจจุบัน
      // ============================================

      POS.currentTable =
        null;


      // ============================================
      // รีเฟรชโต๊ะ
      // ============================================

      POS.ordersRenderTables();


    }catch(error){

      console.error(
        "ORDER PAYMENT ERROR:",
        error
      );


      alert(
        "รับชำระไม่สำเร็จ\n\n" +
        (
          error?.message ||
          "กรุณาลองใหม่อีกครั้ง"
        )
      );


      // ============================================
      // ถ้าไม่สำเร็จ
      // ห้ามล้างรายการ
      // ============================================

      if(modal){

        const confirmButton =
          modal.querySelector(
            'button[onclick="POS.ordersPaymentConfirm()"]'
          );


        if(confirmButton){

          confirmButton.disabled =
            false;

          confirmButton.textContent =
            "ยืนยันรับชำระ";

        }

      }


    }finally{

      POS.__ordersPaying =
        false;

    }

  };


/* =====================================================
   กลับจากหน้าเลือกเมนู
   ===================================================== */

POS.ordersBackFromMenu = function(){

  const detailArea =
    document.getElementById(
      "ordersDetailArea"
    );

  const menuArea =
    document.getElementById(
      "ordersMenuArea"
    );


  if(menuArea){

    menuArea.style.display =
      "none";

  }


  if(detailArea){

    detailArea.style.display =
      "block";

  }


  POS.ordersRenderCart();

  // รีเฟรชยอดและสถานะการ์ดโต๊ะ
  POS.ordersRenderTables();

};


/* =====================================================
   PAGE : ORDERS
   ===================================================== */

POS.pages.orders = function(){

  // Local Storage ใช้เป็น cache เท่านั้น
  // แสดงหน้าโต๊ะทันที ไม่รอ Database
  POS.ordersLoadStorage();

  // Sync Database เบื้องหลัง
  // เมื่อเสร็จแล้วค่อยอัปเดตการ์ดโต๊ะ
  POS.ordersLoadDatabase(true)
    .then(() => {
      POS.ordersRenderTables();
    })
    .catch(error => {
      console.warn(
        "BACKGROUND ORDERS PAGE SYNC ERROR:",
        error
      );
    });

  return `

    <h1 class="page-title">
      โต๊ะ / Orders
    </h1>

    <p class="page-subtitle">
      จัดการโต๊ะและรายการสั่งซื้อ
    </p>


    <!-- =================================================
         TABLE AREA
         ================================================= -->

    <div
      id="ordersTableArea"
      class="panel"
    >

      <!-- =================================================
       ORDERS TABS
       ================================================= -->

  <div class="orders-tabs">

    <button
      type="button"
      class="pos-tab active"
      data-orders-tab="tables"
    >
      🪑 โต๊ะ
    </button>

    <button
      type="button"
      class="pos-tab"
      data-orders-tab="paid"
    >
      🧾 รายการบิลขายแล้ว
    </button>

  </div>


  <div
  id="ordersPaidArea"
  class="panel"
  style="display:none;"
>

  <div class="pos-pending-header">

    <h2 class="pos-pending-title">
      🧾 รายการบิลขายแล้ว
    </h2>

    <div
      id="ordersPaidCount"
      class="pos-pending-count"
    >
      0 บิล
    </div>

  </div>


  <div id="ordersPaidBills">

    <div class="pos-cart-empty">
      ยังไม่มีรายการบิลขายแล้ว
    </div>

  </div>

</div>


      <h2 class="orders-title">
        โต๊ะ
      </h2>


      <div class="orders-table-grid">

        ${[1,2,3,4,5,6].map(table => {

          const items =
            POS.tableOrders?.[table] || [];

          const hasItems =
            items.length > 0;

          const total =
            items.reduce(
              (sum, item) =>
                sum +
                (
                  Number(item.price || 0) *
                  Number(item.qty || 0)
                ),
              0
            );

          return `

            <button
              type="button"
              class="orders-table-card"
              data-table="${table}"
              onclick="POS.ordersOpenTable(${table})"
            >

              <div class="orders-table-icon">
                🪑
              </div>

              <div class="orders-table-name">
                โต๊ะ ${table}
              </div>

              ${
                hasItems

                ? `

                  <div
                    class="orders-table-status orders-status-active"
                  >
                    มีรายการ
                  </div>

                  <div
                    class="orders-table-total"
                    style="display:block;"
                  >
                    ${total.toLocaleString("th-TH")} บาท
                  </div>

                `

                : `

                  <div
                    class="orders-table-status orders-status-empty"
                  >
                    ว่าง
                  </div>

                  <div
                    class="orders-table-total"
                    style="display:none;"
                  >
                  </div>

                `
              }

            </button>

          `;

        }).join("")}

      </div>

    </div>


    <!-- =================================================
         DETAIL AREA
         ================================================= -->

    <div
      id="ordersDetailArea"
      class="panel orders-detail-panel"
      style="display:none;"
    >

      <div class="orders-detail-header">

        <button
          type="button"
          class="orders-back-btn"
          onclick="POS.ordersBackToTables()"
        >
          ← กลับ
        </button>


        <div
          id="ordersDetailTable"
          class="orders-detail-table"
        >
          โต๊ะ
        </div>

        <div
          id="ordersItemCount"
          class="orders-item-count"
        >
          0 รายการ
        </div>

      </div>


      <div class="orders-detail-content">

        <h2>
          รายการในโต๊ะ
        </h2>


        <div
          id="ordersCartArea"
        >

          <div class="orders-empty">
            ยังไม่มีรายการ
          </div>

        </div>


        <div class="orders-detail-footer"> 
 
            <div class="orders-total-box"> 
          
              <div class="orders-total-label"> 
                ยอดรวมทั้งหมด 
              </div> 
          
              <div class="orders-total-value"> 
                <strong id="ordersTotalValue"> 
                  0 
                </strong> 
                <span>บาท</span> 
              </div> 
          
            </div> 
          
          
            <div class="orders-detail-actions"> 
          
              <button 
                type="button" 
                class="orders-add-menu-btn" 
                onclick="POS.ordersOpenMenu()" 
              > 
                <span class="orders-btn-icon">＋</span> 
                <span>เพิ่มเมนู</span> 
              </button> 
          
          
              <button 
                type="button" 
                class="orders-payment-btn" 
                onclick="POS.ordersPayment()" 
              > 
                <span class="orders-btn-icon">💵</span> 
                <span>รับชำระ</span> 
              </button> 
          
            </div> 
          
          </div>

        </div>

    </div>


    <!-- =================================================
         MENU AREA
         ================================================= -->

    <div
      id="ordersMenuArea"
      class="panel orders-menu-panel"
      style="display:none;"
    >


      <div class="orders-menu-header">

        <button
          type="button"
          class="orders-back-btn"
          onclick="POS.ordersBackFromMenu()"
        >
          ← กลับ
        </button>


        <div
          id="ordersMenuTable"
          class="orders-detail-table"
        >
          โต๊ะ
        </div>

      </div>


      <div
        id="ordersMenuContent"
        class="orders-menu-content"
      >

        <div class="orders-menu-loading">
          กำลังโหลดเมนู...
        </div>

      </div>


    </div>


    <!-- =================================================
         QUANTITY MODAL
         ================================================= -->

    <div
      id="ordersQuantityModal"
      class="orders-quantity-modal"
      style="display:none;"
    >


      <div class="orders-quantity-box">


        <button
          type="button"
          class="orders-quantity-close"
          onclick="POS.ordersQuantityCancel()"
        >
          ×
        </button>


        <div
          id="ordersQuantityEmoji"
          class="orders-quantity-emoji"
        >
          🍹
        </div>


        <div
          id="ordersQuantityName"
          class="orders-quantity-name"
        >
          เมนู
        </div>


        <div
          id="ordersQuantityPrice"
          class="orders-quantity-price"
        >
          0 บาท
        </div>


        <div class="orders-quantity-control">


          <button
            type="button"
            onclick="POS.ordersQuantityMinus()"
          >
            −
          </button>


          <strong
            id="ordersQuantityValue"
          >
            1
          </strong>


          <button
            type="button"
            onclick="POS.ordersQuantityPlus()"
          >
            +
          </button>


        </div>


        <button
          type="button"
          class="orders-quantity-confirm"
          onclick="POS.ordersQuantityConfirm()"
        >
          เพิ่มรายการ
        </button>


      </div>

    </div>


    <style>

    /* =====================================================
   ORDERS TABS
   รูปแบบเดียวกับแท็บหน้า POS
   ===================================================== */

.orders-tabs,
.pos-tabs {
    display: flex;
    align-items: center;
    gap: 0;
    width: 100%;
    padding: 8px;
    margin-bottom: 24px;

    background: #ffffff;
    border-radius: 18px;

    box-shadow:
        0 4px 14px rgba(0,0,0,0.06);

    box-sizing: border-box;
}


/* =====================================================
   TAB BUTTON
   ===================================================== */

.orders-tabs .pos-tab,
.pos-tabs .pos-tab {

    flex: 1;

    height: 62px;

    border: none;
    border-radius: 14px;

    background: transparent;

    color: #667085;

    font-size: 20px;
    font-weight: 600;

    cursor: pointer;

    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.1s ease;
}


/* =====================================================
   ACTIVE TAB
   ===================================================== */

.orders-tabs .pos-tab.active,
.pos-tabs .pos-tab.active {

    background: #e4f7ed;

    color: #008f5a;

    font-weight: 700;
}


/* =====================================================
   HOVER
   ===================================================== */

.orders-tabs .pos-tab:hover,
.pos-tabs .pos-tab:hover {

    background: #f2f8f5;
}


/* =====================================================
   ACTIVE HOVER
   ===================================================== */

.orders-tabs .pos-tab.active:hover,
.pos-tabs .pos-tab.active:hover {

    background: #e4f7ed;
}


/* =====================================================
   CLICK
   ===================================================== */

.orders-tabs .pos-tab:active,
.pos-tabs .pos-tab:active {

    transform: scale(0.98);
}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 600px) {

    .orders-tabs,
    .pos-tabs {

        padding: 6px;

        border-radius: 16px;
    }

    .orders-tabs .pos-tab,
    .pos-tabs .pos-tab {

        height: 54px;

        font-size: 16px;

        border-radius: 12px;
    }

}

      /* =================================================
         TABLE
         ================================================= */

      .orders-title{
        margin:0 0 18px 0;
        font-size:22px;
      }


      .orders-table-grid{
        display:grid;
        grid-template-columns:
          repeat(3,minmax(0,1fr));
        gap:16px;
      }


      .orders-table-card{
        border:0;
        background:#fff;
        border-radius:16px;
        padding:24px 15px;
        min-height:170px;
        cursor:pointer;
        font-family:inherit;

        box-shadow:
          0 3px 15px #0000000d;
      }


      .orders-table-card:hover{
        transform:translateY(-2px);
      }


      .orders-table-icon{
        font-size:42px;
        margin-bottom:12px;
      }


      .orders-table-name{
        font-size:20px;
        font-weight:800;
        color:#111827;
      }


      .orders-table-status{
        margin-top:8px;
        display:inline-block;
        padding:5px 12px;
        border-radius:999px;
        background:#dcfce7;
        color:#166534;
        font-size:13px;
        font-weight:700;
      }


      /* =================================================
         DETAIL
         ================================================= */

      .orders-detail-panel{
        margin-top:18px;
      }


      .orders-detail-header{
        display:flex;
        align-items:center;
        gap:18px;
        padding-bottom:18px;
        border-bottom:1px solid #eee;
      }


      .orders-back-btn{
        border:0;
        border-radius:10px;
        padding:9px 14px;
        background:#f3f4f6;
        color:#111827;
        font-family:inherit;
        font-size:15px;
        font-weight:700;
        cursor:pointer;
      }


      .orders-detail-table{
        font-size:24px;
        font-weight:800;
        color:#111827;
      }


      .orders-item-count{
        margin-left:auto;
        color:#6b7280;
        font-weight:700;
      }


      .orders-detail-content{
        padding-top:20px;
      }


      .orders-detail-content h2{
        margin:0 0 18px 0;
        font-size:20px;
      }


      .orders-empty{
        padding:35px 20px;
        text-align:center;
        border-radius:12px;
        background:#f9fafb;
        color:#6b7280;
        font-size:16px;
      }


      /* =================================================
         CART
         ================================================= */

      .orders-cart-row{
        display:grid;
        grid-template-columns:
          1fr auto auto;

        align-items:center;

        gap:25px;

        padding:16px 0;

        border-bottom:1px solid #eee;
      }


      .orders-cart-name{
        font-size:17px;
        font-weight:800;
      }


      .orders-cart-price{
        margin-top:5px;
        color:#6b7280;
        font-size:14px;
      }

      .pos-cart-empty{
          padding:22px 0;
          color:#6b7280;
          text-align:center;
        }


      .orders-cart-qty{
        font-size:18px;
        font-weight:800;
      }

      .orders-cart-qty-control{
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
      }


      .orders-cart-qty-btn{
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


      .orders-cart-qty-btn:active{
        transform:scale(.95);
      }


      .orders-cart-qty{
        min-width:28px;

        text-align:center;

        font-size:16px;
      }


      .orders-cart-delete{
        width:38px;
        height:38px;

        border:0;

        border-radius:9px;

        background:#fee2e2;

        cursor:pointer;

        font-size:17px;
      }


      .orders-cart-delete:active{
        transform:scale(.95);
      }


      .orders-cart-total{
        color:#008f68;
        font-size:18px;
        font-weight:800;
      }


      .orders-detail-footer{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
        margin-top:20px;
        padding-top:18px;
        border-top:1px solid #eee;
      }


      .orders-detail-total{
        display:flex;
        flex-direction:column;
        gap:4px;
      }


      .orders-detail-total span{
        color:#6b7280;
        font-size:14px;
      }


      .orders-detail-total strong{
        color:#008f68;
        font-size:26px;
      }


      .orders-add-menu-btn{
        border:0;
        border-radius:12px;
        padding:13px 20px;
        background:#a8dca8;
        color:#14532d;
        font-family:inherit;
        font-size:17px;
        font-weight:800;
        cursor:pointer;
      }

      .orders-payment-btn{
        border:0;
        border-radius:12px;
        padding:13px 20px;
        background:#86efac;
        color:#14532d;
        font-family:inherit;
        font-size:17px;
        font-weight:800;
        cursor:pointer;
      }

      .orders-payment-btn:active{
        transform:scale(.97);
      }


      /* =================================================
         MENU
         ================================================= */

      .orders-menu-panel{
        margin-top:18px;
      }


      .orders-menu-header{
        display:flex;
        align-items:center;
        gap:18px;
        padding-bottom:18px;
        border-bottom:1px solid #eee;
      }


      .orders-menu-content{
        padding-top:20px;
      }


      .orders-menu-category{
        margin-bottom:28px;
      }


      .orders-menu-category-title{
        margin:0 0 16px 0;
        font-size:22px;
      }


      .orders-menu-grid{
        display:grid;
        grid-template-columns:
          repeat(6,minmax(0,1fr));
        gap:16px;
      }


      .orders-menu-card{
        border:0;
        background:#fff;
        border-radius:16px;
        min-height:190px;
        padding:18px 10px;
        cursor:pointer;
        font-family:inherit;

        box-shadow:
          0 3px 15px #0000000d;
      }


      .orders-menu-card:hover{
        transform:translateY(-2px);
      }


      .orders-menu-emoji{
        font-size:48px;
        margin-bottom:10px;
      }


      .orders-menu-name{
        font-size:16px;
        font-weight:800;
        line-height:1.4;
      }


      .orders-menu-price{
        margin-top:8px;
        color:#008f68;
        font-size:18px;
        font-weight:800;
      }


      .orders-menu-loading,
      .orders-menu-empty{
        padding:50px 20px;
        text-align:center;
        color:#6b7280;
        font-size:18px;
      }


      .orders-menu-error{
        padding:20px;
        border-radius:12px;
        background:#fee2e2;
        color:#991b1b;
      }


      /* =================================================
         QUANTITY MODAL
         ================================================= */

      .orders-quantity-modal{
        position:fixed;
        inset:0;

        background:#00000055;

        display:flex;
        align-items:center;
        justify-content:center;

        z-index:9999;

        padding:20px;
      }


      .orders-quantity-box{
        position:relative;

        width:100%;
        max-width:450px;

        background:#fff;

        border-radius:20px;

        padding:35px 30px;

        text-align:center;

        box-shadow:
          0 10px 35px #00000025;
      }


      .orders-quantity-close{
        position:absolute;

        right:15px;
        top:15px;

        width:42px;
        height:42px;

        border:0;

        border-radius:50%;

        background:#f3f4f6;

        font-size:28px;

        cursor:pointer;
      }


      .orders-quantity-emoji{
        font-size:58px;
      }


      .orders-quantity-name{
        margin-top:10px;

        font-size:25px;

        font-weight:800;
      }


      .orders-quantity-price{
        margin-top:6px;

        color:#008f68;

        font-size:20px;

        font-weight:800;
      }


      .orders-quantity-control{
        display:flex;

        align-items:center;

        justify-content:center;

        gap:30px;

        margin:30px 0;
      }


      .orders-quantity-control button{
        width:64px;
        height:64px;

        border:0;

        border-radius:14px;

        background:#f3f4f6;

        color:#111827;

        font-size:32px;

        font-weight:800;

        cursor:pointer;
      }


      .orders-quantity-control strong{
        min-width:40px;

        font-size:36px;
      }


      .orders-quantity-confirm{
        width:100%;

        border:0;

        border-radius:12px;

        padding:15px;

        background:#a8dca8;

        color:#14532d;

        font-family:inherit;

        font-size:18px;

        font-weight:800;

        cursor:pointer;
      }


      /* =================================================
         MOBILE
         ================================================= */

      @media(max-width:1100px){

        .orders-menu-grid{
          grid-template-columns:
            repeat(4,minmax(0,1fr));
        }

      }


      @media(max-width:700px){

        .orders-table-grid{
          grid-template-columns:
            repeat(2,minmax(0,1fr));
        }


        .orders-menu-grid{
          grid-template-columns:
            repeat(2,minmax(0,1fr));
        }


        .orders-cart-row{
          grid-template-columns:
            1fr auto;

          gap:10px;
        }


        .orders-cart-total{
          grid-column:2;
        }


        .orders-detail-footer{
          flex-direction:column;
          align-items:stretch;
        }


        .orders-add-menu-btn{
          width:100%;
        }

      }

      .orders-table-total{
        margin-top:8px;
        color:#008f68;
        font-size:17px;
        font-weight:800;
      }


      .orders-status-empty{
        background:#dcfce7;
        color:#166534;
      }


      .orders-status-active{
        background:#fef3c7;
        color:#92400e;
      }

      /* =====================================================
   PAID BILLS
   ===================================================== */

.orders-paid-bill{
  padding: 10px 24px 4px 24px;
}


.orders-paid-bill-id{
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  line-height: 1.4;
}


.orders-paid-bill-info{
  display: flex;
  align-items: center;
  gap: 10px;

  margin-top: 8px;

  font-size: 16px;
  color: #6b7280;
}


.orders-paid-status{
  display: inline-flex;

  align-items: center;
  justify-content: center;

  padding: 5px 12px;

  border-radius: 999px;

  background: #fef3c7;
  color: #92400e;

  font-size: 14px;
  font-weight: 700;
}


.orders-paid-bill-date{
  margin-top: 7px;

  font-size: 15px;

  color: #6b7280;
}


.orders-paid-bill-total{
  margin-top: 2px;

  font-size: 22px;

  font-weight: 800;

  color: #92400e;
}

/* =====================================================
   ORDERS PAID HEADER
   ===================================================== */

#ordersPaidArea .pos-pending-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}


#ordersPaidArea .pos-pending-title{
  margin: 0;
}


#ordersPaidArea .pos-pending-count{
  margin-left: auto;
  white-space: nowrap;
}

    </style>

  `;

};


// =====================================================
// ORDERS : โหลดรายการบิลขายแล้ว
// ใช้เฉพาะ Orders Database
// ไม่ปน Sales
// =====================================================

POS.ordersLoadPaidBills = async function(){

  const area =
    document.getElementById(
      "ordersPaidBills"
    );

  const count =
    document.getElementById(
      "ordersPaidCount"
    );


  if(!area){
    return;
  }


  area.innerHTML = `
    <div class="pos-cart-empty">
      กำลังโหลดรายการบิล...
    </div>
  `;


  try{

    // =================================================
    // โหลด Orders ที่ชำระแล้ว
    // =================================================

    const result =
      await POS.supabase
        .from("orders")
        .select(`
          id,
          table_no,
          menu_id,
          qty,
          unit_price,
          total,
          order_status,
          payment_status,
          ordered_at,
          paid_at,
          remark
        `)
        .eq(
          "payment_status",
          "PAID"
        )
        .order(
          "paid_at",
          {
            ascending:false
          }
        );


    if(result.error){
      throw result.error;
    }


    const rows =
      Array.isArray(result.data)
        ? result.data
        : [];


    // =================================================
    // โหลดเมนู
    // =================================================

    const menuResult =
      await POS.api.menus();


    const menus =
      Array.isArray(
        menuResult?.menus
      )
        ? menuResult.menus
        : [];


    const menuMap = {};


    menus.forEach(menu => {

      menuMap[
        String(menu.id)
      ] = menu;

    });


    // =================================================
    // รวมตามเลขบิลใน remark
    // =================================================

    const billMap = {};


    rows.forEach(row => {

      const billId =
        String(
          row.remark || ""
        ).trim();


      if(!billId){
        return;
      }


      if(!billMap[billId]){

        billMap[billId] = {

          billId:
            billId,

          table:
            row.table_no,

          soldAt:
            row.ordered_at,

          paidAt:
            row.paid_at,

          items:
            [],

          total:
            0

        };

      }


      const menu =
        menuMap[
          String(row.menu_id)
        ] || {};


      const qty =
        Number(
          row.qty || 0
        );


      const price =
        Number(
          row.unit_price || 0
        );


      const total =
        Number(
          row.total || (
            qty * price
          )
        );


      billMap[billId].items.push({

        id:
          row.id,

        menuId:
          row.menu_id,

        name:
          menu.name ||
          "ไม่พบชื่อเมนู",

        emoji:
          menu.emoji ||
          "🍹",

        qty:
          qty,

        price:
          price,

        total:
          total

      });


      billMap[billId].total +=
        total;

    });


    const bills =
      Object.values(
        billMap
      );


    // =================================================
    // เก็บไว้ให้หน้ารายละเอียดใช้
    // =================================================

    POS.paidBills =
      bills;


    if(count){

      count.textContent =
        bills.length +
        " บิล";

    }


    if(!bills.length){

      area.innerHTML = `
        <div class="pos-cart-empty">
          ยังไม่มีรายการบิลขายแล้ว
        </div>
      `;

      return;

    }


    // =================================================
    // แสดงรายการบิล
    // =================================================

    area.innerHTML =
      bills.map(bill => {

        const soldDate =
        bill.soldAt
          ? new Date(
              bill.soldAt
            ).toLocaleString(
              "th-TH"
            )
          : "-";


      const paidDate =
        bill.paidAt
          ? new Date(
              bill.paidAt
            ).toLocaleString(
              "th-TH"
            )
          : "-";


        return `

          <button
            type="button"
            onclick="
              POS.ordersOpenPaidBill(
                '${bill.billId}'
              )
            "
            style="
              width:100%;
              display:block;
              text-align:left;
              border:0;
              background:white;
              padding:16px 0;
              cursor:pointer;
              border-bottom:1px solid #eee;
            "
          >

            <div
              style="
                font-size:22px;
                font-weight:900;
                color:#102a43;
              "
            >
              บิล ${bill.billId}
            </div>


            <div
              style="
                margin-top:7px;
                color:#64748b;
                font-size:16px;
              "
            >
              ${bill.items.length}
              รายการ
            </div>


            <div
              style="
                margin-top:5px;
                color:#64748b;
                font-size:15px;
              "
            >
              โต๊ะ ${bill.table}
           
            </div>


            <div
              style="
                margin-top:8px;
                font-size:22px;
                font-weight:900;
                color:#a34a08;
              "
            >
              ${bill.total.toLocaleString("th-TH")}
              บาท
            </div>


            <div
              style="
                margin-top:7px;
              "
            >

              <span
                style="
                  display:inline-block;
                  padding:5px 12px;
                  border-radius:20px;
                  background:#fef3c7;
                  color:#92400e;
                  font-weight:800;
                "
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

          </button>

        `;

      }).join("");


  }catch(error){

    console.error(
      "LOAD PAID ORDERS ERROR:",
      error
    );


    area.innerHTML = `
      <div
        style="
          padding:20px;
          color:#b91c1c;
        "
      >
        โหลดรายการบิลไม่สำเร็จ
        <br>
        ${error?.message || ""}
      </div>
    `;

  }

};


// =====================================================
// ORDERS TABS
// =====================================================

if(!window.POS.ordersTabsBound){

  window.POS.ordersTabsBound = true;


  document.addEventListener(
    "click",
    event => {

      const tab =
        event.target.closest(
          "[data-orders-tab]"
        );


      if(!tab){
        return;
      }


      const tabName =
        tab.dataset.ordersTab;


      const tableArea =
        document.getElementById(
          "ordersTableArea"
        );


      const detailArea =
        document.getElementById(
          "ordersDetailArea"
        );


      const menuArea =
        document.getElementById(
          "ordersMenuArea"
        );


      const paidArea =
        document.getElementById(
          "ordersPaidArea"
        );


      // -----------------------------------------------
      // เปลี่ยน active tab
      // -----------------------------------------------

      document
        .querySelectorAll(
          "[data-orders-tab]"
        )
        .forEach(item => {

          item.classList.remove(
            "active"
          );

        });


      tab.classList.add(
        "active"
      );


      // -----------------------------------------------
      // TAB : โต๊ะ
      // -----------------------------------------------

      if(tabName === "tables"){

  if(paidArea){
    paidArea.style.display =
      "none";
  }


  if(menuArea){
    menuArea.style.display =
      "none";
  }


  if(detailArea){
    detailArea.style.display =
      "none";
  }


  if(tableArea){

    tableArea.style.display =
      "block";


    const tableTitle =
      tableArea.querySelector(
        ".orders-title"
      );

    const tableGrid =
      tableArea.querySelector(
        ".orders-table-grid"
      );


    if(tableTitle){
      tableTitle.style.display =
        "block";
    }


    if(tableGrid){
      tableGrid.style.display =
        "grid";
    }

  }


  POS.currentTable =
    null;


  POS.ordersRenderTables();


  return;

}


      // -----------------------------------------------
      // TAB : รายการบิลขายแล้ว
      // -----------------------------------------------

      if(tabName === "paid"){

  if(tableArea){

    const tableTitle =
      tableArea.querySelector(
        ".orders-title"
      );

    const tableGrid =
      tableArea.querySelector(
        ".orders-table-grid"
      );


    if(tableTitle){
      tableTitle.style.display =
        "none";
    }


    if(tableGrid){
      tableGrid.style.display =
        "none";
    }

  }


  if(detailArea){
    detailArea.style.display =
      "none";
  }


  if(menuArea){
    menuArea.style.display =
      "none";
  }


  if(paidArea){
    paidArea.style.display =
      "block";
  }

  POS.ordersRenderPaidBills();

}


    }
  );

}


// =====================================================
// แสดงรายการบิลขายแล้ว
// =====================================================

POS.ordersRenderPaidBills =
  async function(){

    // =================================================
    // FIX:
    // ใช้ ordersLoadPaidBills() โดยตรง
    //
    // ordersLoadPaidBills() อ่าน Orders ที่ชำระแล้ว
    // ด้วย payment_status = PAID และไม่กรอง BUSINESS_DATE
    //
    // ทำให้เมื่อปิดยอดและ BUSINESS_DATE เปลี่ยนวัน
    // บิลเก่ายังคงอยู่ใน "รายการบิลขายแล้ว"
    // =================================================

    return POS.ordersLoadPaidBills();

  };




  // =====================================================
// ORDERS : เปิดรายละเอียดบิล
// =====================================================

POS.ordersOpenPaidBill = function(billId){

  const bills =
    Array.isArray(
      POS.paidBills
    )
      ? POS.paidBills
      : [];


  const bill =
    bills.find(
      item =>
        String(item.billId) ===
        String(billId)
    );


  if(!bill){

    alert(
      "ไม่พบข้อมูลบิล"
    );

    return;

  }


  let modal =
    document.getElementById(
      "ordersPaidBillDetailModal"
    );


  if(modal){

    modal.remove();

  }


  modal =
    document.createElement(
      "div"
    );


  modal.id =
    "ordersPaidBillDetailModal";


  modal.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.45);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:99999;
    padding:20px;
  `;


  const itemsHtml =
    bill.items.map(item => {

      return `

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:15px;
            padding:13px 0;
            border-bottom:1px solid #eee;
          "
        >

          <div>

            <div
              style="
                font-size:18px;
                font-weight:800;
              "
            >
              ${item.emoji}
              ${item.name}
            </div>


            <div
              style="
                margin-top:4px;
                color:#64748b;
              "
            >
              ${item.qty}
              ×
              ${item.price.toLocaleString("th-TH")}
              บาท
            </div>

          </div>


          <div
            style="
              font-size:18px;
              font-weight:900;
              white-space:nowrap;
            "
          >
            ${item.total.toLocaleString("th-TH")}
            บาท
          </div>

        </div>

      `;

    }).join("");


  const soldDate =
    bill.soldAt
      ? new Date(
          bill.soldAt
        ).toLocaleString(
          "th-TH"
        )
      : "-";


  const paidDate =
    bill.paidAt
      ? new Date(
          bill.paidAt
        ).toLocaleString(
          "th-TH"
        )
      : "-";


  modal.innerHTML = `

    <div
      style="
        width:100%;
        max-width:600px;
        max-height:90vh;
        overflow:auto;
        background:white;
        border-radius:20px;
        padding:25px;
        box-shadow:0 20px 60px rgba(0,0,0,.25);
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        "
      >

        <div
          style="
            font-size:24px;
            font-weight:900;
          "
        >
          🧾 รายละเอียดบิล
        </div>


        <button
          type="button"
          onclick="
            document
              .getElementById(
                'ordersPaidBillDetailModal'
              )
              .remove();
          "
          style="
            border:0;
            background:#f1f5f9;
            width:40px;
            height:40px;
            border-radius:50%;
            font-size:25px;
            cursor:pointer;
          "
        >
          ×
        </button>

      </div>


      <div
        style="
          font-size:22px;
          font-weight:900;
        "
      >
        บิล ${bill.billId}
      </div>


      <div
        style="
          margin-top:6px;
          color:#64748b;
        "
      >
        โต๊ะ ${bill.table}
      </div>

      <div
      style="
        margin-top:10px;
        color:#64748b;
        font-size:17px;
        line-height:1.8;
      "
    >
      📅 วันที่ขาย ${soldDate}
      <br>
      💳 วันที่ชำระ ${paidDate}
    </div>


      <div
        style="
          margin-top:20px;
        "
      >
        ${itemsHtml}
      </div>


      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-top:20px;
          padding-top:15px;
          border-top:2px solid #ddd;
        "
      >

        <div
          style="
            font-size:19px;
            font-weight:900;
          "
        >
          รวมทั้งหมด
        </div>


        <div
          style="
            font-size:26px;
            font-weight:900;
            color:#009b68;
          "
        >
          ${bill.total.toLocaleString("th-TH")}
          บาท
        </div>

      </div>


      <div
        style="
          text-align:center;
          margin-top:20px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          color:#009b68;
          font-size:20px;
          font-weight:700;
        "
      >
        <span
          style="
            width:20px;
            height:20px;
            border-radius:50%;
            background:#57d99a;
            display:inline-block;
          "
        ></span>

        <span>
          ชำระแล้ว
        </span>
      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );

};