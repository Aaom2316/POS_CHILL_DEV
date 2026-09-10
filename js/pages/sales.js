// =====================================================
// PAGE : SALES / ยอดขาย
// รวม Sales + Orders + Pending Bills
// สำหรับพนักงานดูตอนปิดยอด
// =====================================================

POS.pages.sales = async function(){

  // ===================================================
  // LOAD DATA
  // โหลดข้อมูลพร้อมกัน เพื่อลดเวลารอเปิดหน้า
  // ===================================================

  let salesRows = [];
  let orderRows = [];
  let expenseRows = [];
  let currentCashRound = null;

  try{

    // -------------------------------------------------
    // LOAD SALES + ORDERS + EXPENSES + CASH ROUND
    // พร้อมกัน ไม่รอทีละชุด
    // -------------------------------------------------

    const [
      salesResult,
      orderResults,
      paidOrderResult,
      expenseResult,
      roundResult
    ] = await Promise.all([

      // SALES
      (async () => {
        try{

          return await POS.api.salesList();

        }catch(error){

          console.error(
            "LOAD SALES ERROR:",
            error
          );

          return {
            sales: []
          };

        }
      })(),


      // ORDERS ปัจจุบัน
      // ใช้ LIST เพื่อเอารายการของวันทำการปัจจุบัน
      // และรายการที่ยังค้าง / ยังไม่ปิดบิล
      Promise.all(

        [1,2,3,4,5,6].map(
          async tableNo => {

            try{

              const result =
                await POS.api.call(
                  POS_CONFIG.FUNCTION_NAMES.ORDERS,
                  {
                    method:"POST",

                    body:{
                      action:"LIST",
                      table_no: tableNo
                    }
                  }
                );

              return Array.isArray(
                result?.orders
              )
                ? result.orders
                : [];

            }catch(error){

              console.error(
                "LOAD ORDER ERROR:",
                tableNo,
                error
              );

              return [];

            }

          }
        )

      ),


      // ORDERS HISTORY
      // สำคัญมากสำหรับ "ยอดขายรอบนี้"
      // หลังปิดยอด BUSINESS_DATE จะเปลี่ยนวัน
      //
      // FIX:
      // ไม่พึ่ง PAID_LIST ของ Orders API เพียงทางเดียว
      // เพราะถ้า Function ที่ Deploy อยู่ยังเป็นตัวเก่า
      // หรือ API ส่งรูปแบบ response ต่างกัน
      // ยอดขายรอบนี้จะกลายเป็น 0 ทั้งที่ข้อมูลใน orders ยังมีอยู่
      //
      // ใช้ Supabase ตรงเป็นแหล่งประวัติ PAID + COMPLETED
      // โดย RLS ของฐานข้อมูลเป็นตัวควบคุมสิทธิ์
      (async () => {
        try{

          if(
            POS.supabase &&
            typeof POS.supabase
              .from === "function"
          ){

            const historyResult =
              await POS.supabase
                .from("orders")
                .select("*")
                .eq(
                  "payment_status",
                  "PAID"
                )
                .eq(
                  "order_status",
                  "COMPLETED"
                )
                .order(
                  "paid_at",
                  {
                    ascending:false
                  }
                );

            if(
              !historyResult.error &&
              Array.isArray(
                historyResult.data
              )
            ){

              return historyResult.data;

            }

            console.warn(
              "DIRECT ORDERS HISTORY LOAD ERROR:",
              historyResult.error
            );

          }

          // -----------------------------------------------
          // FALLBACK
          // ถ้าอ่าน Supabase ตรงไม่ได้ ให้ลอง API PAID_LIST
          // -----------------------------------------------

          const result =
            await POS.api.call(
              POS_CONFIG.FUNCTION_NAMES.ORDERS,
              {
                method:"POST",

                body:{
                  action:"PAID_LIST"
                }
              }
            );

          if(
            Array.isArray(
              result?.orders
            )
          ){

            return result.orders;

          }

          // รองรับกรณี API คืน data เป็น array
          if(
            Array.isArray(
              result?.data
            )
          ){

            return result.data;

          }

          return [];

        }catch(error){

          console.error(
            "LOAD PAID ORDER HISTORY ERROR:",
            error
          );

          return [];

        }
      })(),


      // EXPENSES
      (async () => {
        try{

          return await POS.api.expensesList();

        }catch(error){

          console.error(
            "LOAD EXPENSES ERROR:",
            error
          );

          return {
            expenses: []
          };

        }
      })(),


      // CURRENT CASH ROUND
      (async () => {
        try{

          return await POS.api.cashRoundCurrent();

        }catch(error){

          console.error(
            "LOAD CASH ROUND ERROR:",
            error
          );

          return null;

        }
      })()

    ]);


    // -------------------------------------------------
    // SALES RESULT
    // -------------------------------------------------

    salesRows =
      Array.isArray(
        salesResult?.sales
      )
        ? salesResult.sales
        : [];


    // -------------------------------------------------
    // ORDERS RESULT
    // -------------------------------------------------
    // รวม 2 แหล่งข้อมูล
    // 1) LIST = รายการของวันทำการปัจจุบัน / รายการค้าง
    // 2) PAID_LIST = ประวัติ Orders ที่จ่ายแล้ว
    // เพื่อให้บิลโต๊ะ เช่น 108 บาท ไม่หายหลังปิดยอด
    // -------------------------------------------------

    const currentOrderRows =
      Array.isArray(orderResults)
        ? orderResults.flat()
        : [];

    const paidOrderRows =
      Array.isArray(paidOrderResult)
        ? paidOrderResult
        : [];

    // ป้องกันรายการซ้ำ เพราะ PAID_LIST กับ LIST
    // อาจมีบิลที่เป็นวันทำการปัจจุบันเหมือนกัน
    const orderMap =
      new Map();

    [
      ...currentOrderRows,
      ...paidOrderRows
    ].forEach(
      row => {

        const id =
          String(
            row?.id ||
            row?.order_id ||
            ""
          ).trim();

        if(id){
          orderMap.set(id,row);
        }

      }
    );

    orderRows =
      Array.from(
        orderMap.values()
      );


    // -------------------------------------------------
    // EXPENSE RESULT
    // -------------------------------------------------

    expenseRows =
      Array.isArray(
        expenseResult?.expenses
      )
        ? expenseResult.expenses
        : [];


    // -------------------------------------------------
    // CASH ROUND RESULT
    // -------------------------------------------------

    // -------------------------------------------------
    // CASH ROUND RESULT
    // รองรับทั้ง 2 รูปแบบที่ API อาจส่งกลับมา
    // 1) { success:true, round:{...} }
    // 2) { round_no, started_at, ... } จาก RPC โดยตรง
    // -------------------------------------------------

    if(roundResult){

      if(
        roundResult.success === true &&
        roundResult.round
      ){

        currentCashRound =
          roundResult.round;

      }
      else if(
        roundResult.round_no !== undefined &&
        roundResult.started_at
      ){

        currentCashRound =
          roundResult;

      }
      else if(
        roundResult.data &&
        roundResult.data.round_no !== undefined
      ){

        currentCashRound =
          roundResult.data;

      }

    }


  }catch(error){

    console.error(
      "SALES PAGE LOAD ERROR:",
      error
    );

  }

  // ===================================================
  // BUSINESS DATE
  // ใช้วันทำการจาก SYSTEM แทนวันที่ปัจจุบันของเครื่อง
  // ถ้าอ่านวันทำการไม่ได้ ค่อย fallback เป็นวันที่ปัจจุบัน
  // ===================================================

  let today =
    new Date()
      .toLocaleDateString(
        "en-CA",
        {
          timeZone:
            "Asia/Bangkok"
        }
      );

  try{

    const systemData =
      await POS.api.systemSettings();

    const settings =
      Array.isArray(systemData?.settings)
        ? systemData.settings
        : [];

    const businessDateSetting =
      settings.find(
        item =>
          String(item?.key || "")
            .trim()
            .toUpperCase() ===
          "BUSINESS_DATE"
      );

    const businessDate =
      businessDateSetting?.value
        ? String(businessDateSetting.value).substring(0,10)
        : (
            systemData?.business_date ||
            systemData?.businessDate ||
            null
          );

    if(
      businessDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        String(businessDate).substring(0,10)
      )
    ){

      today =
        String(businessDate).substring(0,10);

    }

  }catch(error){

    console.warn(
      "LOAD BUSINESS DATE ERROR:",
      error
    );

  }

  // ===================================================
// CHECK BUSINESS DATE
// ห้ามปิดยอดถ้าวันทำการเกินวันจริง
// ===================================================

const realToday =
  new Date()
    .toLocaleDateString(
      "en-CA",
      {
        timeZone:
          "Asia/Bangkok"
      }
    );

const businessDateIsFuture =
  String(today) >
  String(realToday);


  // ===================================================
  // CURRENT MONTH
  // ===================================================

  const currentMonth =
    today.substring(
      0,
      7
    );


  // ===================================================
  // DAILY CLOSE STATE
  // ปิดยอดวันนี้แล้วหรือยัง
  // ใช้ DATABASE เป็นตัวจริงเท่านั้น
  // ไม่ใช้ localStorage เป็นตัวตัดสิน
  // ไม่กระทบยอดสะสมของรอบขาย
  // ===================================================

  let dailyClosedAt = null;


  // ---------------------------------------------------
  // ตรวจจาก DATABASE ทุกครั้งที่โหลดหน้า
  // ถ้ามีรายการของวันนี้ = ปิดยอดแล้ว
  // ถ้าไม่มีรายการของวันนี้ = ยังปิดยอดได้
  // ---------------------------------------------------

  try{

    const {
      data: dailyCloseRow,
      error: dailyCloseError
    } = await POS.supabase
      .from("daily_closings")
      .select(
        "id,close_date,closed_at"
      )
      .eq(
        "close_date",
        today
      )
      .order(
        "closed_at",
        {
          ascending:false
        }
      )
      .limit(1)
      .maybeSingle();


    if(
      !dailyCloseError &&
      dailyCloseRow &&
      dailyCloseRow.closed_at
    ){

      const closeDate =
        new Date(
          dailyCloseRow.closed_at
        );

      if(
        !isNaN(
          closeDate.getTime()
        )
      ){

        dailyClosedAt =
          closeDate;

      }

    }


  }catch(error){

    console.warn(
      "LOAD DAILY CLOSING FROM DB ERROR:",
      error
    );

  }


  // ===================================================
  // ROUND START
  // ===================================================

  let roundStartAt = null;

  if(
    currentCashRound &&
    currentCashRound.started_at
  ){

    roundStartAt =
      new Date(
        currentCashRound.started_at
      );

  }


  // ===================================================
  // DATE HELPER
  // ===================================================

  function getDateKey(value){

    if(!value){
      return "";
    }

    try{

      return new Date(value)
        .toLocaleDateString(
          "en-CA",
          {
            timeZone:
              "Asia/Bangkok"
          }
        );

    }catch(error){

      return "";

    }

  }


  // ===================================================
  // FILTER SALES วันนี้
  // ===================================================

  const todaySalesRows =
    salesRows.filter(
      row => {

        const dateValue =
          row.sold_at ||
          row.created_at ||
          "";

        if(
          getDateKey(
            dateValue
          ) !==
          today
        ){

          return false;

        }

        // หลังปิดยอดวันนี้แล้ว
        // นับเฉพาะรายการที่เกิดหลังเวลาปิด
        if(dailyClosedAt){

          const rowDate =
            new Date(
              dateValue
            );

          if(
            isNaN(
              rowDate.getTime()
            )
          ){

            return false;

          }

          return (
            rowDate.getTime() >
            dailyClosedAt.getTime()
          );

        }

        return true;

      }
    );


 // ===================================================
// FILTER ORDERS วันนี้
// ===================================================
// สำคัญ:
// Orders ใช้ BUSINESS_DATE เป็นตัวกำหนดวันทำการ
// ไม่ใช้ ordered_at / created_at เป็นตัวตัดสินวัน
// เพื่อให้ยอดจาก "หน้าโต๊ะ" เข้า "รายรับ"
// ของวันทำการเดียวกับหน้าขายสินค้า
// ===================================================

const todayOrderRows =
  orderRows.filter(
    row => {

      // -------------------------------------------------
      // ใช้ business_date เป็นหลัก
      // -------------------------------------------------

      const orderBusinessDate =
        String(
          row.business_date ||
          ""
        ).substring(
          0,
          10
        );

      // -------------------------------------------------
      // ต้องเป็นวันทำการเดียวกับหน้า Sales
      // -------------------------------------------------

      if(
        orderBusinessDate !==
        String(today).substring(
          0,
          10
        )
      ){

        return false;

      }

      // -------------------------------------------------
      // ถ้ามีการปิดยอดวันนี้แล้ว
      // นับเฉพาะ Order ที่เกิดหลังเวลาปิดยอด
      //
      // ใช้เวลา ordered_at / created_at
      // เฉพาะสำหรับแบ่ง "ก่อน/หลังปิดยอด"
      // ไม่ได้ใช้กำหนดวันทำการ
      // -------------------------------------------------

      if(dailyClosedAt){

        const dateValue =
          row.ordered_at ||
          row.created_at ||
          "";

        if(!dateValue){

          return false;

        }

        const rowDate =
          new Date(
            dateValue
          );

        if(
          isNaN(
            rowDate.getTime()
          )
        ){

          return false;

        }

        return (
          rowDate.getTime() >
          dailyClosedAt.getTime()
        );

      }

      return true;

    }
  );


  // ===================================================
  // PENDING BILLS
  // ===================================================

  let pendingBills = [];

  try{

    const saved =
      localStorage.getItem(
        "POS_CHILL_PENDING_BILLS"
      );

    pendingBills =
      saved
        ? JSON.parse(saved)
        : [];

    if(
      !Array.isArray(
        pendingBills
      )
    ){

      pendingBills = [];

    }

  }catch(error){

    console.error(
      "LOAD PENDING BILLS ERROR:",
      error
    );

    pendingBills = [];

  }


  // ===================================================
  // PENDING BILLS วันนี้
  // ===================================================

  // สร้าง Set ครั้งเดียว แทนการใช้ .some() ซ้ำทุกบิล
  // ช่วยลดเวลาถ้ามี Pending Bills จำนวนมาก
  const todaySalesBillIds =
    new Set(
      todaySalesRows
        .map(
          row =>
            String(
              row.remark ||
              row.bill_id ||
              ""
            ).trim()
        )
        .filter(Boolean)
    );


  const todayPendingBills =
    pendingBills
      .filter(
        bill => {

          const status =
            String(
              bill?.status ||
              ""
            ).toUpperCase();

          if(
            status !==
            "UNPAID"
          ){

            return false;

          }


          return (
            getDateKey(
              bill?.createdAt
            ) ===
            today
          );

        }
      )
      .filter(
        bill => {

          const billId =
            String(
              bill?.billId ||
              ""
            ).trim();


          if(!billId){
            return false;
          }


          // -------------------------------------------
          // ป้องกันบิลซ้ำกับ Sales
          // -------------------------------------------

          return !todaySalesBillIds.has(
            billId
          );

        }
      );


  // ===================================================
  // NORMALIZE SALES
  // ===================================================

  const normalizedSales =
    todaySalesRows.map(
      row => ({

        source:
          "SALES",

        id:
          row.id,

        total:
          Number(
            row.total || 0
          ),

        payment_status:
          String(
            row.payment_status ||
            ""
          ).toUpperCase(),

        // เวลารับเงินจริงจาก DATABASE
        // ใช้ paid_at เท่านั้นสำหรับการคำนวณรับเงินจริง
        paid_at:
          row.paid_at ||
          null,

        date:
          row.sold_at ||
          row.created_at,

        table_no:
          null

      })
    );


  // ===================================================
  // NORMALIZE ORDERS
  // ===================================================

  const normalizedOrders =
    todayOrderRows.map(
      row => ({

        source:
          "ORDERS",

        id:
          row.id,

        total:
          Number(
            row.total || 0
          ),

        payment_status:
          String(
            row.payment_status ||
            ""
          ).toUpperCase(),

        // เวลารับเงินจริงจาก DATABASE
        // ใช้ paid_at เท่านั้นสำหรับการคำนวณรับเงินจริง
        paid_at:
          row.paid_at ||
          null,

        date:
          row.ordered_at ||
          row.created_at,

        table_no:
          row.table_no

      })
    );


  // ===================================================
  // NORMALIZE PENDING
  // ===================================================

  const normalizedPending =
    todayPendingBills.map(
      bill => ({

        source:
          "SALES",

        id:
          bill.billId,

        total:
          Number(
            bill.total || 0
          ),

        payment_status:
          "UNPAID",

        date:
          bill.createdAt,

        // ให้ตัวกรองยอดรอบอ่านวันเวลาของบิลค้างได้
        created_at:
          bill.createdAt,

        table_no:
          null

      })
    );


  // ===================================================
  // ALL TODAY SALES
  // ===================================================

  const allRows = [

    ...normalizedSales,

    ...normalizedOrders,

    ...normalizedPending

  ];


  // ===================================================
  // PAID
  // ===================================================

  const paidRows =
    allRows.filter(
      row =>
        String(
          row.payment_status ||
          ""
        ).toUpperCase() ===
        "PAID"
    );


  // ===================================================
  // UNPAID
  // ===================================================

  const unpaidRows =
    allRows.filter(
      row =>
        String(
          row.payment_status ||
          ""
        ).toUpperCase() ===
        "UNPAID"
    );


  // ===================================================
  // TODAY SALES
  // ชำระแล้ว + ค้างจ่าย
  // ===================================================

  const todaySales =
    allRows.reduce(
      (sum,row) =>
        sum +
        Number(
          row.total || 0
        ),
      0
    );


    // ===================================================
  // TODAY CASH
  // รับเงินจริงวันนี้
  // ===================================================
  // สำคัญ:
  // ใช้ paid_at จาก DATABASE โดยตรง
  //
  // ห้ามใช้ paidRows
  // เพราะ paidRows ถูกกรองตามวันทำการแล้ว
  //
  // ตัวอย่าง:
  // ขาย 26/08
  // รับเงินจริง 27/08
  // paid_at = 27/08
  // ต้องนับเป็น "รับเงินจริงวันนี้"
  // ===================================================

  const todayCashRows = [

    // -----------------------------------------------
    // SALES
    // -----------------------------------------------
    ...salesRows,

    // -----------------------------------------------
    // ORDERS
    // -----------------------------------------------
    ...orderRows

  ]
    .filter(
      row => {

        // ต้อง PAID
        const status =
          String(
            row.payment_status ||
            ""
          ).toUpperCase();

        if(
          status !==
          "PAID"
        ){

          return false;

        }


        // ---------------------------------------------
        // ใช้ paid_at เท่านั้น
        // ---------------------------------------------

        const paidAt =
          row.paid_at ||
          "";

        if(!paidAt){

          return false;

        }


        // ---------------------------------------------
        // รับเงินจริงวันนี้
        // ใช้วันที่ประเทศไทย
        // ---------------------------------------------

        if(
          getDateKey(
            paidAt
          ) !==
          getDateKey(
            new Date()
          )
        ){

          return false;

        }


        // ---------------------------------------------
        // ถ้ามีการปิดยอดวันนี้แล้ว
        // เงินที่รับหลังปิดยอด = รอบใหม่
        // ---------------------------------------------

        if(dailyClosedAt){

          const paidDate =
            new Date(
              paidAt
            );

          if(
            isNaN(
              paidDate.getTime()
            )
          ){

            return false;

          }

          return (
            paidDate.getTime() >
            dailyClosedAt.getTime()
          );

        }


        return true;

      }
    );


let todayCash =
  todayCashRows.reduce(
    (sum,row) =>
      sum +
        Number(
          row.total || 0
        ),
    0
  );


// ===================================================
// CASH DISPLAY DATE
// ===================================================
// ก่อนปิดยอดของวันปัจจุบัน
// ให้ช่อง "รับเงินจริงวันนี้" แสดงยอดของวันก่อนหน้า
// เช่น วันนี้ 03/09 และยังไม่ปิดยอด -> แสดง 02/09
// หลังปิดยอดแล้ว -> กลับมาแสดงยอดของวันปัจจุบัน
// ===================================================

let cashDisplayDate =
  String(today).substring(0,10);


const cashDisplayRows =
  [
    ...salesRows,
    ...orderRows
  ].filter(
    row => {

      const status =
        String(
          row.payment_status ||
          ""
        ).toUpperCase();

      if(status !== "PAID"){
        return false;
      }

      const paidAt =
        row.paid_at ||
        "";

      if(!paidAt){
        return false;
      }

      return (
        getDateKey(paidAt) ===
        cashDisplayDate
      );

    }
  );


let cashDisplayTotal =
  cashDisplayRows.reduce(
    (sum,row) =>
      sum +
        Number(
          row.total || 0
        ),
    0
  );


if(businessDateIsFuture){

  cashDisplayTotal = 0;

}


const cashDisplayCount =
  businessDateIsFuture
    ? 0
    : cashDisplayRows.length;


// ===================================================
// ถ้าปิดยอดแล้ว และวันทำการเป็นวันถัดไป
// รับเงินจริงวันนี้ต้องเริ่มที่ 0
// ===================================================

if(businessDateIsFuture){

  todayCash = 0;

}


// ===================================================
// CURRENT CASH ROUND SALES
// ===================================================
// สำคัญ:
// "รอบนี้" ต้องสะสมต่อเนื่องข้ามการปิดยอดประจำวัน
//
// ห้ามใช้ todaySalesRows / todayOrderRows ตรงนี้
// เพราะ 2 ตัวนี้ถูกตัดรายการก่อน dailyClosedAt ออกแล้ว
//
// รอบเงินจะเริ่มนับใหม่ก็ต่อเมื่อ
// POS.startNewCashRound() -> START_NEW_CASH_ROUND
// ===================================================

// ---------------------------------------------------
// SALES ทั้งหมดของรอบ
// ---------------------------------------------------
const roundSalesRows =
  salesRows
    .map(
      row => ({

        source:
          "SALES",

        id:
          row.id,

        total:
          Number(
            row.total || 0
          ),

        payment_status:
          String(
            row.payment_status ||
            ""
          ).toUpperCase(),

        date:
          row.sold_at ||
          row.created_at,

        table_no:
          null,

        // เก็บไว้ใช้กัน Pending ซ้ำ
        bill_id:
          row.remark ||
          row.bill_id ||
          ""

      })
    );


// ---------------------------------------------------
// ORDERS ทั้งหมดของรอบ
// ไม่ใช้ todayOrderRows เพราะมันถูกกรองตามวันทำการ
// ---------------------------------------------------
const roundOrderRows =
  orderRows
    .map(
      row => ({

        source:
          "ORDERS",

        id:
          row.id,

        total:
          Number(
            row.total || 0
          ),

        payment_status:
          String(
            row.payment_status ||
            ""
          ).toUpperCase(),

        // เวลารับเงินจริงของ Orders
        paid_at:
          row.paid_at ||
          null,

        date:
          String(
            row.payment_status ||
            ""
          ).toUpperCase() === "PAID"
            ? (
                row.paid_at ||
                row.ordered_at ||
                row.created_at
              )
            : (
                row.ordered_at ||
                row.created_at
              ),

        table_no:
          row.table_no

      })
    );


// ---------------------------------------------------
// PENDING BILLS ทั้งหมดของรอบ
// เอาเฉพาะ UNPAID
// เพราะถ้าจ่ายแล้ว รายการจะอยู่ใน SALES
// ---------------------------------------------------
const roundSalesBillIds =
  new Set(
    roundSalesRows
      .map(
        row =>
          String(
            row.bill_id ||
            ""
          ).trim()
      )
      .filter(Boolean)
  );


const roundPendingRows =
  pendingBills
    .filter(
      bill => {

        const status =
          String(
            bill?.status ||
            ""
          ).toUpperCase();

        if(
          status !==
          "UNPAID"
        ){

          return false;

        }

        const billId =
          String(
            bill?.billId ||
            ""
          ).trim();

        if(!billId){

          return false;

        }

        // ป้องกันบิล Pending ซ้ำกับ Sales
        return !roundSalesBillIds.has(
          billId
        );

      }
    )
    .map(
      bill => ({

        source:
          "SALES",

        id:
          bill.billId,

        total:
          Number(
            bill.total || 0
          ),

        payment_status:
          "UNPAID",

        date:
          bill.createdAt,

        created_at:
          bill.createdAt,

        table_no:
          null

      })
    );


// ---------------------------------------------------
// รวมข้อมูลทั้งหมด แล้วกรองตามเวลาเริ่มรอบ
// ---------------------------------------------------
const monthSalesRows = [

  ...roundSalesRows,

  ...roundOrderRows,

  ...roundPendingRows

].filter(
  row => {

    const dateValue =
      row.date ||
      row.sold_at ||
      row.ordered_at ||
      row.created_at ||
      "";

    if(!dateValue){

      return false;

    }

    // -----------------------------------------------
    // มีรอบปัจจุบัน
    // = สะสมตั้งแต่เวลาเริ่มรอบ
    // ไม่สนใจว่าเป็นวันไหน
    // -----------------------------------------------

    if(
      roundStartAt &&
      !isNaN(
        roundStartAt.getTime()
      )
    ){

      const rowDate =
        new Date(
          dateValue
        );

      if(
        isNaN(
          rowDate.getTime()
        )
      ){

        return false;

      }

      return (
        rowDate.getTime() >=
        roundStartAt.getTime()
      );

    }

    // -----------------------------------------------
    // ยังไม่มีรอบ
    // fallback ใช้เดือนปัจจุบัน
    // -----------------------------------------------

    return (
      getDateKey(
        dateValue
      ).substring(
        0,
        7
      ) ===
      currentMonth
    );

  }
);


  // ===================================================
  // MONTH SALES
  // ===================================================

  const monthSales =
    monthSalesRows.reduce(
      (sum,row) => {

        const total =
          Number(
            row.total ??
            row.grand_total ??
            row.amount ??
            (Number(row.price || 0) * Number(row.qty || 0))
          ) || 0;

        return sum + total;

      },
      0
    );


  // ===================================================
  // MONTH CASH
  // ===================================================

  const monthCash =
    monthSalesRows
      .filter(
        row =>
          String(
            row.payment_status ||
            row.status ||
            ""
          ).toUpperCase() ===
          "PAID" ||
          String(
            row.status ||
            ""
          ) === "จ่าย"
      )
      .reduce(
        (sum,row) => {

          const total =
            Number(
              row.total ??
              row.grand_total ??
              row.amount ??
              (Number(row.price || 0) * Number(row.qty || 0))
            ) || 0;

          return sum + total;

        },
        0
      );


  // ===================================================
  // รายจ่ายประจำวันนี้
  // CASH_EXPENSE เท่านั้น
  // ===================================================

  const todayRegularExpenses =
    expenseRows.filter(
      item => {

        const expenseType =
          String(
            item.expense_type ||
            ""
          ).toUpperCase();


        if(
          expenseType !==
          "CASH_EXPENSE"
        ){

          return false;

        }


        const expenseDate =
          String(
            item.expense_date ||
            ""
          ).substring(
            0,
            10
          );


        if(
          expenseDate !==
          today
        ){

          return false;

        }

        // รายจ่ายที่เกิดก่อนปิดยอดวันนี้
        // อยู่ในยอดที่ปิดไปแล้ว ไม่เอามารอบใหม่
        if(dailyClosedAt){

          // expense_date เป็นวันที่อย่างเดียว
          // จึงถือว่ารายจ่ายของวันที่ปิดแล้วจบที่รอบนั้น
          return false;

        }

        return true;

      }
    );


  // ===================================================
  // รวมรายจ่ายประจำวันนี้
  // ===================================================

  const todayRegularExpenseTotal =
    todayRegularExpenses.reduce(
      (sum,item) =>
        sum +
        Number(
          item.amount || 0
        ),
      0
    );


  // ===================================================
  // รายจ่ายสะสมของ "รอบนี้"
  // ===================================================
  // รอบเงินเริ่มจาก currentCashRound.started_at
  // ดังนั้นรายจ่ายต้องนับตั้งแต่เวลาเริ่มรอบเหมือนกัน
  // ไม่ใช้ dailyClosedAt เป็นตัวตัดรอบ
  //
  // เมื่อกด "เริ่มรอบใหม่" started_at จะเปลี่ยนเป็นเวลาใหม่
  // รายจ่ายของรอบเก่าจึงไม่ติดมารอบใหม่
  // ===================================================

  const roundRegularExpenses =
    expenseRows.filter(
      item => {

        const expenseType =
          String(
            item.expense_type ||
            ""
          ).toUpperCase();

        if(
          expenseType !==
          "CASH_EXPENSE"
        ){
          return false;
        }

        // -----------------------------------------------
        // เวลาเกิดรายจ่าย
        // ใช้ created_at เป็นหลัก
        // fallback เป็น updated_at
        // -----------------------------------------------
        const expenseCreatedAt =
          item.created_at ||
          item.updated_at ||
          null;

        // -----------------------------------------------
        // มีรอบปัจจุบัน
        // เอาเฉพาะรายจ่ายตั้งแต่เริ่มรอบ
        // -----------------------------------------------
        if(
          roundStartAt &&
          !isNaN(
            roundStartAt.getTime()
          )
        ){

          if(
            !expenseCreatedAt
          ){
            return false;
          }

          const expenseDate =
            new Date(
              expenseCreatedAt
            );

          if(
            isNaN(
              expenseDate.getTime()
            )
          ){
            return false;
          }

          return (
            expenseDate.getTime() >=
            roundStartAt.getTime()
          );

        }

        // -----------------------------------------------
        // ยังไม่มีรอบ
        // fallback ใช้รายจ่ายของวันทำการปัจจุบัน
        // -----------------------------------------------
        const expenseDate =
          String(
            item.expense_date ||
            ""
          ).substring(
            0,
            10
          );

        return (
          expenseDate ===
          String(today).substring(
            0,
            10
          )
        );

      }
    );


  // ===================================================
  // รวมรายจ่ายสะสมของรอบนี้
  // ===================================================

  const roundExpenseTotal =
    roundRegularExpenses.reduce(
      (sum,item) =>
        sum +
        Number(
          item.amount || 0
        ),
      0
    );


  // ===================================================
  // เงินสุทธิรอบนี้
  // ===================================================
  // รับเงินจริงรอบนี้ - รายจ่ายสะสมรอบนี้
  // ตัวอย่าง 138 - 40 = 98 บาท
  // ใช้สำหรับการ์ด "เงินสุทธิรอบนี้" เท่านั้น
  // ===================================================

  const netCash =
    monthCash -
    roundExpenseTotal;


  // ===================================================
  // เงินสุทธิที่ต้องส่งวันนี้
  // ===================================================
  // ตัวนี้เป็นของ "แต่ละวัน" ไม่ใช่ของรอบ
  // เมื่อปิดยอดแล้ว todayCash / todayRegularExpenseTotal
  // จะถูกตัดเป็น 0 ตามวันใหม่ ดังนั้นช่องนี้ต้องรีเซตเป็น 0
  // ไม่ใช้ netCash ซึ่งเป็นยอดสะสมของรอบ
  // ===================================================

  const dailyNetCash =
    cashDisplayTotal -
    todayRegularExpenseTotal;


  // ===================================================
  // ALL PENDING BILLS
  // ใช้ SALES จาก DATABASE เป็นแหล่งข้อมูลหลัก
  // + ORDERS จากหน้าโต๊ะที่ยัง UNPAID
  // แสดงเฉพาะรายการที่ยังไม่รับชำระทั้งหมด
  // ===================================================

  const allPendingBillMap = new Map();

  // ---------------------------------------------------
  // SALES / บิลค้างจ่าย
  // ---------------------------------------------------
  salesRows
    .filter(
      row =>
        String(
          row?.payment_status ||
          ""
        ).toUpperCase() ===
        "UNPAID"
    )
    .forEach(
      row => {

        const billId =
          String(
            row?.remark ||
            row?.bill_id ||
            row?.id ||
            ""
          ).trim();

        if(!billId){
          return;
        }

        if(!allPendingBillMap.has(billId)){
          allPendingBillMap.set(
            billId,
            {
              billId,
              source:"SALES",
              tableNo:null,
              total:0,
              qty:0,
              createdAt:
                row?.sold_at ||
                row?.created_at ||
                null,
              customerName:
                String(
                  row?.customer_name ||
                  ""
                ).trim()
            }
          );
        }

        const bill =
          allPendingBillMap.get(billId);

        bill.total +=
          Number(row?.total || 0);

        bill.qty +=
          Number(row?.qty || 0);

        if(
          !bill.customerName &&
          row?.customer_name
        ){
          bill.customerName =
            String(
              row.customer_name
            ).trim();
        }

        if(
          row?.sold_at ||
          row?.created_at
        ){
          const rowDate =
            new Date(
              row.sold_at ||
              row.created_at
            );

          const billDate =
            bill.createdAt
              ? new Date(
                  bill.createdAt
                )
              : null;

          if(
            !billDate ||
            isNaN(billDate.getTime()) ||
            (
              !isNaN(rowDate.getTime()) &&
              rowDate.getTime() <
                billDate.getTime()
            )
          ){
            bill.createdAt =
              row.sold_at ||
              row.created_at;
          }
        }
      }
    );


  // ---------------------------------------------------
  // ORDERS / หน้าโต๊ะที่ยังไม่ได้รับชำระ
  // รวมรายการของโต๊ะเดียวกันเป็น 1 รายการ
  // ---------------------------------------------------
  orderRows
    .filter(
      row =>
        String(
          row?.payment_status ||
          ""
        ).toUpperCase() ===
        "UNPAID"
    )
    .forEach(
      row => {

        const tableNo =
          String(
            row?.table_no ??
            ""
          ).trim();

        if(!tableNo){
          return;
        }

        const tableKey =
          `TABLE:${tableNo}`;

        if(!allPendingBillMap.has(tableKey)){
          allPendingBillMap.set(
            tableKey,
            {
              billId:tableKey,
              source:"ORDERS",
              tableNo,
              total:0,
              qty:0,
              createdAt:
                row?.ordered_at ||
                row?.created_at ||
                null,
              customerName:""
            }
          );
        }

        const tablePending =
          allPendingBillMap.get(tableKey);

        tablePending.total +=
          Number(row?.total || 0);

        tablePending.qty +=
          Number(row?.qty || 0);

        if(
          row?.ordered_at ||
          row?.created_at
        ){
          const rowDate =
            new Date(
              row.ordered_at ||
              row.created_at
            );

          const tableDate =
            tablePending.createdAt
              ? new Date(
                  tablePending.createdAt
                )
              : null;

          if(
            !tableDate ||
            isNaN(tableDate.getTime()) ||
            (
              !isNaN(rowDate.getTime()) &&
              rowDate.getTime() <
                tableDate.getTime()
            )
          ){
            tablePending.createdAt =
              row.ordered_at ||
              row.created_at;
          }
        }
      }
    );


  const allPendingBills =
    Array.from(
      allPendingBillMap.values()
    ).sort(
      (a,b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

  // ===================================================
  // FORMAT MONEY
  // ===================================================

  const money =
    value =>
      Number(
        value || 0
      ).toLocaleString(
        "th-TH"
      );


  // ===================================================
  // RETURN HTML
  // ===================================================

  return `

    <style>

      /* =================================================
         SALES PAGE
         ================================================= */

      .pos-sales-page{

        width:100%;

      }


      /* =================================================
         SUMMARY GRID
         ================================================= */

      .pos-sales-summary{

        display:grid;

        grid-template-columns:
          repeat(2,1fr);

        gap:20px;

        margin-top:25px;

        margin-bottom:25px;

      }


      /* =================================================
         SUMMARY CARD
         ================================================= */

      .pos-sales-summary-card{

        background:#ffffff;

        border-radius:22px;

        padding:28px 30px;

        box-shadow:
          0 8px 25px
          rgba(0,0,0,0.05);

        border:
          1px solid
          #f1f5f9;

      }


      .pos-sales-summary-card.today{

        border-top:
          5px solid
          #22c55e;

      }


      .pos-sales-summary-card.month{

        border-top:
          5px solid
          #3b82f6;

      }


      .pos-sales-summary-card.cash-today{

        border-top:
          5px solid
          #10b981;

      }


      .pos-sales-summary-card.cash-month{

        border-top:
          5px solid
          #8b5cf6;

      }


      .pos-sales-summary-label{

        font-size:21px;

        font-weight:800;

        color:#475569;

        display:flex;

        align-items:center;

        gap:10px;

      }


      .pos-sales-summary-value{

        margin-top:12px;

        font-size:40px;

        font-weight:900;

        line-height:1.1;

      }


      .pos-sales-summary-card.today
      .pos-sales-summary-value{

        color:#009b63;

      }


      .pos-sales-summary-card.month
      .pos-sales-summary-value{

        color:#2563eb;

      }


      .pos-sales-summary-card.cash-today
      .pos-sales-summary-value{

        color:#009b63;

      }


      .pos-sales-summary-card.cash-month
      .pos-sales-summary-value{

        color:#7c3aed;

      }


      .pos-sales-summary-sub{

        margin-top:8px;

        font-size:15px;

        color:#94a3b8;

        font-weight:600;

      }


      /* =================================================
         CLOSE SUMMARY
         ================================================= */

      .pos-sales-close-panel{

        background:
          linear-gradient(
            135deg,
            #ffffff,
            #f8fffb
          );

        border-radius:24px;

        padding:30px;

        margin-bottom:25px;

        box-shadow:
          0 8px 25px
          rgba(0,0,0,0.05);

        border:
          2px solid
          #d1fae5;

      }


      .pos-sales-close-title{

        font-size:25px;

        font-weight:900;

        color:#1e293b;

        margin-bottom:22px;

      }


         .pos-sales-close-head{

  display:grid;

  grid-template-columns:1fr auto auto;

  align-items:center;

  gap:10px;

  margin-bottom:22px;

}


      .pos-sales-round-button{

        border:none;

        border-radius:14px;

        padding:13px 20px;

        background:#e0f7ec;

        color:#009b63;

        font-size:16px;

        font-weight:800;

        cursor:pointer;

        transition:0.2s;

        white-space:nowrap;

      }


      .pos-sales-round-button:hover{

        background:#c8f1df;

      }


      .pos-sales-round-button:disabled{

        opacity:0.6;

        cursor:not-allowed;

      }


      .pos-sales-close-row{

        display:flex;

        align-items:center;

        justify-content:space-between;

        padding:14px 0;

        border-bottom:
          1px solid
          #e2e8f0;

      }


      .pos-sales-close-row:last-of-type{

        border-bottom:none;

      }


      .pos-sales-close-label{

        font-size:19px;

        font-weight:700;

        color:#475569;

      }


      .pos-sales-close-value{

        font-size:22px;

        font-weight:900;

        color:#1e293b;

      }


      .pos-sales-close-expense{

        color:#c45a00;

      }


      .pos-sales-close-net{

        margin-top:20px;

        padding:22px 24px;

        border-radius:18px;

        background:#dff7eb;

        display:flex;

        align-items:center;

        justify-content:space-between;

      }


      .pos-sales-close-net-label{

        font-size:21px;

        font-weight:900;

        color:#14532d;

      }


      .pos-sales-close-net-value{

        font-size:36px;

        font-weight:900;

        color:#009b63;

      }


      /* =================================================
         LIST
         ================================================= */

      .pos-sales-list{

        background:#ffffff;

        border-radius:22px;

        padding:
          10px 25px;

        box-shadow:
          0 8px 25px
          rgba(0,0,0,0.04);

      }


      .pos-sales-list-title{

        font-size:24px;

        font-weight:900;

        color:#1e293b;

        padding:
          20px 0;

      }


      .pos-sales-row{

        display:flex;

        align-items:center;

        justify-content:
          space-between;

        padding:
          18px 0;

        border-bottom:
          1px solid
          #e2e8f0;

      }


      .pos-sales-row:last-child{

        border-bottom:none;

      }


      .pos-sales-row-left{

        display:flex;

        flex-direction:column;

        gap:5px;

      }


      .pos-sales-row-name{

        font-size:18px;

        font-weight:800;

        color:#1e293b;

      }


      .pos-sales-row-info{

        font-size:14px;

        color:#94a3b8;

      }


      .pos-sales-row-right{

        text-align:right;

      }


      .pos-sales-row-money{

        font-size:20px;

        font-weight:900;

      }


      .pos-sales-status{

        margin-top:5px;

        font-size:14px;

        font-weight:700;

      }


      .pos-sales-status.paid{

        color:#16a34a;

      }


      .pos-sales-status.unpaid{

        color:#d97706;

      }


      /* =================================================
         EMPTY
         ================================================= */

      .pos-sales-empty{

        text-align:center;

        padding:
          45px 20px;

        color:#94a3b8;

        font-size:18px;

      }


      /* =================================================
         MOBILE
         ================================================= */

      @media(max-width:700px){

        .pos-sales-summary{

          grid-template-columns:
            1fr;

        }


        .pos-sales-close-net{

          flex-direction:column;

          align-items:flex-start;

          gap:8px;

        }


        .pos-sales-close-value{

          font-size:30px;

        }

      }



      /* =================================================
         SALES TABS
         ================================================= */

      .pos-sales-tabs{
        display:flex;
        gap:10px;
        margin-top:22px;
        margin-bottom:22px;
        padding:6px;
        background:#f1f5f9;
        border-radius:16px;
        width:fit-content;
      }

      .pos-sales-tab{
        border:none;
        border-radius:12px;
        padding:12px 22px;
        background:transparent;
        color:#64748b;
        font-family:inherit;
        font-size:16px;
        font-weight:800;
        cursor:pointer;
        transition:.2s;
      }

      .pos-sales-tab:hover{
        background:#e2e8f0;
        color:#334155;
      }

      .pos-sales-tab.active{
        background:#ffffff;
        color:#2563eb;
        box-shadow:0 4px 12px rgba(15,23,42,.08);
      }

      .pos-sales-tab-panel{
        width:100%;
      }

      .pos-sales-history{
        background:#ffffff;
        border-radius:22px;
        padding:10px 25px 25px;
        box-shadow:0 8px 25px rgba(0,0,0,.04);
      }

      .pos-sales-history-title{
        font-size:24px;
        font-weight:900;
        color:#1e293b;
        padding:20px 0 15px;
      }

      /* =====================================================
         HISTORY ROUND FILTER
         ===================================================== */

      .pos-sales-history-filter{
        display:flex;
        gap:10px;
        margin:0 0 20px;
        padding:6px;
        width:fit-content;
        background:#f1f5f9;
        border-radius:16px;
      }

      .pos-sales-history-filter-btn{
        border:none;
        border-radius:12px;
        padding:11px 20px;
        background:transparent;
        color:#64748b;
        font-family:inherit;
        font-size:15px;
        font-weight:800;
        cursor:pointer;
        transition:.2s;
        white-space:nowrap;
      }

      .pos-sales-history-filter-btn:hover{
        background:#e2e8f0;
        color:#334155;
      }

      .pos-sales-history-filter-btn.active{
        background:#ffffff;
        color:#2563eb;
        box-shadow:0 4px 12px rgba(15,23,42,.08);
      }

      .pos-sales-history-round-info{
        margin:-6px 0 18px;
        color:#94a3b8;
        font-size:14px;
        font-weight:600;
      }

      @media(max-width:700px){
        .pos-sales-history-filter{
          width:100%;
        }

        .pos-sales-history-filter-btn{
          flex:1;
          padding:11px 10px;
          font-size:14px;
        }
      }

      .pos-sales-history-table-wrap{
        width:100%;
        overflow-x:auto;
        -webkit-overflow-scrolling:touch;
      }

      .pos-sales-history-table{
        width:100%;
        min-width:900px;
        border-collapse:collapse;
      }

      .pos-sales-history-table th{
        padding:14px 12px;
        background:#f8fafc;
        color:#475569;
        font-size:14px;
        font-weight:800;
        text-align:left;
        white-space:nowrap;
        border-bottom:1px solid #e2e8f0;
      }

      .pos-sales-history-table td{
        padding:15px 12px;
        color:#334155;
        font-size:15px;
        font-weight:600;
        border-bottom:1px solid #e2e8f0;
        white-space:nowrap;
      }

      .pos-sales-history-table tr:last-child td{
        border-bottom:none;
      }

      .pos-sales-history-money{
        text-align:right;
        font-weight:900;
      }

      .pos-sales-history-difference{
        font-weight:900;
      }

      .pos-sales-history-difference.over{color:#ea580c;}
      .pos-sales-history-difference.short{color:#dc2626;}
      .pos-sales-history-difference.equal{color:#16a34a;}

      /* =====================================================
         ALL PENDING BILLS
         ===================================================== */

      .pos-sales-pending-summary{
        margin:0 0 10px;
        color:#d97706;
        font-size:15px;
        font-weight:800;
      }

      .pos-sales-pending-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
        padding:17px 0;
        border-bottom:1px solid #e2e8f0;
      }

      .pos-sales-pending-row:last-child{
        border-bottom:none;
      }

      .pos-sales-pending-left{
        min-width:0;
      }

      .pos-sales-pending-bill{
        font-size:18px;
        font-weight:900;
        color:#1e293b;
      }

      .pos-sales-pending-info{
        margin-top:5px;
        font-size:14px;
        color:#94a3b8;
        font-weight:600;
      }

      .pos-sales-pending-right{
        flex-shrink:0;
        text-align:right;
      }

      .pos-sales-pending-money{
        font-size:20px;
        font-weight:900;
        color:#d97706;
      }

      @media(max-width:700px){
        .pos-sales-pending-row{
          align-items:flex-start;
          flex-direction:column;
          gap:8px;
        }

        .pos-sales-pending-right{
          width:100%;
          text-align:left;
        }
      }

      .pos-sales-history-empty,
      .pos-sales-history-loading{
        text-align:center;
        padding:45px 20px;
        color:#94a3b8;
        font-size:18px;
        font-weight:700;
      }

      @media(max-width:700px){
        .pos-sales-tabs{width:100%;}
        .pos-sales-tab{flex:1;padding:11px 12px;font-size:14px;}
        .pos-sales-history{padding-left:15px;padding-right:15px;}
      }


      /* =====================================================
          DAILY CLOSING SUMMARY CARDS
          ===================================================== */

        .pos-sales-closing-summary{
          width:100%;
          display:grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap:14px;
          margin:0 0 18px;
        }

        .pos-sales-closing-card{
          background:#ffffff;
          border-radius:14px;
          padding:14px 20px;
          min-height:82px;
          box-sizing:border-box;
          box-shadow:
            0 4px 14px rgba(0,0,0,.06);
          border-top:3px solid;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
        }


        /* =====================================================
          เงินขาดสะสม
          ===================================================== */

        .pos-sales-closing-card.short{
          border-top-color:#ef4444;
        }

        .pos-sales-closing-card.short
        .pos-sales-closing-card-value{
          color:#dc2626;
        }


        /* =====================================================
          เงินเกินสะสม
          ===================================================== */

        .pos-sales-closing-card.over{
          border-top-color:#f59e0b;
        }

        .pos-sales-closing-card.over
        .pos-sales-closing-card-value{
          color:#ea580c;
        }


        /* =====================================================
          ส่วนต่างสุทธิ
          ===================================================== */

        /* ติดลบ = แดง */

        .pos-sales-closing-card.net.short{
          border-top-color:#ef4444;
        }

        .pos-sales-closing-card.net.short
        .pos-sales-closing-card-value{
          color:#dc2626;
        }


        /* มากกว่า 0 = ส้ม */

        .pos-sales-closing-card.net.over{
          border-top-color:#f59e0b;
        }

        .pos-sales-closing-card.net.over
        .pos-sales-closing-card-value{
          color:#ea580c;
        }


        /* เท่ากับ 0 = เขียว */

        .pos-sales-closing-card.net.equal{
          border-top-color:#22c55e;
        }

        .pos-sales-closing-card.net.equal
        .pos-sales-closing-card-value{
          color:#16a34a;
        }


        /* =====================================================
          DOT
          ===================================================== */

        .pos-sales-closing-dot{
          width:13px;
          height:13px;
          border-radius:50%;
          display:inline-block;
        }

        .pos-sales-closing-dot.short{
          background:#ef4444;
        }

        .pos-sales-closing-dot.over{
          background:#f97316;
        }

        .pos-sales-closing-dot.equal{
          background:#4ade80;
        }


        /* =====================================================
          TITLE / VALUE
          ===================================================== */

        .pos-sales-closing-card-title{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:7px;
          font-size:14px;
          font-weight:800;
          color:#334155;
          margin-bottom:5px;
        }

        .pos-sales-closing-card-value{
          font-size:20px;
          line-height:1.1;
          font-weight:900;
        }


        /* =====================================================
          MOBILE
          ===================================================== */

        @media(max-width:900px){

          .pos-sales-closing-summary{
            grid-template-columns:1fr;
          }

        }



    </style>


    <!-- =================================================
         PAGE
         ================================================= -->

    <div
      class="pos-sales-page"
    >


      <!-- =================================================
           TITLE
           ================================================= -->

      <h1 class="page-title">
        ยอดขาย
      </h1>


      <p class="page-subtitle">
        สรุปยอดขายและเงินที่ได้รับ
      </p>


      <!-- =================================================
           SALES TABS
           ================================================= -->

      <div class="pos-sales-tabs" role="tablist">

        <button
          type="button"
          id="posSalesTabButton"
          class="pos-sales-tab active"
          onclick="POS.salesTab('sales')"
        >
          📊 ยอดขาย
        </button>

        <button
          type="button"
          id="posHistoryTabButton"
          class="pos-sales-tab"
          onclick="POS.salesTab('history')"
        >
          🧾 ประวัติปิดยอด
        </button>

        <button
          type="button"
          id="posPendingTabButton"
          class="pos-sales-tab"
          onclick="POS.salesTab('pending')"
        >
          🟡 ค้างจ่ายทั้งหมด
        </button>

      </div>


      <!-- =================================================
           SUMMARY 4 CARDS
           ================================================= -->

      <div
        id="posSalesMainSummary"
        class="pos-sales-summary"
      >


        <!-- ===============================================
             ยอดขายวันนี้
             =============================================== -->

        <div
          class="
            pos-sales-summary-card
            today
          "
        >

          <div
            class="
              pos-sales-summary-label
            "
          >
            🛒 ยอดขายวันนี้
          </div>


          <div
            class="
              pos-sales-summary-value
            "
          >
            ${money(
              todaySales
            )}
            บาท
          </div>


          <div
            class="
              pos-sales-summary-sub
            "
          >
            ${allRows.length}
            รายการ
          </div>

        </div>


        <!-- ===============================================
             ยอดขายรอบนี้
             =============================================== -->

        <div
          class="
            pos-sales-summary-card
            month
          "
        >

          <div
            class="
              pos-sales-summary-label
            "
          >
            📊 ยอดขายรอบนี้
          </div>


          <div
            class="
              pos-sales-summary-value
            "
          >
            ${money(
              monthSales
            )}
            บาท
          </div>


          <div
            class="
              pos-sales-summary-sub
            "
          >
            ${
              currentCashRound?.started_at

                ? "วันที่เริ่มรอบนี้ " +
                  new Date(
                    currentCashRound.started_at
                  ).toLocaleString(
                    "th-TH",
                    {
                      timeZone:
                        "Asia/Bangkok",

                      day:
                        "2-digit",

                      month:
                        "2-digit",

                      year:
                        "numeric",

                      hour:
                        "2-digit",

                      minute:
                        "2-digit",

                      hour12:
                        false
                    }
                  ) +
                  " น."

                : "ยังไม่มีรอบ"
            }
          </div>

        </div>


        <!-- ===============================================
             รับเงินจริงวันนี้
             =============================================== -->

        <div
          class="
            pos-sales-summary-card
            cash-today
          "
        >

          <div
            class="
              pos-sales-summary-label
            "
          >
            💵 รับเงินจริงวันนี้
          </div>


          <div
            class="
              pos-sales-summary-value
            "
          >
            ${money(
            cashDisplayTotal
          )}
          บาท
          </div>


          <div
            class="
              pos-sales-summary-sub
            "
          >
            ${
              cashDisplayCount
            }
            รายการที่ชำระแล้ว
          </div>

        </div>


        <!-- ===============================================
             รับเงินจริงรอบนี้
             =============================================== -->

        <div
          class="
            pos-sales-summary-card
            cash-month
          "
        >

          <div
            class="
              pos-sales-summary-label
            "
          >
            💰 เงินสุทธิรอบนี้
          </div>


          <div
            class="
              pos-sales-summary-value
            "
          >
            ${money(
              netCash
            )}
            บาท
          </div>


                   <div
            class="
              pos-sales-summary-sub
            "
          >
            ${
              currentCashRound?.started_at

                ? "วันที่เริ่มรอบนี้ " +
                  new Date(
                    currentCashRound.started_at
                  ).toLocaleString(
                    "th-TH",
                    {
                      timeZone:
                        "Asia/Bangkok",

                      day:
                        "2-digit",

                      month:
                        "2-digit",

                      year:
                        "numeric",

                      hour:
                        "2-digit",

                      minute:
                        "2-digit",

                      hour12:
                        false
                    }
                  ) +
                  " น."

                : "ยังไม่มีรอบ"
            }
          </div>

        </div>

        </div>


      </div>


      <!-- =================================================
           สรุปปิดยอด
           ================================================= -->

      <div
        id="posSalesClosePanel"
        class="
          pos-sales-close-panel
        "
      >


                <div
          class="
            pos-sales-close-head
          "
        >

          <div
            class="
              pos-sales-close-title
            "
          >
            🧾 สรุปปิดยอดวันนี้
          </div>

          ${
            dailyClosedAt

              ? `
                <button
                  type="button"
                  class="
                    pos-sales-round-button
                  "
                  disabled
                  style="
                    opacity:.55;
                    cursor:not-allowed;
                  "
                >
                  ✅ ปิดยอดวันนี้แล้ว
                </button>
              `

              : businessDateIsFuture

                ? `
                  <button
                    type="button"
                    class="
                      pos-sales-round-button
                    "
                    disabled
                    style="
                      opacity:.55;
                      cursor:not-allowed;
                    "
                    title="วันทำการเกินวันที่จริง"
                  >
                    🚫 ปิดยอดไม่ได้
                  </button>
                `

                : `
                  <button
                    type="button"
                    class="
                      pos-sales-round-button
                    "
                    onclick="POS.openDailyClosingModal({
                      businessDate: '${today}',
                      salesTotal: ${todaySales},
                      cashReceived: ${cashDisplayTotal},
                      regularExpense: ${todayRegularExpenseTotal}
                    })" 
                  >
                    🔒 ปิดยอดวันนี้
                  </button>
                `
          }


          <button
            type="button"
            class="
              pos-sales-round-button
            "
            id="posStartNewRoundButton"
            onclick="POS.startNewCashRound()"
          >
            🔄 เริ่มรอบใหม่
          </button>

        </div>


        <!-- ===============================================
             รับเงินจริง
             =============================================== -->

        <div
          class="
            pos-sales-close-row
          "
        >

          <div
            class="
              pos-sales-close-label
            "
          >
            💵 รับเงินจริงวันนี้
          </div>


          <div
            class="
              pos-sales-close-value
            "
          >
            ${money(
              cashDisplayTotal
            )}
            บาท
          </div>

        </div>


        <!-- ===============================================
             รายจ่ายประจำ
             =============================================== -->

        <div
          class="
            pos-sales-close-row
          "
        >

          <div
            class="
              pos-sales-close-label
            "
          >
            💸 หักรายจ่ายประจำวันนี้
          </div>


          <div
            class="
              pos-sales-close-value
              pos-sales-close-expense
            "
          >
            − ${money(
              todayRegularExpenseTotal
            )}
            บาท
          </div>

        </div>


        <!-- ===============================================
             NET CASH
             =============================================== -->

        <div
          class="
            pos-sales-close-net
          "
        >

          <div
            class="
              pos-sales-close-net-label
            "
          >
            💰 เงินสุทธิที่ต้องส่ง
          </div>


          <div
            class="
              pos-sales-close-net-value
            "
          >
            ${money(
              dailyNetCash
            )}
            บาท
          </div>

        </div>


      </div>


      <!-- =================================================
           LIST
           ================================================= -->

      <div
        id="posSalesListPanel"
        class="
          pos-sales-list
        "
      >


        <div
          class="
            pos-sales-list-title
          "
        >
          📋 รายการขายวันนี้
        </div>


        ${
          allRows.length

          ?

          allRows
            .sort(
              (a,b) =>
                new Date(
                  b.date || 0
                ) -
                new Date(
                  a.date || 0
                )
            )
            .map(
              row => {

                const paid =
                  String(
                    row.payment_status ||
                    ""
                  ).toUpperCase() ===
                  "PAID";


                const sourceText =
                  row.source ===
                  "ORDERS"

                    ? `🪑 โต๊ะ ${
                        row.table_no ||
                        ""
                      }`

                    : "🛒 ขายสินค้า";


                return `

                  <div
                    class="
                      pos-sales-row
                    "
                  >

                    <div
                      class="
                        pos-sales-row-left
                      "
                    >

                      <div
                        class="
                          pos-sales-row-name
                        "
                      >
                        ${sourceText}
                      </div>


                      <div
                        class="
                          pos-sales-row-info
                        "
                      >
                        ${
                          row.date
                            ? new Date(
                                row.date
                              ).toLocaleString(
                                "th-TH",
                                {
                                  timeZone:
                                    "Asia/Bangkok",

                                  day:
                                    "2-digit",

                                  month:
                                    "2-digit",

                                  year:
                                    "numeric",

                                  hour:
                                    "2-digit",

                                  minute:
                                    "2-digit"
                                }
                              )
                            : ""
                        }
                      </div>

                    </div>


                    <div
                      class="
                        pos-sales-row-right
                      "
                    >

                      <div
                        class="
                          pos-sales-row-money
                        "
                      >
                        ${money(
                          row.total
                        )}
                        บาท
                      </div>


                      <div
                        class="
                          pos-sales-status
                          ${
                            paid
                              ? "paid"
                              : "unpaid"
                          }
                        "
                      >
                        ${
                          paid
                            ? "🟢 ชำระแล้ว"
                            : "🟡 ค้างจ่าย"
                        }
                      </div>

                    </div>

                  </div>

                `;

              }
            )
            .join("")

          :

          `

            <div
              class="
                pos-sales-empty
              "
            >
              วันนี้ยังไม่มีรายการขาย
            </div>

          `
        }


      </div>


      <!-- =================================================
           DAILY CLOSING HISTORY
           ================================================= -->

      <div
        id="posSalesHistoryPanel"
        class="pos-sales-tab-panel"
        style="display:none;"
      >

        <div class="pos-sales-history">

          <div class="pos-sales-history-title">
            🧾 ประวัติปิดยอด
          </div>

          <div
            class="pos-sales-history-filter"
            role="tablist"
            aria-label="ตัวกรองประวัติปิดยอด"
          >

            <button
              type="button"
              id="posClosingCurrentButton"
              class="pos-sales-history-filter-btn active"
              onclick="POS.loadDailyClosingHistory('current')"
            >
              🔵 รอบปัจจุบัน
            </button>

            <button
              type="button"
              id="posClosingAllButton"
              class="pos-sales-history-filter-btn"
              onclick="POS.loadDailyClosingHistory('all')"
            >
              📋 ดูทั้งหมด
            </button>

          </div>

          <div
            id="posSalesHistoryContent"
            class="pos-sales-history-loading"
          >
            กำลังโหลดประวัติปิดยอด...
          </div>

        </div>

      </div>

      <!-- =================================================
           ALL PENDING BILLS
           ================================================= -->

      <div
        id="posSalesPendingPanel"
        class="pos-sales-tab-panel"
        style="display:none;"
      >

        <div class="pos-sales-history">

          <div class="pos-sales-history-title">
            🟡 บิลค้างจ่ายทั้งหมด
          </div>

          <div class="pos-sales-pending-summary">
            ค้างจ่าย ${allPendingBills.length} บิล
          </div>

          ${
            allPendingBills.length
              ? allPendingBills.map(
                  bill => `
                    <div class="pos-sales-pending-row">

                      <div class="pos-sales-pending-left">
                        <div class="pos-sales-pending-bill">
                          ${
                            bill.source === "ORDERS"
                              ? `🪑 โต๊ะ ${bill.tableNo}`
                              : `🧾 ${bill.billId}`
                          }
                        </div>

                        <div class="pos-sales-pending-info">
                          ${
                            bill.customerName
                              ? `👤 ${bill.customerName} • `
                              : ""
                          }
                          ${bill.source === "ORDERS" ? "หน้าโต๊ะ • " : ""}
                          ${bill.qty} รายการ •
                          ${
                            bill.createdAt
                              ? new Date(
                                  bill.createdAt
                                ).toLocaleString(
                                  "th-TH",
                                  {
                                    timeZone:"Asia/Bangkok",
                                    day:"2-digit",
                                    month:"2-digit",
                                    year:"numeric",
                                    hour:"2-digit",
                                    minute:"2-digit"
                                  }
                                )
                              : ""
                          }
                        </div>
                      </div>

                      <div class="pos-sales-pending-right">
                        <div class="pos-sales-pending-money">
                          ${money(bill.total)} บาท
                        </div>
                        <div class="pos-sales-status unpaid">
                          🟡 ค้างจ่าย
                        </div>
                      </div>

                    </div>
                  `
                ).join("")
              : `
                  <div class="pos-sales-empty">
                    ไม่มีบิลค้างจ่าย
                  </div>
                `
          }

        </div>

      </div>


    </div>

  `;

};

// =====================================================
// SALES TABS
// =====================================================

window.POS = window.POS || {};

POS.salesTab = async function(tab){

  const summary = document.getElementById("posSalesMainSummary");
  const closePanel = document.getElementById("posSalesClosePanel");
  const listPanel = document.getElementById("posSalesListPanel");
  const historyPanel = document.getElementById("posSalesHistoryPanel");
  const salesButton = document.getElementById("posSalesTabButton");
  const historyButton = document.getElementById("posHistoryTabButton");
  const pendingPanel = document.getElementById("posSalesPendingPanel");
  const pendingButton = document.getElementById("posPendingTabButton");

  if(!summary || !closePanel || !listPanel || !historyPanel || !pendingPanel) return;

  if(tab === "history"){
    summary.style.display = "none";
    closePanel.style.display = "none";
    listPanel.style.display = "none";
    historyPanel.style.display = "block";
    pendingPanel.style.display = "none";

    salesButton?.classList.remove("active");
    historyButton?.classList.add("active");
    pendingButton?.classList.remove("active");

    await POS.loadDailyClosingHistory();
    return;
  }

  if(tab === "pending"){
    summary.style.display = "none";
    closePanel.style.display = "none";
    listPanel.style.display = "none";
    historyPanel.style.display = "none";
    pendingPanel.style.display = "block";

    salesButton?.classList.remove("active");
    historyButton?.classList.remove("active");
    pendingButton?.classList.add("active");
    return;
  }

  summary.style.display = "grid";
  closePanel.style.display = "block";
  listPanel.style.display = "block";
  historyPanel.style.display = "none";
  pendingPanel.style.display = "none";

  historyButton?.classList.remove("active");
  pendingButton?.classList.remove("active");
  salesButton?.classList.add("active");

};

// =====================================================
// LOAD DAILY CLOSING HISTORY
// =====================================================

POS.loadDailyClosingHistory = async function(mode = "current"){

  const content =
    document.getElementById(
      "posSalesHistoryContent"
    );

  if(!content){
    return;
  }

  const currentButton =
    document.getElementById(
      "posClosingCurrentButton"
    );

  const allButton =
    document.getElementById(
      "posClosingAllButton"
    );

  const currentMode =
    mode === "all"
      ? "all"
      : "current";

  currentButton?.classList.toggle(
    "active",
    currentMode === "current"
  );

  allButton?.classList.toggle(
    "active",
    currentMode === "all"
  );

  content.className =
    "pos-sales-history-loading";

  content.innerHTML =
    "กำลังโหลดประวัติปิดยอด...";


  try{
    // =================================================
    // ใช้ SYSTEM API
    // ห้ามอ่าน daily_closings / users ตรงจาก Frontend
    // =================================================

    const result =
      await POS.api.call(
        POS_CONFIG.FUNCTION_NAMES.SYSTEM,
        {
          method:"POST",
          body:{
            action:
              "GET_DAILY_CLOSING_HISTORY"
          }
        }
      );


    if(
      !result ||
      result.success !== true
    ){

      throw new Error(
        result?.error ||
        "โหลดประวัติปิดยอดไม่สำเร็จ"
      );

    }


    let rows =
      Array.isArray(
        result.closings
      )
        ? result.closings
        : [];


    // =================================================
    // รอบปัจจุบัน
    // ใช้ started_at ของ CASH ROUND เป็นตัวแบ่งรอบ
    // ไม่แตะข้อมูล / ไม่เปลี่ยนระบบปิดยอด
    // =================================================

    let currentCashRound = null;

    if(currentMode === "current"){

      try{

        const roundResult =
          await POS.api.cashRoundCurrent();

        if(roundResult){

          if(
            roundResult.success === true &&
            roundResult.round
          ){

            currentCashRound =
              roundResult.round;

          }
          else if(
            roundResult.round_no !== undefined &&
            roundResult.started_at
          ){

            currentCashRound =
              roundResult;

          }
          else if(
            roundResult.data &&
            roundResult.data.round_no !== undefined
          ){

            currentCashRound =
              roundResult.data;

          }

        }

      }catch(roundError){

        console.warn(
          "LOAD CURRENT CASH ROUND FOR HISTORY ERROR:",
          roundError
        );

      }


      const roundStartAt =
        currentCashRound?.started_at
          ? new Date(
              currentCashRound.started_at
            )
          : null;


      if(
        !roundStartAt ||
        isNaN(
          roundStartAt.getTime()
        )
      ){

        rows = [];

      }else{

        rows =
          rows.filter(
            row => {

              const closedAt =
                row?.closed_at ||
                null;

              if(!closedAt){
                return false;
              }

              const closeDate =
                new Date(
                  closedAt
                );

              if(
                isNaN(
                  closeDate.getTime()
                )
              ){

                return false;

              }

              return (
                closeDate.getTime() >=
                roundStartAt.getTime()
              );

            }
          );

      }

    }


    if(!rows.length){

      content.className =
        "pos-sales-history-empty";

      content.innerHTML =
        currentMode === "current"
          ? `
              <div>
                ยังไม่มีประวัติปิดยอดในรอบปัจจุบัน
              </div>
              ${
                currentCashRound?.started_at
                  ? `
                    <div
                      class="pos-sales-history-round-info"
                      style="margin-top:10px;"
                    >
                      รอบเริ่มวันที่ ${
                        new Date(
                          currentCashRound.started_at
                        ).toLocaleString(
                          "th-TH",
                          {
                            timeZone:"Asia/Bangkok",
                            day:"2-digit",
                            month:"2-digit",
                            year:"numeric",
                            hour:"2-digit",
                            minute:"2-digit",
                            hour12:false
                          }
                        )
                      } น.
                    </div>
                  `
                  : ""
              }
            `
          : "ยังไม่มีประวัติการปิดยอด";

      return;

    }


      // =================================================
      // SUMMARY
      // เงินขาดสะสม / เงินเกินสะสม / ส่วนต่างสุทธิ
      // =================================================

      let totalShort =
        0;

      let totalOver =
        0;

      rows.forEach(
        row => {

          const remarkText =
            String(
              row.remark ||
              ""
            );

          const countedMatch =
            remarkText.match(
              /นับเงินจริง\s*:\s*([0-9,]+(?:\.[0-9]+)?)\s*บาท/
            );

          const cashCounted =
            countedMatch
              ? Number(
                  String(
                    countedMatch[1]
                  ).replace(
                    /,/g,
                    ""
                  )
                )
              : Number(
                  row.cash_counted ??
                  0
                );

          const expectedCash =
            Number(
              row.net_cash ??
              (
                Number(
                  row.cash_received ||
                  0
                ) -
                Number(
                  row.regular_expense ||
                  0
                )
              )
            );

          const difference =
            Math.round(
              (
                cashCounted -
                expectedCash
              ) * 100
            ) / 100;

          if(difference < 0){

            totalShort +=
              Math.abs(
                difference
              );

          }

          if(difference > 0){

            totalOver +=
              difference;

          }

        }
      );

      totalShort =
        Math.round(
          totalShort * 100
        ) / 100;

      totalOver =
        Math.round(
          totalOver * 100
        ) / 100;

      const netDifference =
        Math.round(
          (
            totalOver -
            totalShort
          ) * 100
        ) / 100;

        let netDifferenceClass =
          "equal";

        if(netDifference < 0){

          netDifferenceClass =
            "short";

        }
        else if(netDifference > 0){

          netDifferenceClass =
            "over";

        }


    const money =
      value =>
        Number(
          value || 0
        ).toLocaleString(
          "th-TH",
          {
            minimumFractionDigits:0,
            maximumFractionDigits:2
          }
        );


    const escapeHtml =
      value =>
        String(
          value ?? ""
        )
          .replace(
            /&/g,
            "&amp;"
          )
          .replace(
            /</g,
            "&lt;"
          )
          .replace(
            />/g,
            "&gt;"
          )
          .replace(
            /"/g,
            "&quot;"
          )
          .replace(
            /'/g,
            "&#039;"
          );


    const dateOnly =
      value => {

        if(!value){
          return "-";
        }

        const d =
          new Date(value);

        if(
          isNaN(
            d.getTime()
          )
        ){
          return escapeHtml(value);
        }

        return d.toLocaleDateString(
          "th-TH",
          {
            timeZone:
              "Asia/Bangkok",

            day:
              "2-digit",

            month:
              "2-digit",

            year:
              "numeric"
          }
        );

      };


    const dateTime =
      value => {

        if(!value){
          return "-";
        }

        const d =
          new Date(value);

        if(
          isNaN(
            d.getTime()
          )
        ){
          return escapeHtml(value);
        }

        return d.toLocaleString(
          "th-TH",
          {
            timeZone:
              "Asia/Bangkok",

            day:
              "2-digit",

            month:
              "2-digit",

            year:
              "numeric",

            hour:
              "2-digit",

            minute:
              "2-digit",

            hour12:false
          }
        );

      };


    const differenceText =
      value => {

        const n =
          Number(
            value || 0
          );

        if(n > 0){

          return (
            "เกิน " +
            money(n)
          );

        }

        if(n < 0){

          return (
            "ขาด " +
            money(
              Math.abs(n)
            )
          );

        }

        return "ตรง";

      };


    const differenceClass =
      value => {

        const n =
          Number(
            value || 0
          );

        return (
          n > 0
            ? "over"
            : n < 0
              ? "short"
              : "equal"
        );

      };


    const historyModeInfo =
      currentMode === "current"
        ? (
            currentCashRound?.started_at
              ? `
                <div class="pos-sales-history-round-info">
                  🔵 แสดงเฉพาะรอบปัจจุบัน
                  • เริ่มรอบ ${
                    new Date(
                      currentCashRound.started_at
                    ).toLocaleString(
                      "th-TH",
                      {
                        timeZone:"Asia/Bangkok",
                        day:"2-digit",
                        month:"2-digit",
                        year:"numeric",
                        hour:"2-digit",
                        minute:"2-digit",
                        hour12:false
                      }
                    )
                  } น.
                </div>
              `
              : ""
          )
        : `
            <div class="pos-sales-history-round-info">
              📋 แสดงประวัติปิดยอดทั้งหมด
            </div>
          `;


    const html = `

  <!-- =================================================
       HISTORY MODE INFO
       ================================================= -->

  ${historyModeInfo}


  <!-- =================================================
       SUMMARY CARDS
       ================================================= -->

  <div
    class="pos-sales-closing-summary"
  >

    <!-- เงินขาดสะสม -->

    <div
      class="pos-sales-closing-card short"
    >

      <div
        class="pos-sales-closing-card-title"
      >
        <span
          class="pos-sales-closing-dot short"
        ></span>

        เงินขาดสะสม
      </div>

      <div
        class="pos-sales-closing-card-value"
      >
        ${money(totalShort)}
        บาท
      </div>

    </div>


    <!-- เงินเกินสะสม -->

    <div
      class="pos-sales-closing-card over"
    >

      <div
        class="pos-sales-closing-card-title"
      >
        <span
          class="pos-sales-closing-dot over"
        ></span>

        เงินเกินสะสม
      </div>

      <div
        class="pos-sales-closing-card-value"
      >
        ${money(totalOver)}
        บาท
      </div>

    </div>


    <!-- ส่วนต่างสุทธิ -->

    <div
      class="pos-sales-closing-card net ${netDifferenceClass}"
    >

      <div
        class="pos-sales-closing-card-title"
      >
        📊 ส่วนต่างสุทธิ
      </div>

      <div
        class="pos-sales-closing-card-value"
      >

        <span
          class="pos-sales-closing-dot net ${netDifferenceClass}"
        ></span>

        ${money(netDifference)}
        บาท

      </div>

    </div>

  </div>


  <!-- =================================================
       HISTORY TABLE
       ================================================= -->

  <div
    class="pos-sales-history-table-wrap"
  >

    <table
      class="pos-sales-history-table"
    >

          <thead>

            <tr>

              <th>วันที่ปิดยอด</th>

              <th>เวลาปิด</th>

              <th>ยอดขาย</th>

              <th>รับเงินจริง</th>

              <th>รายจ่าย</th>

              <th>เงินสดนับจริง</th>

              <th>ส่วนต่าง</th>

              <th>ผู้ปิดยอด</th>

              <th>หมายเหตุ</th>

            </tr>

          </thead>

          <tbody>

            ${
              rows
                .map(
                  row => {

                    // -------------------------------------------------
                    // เงินสดนับจริง
                    // จุดนี้แก้เฉพาะช่อง "เงินสดนับจริง" เท่านั้น
                    //
                    // ถ้า remark มีข้อความ:
                    // "นับเงินจริง: 60.00 บาท | เงินเกิน 11.00 บาท"
                    // ให้ใช้ 60 เป็นค่าที่แสดง
                    //
                    // ห้ามใช้ net_cash เป็นเงินสดนับจริง
                    // -------------------------------------------------

                    const remarkText =
                      String(
                        row.remark ||
                        ""
                      );

                    const countedMatch =
                      remarkText.match(
                        /นับเงินจริง\s*:\s*([0-9,]+(?:\.[0-9]+)?)\s*บาท/
                      );

                    const cashCounted =
                      countedMatch
                        ? Number(
                            String(
                              countedMatch[1]
                            ).replace(
                              /,/g,
                              ""
                            )
                          )
                        : Number(
                            row.cash_counted ??
                            0
                          );


                    // -------------------------------------------------
                    // ส่วนต่าง
                    // คำนวณจาก เงินสดนับจริง - เงินที่ระบบควรเหลือ
                    // เพื่อให้ประวัติถูกต้อง แม้ cash_difference ใน DB จะเป็น 0
                    // -------------------------------------------------

                    const expectedCash =
                      Number(
                        row.net_cash ??
                        (Number(row.cash_received || 0) -
                         Number(row.regular_expense || 0))
                      );

                    const difference =
                      Math.round(
                        (cashCounted - expectedCash) * 100
                      ) / 100;


                    const closedBy =
                      row.closed_by_name ||
                      row.user_name ||
                      "-";


                    return `

                      <tr>

                        <td>
                          ${dateOnly(
                            row.close_date
                          )}
                        </td>

                        <td>
                          ${dateTime(
                            row.closed_at
                          )}
                        </td>

                        <td
                          class="
                            pos-sales-history-money
                          "
                        >
                          ${money(
                            row.sales_total
                          )}
                          บาท
                        </td>

                        <td
                          class="
                            pos-sales-history-money
                          "
                        >
                          ${money(
                            row.cash_received
                          )}
                          บาท
                        </td>

                        <td
                          class="
                            pos-sales-history-money
                          "
                        >
                          ${money(
                            row.regular_expense
                          )}
                          บาท
                        </td>

                        <td
                          class="
                            pos-sales-history-money
                          "
                        >
                          ${money(
                            cashCounted
                          )}
                          บาท
                        </td>

                        <td
                          class="
                            pos-sales-history-money
                            pos-sales-history-difference
                            ${differenceClass(
                              difference
                            )}
                          "
                        >
                          ${differenceText(
                            difference
                          )}
                          บาท
                        </td>

                        <td>
                          ${escapeHtml(
                            closedBy
                          )}
                        </td>

                        <td>
                          ${escapeHtml(
                            row.remark ||
                            "-"
                          )}
                        </td>

                      </tr>

                    `;

                  }
                )
                .join("")
            }

          </tbody>

        </table>

      </div>

    `;


    content.className =
      "pos-sales-history-content";

    content.innerHTML =
      html;


  }catch(error){

    console.error(
      "LOAD DAILY CLOSING HISTORY ERROR:",
      error
    );

    content.className =
      "pos-sales-history-empty";

    content.innerHTML = `
      ไม่สามารถโหลดประวัติปิดยอดได้
      <br>
      <small>
        ${escapeHtml(
          error?.message ||
          "เกิดข้อผิดพลาด"
        )}
      </small>
    `;

  }

};


// =====================================================
// START NEW CASH ROUND
// =====================================================

window.POS =
  window.POS || {};


POS.startNewCashRound =
  async function(){

    // -------------------------------------------------
    // ลบ Modal เดิม ถ้ามี
    // -------------------------------------------------

    const oldModal =
      document.getElementById(
        "posStartNewRoundModal"
      );

    if(oldModal){

      oldModal.remove();

    }


    // -------------------------------------------------
    // Modal ยืนยันเริ่มรอบใหม่
    // -------------------------------------------------

    const modal =
      document.createElement(
        "div"
      );

    modal.id =
      "posStartNewRoundModal";


    modal.innerHTML = `

      <style>

        #posStartNewRoundModal{

          position:fixed;
          inset:0;
          z-index:100001;

          display:flex;
          align-items:center;
          justify-content:center;

          padding:20px;

          background:rgba(15,23,42,.58);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);

          animation:posRoundBackdropIn .18s ease-out;

          font-family:inherit;

        }

        #posStartNewRoundModal *{
          box-sizing:border-box;
        }

        .pos-round-modal-card{

          width:min(440px, calc(100vw - 40px));

          background:#fff;
          border-radius:24px;

          padding:26px 24px 24px;

          box-shadow:
            0 24px 70px rgba(15,23,42,.28),
            0 8px 24px rgba(15,23,42,.12);

          animation:posRoundCardIn .22s ease-out;

          text-align:center;

        }

        .pos-round-modal-icon{

          width:72px;
          height:72px;

          margin:0 auto 16px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:50%;

          background:linear-gradient(135deg,#dbeafe,#e0f2fe);

          font-size:38px;

          box-shadow:inset 0 0 0 1px rgba(59,130,246,.08);

        }

        .pos-round-modal-title{

          margin:0;

          color:#172033;
          font-size:25px;
          line-height:1.25;
          font-weight:800;

        }

        .pos-round-modal-subtitle{

          margin:7px 0 18px;

          color:#64748b;
          font-size:14px;
          font-weight:600;

        }

        .pos-round-modal-info{

          border:1px solid #dbe4ef;
          background:#f8fafc;
          border-radius:17px;

          padding:17px 18px;

          color:#475569;
          font-size:15px;
          line-height:1.65;

          margin-bottom:22px;

        }

        .pos-round-modal-info strong{

          display:block;
          color:#2563eb;
          font-size:16px;
          margin-top:2px;

        }

        .pos-round-modal-note{

          margin-top:10px;
          color:#64748b;
          font-size:13px;

        }

        .pos-round-modal-actions{

          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;

        }

        .pos-round-modal-btn{

          min-height:54px;
          border:0;
          border-radius:15px;

          font-family:inherit;
          font-size:16px;
          font-weight:800;

          cursor:pointer;
          transition:transform .12s ease, box-shadow .12s ease, opacity .12s ease;

        }

        .pos-round-modal-btn:active{
          transform:scale(.98);
        }

        .pos-round-cancel{

          color:#475569;
          background:#f1f5f9;

        }

        .pos-round-cancel:hover{
          background:#e2e8f0;
        }

        .pos-round-confirm{

          color:#fff;
          background:linear-gradient(135deg,#2563eb,#3b82f6);

          box-shadow:0 8px 20px rgba(37,99,235,.22);

        }

        .pos-round-confirm:hover{
          box-shadow:0 10px 24px rgba(37,99,235,.30);
        }

        .pos-round-modal-btn:disabled{
          cursor:not-allowed;
          opacity:.65;
          transform:none;
          box-shadow:none;
        }

        @keyframes posRoundBackdropIn{
          from{opacity:0;}
          to{opacity:1;}
        }

        @keyframes posRoundCardIn{
          from{
            opacity:0;
            transform:translateY(10px) scale(.97);
          }
          to{
            opacity:1;
            transform:translateY(0) scale(1);
          }
        }

        @media(max-width:480px){

          .pos-round-modal-card{
            padding:22px 18px 18px;
            border-radius:22px;
          }

          .pos-round-modal-title{
            font-size:22px;
          }

          .pos-round-modal-actions{
            gap:10px;
          }

        }

      </style>

      <div class="pos-round-modal-card" role="dialog" aria-modal="true" aria-labelledby="posStartNewRoundTitle">

        <div class="pos-round-modal-icon">🔄</div>

        <h2
          id="posStartNewRoundTitle"
          class="pos-round-modal-title"
        >
          ยืนยันเริ่มรอบใหม่?
        </h2>

        <div class="pos-round-modal-subtitle">
          กำลังจะปิดรอบปัจจุบันและเริ่มรอบใหม่
        </div>

        <div class="pos-round-modal-info">

          <div>รอบปัจจุบันจะถูกปิด</div>

          <strong>และจะเริ่มรอบใหม่เป็น 0 บาท</strong>

          <div class="pos-round-modal-note">
            📁 ข้อมูลรอบเก่าจะยังเก็บไว้ ไม่ถูกลบ
          </div>

        </div>

        <div class="pos-round-modal-actions">

          <button
            type="button"
            id="posStartNewRoundCancel"
            class="pos-round-modal-btn pos-round-cancel"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            id="posStartNewRoundConfirm"
            class="pos-round-modal-btn pos-round-confirm"
          >
            🔄 เริ่มรอบใหม่
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    const cancelButton =
      document.getElementById(
        "posStartNewRoundCancel"
      );

    const confirmButton =
      document.getElementById(
        "posStartNewRoundConfirm"
      );


    // -------------------------------------------------
    // ยกเลิก
    // -------------------------------------------------

    cancelButton.onclick =
      function(){

        modal.remove();

      };


    // -------------------------------------------------
    // คลิกพื้นหลังเพื่อยกเลิก
    // -------------------------------------------------

    modal.addEventListener(
      "click",
      function(event){

        if(
          event.target === modal
        ){

          modal.remove();

        }

      }
    );


    // -------------------------------------------------
    // ESC = ยกเลิก
    // -------------------------------------------------

    const escHandler =
      function(event){

        if(
          event.key === "Escape"
        ){

          modal.remove();

          document.removeEventListener(
            "keydown",
            escHandler
          );

        }

      };


    document.addEventListener(
      "keydown",
      escHandler
    );


    // -------------------------------------------------
    // ยืนยัน
    // -------------------------------------------------

    confirmButton.onclick =
      async function(){

        // ป้องกันกดซ้ำ
        confirmButton.disabled =
          true;

        cancelButton.disabled =
          true;

        confirmButton.textContent =
          "กำลังเริ่มรอบใหม่...";


        try{

          // -------------------------------------------------
          // เรียก SYSTEM API
          // -------------------------------------------------

          const result =
            await POS.api.call(
              POS_CONFIG.FUNCTION_NAMES.SYSTEM,
              {

                method:
                  "POST",

                body: {

                  action:
                    "START_NEW_CASH_ROUND"

                }

              }

            );


          // -------------------------------------------------
          // ตรวจผลลัพธ์
          // -------------------------------------------------

          if(
            !result ||
            result.success !== true
          ){

            throw new Error(
              result?.error ||
              "เริ่มรอบใหม่ไม่สำเร็จ"
            );

          }


          document.removeEventListener(
            "keydown",
            escHandler
          );


          modal.remove();


          // -------------------------------------------------
          // โหลดเฉพาะหน้ายอดขายใหม่
          // ไม่ Reload ทั้งหน้าเว็บ
          // -------------------------------------------------

          const salesPage =
            document.querySelector(
              ".pos-sales-page"
            );


          if(
            salesPage &&
            salesPage.parentElement
          ){

            salesPage.parentElement.innerHTML =
              await POS.pages.sales();

          }


        }catch(error){

          console.error(
            "START NEW CASH ROUND ERROR:",
            error
          );


          confirmButton.disabled =
            false;

          cancelButton.disabled =
            false;

          confirmButton.textContent =
            "🔄 เริ่มรอบใหม่";


          window.alert(
            error?.message ||
            "เริ่มรอบใหม่ไม่สำเร็จ"
          );

        }

      };


    // -------------------------------------------------
    // โฟกัสปุ่มยืนยัน
    // -------------------------------------------------

    setTimeout(
      function(){

        confirmButton.focus();

      },
      0
    );

  };

POS.openDailyClosingModal =
  function(data = {}){

    // -------------------------------------------------
    // BUSINESS DATE
    // ใช้วันทำการจากหน้า Sales
    // ห้ามใช้วันที่ปัจจุบันของเครื่อง
    // -------------------------------------------------

    const closingBusinessDate =
      String(
        data?.businessDate || ""
      ).substring(0,10);

    // -------------------------------------------------
    // ลบ Modal เดิม ถ้ามี
// -------------------------------------------------

    const oldModal =
      document.getElementById(
        "posDailyClosingModal"
      );

    if(oldModal){

      oldModal.remove();

    }


    // -------------------------------------------------
    // ใช้ค่าที่ส่งมาจากหน้า Sales โดยตรง
    // เพื่อให้ตรงกับ BUSINESS_DATE ที่กำลังปิดยอด
    // -------------------------------------------------

    let salesTotal =
      Number(
        data?.salesTotal
      );

    let cashReceived =
      Number(
        data?.cashReceived
      );

    let regularExpense =
      Number(
        data?.regularExpense
      );

    // fallback เผื่อมีการเรียก Modal จากจุดอื่น
    if(
      !Number.isFinite(cashReceived) ||
      !Number.isFinite(regularExpense)
    ){

      const salesPage =
        document.querySelector(
          ".pos-sales-page"
        );

      if(!salesPage){
        return;
      }

      const valueElements =
        salesPage.querySelectorAll(
          ".pos-sales-close-value"
        );

      cashReceived =
        0;

      regularExpense =
        0;

      if(valueElements.length >= 2){

        cashReceived =
          parseFloat(
            String(
              valueElements[0]
                .textContent
                .replace(/,/g,"")
                .replace(/[^\d.-]/g,"")
            )
          ) || 0;

        regularExpense =
          parseFloat(
            String(
              valueElements[1]
                .textContent
                .replace(/,/g,"")
                .replace(/[^\d.-]/g,"")
            )
          ) || 0;

      }

    }


    // -------------------------------------------------
    // เงินที่ควรเหลือ
    // -------------------------------------------------

    const expectedCash =
      cashReceived -
      regularExpense;


    // -------------------------------------------------
    // Format เงิน
    // -------------------------------------------------

    const money =
      value =>
        Number(
          value || 0
        ).toLocaleString(
          "th-TH",
          {
            minimumFractionDigits:2,
            maximumFractionDigits:2
          }
        );


    // -------------------------------------------------
    // Modal
    // -------------------------------------------------

    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "posDailyClosingModal";


    modal.innerHTML = `

      <style>

        /* ==============================================
           BACKDROP
           ============================================== */

        #posDailyClosingModal{

          position:fixed;

          inset:0;

          z-index:100000;

          display:flex;

          align-items:center;

          justify-content:center;

          padding:20px;

          background:
            rgba(
              15,
              23,
              42,
              0.60
            );

          backdrop-filter:
            blur(5px);

          animation:
            dailyCloseFadeIn
            .18s
            ease-out;

        }


        /* ==============================================
           BOX
           ============================================== */

        .pos-daily-close-modal{

          width:
            min(
              500px,
              100%
            );

          max-height:
            calc(
              100vh - 40px
            );

          overflow-y:auto;

          background:#ffffff;

          border-radius:26px;

          box-shadow:
            0 25px 80px
            rgba(
              0,
              0,
              0,
              0.25
            );

          animation:
            dailyCloseModalIn
            .22s
            ease-out;

        }


        /* ==============================================
           HEADER
           ============================================== */

        .pos-daily-close-header{

          text-align:center;

          padding:
            28px
            28px
            20px;

        }


        .pos-daily-close-icon{

          width:68px;

          height:68px;

          margin:
            0
            auto
            14px;

          display:flex;

          align-items:center;

          justify-content:center;

          border-radius:50%;

          background:
            linear-gradient(
              135deg,
              #dcfce7,
              #ecfdf5
            );

          font-size:34px;

        }


        .pos-daily-close-title{

          margin:0;

          font-size:26px;

          font-weight:900;

          color:#1e293b;

        }


        .pos-daily-close-date{

          margin-top:7px;

          color:#64748b;

          font-size:15px;

          font-weight:600;

        }


        /* ==============================================
           SUMMARY
           ============================================== */

        .pos-daily-close-summary{

          margin:
            0
            24px;

          padding:
            18px
            20px;

          border:
            1px solid
            #e2e8f0;

          border-radius:18px;

          background:#f8fafc;

        }


        .pos-daily-close-row{

          display:flex;

          align-items:center;

          justify-content:space-between;

          gap:15px;

          padding:
            11px 0;

        }


        .pos-daily-close-row
        + .pos-daily-close-row{

          border-top:
            1px solid
            #e2e8f0;

        }


        .pos-daily-close-label{

          color:#475569;

          font-size:16px;

          font-weight:700;

        }


        .pos-daily-close-value{

          color:#1e293b;

          font-size:19px;

          font-weight:900;

          white-space:nowrap;

        }


        .pos-daily-close-value.expense{

          color:#c45a00;

        }


        /* ==============================================
           EXPECTED CASH
           ============================================== */

        .pos-daily-close-expected{

          margin-top:14px;

          padding:
            16px
            18px;

          border-radius:16px;

          background:#ecfdf5;

          border:
            1px solid
            #bbf7d0;

          display:flex;

          align-items:center;

          justify-content:space-between;

          gap:15px;

        }


        .pos-daily-close-expected-label{

          color:#166534;

          font-size:16px;

          font-weight:800;

        }


        .pos-daily-close-expected-value{

          color:#008f68;

          font-size:23px;

          font-weight:900;

          white-space:nowrap;

        }


        /* ==============================================
           REAL CASH INPUT
           ============================================== */

        .pos-daily-close-real{

          padding:
            22px
            24px
            0;

        }


        .pos-daily-close-real-label{

          display:block;

          margin-bottom:10px;

          color:#1e293b;

          font-size:18px;

          font-weight:900;

        }


        .pos-daily-close-real-input{

          width:100%;

          height:62px;

          box-sizing:border-box;

          padding:
            0
            18px;

          border:
            2px solid
            #cbd5e1;

          border-radius:15px;

          outline:none;

          text-align:right;

          font-family:inherit;

          font-size:28px;

          font-weight:900;

          color:#1e293b;

          transition:
            border-color
            .15s
            ease,
            box-shadow
            .15s
            ease;

        }


        .pos-daily-close-real-input:focus{

          border-color:#3b82f6;

          box-shadow:
            0 0 0 4px
            rgba(
              59,
              130,
              246,
              0.12
            );

        }


        .pos-daily-close-real-unit{

          margin-top:6px;

          color:#94a3b8;

          font-size:13px;

          text-align:right;

          font-weight:600;

        }


        /* ==============================================
           RESULT
           ============================================== */

        .pos-daily-close-result{

          margin:
            18px
            24px
            0;

          padding:
            16px
            18px;

          border-radius:16px;

          text-align:center;

          font-size:20px;

          font-weight:900;

          transition:
            .2s
            ease;

        }


        .pos-daily-close-result.empty{

          background:#f1f5f9;

          color:#64748b;

        }


        .pos-daily-close-result.match{

          background:#dcfce7;

          color:#15803d;

          border:
            1px solid
            #bbf7d0;

        }


        .pos-daily-close-result.short{

          background:#fee2e2;

          color:#dc2626;

          border:
            1px solid
            #fecaca;

        }


        .pos-daily-close-result.over{

          background:#ffedd5;

          color:#ea580c;

          border:
            1px solid
            #fed7aa;

        }


        /* ==============================================
           BUTTONS
           ============================================== */

        .pos-daily-close-actions{

          display:grid;

          grid-template-columns:
            1fr
            1fr;

          gap:12px;

          padding:
            24px;

        }


        .pos-daily-close-btn{

          height:52px;

          border:0;

          border-radius:14px;

          font-family:inherit;

          font-size:16px;

          font-weight:900;

          cursor:pointer;

          transition:
            .15s
            ease;

        }


        .pos-daily-close-btn:active{

          transform:
            translateY(1px);

        }


        .pos-daily-close-cancel{

          background:#f1f5f9;

          color:#475569;

        }


        .pos-daily-close-cancel:hover{

          background:#e2e8f0;

        }


        .pos-daily-close-confirm{

          background:
            linear-gradient(
              135deg,
              #16a34a,
              #22c55e
            );

          color:#ffffff;

          box-shadow:
            0 7px 18px
            rgba(
              34,
              197,
              94,
              0.25
            );

        }


        .pos-daily-close-confirm:disabled{

          opacity:.45;

          cursor:not-allowed;

          box-shadow:none;

        }


        /* ==============================================
           ANIMATION
           ============================================== */

        @keyframes dailyCloseFadeIn{

          from{

            opacity:0;

          }

          to{

            opacity:1;

          }

        }


        @keyframes dailyCloseModalIn{

          from{

            opacity:0;

            transform:
              translateY(12px)
              scale(.97);

          }

          to{

            opacity:1;

            transform:
              translateY(0)
              scale(1);

          }

        }


        /* ==============================================
           MOBILE
           ============================================== */

        @media(max-width:480px){

          .pos-daily-close-modal{

            border-radius:22px;

          }


          .pos-daily-close-header{

            padding:
              24px
              20px
              18px;

          }


          .pos-daily-close-title{

            font-size:23px;

          }


          .pos-daily-close-summary{

            margin:
              0
              18px;

          }


          .pos-daily-close-real{

            padding:
              20px
              18px
              0;

          }


          .pos-daily-close-result{

            margin:
              16px
              18px
              0;

          }


          .pos-daily-close-actions{

            padding:
              20px
              18px;

          }

        }

      </style>


      <div
        class="
          pos-daily-close-modal
        "
      >

        <!-- ==========================================
             HEADER
             ========================================== -->

        <div
          class="
            pos-daily-close-header
          "
        >

          <div
            class="
              pos-daily-close-icon
            "
          >
            🔒
          </div>


          <h2
            class="
              pos-daily-close-title
            "
          >
            ปิดยอดวันนี้
          </h2>


          <div
            class="
              pos-daily-close-date
            "
          >
            ${(() => {

              if(
                !/^\d{4}-\d{2}-\d{2}$/.test(
                  closingBusinessDate
                )
              ){
                return "";
              }

              const parts =
                closingBusinessDate.split("-");

              return (
                parts[2] +
                "/" +
                parts[1] +
                "/" +
                parts[0]
              );

            })()}
          </div>

        </div>


        <!-- ==========================================
             SUMMARY
             ========================================== -->

        <div
          class="
            pos-daily-close-summary
          "
        >

          <div
            class="
              pos-daily-close-row
            "
          >

            <div
              class="
                pos-daily-close-label
              "
            >
              💵 รับเงินจริงวันนี้
            </div>


            <div
              class="
                pos-daily-close-value
              "
            >
              ${money(
                cashReceived
              )}
              บาท
            </div>

          </div>


          <div
            class="
              pos-daily-close-row
            "
          >

            <div
              class="
                pos-daily-close-label
              "
            >
              💸 หักรายจ่ายวันนี้
            </div>


            <div
              class="
                pos-daily-close-value
                expense
              "
            >
              − ${money(
                regularExpense
              )}
              บาท
            </div>

          </div>


          <div
            class="
              pos-daily-close-expected
            "
          >

            <div
              class="
                pos-daily-close-expected-label
              "
            >
              💰 เงินที่ควรเหลือ
            </div>


            <div
              class="
                pos-daily-close-expected-value
              "
            >
              ${money(
                expectedCash
              )}
              บาท
            </div>

          </div>

        </div>


        <!-- ==========================================
             REAL CASH
             ========================================== -->

        <div
          class="
            pos-daily-close-real
          "
        >

          <label
            class="
              pos-daily-close-real-label
            "
            for="posDailyRealCash"
          >
            💵 เงินที่นับได้จริง
          </label>


          <input
            id="posDailyRealCash"
            class="
              pos-daily-close-real-input
            "
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            autocomplete="off"
          />


          <div
            class="
              pos-daily-close-real-unit
            "
          >
            บาท
          </div>

        </div>


        <!-- ==========================================
             RESULT
             ========================================== -->

        <div
          id="posDailyCloseResult"
          class="
            pos-daily-close-result
            empty
          "
        >
          กรุณานับเงินแล้วกรอกจำนวนเงินจริง
        </div>


        <!-- ==========================================
             BUTTONS
             ========================================== -->

        <div
          class="
            pos-daily-close-actions
          "
        >

          <button
            type="button"
            class="
              pos-daily-close-btn
              pos-daily-close-cancel
            "
            id="posDailyCloseCancel"
          >
            ยกเลิก
          </button>


          <button
            type="button"
            class="
              pos-daily-close-btn
              pos-daily-close-confirm
            "
            id="posDailyCloseConfirm"
            disabled
          >
            🔒 ปิดยอด
          </button>

        </div>

      </div>

    `;


    // -------------------------------------------------
    // แสดง Modal
    // -------------------------------------------------

    document.body.appendChild(
      modal
    );


    // -------------------------------------------------
    // ELEMENTS
    // -------------------------------------------------

    const input =
      document.getElementById(
        "posDailyRealCash"
      );


    const result =
      document.getElementById(
        "posDailyCloseResult"
      );


    const confirmButton =
      document.getElementById(
        "posDailyCloseConfirm"
      );


    const cancelButton =
      document.getElementById(
        "posDailyCloseCancel"
      );


    // -------------------------------------------------
    // UPDATE RESULT
    // -------------------------------------------------

    function updateResult(){

      const realCash =
        Number(
          input.value
        );


      if(
        input.value === "" ||
        !Number.isFinite(
          realCash
        )
      ){

        result.className =
          "pos-daily-close-result empty";

        result.textContent =
          "กรุณานับเงินแล้วกรอกจำนวนเงินจริง";

        confirmButton.disabled =
          true;

        return;

      }


      const difference =
        realCash -
        expectedCash;


      const roundedDifference =
        Math.round(
          difference *
          100
        ) / 100;


      confirmButton.disabled =
        false;


      // -------------------------------------------------
      // ตรง
      // -------------------------------------------------

      if(
        Math.abs(
          roundedDifference
        ) < 0.01
      ){

        result.className =
          "pos-daily-close-result match";

        result.innerHTML =
          `
            🟢 เงินตรงกัน

            <div
              style="
                margin-top:5px;
                font-size:14px;
                font-weight:700;
              "
            >
              เงินที่นับได้
              ${money(realCash)}
              บาท
            </div>
          `;

        return;

      }


      // -------------------------------------------------
      // ขาด
      // -------------------------------------------------

      if(
        roundedDifference < 0
      ){

        result.className =
          "pos-daily-close-result short";

        result.innerHTML =
          `
            🔴 เงินขาด
            ${money(
              Math.abs(
                roundedDifference
              )
            )}
            บาท
          `;

        return;

      }


      // -------------------------------------------------
      // เกิน
      // -------------------------------------------------

      result.className =
        "pos-daily-close-result over";

      result.innerHTML =
        `
          🟠 เงินเกิน
          ${money(
            roundedDifference
          )}
          บาท
        `;

    }


    // -------------------------------------------------
    // INPUT
    // -------------------------------------------------

    input.addEventListener(
      "input",
      updateResult
    );


    // -------------------------------------------------
    // CANCEL
    // -------------------------------------------------

    cancelButton.onclick =
      function(){

        modal.remove();

      };


    // -------------------------------------------------
    // CLICK BACKDROP
    // -------------------------------------------------

    modal.onclick =
      function(event){

        if(
          event.target ===
          modal
        ){

          modal.remove();

        }

      };


    // =================================================
    // CONFIRM
    // บันทึก DAILY CLOSING จริง
    // =================================================

    confirmButton.onclick =
      async function(){

        const realCash =
          Number(
            input.value
          );


        if(
          !Number.isFinite(
            realCash
          )
        ){

          return;

        }


        const difference =
          Math.round(
            (
              realCash -
              expectedCash
            ) * 100
          ) / 100;


        // -------------------------------------------------
        // ป้องกันกดซ้ำ
        // -------------------------------------------------

        confirmButton.disabled =
          true;

        cancelButton.disabled =
          true;

        confirmButton.textContent =
          "กำลังบันทึก...";


        try{

          // =================================================
          // เรียก API ปิดยอด
          // =================================================

          const closing =
            await POS.api.dailyClosing({

              /*
               * ตอนนี้ sales_total ใช้ยอดรับเงินจริง
               * เพราะหน้าปิดยอดชุดนี้ดึงค่าหลักจาก
               * รับเงินจริงวันนี้โดยตรง
               */

              sales_total:
                salesTotal,

              cash_received:
                cashReceived,

              regular_expense:
                regularExpense,

              cash_counted:
                realCash,

              cash_difference:
                difference,

              remark:
                ""

            });


          // -------------------------------------------------
          // ตรวจผลลัพธ์
          // -------------------------------------------------

          if(
            !closing ||
            closing.success !== true
          ){

            throw new Error(
              closing?.error ||
              "ปิดยอดวันนี้ไม่สำเร็จ"
            );

          }


          // -------------------------------------------------
          // ปิดยอดสำเร็จ
          // สถานะจริงจะอ่านจาก daily_closings ใน DATABASE
          // ไม่เขียน localStorage
          // ไม่แตะรอบขาย
          // -------------------------------------------------


          // -------------------------------------------------
          // ปิด Modal
          // -------------------------------------------------

          modal.remove();


          // -------------------------------------------------
// แสดงผลสำเร็จ
// ใช้ Modal ของ POS แทน alert()
// -------------------------------------------------

const successModal =
  document.createElement("div");

successModal.id =
  "dailyClosingSuccessModal";

successModal.innerHTML = `

  <div
    style="
      position:fixed;
      inset:0;
      background:rgba(15,23,42,.55);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:99999;
      padding:20px;
      backdrop-filter:blur(4px);
    "
  >

    <div
      style="
        width:100%;
        max-width:460px;
        background:#ffffff;
        border-radius:24px;
        box-shadow:0 25px 60px rgba(0,0,0,.25);
        overflow:hidden;
        animation:dailyClosingSuccessIn .25s ease;
      "
    >

      <!-- HEADER -->
      <div
        style="
          padding:28px 24px 20px;
          text-align:center;
        "
      >

        <div
          style="
            width:72px;
            height:72px;
            margin:0 auto 16px;
            border-radius:50%;
            background:#dcfce7;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:38px;
          "
        >
          ✓
        </div>

        <div
          style="
            font-size:24px;
            font-weight:700;
            color:#0f172a;
            margin-bottom:6px;
          "
        >
          ปิดยอดวันนี้เรียบร้อย
        </div>

        <div
          style="
            font-size:14px;
            color:#64748b;
          "
        >
          บันทึกยอดประจำวันเรียบร้อยแล้ว
        </div>

      </div>


      <!-- SUMMARY -->
      <div
        style="
          margin:0 20px 20px;
          padding:18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:16px;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            padding:8px 0;
            border-bottom:1px solid #e2e8f0;
          "
        >
          <span style="color:#475569;">
            💵 รับเงินจริงวันนี้
          </span>

          <strong style="color:#0f172a;">
            ${money(cashReceived)} บาท
          </strong>
        </div>


        <div
          style="
            display:flex;
            justify-content:space-between;
            padding:8px 0;
            border-bottom:1px solid #e2e8f0;
          "
        >
          <span style="color:#475569;">
            💸 หักรายจ่าย
          </span>

          <strong style="color:#c2410c;">
            - ${money(regularExpense)} บาท
          </strong>
        </div>


        <div
          style="
            display:flex;
            justify-content:space-between;
            padding:8px 0;
            border-bottom:1px solid #e2e8f0;
          "
        >
          <span style="color:#475569;">
            💰 เงินที่ควรเหลือ
          </span>

          <strong style="color:#0f172a;">
            ${money(expectedCash)} บาท
          </strong>
        </div>


        <div
          style="
            display:flex;
            justify-content:space-between;
            padding:8px 0;
          "
        >
          <span style="color:#475569;">
            💳 เงินที่นับได้จริง
          </span>

          <strong style="color:#0f172a;">
            ${money(realCash)} บาท
          </strong>
        </div>

      </div>


      <!-- DIFFERENCE -->
      <div
        style="
          margin:0 20px 20px;
          padding:14px 16px;
          border-radius:14px;
          text-align:center;
          font-size:17px;
          font-weight:700;

          ${
            Math.abs(difference) < 0.01

              ? `
                background:#dcfce7;
                color:#15803d;
              `

              : difference < 0

                ? `
                  background:#fee2e2;
                  color:#dc2626;
                `

                : `
                  background:#ffedd5;
                  color:#ea580c;
                `
          }
        "
      >

        ${
          Math.abs(difference) < 0.01

            ? "🟢 เงินตรงกัน"

            : difference < 0

              ? "🔴 เงินขาด " +
                money(
                  Math.abs(difference)
                ) +
                " บาท"

              : "🟠 เงินเกิน " +
                money(difference) +
                " บาท"
        }

      </div>


      <!-- BUTTON -->
      <div
        style="
          padding:0 20px 20px;
        "
      >

        <button
          id="dailyClosingSuccessOk"
          type="button"
          style="
            width:100%;
            border:0;
            border-radius:14px;
            padding:14px;
            background:#16a34a;
            color:#ffffff;
            font-size:17px;
            font-weight:700;
            cursor:pointer;
          "
        >
          ตกลง
        </button>

      </div>

    </div>

  </div>
`;


/* -------------------------------------------------
   Animation
------------------------------------------------- */

if(
  !document.getElementById(
    "dailyClosingSuccessStyle"
  )
){

  const style =
    document.createElement("style");

  style.id =
    "dailyClosingSuccessStyle";

  style.textContent = `

    @keyframes dailyClosingSuccessIn {

      from {

        opacity:0;

        transform:
          translateY(15px)
          scale(.96);

      }

      to {

        opacity:1;

        transform:
          translateY(0)
          scale(1);

      }

    }

    #dailyClosingSuccessOk:hover {

      filter:brightness(.95);

    }

    #dailyClosingSuccessOk:active {

      transform:scale(.98);

    }

  `;

  document.head.appendChild(style);

}


/* -------------------------------------------------
   แสดง Modal
------------------------------------------------- */

document.body.appendChild(
  successModal
);


/* -------------------------------------------------
   ปุ่มตกลง
------------------------------------------------- */

document
  .getElementById(
    "dailyClosingSuccessOk"
  )
  .onclick = function(){

    successModal.remove();

  };


          // -------------------------------------------------
          // อัปเดต Header ทันที
          // วันทำการ + สถานะ ต้องเปลี่ยนโดยไม่ต้อง Refresh
          // -------------------------------------------------

          if(
            typeof POS.loadHeaderBusinessDate === "function"
          ){

            await POS.loadHeaderBusinessDate();

          }


          // -------------------------------------------------
          // โหลดหน้ารายรับใหม่
          // -------------------------------------------------

          const salesPageAfterClose =
            document.querySelector(
              ".pos-sales-page"
            );


          if(
            salesPageAfterClose &&
            salesPageAfterClose.parentElement
          ){

            salesPageAfterClose
              .parentElement
              .innerHTML =
                await POS.pages.sales();

          }


        }catch(error){

          // -------------------------------------------------
          // Error
          // -------------------------------------------------

          console.error(
            "CLOSE DAILY ERROR:",
            error
          );


          confirmButton.disabled =
            false;

          cancelButton.disabled =
            false;

          confirmButton.textContent =
            "🔒 ปิดยอด";


          alert(
            error?.message ||
            "ปิดยอดวันนี้ไม่สำเร็จ"
          );

        } 

      };


    // -------------------------------------------------
    // Focus
    // -------------------------------------------------

    setTimeout(
      () => input.focus(),
      100
    );

  }  