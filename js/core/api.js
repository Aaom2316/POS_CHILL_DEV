window.POS = window.POS || {};

POS.api = {

  // =================================================
  // API CALL
  // =================================================

  call: async function(name, options = {}) {

    let data = null;
    let error = null;

    try{

      const result =
        await POS.supabase.functions.invoke(
          name,
          options
        );

      data =
        result.data;

      error =
        result.error;

    }
    catch(err){

      console.error(
        "API INVOKE ERROR:",
        err
      );

      throw err;

    }


    // =================================================
    // EDGE FUNCTION ERROR
    // ดึงรายละเอียดจาก Response ของ Supabase
    // =================================================

    if(error){

      let message =
        error.message ||
        "API_ERROR";

      let details = "";
      let serverData = null;


      // -------------------------------------------------
      // พยายามอ่าน Response จาก Edge Function
      // -------------------------------------------------

      try{

        if(error.context){

          const response =
            error.context;

          const contentType =
            response.headers
              ?.get("content-type") ||
            "";


          // ---------------------------------------------
          // JSON
          // ---------------------------------------------

          if(
            contentType
              .toLowerCase()
              .includes("application/json")
          ){

            serverData =
              await response.json();

          }


          // ---------------------------------------------
          // TEXT
          // ---------------------------------------------

          else{

            const text =
              await response.text();

            if(text){

              try{

                serverData =
                  JSON.parse(text);

              }
              catch{

                serverData = {
                  error:
                    text
                };

              }

            }

          }

        }

      }
      catch(readError){

        console.warn(
          "ไม่สามารถอ่าน Error Response:",
          readError
        );

      }


      // =================================================
      // เอาข้อมูลจาก Edge Function
      // =================================================

      if(serverData){

        console.error(
          "EDGE FUNCTION ERROR:",
          serverData
        );


        // -----------------------------------------------
        // error
        // -----------------------------------------------

        if(serverData.error){

          message =
            serverData.error;

        }


        // -----------------------------------------------
        // details
        // -----------------------------------------------

        if(serverData.details){

          details =
            serverData.details;

        }


        // -----------------------------------------------
        // message
        // -----------------------------------------------

        if(
          serverData.message &&
          !serverData.error
        ){

          message =
            serverData.message;

        }


        // -----------------------------------------------
        // stage
        // -----------------------------------------------

        if(serverData.stage){

          message +=
            "\n\nStage: " +
            serverData.stage;

        }


        // -----------------------------------------------
        // code
        // -----------------------------------------------

        if(serverData.code){

          message +=
            "\nCode: " +
            serverData.code;

        }


        // -----------------------------------------------
        // details
        // -----------------------------------------------

        if(details){

          message +=
            "\nDetails: " +
            details;

        }


        // -----------------------------------------------
        // hint
        // -----------------------------------------------

        if(serverData.hint){

          message +=
            "\nHint: " +
            serverData.hint;

        }

      }


      const apiError =
        new Error(
          message
        );


      // เก็บข้อมูลไว้ดูใน Console
      apiError.originalError =
        error;

      apiError.serverData =
        serverData;


      throw apiError;

    }


    // =================================================
    // API RETURN success:false
    // =================================================

    if(
      data &&
      data.success === false
    ){

      const message =
        data.details ||
        data.error ||
        data.message ||
        "API_ERROR";


      const apiError =
        new Error(
          message
        );


      apiError.serverData =
        data;


      console.error(
        "API ERROR:",
        data
      );


      throw apiError;

    }


    // =================================================
    // RETURN
    // =================================================

    return data;

  },


  // =================================================
  // SYSTEM
  // =================================================

  systemSettings() {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.SYSTEM,
      {
        method: "GET"
      }
    );

  },


  // =================================================
  // BUSINESS DATE
  // อ่านวันทำการจาก systemSettings()
  // =================================================

  getBusinessDate() {

    return this.systemSettings()
      .then(data => {

        const settings =
          Array.isArray(
            data?.settings
          )
            ? data.settings
            : [];

        const item =
          settings.find(
            x =>
              String(
                x?.key || ""
              ).trim()
              ===
              "BUSINESS_DATE"
          );

        const date =
          String(
            item?.value || ""
          ).trim()
          .substring(0,10);

        if(
          !/^\d{4}-\d{2}-\d{2}$/.test(
            date
          )
        ){

          throw new Error(
            "ไม่พบวันทำการ BUSINESS_DATE"
          );

        }

        return {
          success:true,
          date:date
        };

      });

  },


  // =================================================
  // BUSINESS DATE
  // อ่านวันทำการจาก SYSTEM
  // =================================================

  async getBusinessDate() {

    const result =
      await this.systemSettings();

    const settings =
      Array.isArray(
        result?.settings
      )
        ? result.settings
        : [];

    const item =
      settings.find(
        x =>
          String(
            x?.key || ""
          ).trim()
            .toUpperCase()
          ===
          "BUSINESS_DATE"
      );

    const date =
      String(
        item?.value || ""
      ).trim();

    if(
      !/^\\d{4}-\\d{2}-\\d{2}$/.test(
        date
      )
    ){

      throw new Error(
        "ไม่พบวันทำการ BUSINESS_DATE"
      );

    }

    return {
      success:true,
      date:date
    };

  },


  // =================================================
  // MENU
  // =================================================

  menus() {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.MENU,
      {
        method: "GET"
      }
    );

  },


  // =================================================
  // SALES LIST
  // =================================================

  salesList() {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.SALES,
      {
        method: "GET"
      }
    );

  },


  // =================================================
  // SALES
  // =================================================

  sales(data) {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.SALES,
      {
        method: "POST",
        body: data
      }
    );

  },


  // =================================================
  // SALES PAY
  // =================================================

  salesPay(billId) {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.SALES,
      {
        method: "POST",

        body: {

          action:
            "PAY",

          bill_id:
            billId

        }

      }
    );

  },


  // =================================================
  // ORDERS
  // STEP 1
  // เพิ่ม Order 1 รายการ
  // =================================================

  orderAdd(data) {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.ORDERS,
      {
        method: "POST",

        body: {

          action:
            "ADD",

          table_no:
            data.table_no,

          menu_id:
            data.menu_id,

          qty:
            data.qty,

          bill_id:
            data.bill_id,

          // ส่งได้ แต่ Backend จะยึด BUSINESS_DATE
          // จาก system_settings เป็นหลัก
          business_date:
            data.business_date || null

        }

      }
    );

  },


  // =================================================
  // ORDER UPDATE QTY
  // =================================================

  orderUpdateQty(orderId, qty) {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.ORDERS,
      {
        method: "POST",

        body: {

          action:
            "UPDATE_QTY",

          order_id:
            orderId,

          qty:
            qty

        }

      }
    );

  },


  // =================================================
  // ORDER PAY
  // =================================================

  orderPay(tableNo, billId) {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.ORDERS,
      {
        method: "POST",

        body: {

          action:
            "PAY",

          table_no:
            tableNo,

          bill_id:
            billId

        }

      }
    );

  },


  // =================================================
  // ORDER PAID LIST
  // =================================================

  orderPaidList() {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.ORDERS,
      {
        method: "POST",

        body: {

          action:
            "PAID_LIST"

        }

      }
    );

  },


  // =================================================
  // EXPENSES LIST
  // =================================================

  expensesList() {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.EXPENSES,
      {
        method:"POST",
        body:{
          action:"LIST"
        }
      }
    );

  },


  // =================================================
  // EXPENSES ADD
  // =================================================

  expenseAdd(data) {

    return this.call(
      POS_CONFIG.FUNCTION_NAMES.EXPENSES,
      {
        method: "POST",

        body: {

          action:
            "ADD",

          expense_date:
            data.expense_date,

          category:
            data.category,

          description:
            data.description,

          amount:
            data.amount,

          expense_type:
            data.expense_type,

          remark:
            data.remark || ""

        }

      }
    );

  },


  // =================================================
  // INGREDIENTS / STOCK
  // =================================================

  ingredientsList() {

    return this.call(
      "ingredients",
      {
        method: "GET"
      }
    );

  },


  // =================================================
  // INGREDIENT ADD
  // =================================================

  ingredientAdd(data) {

    return this.call(
      "ingredients",
      {
        method: "POST",

        body: {

          action:
            "ADD",

          name:
            data.name,

          base_unit:
            data.base_unit || data.unit,

          minimum:
            data.minimum ?? 0

        }

      }
    );

  },


  // =================================================
  // INGREDIENT UPDATE
  // =================================================

  ingredientUpdate(data) {

    return this.call(
      "ingredients",
      {
        method: "PUT",

        body: {

          action:
            "UPDATE",

          id:
            data.id,

          name:
            data.name,

          base_unit:
            data.base_unit || data.unit,

          minimum:
            data.minimum ?? 0

        }

      }
    );

  },


  // =================================================
  // INGREDIENT DELETE
  // =================================================

  ingredientDelete(id) {

    return this.call(
      "ingredients",
      {
        method: "POST",

        body: {

          action:
            "DELETE",

          id:
            id

        }

      }
    );

  },


  // =================================================
  // PURCHASE UNITS
  // หน่วยซื้อ
  // =================================================

  purchaseUnitsList() {

    return this.call(
      "units",
      {
        method: "GET"
      }
    );

  },


  // =================================================
  // PURCHASE UNIT ADD
  // =================================================

  purchaseUnitAdd(data) {

    return this.call(
      "units",
      {
        method: "POST",

        body: {

          action:
            "ADD",

          ingredient_id:
            data.ingredient_id,

          unit_name:
            data.unit_name,

          multiple:
            data.multiple ?? 1,

          base_qty:
            data.base_qty ?? 1,

          cost_per_unit:
            data.cost_per_unit ?? 0

        }

      }
    );

  },


  // =================================================
  // PURCHASE UNIT UPDATE
  // =================================================

  purchaseUnitUpdate(data) {

    return this.call(
      "units",
      {
        method: "PUT",

        body: {

          action:
            "UPDATE",

          id:
            data.id,

          ingredient_id:
            data.ingredient_id,

          unit_name:
            data.unit_name,

          multiple:
            data.multiple ?? 1,

          base_qty:
            data.base_qty ?? 1,

          cost_per_unit:
            data.cost_per_unit ?? 0,

          active:
            data.active ?? true

        }

      }
    );

  },


  // =================================================
  // PURCHASE UNIT DELETE
  // =================================================

  purchaseUnitDelete(id) {

    return this.call(
      "units",
      {
        method: "POST",

        body: {

          action:
            "DELETE",

          id:
            id

        }

      }
    );

  },


  // =================================================
  // PURCHASE
  // บันทึกบิลซื้อเข้า
  // =================================================

  purchaseAdd(data) {

    return this.call(
      "purchase",
      {
        method: "POST",

        body: {
          bill_no:
            data.bill_no,

          purchase_date:
            data.purchase_date,

          supplier:
            data.supplier,

          remark:
            data.remark || "",

          items:
            Array.isArray(data.items)
              ? data.items.map(item => ({
                  ingredient_id:
                    item.ingredient_id,

                  purchase_unit_id:
                    item.purchase_unit_id || null,

                  quantity:
                    item.quantity,

                  multiple:
                    item.multiple ?? 1,

                  base_qty:
                    item.base_qty ?? item.quantity,

                  total:
                    item.total
                }))
              : []
        }

      }
    );

  },


  // =================================================
  // STOCK MOVEMENT
  // รายการเคลื่อนไหวสต็อก
  // =================================================

  movementList() {

    return this.call(
      "movements",
      {
        method: "GET"
      }
    );

  },


  // =================================================
  // STOCK COUNT
  // บันทึกการตรวจนับสต็อก
  // =================================================

  stockCountAdd(data) {

    return this.call(
      "stock-count",
      {
        method: "POST",

        body: {
          items:
            Array.isArray(data?.items)
              ? data.items.map(item => ({
                  ingredient_id:
                    item.ingredient_id,

                  counted_qty:
                    item.counted_qty,

                  remark:
                    item.remark || ""
                }))
              : []
        }

      }
    );

  },


  // =================================================
  // RECIPES
  // สูตรอาหาร
  // =================================================

  recipesList() {

    return this.call(
      "recipes",
      {
        method: "GET"
      }
    );

  },


  // =================================================
  // RECIPE ADD
  // เพิ่มวัตถุดิบเข้าในสูตร
  // =================================================

  recipeAdd(data) {

    return this.call(
      "recipes",
      {
        method: "POST",

        body: {

          action:
            "ADD",

          menu_id:
            data.menu_id,

          ingredient_id:
            data.ingredient_id,

          qty:
            data.qty

        }

      }
    );

  },


  // =================================================
  // RECIPE UPDATE
  // แก้จำนวนวัตถุดิบในสูตร
  // =================================================

  recipeUpdate(data) {

    return this.call(
      "recipes",
      {
        method: "POST",

        body: {

          action:
            "UPDATE",

          id:
            data.id,

          qty:
            data.qty

        }

      }
    );

  },


  // =================================================
  // RECIPE DELETE
  // ลบวัตถุดิบออกจากสูตร
  // =================================================

  recipeDelete(id) {

    return this.call(
      "recipes",
      {
        method: "POST",

        body: {

          action:
            "DELETE",

          id:
            id

        }

      }
    );

  },


  // =================================================
  // CASH ROUND
  // STEP 3
  // =================================================

  cashRoundCurrent() {

    return this.call(
      "system",
      {
        method: "POST",

        body: {

          action:
            "GET_CURRENT_CASH_ROUND"

        }

      }
    );

  },


  // =================================================
  // CASH ROUND
  // เริ่มรอบใหม่
  // =================================================

  cashRoundStartNew() {

    return this.call(
      "system",
      {
        method: "POST",

        body: {

          action:
            "START_NEW_CASH_ROUND"

        }

      }
    );

  },


  // =================================================
  // CASH ROUND HISTORY
  // =================================================

  cashRoundHistory() {

    return this.call(
      "system",
      {
        method: "POST",

        body: {

          action:
            "GET_CASH_ROUND_HISTORY"

        }

      }
    );

  },


  // =================================================
  // DAILY CLOSING
  // ปิดยอดวันนี้
  // =================================================

  dailyClosing(data) {

    return this.call(
      "system",
      {
        method: "POST",

        body: {

          action:
            "CLOSE_DAILY",

          sales_total:
            data.sales_total,

          cash_received:
            data.cash_received,

          regular_expense:
            data.regular_expense,

          cash_counted:
            data.cash_counted,

          cash_difference:
            data.cash_difference,

          remark:
            data.remark || ""

        }

      }
    );

  },

    // =================================================
  // TODAY DAILY CLOSING
  // เช็กเวลาปิดยอดล่าสุดของวันนี้
  // =================================================

  dailyClosingCurrent() {

    return this.call(
      "system",
      {
        method:
          "POST",

        body: {

          action:
            "GET_TODAY_DAILY_CLOSING"

        }

      }
    );

  },

};

