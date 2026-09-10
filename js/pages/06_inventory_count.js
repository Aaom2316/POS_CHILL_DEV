window.POS = window.POS || {};
POS.pages = POS.pages || {};

/* =====================================================
   STOCK PAGE 06 : STOCK COUNT
   ===================================================== */

POS.pages.inventoryCount = async function(){
  const html = `
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
            🔍 ตรวจนับ
          </h1>

          <p class="page-subtitle" style="
            margin:0;
          ">
            ตรวจสอบและปรับยอดสต็อก
          </p>
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:8px;
        ">

          <button
            type="button"
            class="btn-secondary"
            onclick="POS.inventoryBackToMain()"
            style="
              padding:11px 18px;
              border-radius:10px;
              border:1px solid #d7dce2;
              background:#fff;
              color:#374151;
              font-weight:700;
              cursor:pointer;
            "
          >
            ← กลับหน้าสต็อก
          </button>

          <button
            id="posStockCountSaveBtn"
            type="button"
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
            💾 บันทึกการตรวจนับ
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

        <div class="card" style="margin:0;">
          <div style="
            color:#94a3b8;
            font-size:13px;
            font-weight:700;
          ">
            วัตถุดิบทั้งหมด
          </div>

          <div id="posStockCountTotal" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#1f2937;
          ">
            0
          </div>

          <div style="
            margin-top:3px;
            color:#94a3b8;
            font-size:12px;
          ">
            รายการ
          </div>
        </div>


        <div class="card" style="margin:0;">
          <div style="
            color:#94a3b8;
            font-size:13px;
            font-weight:700;
          ">
            ตรวจแล้ว
          </div>

          <div id="posStockCountChecked" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#267a3d;
          ">
            0
          </div>

          <div style="
            margin-top:3px;
            color:#94a3b8;
            font-size:12px;
          ">
            รายการ
          </div>
        </div>


        <div class="card" style="margin:0;">
          <div style="
            color:#94a3b8;
            font-size:13px;
            font-weight:700;
          ">
            ต่างจากระบบ
          </div>

          <div id="posStockCountDifference" style="
            margin-top:7px;
            font-size:25px;
            font-weight:800;
            color:#2563eb;
          ">
            0
          </div>

          <div style="
            margin-top:3px;
            color:#94a3b8;
            font-size:12px;
          ">
            รายการ
          </div>
        </div>

      </div>


      <!-- =================================================
           FILTER
           ================================================= -->
      <div class="card" style="margin-bottom:20px;">

        <div style="
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          gap:14px;
          align-items:end;
        ">

          <div>
            <label style="
              display:block;
              margin-bottom:7px;
              color:#475569;
              font-size:13px;
              font-weight:700;
            ">
              🔎 ค้นหาวัตถุดิบ
            </label>

            <input
              id="posStockCountSearch"
              type="text"
              placeholder="ค้นหาชื่อวัตถุดิบ / SKU"
              style="
                width:100%;
                height:43px;
                box-sizing:border-box;
                padding:0 13px;
                border:1px solid #d7dee8;
                border-radius:9px;
                outline:none;
                font-size:14px;
              "
            >
          </div>

          <button
            id="posStockCountRefreshBtn"
            class="btn-secondary"
            type="button"
          >
            🔄 รีเฟรช
          </button>

        </div>

      </div>


      <!-- =================================================
           STOCK COUNT TABLE
           ================================================= -->
      <div class="card" style="padding:0;overflow:hidden;">

        <div style="
          padding:18px 18px 14px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
        ">

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
              color:#1f2937;
            ">
              📋 รายการตรวจนับสต็อก
            </div>

            <div style="
              margin-top:4px;
              color:#94a3b8;
              font-size:12px;
            ">
              กรอกจำนวนที่นับได้จริง แล้วตรวจสอบส่วนต่างจากยอดในระบบ
            </div>
          </div>

          <div id="posStockCountListCount" style="
            padding:7px 11px;
            border-radius:999px;
            background:#f8fafc;
            color:#64748b;
            font-size:12px;
            font-weight:700;
            white-space:nowrap;
          ">
            0 รายการ
          </div>

        </div>


        <div style="
          overflow-x:auto;
          border-top:1px solid #eef1f4;
        ">

          <table style="
            width:100%;
            min-width:1000px;
            border-collapse:collapse;
          ">

            <thead>
              <tr style="
                background:#f8fafc;
                border-bottom:1px solid #e2e8f0;
              ">

                <th style="
                  padding:12px;
                  text-align:left;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  SKU
                </th>

                <th style="
                  padding:12px;
                  text-align:left;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  วัตถุดิบ
                </th>

                <th style="
                  padding:12px;
                  text-align:right;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  ยอดในระบบ
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  หน่วย
                </th>

                <th style="
                  padding:12px;
                  text-align:right;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  จำนวนที่นับได้
                </th>

                <th style="
                  padding:12px;
                  text-align:right;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  ส่วนต่าง
                </th>

                <th style="
                  padding:12px;
                  text-align:center;
                  color:#475569;
                  font-size:12px;
                  font-weight:800;
                ">
                  สถานะ
                </th>

              </tr>
            </thead>


            <tbody id="posStockCountTableBody">

              <tr>
                <td colspan="7" style="
                  padding:60px 20px;
                  text-align:center;
                ">

                  <div style="
                    width:56px;
                    height:56px;
                    margin:0 auto 12px;
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#f1f5f9;
                    font-size:25px;
                  ">
                    🔍
                  </div>

                  <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#64748b;
                  ">
                    พร้อมสำหรับการตรวจนับ
                  </div>

                  <div style="
                    margin-top:5px;
                    font-size:13px;
                    color:#94a3b8;
                  ">
                    รายการวัตถุดิบจะแสดงที่หน้านี้
                  </div>

                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  `;

  /*
   * เมื่อเปิดหน้า ตรวจนับจากเมนู โดยไฟล์ JS ถูกโหลดมาก่อนแล้ว
   * ให้เรียก init หลัง DOM ของหน้านี้ถูกใส่เข้าหน้าเว็บแล้ว
   * เพื่อโหลดข้อมูลทันทีโดยไม่ต้องกดรีโหลดหน้าเว็บ
   */
  setTimeout(function(){
    if(typeof POS.inventoryCountInit === "function"){
      POS.inventoryCountInit();
    }
  }, 0);

  return html;
};


/* =====================================================
   STOCK COUNT : DATA / LOAD / RENDER
   ===================================================== */

POS.stockCountData = Array.isArray(POS.stockCountData)
  ? POS.stockCountData
  : [];


/*
 * หน่วยสำหรับตรวจนับ
 * ใช้ข้อมูลจาก purchase_units ที่มีอยู่จริง
 */
POS.stockCountUnitsData = Array.isArray(
  POS.stockCountUnitsData
)
  ? POS.stockCountUnitsData
  : [];


POS.stockCountFormatNumber = function(value){
  const num = Number(value);

  if(!Number.isFinite(num)){
    return "0";
  }

  return num.toLocaleString(
    "th-TH",
    {
      maximumFractionDigits: 4
    }
  );
};


POS.stockCountEscape = function(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
};


/* =====================================================
   LOAD
   ===================================================== */

POS.inventoryCountLoad = async function(){

  const body =
    document.getElementById(
      "posStockCountTableBody"
    );

  if(!body){
    return;
  }


  body.innerHTML = `
    <tr>
      <td
        colspan="7"
        style="
          padding:50px 20px;
          text-align:center;
          color:#64748b;
        "
      >
        กำลังโหลดข้อมูลวัตถุดิบและหน่วยนับ...
      </td>
    </tr>
  `;


  try{

    if(
      !POS.api ||
      typeof POS.api.ingredientsList !== "function"
    ){
      throw new Error(
        "ไม่พบ API ingredientsList"
      );
    }


    const [ingredientResult, unitResult] =
      await Promise.all([
        POS.api.ingredientsList(),
        typeof POS.api.purchaseUnitsList === "function"
          ? POS.api.purchaseUnitsList()
          : Promise.resolve({
              success:true,
              data:[]
            })
      ]);


    if(
      !ingredientResult ||
      ingredientResult.success !== true
    ){
      throw new Error(
        ingredientResult?.error ||
        ingredientResult?.message ||
        "โหลดข้อมูลวัตถุดิบไม่สำเร็จ"
      );
    }


    if(
      unitResult &&
      unitResult.success === false
    ){
      throw new Error(
        unitResult?.error ||
        unitResult?.message ||
        "โหลดข้อมูลหน่วยนับไม่สำเร็จ"
      );
    }


    const ingredients =
      Array.isArray(ingredientResult.data)
        ? ingredientResult.data
        : [];


    POS.stockCountUnitsData =
      Array.isArray(unitResult?.data)
        ? unitResult.data
        : [];


    POS.stockCountData =
      ingredients
        .filter(item =>
          item &&
          item.id
        )
        .map(item => ({
          id:
            item.id,

          sku:
            item.sku || "",

          name:
            item.name || "",

          stock:
            Number(item.stock ?? 0),

          base_unit:
            item.base_unit ||
            item.unit ||
            "",

          counted_qty:
            null,

          count_large:
            null,

          count_small:
            null
        }));


    POS.inventoryCountRender();

  }
  catch(error){

    console.error(
      "STOCK COUNT LOAD ERROR:",
      error
    );


    POS.stockCountData = [];
    POS.stockCountUnitsData = [];


    body.innerHTML = `
      <tr>
        <td
          colspan="7"
          style="
            padding:50px 20px;
            text-align:center;
            color:#c0392b;
          "
        >
          โหลดข้อมูลตรวจนับไม่สำเร็จ<br>
          <span style="font-size:13px;">
            ${POS.stockCountEscape(
              error?.message || error
            )}
          </span>
        </td>
      </tr>
    `;

  }

};


/* =====================================================
   RENDER
   ===================================================== */

/* =====================================================
   COUNT UNIT HELPERS
   ===================================================== */

POS.stockCountGetUnits = function(item){

  const allUnits =
    Array.isArray(POS.stockCountUnitsData)
      ? POS.stockCountUnitsData
      : [];


  const units =
    allUnits
      .filter(unit => {

        if(!unit){
          return false;
        }

        const sameIngredient =
          String(unit.ingredient_id || "") ===
          String(item.id || "");

        const sameSku =
          !sameIngredient &&
          String(unit.ingredient_sku || unit.sku || "")
            .toLowerCase() ===
          String(item.sku || "")
            .toLowerCase();

        const active =
          unit.active === true ||
          String(unit.active).toUpperCase() === "TRUE";

        return active &&
          (sameIngredient || sameSku);
      })
      .map(unit => {

        const multiple =
          Number(unit.multiple);

        return {
          id:
            unit.id,

          unit_name:
            unit.unit_name ||
            unit.name ||
            "",

          size:
            Number.isFinite(multiple) &&
            multiple > 0
              ? multiple
              : 1
        };

      })
      .filter(unit =>
        unit.unit_name &&
        unit.size > 0
      );


  /*
   * เรียงจากหน่วยใหญ่ -> เล็ก
   */
  units.sort(
    (a,b) =>
      b.size - a.size
  );


  return units;
};


POS.stockCountBuildCountUnits = function(item){

  const units =
    POS.stockCountGetUnits(item);


  const baseUnit =
    item.base_unit ||
    "หน่วย";


  /*
   * หน่วยใหญ่ที่สุด
   * ถ้ามีหลายหน่วย ให้ใช้หน่วยที่มี conversion สูงสุด
   */
  const largest =
    units.length
      ? units[0]
      : {
          id:"__BASE_UNIT__",
          unit_name:baseUnit,
          size:1
        };


  /*
   * หน่วยเล็กสำหรับการนับ
   *
   * ถ้ามีหน่วยซื้อที่เล็กกว่า
   * ให้ใช้หน่วยนั้น
   * ถ้าไม่มี ใช้หน่วยหลัก
   */
  const smallest =
    units.length > 1
      ? units[units.length - 1]
      : {
          id:"__BASE_UNIT__",
          unit_name:baseUnit,
          size:1
        };


  /*
   * ถ้าหน่วยใหญ่สุดคือหน่วยหลัก
   * ให้ใช้หน่วยหลักเป็นช่องเล็กด้วย
   */
  const largestSize =
    Number(largest.size) || 1;

  const smallestSize =
    Number(smallest.size) || 1;


  /*
   * ป้องกันกรณีมีหน่วยเดียว
   * และหน่วยนั้นไม่ใช่หน่วยฐาน
   */
  const safeSmallest =
    smallestSize > largestSize
      ? {
          id:"__BASE_UNIT__",
          unit_name:baseUnit,
          size:1
        }
      : smallest;


  return {
    largest,
    smallest:safeSmallest
  };
};


POS.stockCountSetCountedQty = function(
  item,
  largeInput,
  smallInput
){

  const largeSize =
    Number(
      largeInput?.dataset?.stockCountSize || 1
    );

  const smallSize =
    Number(
      smallInput?.dataset?.stockCountSize || 1
    );


  const largeRaw =
    String(
      largeInput?.value ?? ""
    ).trim();

  const smallRaw =
    String(
      smallInput?.value ?? ""
    ).trim();


  if(
    largeRaw === "" &&
    smallRaw === ""
  ){

    item.counted_qty = null;
    item.count_large = null;
    item.count_small = null;

    return null;
  }


  const large =
    Number(largeRaw || 0);

  const small =
    Number(smallRaw || 0);


  if(
    !Number.isFinite(large) ||
    !Number.isFinite(small) ||
    large < 0 ||
    small < 0
  ){

    item.counted_qty = null;

    return null;
  }


  const counted =
    (large * largeSize) +
    (small * smallSize);


  item.count_large =
    large;

  item.count_small =
    small;

  item.counted_qty =
    counted;


  return counted;
};


POS.stockCountFormatCountable = function(
  stock,
  item
){

  const units =
    POS.stockCountBuildCountUnits(item);


  const largestSize =
    Number(units.largest.size) || 1;

  const smallestSize =
    Number(units.smallest.size) || 1;


  const safeStock =
    Math.max(
      0,
      Number(stock) || 0
    );


  const largeCount =
    Math.floor(
      safeStock / largestSize
    );


  const remainder =
    safeStock -
    (
      largeCount *
      largestSize
    );


  const smallCount =
    smallestSize > 0
      ? Math.floor(
          remainder / smallestSize
        )
      : 0;


  return {
    largest:units.largest,
    smallest:units.smallest,
    largeCount,
    smallCount
  };
};


/* =====================================================
   RENDER
   ===================================================== */

POS.inventoryCountRender = function(){

  const body =
    document.getElementById(
      "posStockCountTableBody"
    );

  if(!body){
    return;
  }


  const search =
    String(
      document.getElementById(
        "posStockCountSearch"
      )?.value || ""
    )
      .trim()
      .toLowerCase();


  const allItems =
    Array.isArray(
      POS.stockCountData
    )
      ? POS.stockCountData
      : [];


  const items =
    allItems.filter(item => {

      if(!search){
        return true;
      }

      return (
        String(item.sku || "")
          .toLowerCase()
          .includes(search) ||

        String(item.name || "")
          .toLowerCase()
          .includes(search)
      );

    });


  const total =
    allItems.length;


  const checked =
    allItems.filter(item =>
      item.counted_qty !== null &&
      item.counted_qty !== undefined &&
      String(item.counted_qty) !== ""
    ).length;


  const difference =
    allItems.filter(item => {

      if(
        item.counted_qty === null ||
        item.counted_qty === undefined ||
        String(item.counted_qty) === ""
      ){
        return false;
      }

      return Number(item.counted_qty) !==
        Number(item.stock);

    }).length;


  const totalEl =
    document.getElementById(
      "posStockCountTotal"
    );

  const checkedEl =
    document.getElementById(
      "posStockCountChecked"
    );

  const differenceEl =
    document.getElementById(
      "posStockCountDifference"
    );

  const listCountEl =
    document.getElementById(
      "posStockCountListCount"
    );


  if(totalEl){
    totalEl.textContent =
      POS.stockCountFormatNumber(total);
  }

  if(checkedEl){
    checkedEl.textContent =
      POS.stockCountFormatNumber(checked);
  }

  if(differenceEl){
    differenceEl.textContent =
      POS.stockCountFormatNumber(difference);
  }

  if(listCountEl){
    listCountEl.textContent =
      items.length + " รายการ";
  }


  if(items.length === 0){

    body.innerHTML = `
      <tr>
        <td
          colspan="7"
          style="
            padding:60px 20px;
            text-align:center;
          "
        >

          <div style="
            width:56px;
            height:56px;
            margin:0 auto 12px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f1f5f9;
            font-size:25px;
          ">
            🔍
          </div>

          <div style="
            font-size:15px;
            font-weight:800;
            color:#64748b;
          ">
            ${
              total === 0
                ? "ไม่พบรายการวัตถุดิบ"
                : "ไม่พบวัตถุดิบที่ค้นหา"
            }
          </div>

        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    items.map(item => {

      const hasCount =
        item.counted_qty !== null &&
        item.counted_qty !== undefined &&
        String(item.counted_qty) !== "";


      const counted =
        hasCount
          ? Number(item.counted_qty)
          : null;


      const stock =
        Number(item.stock ?? 0);


      const diff =
        hasCount
          ? counted - stock
          : null;


      const countUnits =
        POS.stockCountFormatCountable(
          stock,
          item
        );


      const largest =
        countUnits.largest;

      const smallest =
        countUnits.smallest;


      /*
       * แสดงยอดในระบบเป็นหน่วยที่พนักงานนับจริง
       * เช่น 5 ลัง12
       * หรือ 2 ถาด24 + 0 ขวด
       */
      const systemParts = [];

      if(countUnits.largeCount > 0){
        systemParts.push(
          POS.stockCountFormatNumber(
            countUnits.largeCount
          ) +
          " " +
          POS.stockCountEscape(
            largest.unit_name
          )
        );
      }

      if(
        countUnits.smallCount > 0 ||
        systemParts.length === 0
      ){
        systemParts.push(
          POS.stockCountFormatNumber(
            countUnits.smallCount
          ) +
          " " +
          POS.stockCountEscape(
            smallest.unit_name
          )
        );
      }


      let statusHtml = `
        <span style="
          display:inline-block;
          padding:5px 9px;
          border-radius:999px;
          background:#f1f5f9;
          color:#64748b;
          font-size:12px;
          font-weight:700;
        ">
          ยังไม่ตรวจ
        </span>
      `;


      if(hasCount){

        if(diff === 0){

          statusHtml = `
            <span style="
              display:inline-block;
              padding:5px 9px;
              border-radius:999px;
              background:#e8f6ec;
              color:#267a3d;
              font-size:12px;
              font-weight:700;
            ">
              ตรงกับระบบ
            </span>
          `;

        }
        else if(diff > 0){

          statusHtml = `
            <span style="
              display:inline-block;
              padding:5px 9px;
              border-radius:999px;
              background:#e8f6ec;
              color:#267a3d;
              font-size:12px;
              font-weight:700;
            ">
              เกิน ${POS.stockCountFormatNumber(diff)}
            </span>
          `;

        }
        else{

          statusHtml = `
            <span style="
              display:inline-block;
              padding:5px 9px;
              border-radius:999px;
              background:#fff1f2;
              color:#c0392b;
              font-size:12px;
              font-weight:700;
            ">
              ขาด ${POS.stockCountFormatNumber(Math.abs(diff))}
            </span>
          `;

        }

      }


      const diffText =
        hasCount
          ? POS.stockCountFormatNumber(diff)
          : "-";


      const diffColor =
        !hasCount
          ? "#94a3b8"
          : diff === 0
            ? "#267a3d"
            : diff > 0
              ? "#267a3d"
              : "#c0392b";


      /*
       * ค่าเริ่มต้นในช่องนับ
       * แยกเป็นหน่วยใหญ่ + หน่วยเล็ก
       */
      const initialLarge =
        hasCount
          ? Math.floor(
              counted /
              (Number(largest.size) || 1)
            )
          : countUnits.largeCount;


      const initialRemainder =
        hasCount
          ? counted -
            (
              initialLarge *
              (Number(largest.size) || 1)
            )
          : (
              stock -
              (
                countUnits.largeCount *
                (Number(largest.size) || 1)
              )
            );


      const initialSmall =
        hasCount
          ? Math.floor(
              initialRemainder /
              (Number(smallest.size) || 1)
            )
          : countUnits.smallCount;


      return `
        <tr
          style="
            border-bottom:1px solid #eef1f4;
          "
          data-stock-count-row-id="${
            POS.stockCountEscape(item.id)
          }"
        >

          <td style="
            padding:12px;
            color:#334155;
            font-size:13px;
            font-weight:700;
          ">
            ${POS.stockCountEscape(item.sku)}
          </td>


          <td style="
            padding:12px;
            color:#1f2937;
            font-size:14px;
            font-weight:700;
          ">
            ${POS.stockCountEscape(item.name)}
          </td>


          <td style="
            padding:12px;
            text-align:right;
            color:#1f2937;
            font-size:14px;
            font-weight:800;
          "
          data-stock="${POS.stockCountEscape(stock)}"
          >
            <div>
              ${systemParts.join(" + ")}
            </div>

            ${
              stock > 0
                ? `
                  <div style="
                    margin-top:3px;
                    color:#94a3b8;
                    font-size:11px;
                    font-weight:500;
                  ">
                    ${POS.stockCountFormatNumber(stock)}
                    ${POS.stockCountEscape(item.base_unit)}
                  </div>
                `
                : ""
            }
          </td>


          <td style="
            padding:12px;
            text-align:center;
            color:#64748b;
            font-size:13px;
          ">
            ${POS.stockCountEscape(item.base_unit)}
          </td>


          <td style="
            padding:8px 12px;
            text-align:right;
          ">

            <div style="
              display:flex;
              align-items:center;
              justify-content:flex-end;
              gap:7px;
              flex-wrap:wrap;
            ">

              <div style="
                display:flex;
                align-items:center;
                gap:6px;
              ">

                <input
                  type="number"
                  min="0"
                  step="1"
                  value="${
                    initialLarge
                  }"
                  data-stock-count-id="${
                    POS.stockCountEscape(item.id)
                  }"
                  data-stock-count-role="large"
                  data-stock-count-size="${
                    POS.stockCountEscape(
                      largest.size
                    )
                  }"
                  style="
                    width:72px;
                    height:38px;
                    box-sizing:border-box;
                    padding:0 9px;
                    border:1px solid #cfd8e3;
                    border-radius:8px;
                    text-align:right;
                    font-size:14px;
                    outline:none;
                  "
                >

                <span style="
                  color:#334155;
                  font-size:13px;
                  font-weight:700;
                  white-space:nowrap;
                ">
                  ${POS.stockCountEscape(
                    largest.unit_name
                  )}
                </span>

              </div>


              <span style="
                color:#94a3b8;
                font-weight:700;
              ">
                +
              </span>


              <div style="
                display:flex;
                align-items:center;
                gap:6px;
              ">

                <input
                  type="number"
                  min="0"
                  step="1"
                  value="${
                    initialSmall
                  }"
                  data-stock-count-id="${
                    POS.stockCountEscape(item.id)
                  }"
                  data-stock-count-role="small"
                  data-stock-count-size="${
                    POS.stockCountEscape(
                      smallest.size
                    )
                  }"
                  style="
                    width:72px;
                    height:38px;
                    box-sizing:border-box;
                    padding:0 9px;
                    border:1px solid #cfd8e3;
                    border-radius:8px;
                    text-align:right;
                    font-size:14px;
                    outline:none;
                  "
                >

                <span style="
                  color:#334155;
                  font-size:13px;
                  font-weight:700;
                  white-space:nowrap;
                ">
                  ${POS.stockCountEscape(
                    smallest.unit_name
                  )}
                </span>

              </div>

            </div>

          </td>


          <td
            class="pos-stock-count-diff-cell"
            style="
              padding:12px;
              text-align:right;
              color:${diffColor};
              font-size:14px;
              font-weight:800;
            "
          >
            ${diffText}
          </td>


          <td
            class="pos-stock-count-status-cell"
            style="
              padding:12px;
              text-align:center;
            "
          >
            ${statusHtml}
          </td>

        </tr>
      `;

    }).join("");


  body
    .querySelectorAll(
      "input[data-stock-count-id]"
    )
    .forEach(input => {

      input.addEventListener(
        "input",
        function(){

          const id =
            this.getAttribute(
              "data-stock-count-id"
            );


          const item =
            POS.stockCountData.find(
              x =>
                String(x.id) ===
                String(id)
            );


          if(!item){
            return;
          }


          const row =
            this.closest("tr");

          if(!row){
            return;
          }


          const largeInput =
            row.querySelector(
              'input[data-stock-count-role="large"]'
            );

          const smallInput =
            row.querySelector(
              'input[data-stock-count-role="small"]'
            );


          const counted =
            POS.stockCountSetCountedQty(
              item,
              largeInput,
              smallInput
            );


          const stock =
            Number(item.stock || 0);


          const hasCount =
            counted !== null &&
            counted !== undefined;


          const diffCell =
            row.querySelector(
              ".pos-stock-count-diff-cell"
            );

          const statusCell =
            row.querySelector(
              ".pos-stock-count-status-cell"
            );


          if(!hasCount){

            if(diffCell){
              diffCell.textContent = "-";
              diffCell.style.color =
                "#94a3b8";
            }

            if(statusCell){
              statusCell.innerHTML = `
                <span style="
                  display:inline-block;
                  padding:5px 9px;
                  border-radius:999px;
                  background:#f1f5f9;
                  color:#64748b;
                  font-size:12px;
                  font-weight:700;
                ">
                  ยังไม่ตรวจ
                </span>
              `;
            }

          }
          else{

            const diff =
              counted - stock;


            if(diffCell){

              diffCell.textContent =
                POS.stockCountFormatNumber(
                  diff
                );

              diffCell.style.color =
                diff === 0
                  ? "#267a3d"
                  : diff > 0
                    ? "#267a3d"
                    : "#c0392b";
            }


            if(statusCell){

              let statusHtml = "";

              if(diff === 0){

                statusHtml = `
                  <span style="
                    display:inline-block;
                    padding:5px 9px;
                    border-radius:999px;
                    background:#e8f6ec;
                    color:#267a3d;
                    font-size:12px;
                    font-weight:700;
                  ">
                    ตรงกับระบบ
                  </span>
                `;

              }
              else if(diff > 0){

                statusHtml = `
                  <span style="
                    display:inline-block;
                    padding:5px 9px;
                    border-radius:999px;
                    background:#e8f6ec;
                    color:#267a3d;
                    font-size:12px;
                    font-weight:700;
                  ">
                    เกิน ${POS.stockCountFormatNumber(diff)}
                  </span>
                `;

              }
              else{

                statusHtml = `
                  <span style="
                    display:inline-block;
                    padding:5px 9px;
                    border-radius:999px;
                    background:#fff1f2;
                    color:#c0392b;
                    font-size:12px;
                    font-weight:700;
                  ">
                    ขาด ${POS.stockCountFormatNumber(
                      Math.abs(diff)
                    )}
                  </span>
                `;

              }

              statusCell.innerHTML =
                statusHtml;

            }

          }


          POS.stockCountUpdateSummary();

        }
      );

    });

};


/* =====================================================
   SUMMARY UPDATE
   ===================================================== */

POS.stockCountUpdateSummary = function(){

  const allItems =
    Array.isArray(
      POS.stockCountData
    )
      ? POS.stockCountData
      : [];


  const checked =
    allItems.filter(item =>
      item.counted_qty !== null &&
      item.counted_qty !== undefined &&
      String(item.counted_qty) !== ""
    ).length;


  const difference =
    allItems.filter(item => {

      if(
        item.counted_qty === null ||
        item.counted_qty === undefined ||
        String(item.counted_qty) === ""
      ){
        return false;
      }

      return Number(item.counted_qty) !==
        Number(item.stock);

    }).length;


  const totalEl =
    document.getElementById(
      "posStockCountTotal"
    );

  const checkedEl =
    document.getElementById(
      "posStockCountChecked"
    );

  const differenceEl =
    document.getElementById(
      "posStockCountDifference"
    );

  const listCountEl =
    document.getElementById(
      "posStockCountListCount"
    );


  if(totalEl){
    totalEl.textContent =
      POS.stockCountFormatNumber(
        allItems.length
      );
  }

  if(checkedEl){
    checkedEl.textContent =
      POS.stockCountFormatNumber(
        checked
      );
  }

  if(differenceEl){
    differenceEl.textContent =
      POS.stockCountFormatNumber(
        difference
      );
  }

  if(listCountEl){

    const search =
      String(
        document.getElementById(
          "posStockCountSearch"
        )?.value || ""
      )
        .trim()
        .toLowerCase();

    const visibleCount =
      allItems.filter(item => {

        if(!search){
          return true;
        }

        return (
          String(item.sku || "")
            .toLowerCase()
            .includes(search) ||

          String(item.name || "")
            .toLowerCase()
            .includes(search)
        );

      }).length;

    listCountEl.textContent =
      visibleCount + " รายการ";
  }

};



/* =====================================================
   STOCK COUNT : MODERN DIALOG
   ===================================================== */

POS.stockCountDialogClose = function(dialog, result){
  if(!dialog) return;

  dialog.remove();

  if(typeof result === "function"){
    result();
  }
};


POS.stockCountShowConfirm = function(message){
  return new Promise(resolve => {

    const overlay = document.createElement("div");

    overlay.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      box-sizing:border-box;
      background:rgba(15,23,42,.48);
      backdrop-filter:blur(3px);
    `;

    const dialog = document.createElement("div");

    dialog.style.cssText = `
      width:min(430px,100%);
      box-sizing:border-box;
      background:#fff;
      border-radius:18px;
      box-shadow:0 22px 60px rgba(15,23,42,.22);
      overflow:hidden;
      border:1px solid rgba(226,232,240,.9);
      animation:posStockCountDialogIn .18s ease-out;
    `;

    dialog.innerHTML = `
      <div style="
        padding:22px 22px 16px;
        text-align:center;
      ">
        <div style="
          width:58px;
          height:58px;
          margin:0 auto 13px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#eef6ff;
          color:#2563eb;
          font-size:27px;
        ">
          💾
        </div>

        <div style="
          font-size:19px;
          font-weight:800;
          color:#1f2937;
          line-height:1.4;
        ">
          ยืนยันการบันทึก
        </div>

        <div style="
          margin-top:8px;
          font-size:14px;
          color:#64748b;
          line-height:1.6;
        ">
          ${POS.stockCountEscape(message)}
        </div>
      </div>

      <div style="
        display:flex;
        justify-content:center;
        gap:10px;
        padding:0 22px 22px;
      ">
        <button
          type="button"
          data-stock-count-dialog-cancel
          style="
            min-width:100px;
            height:42px;
            padding:0 18px;
            border:1px solid #d8dee8;
            border-radius:10px;
            background:#fff;
            color:#475569;
            font-size:14px;
            font-weight:700;
            cursor:pointer;
          "
        >
          ยกเลิก
        </button>

        <button
          type="button"
          data-stock-count-dialog-ok
          style="
            min-width:100px;
            height:42px;
            padding:0 18px;
            border:1px solid #2563eb;
            border-radius:10px;
            background:#2563eb;
            color:#fff;
            font-size:14px;
            font-weight:700;
            cursor:pointer;
            box-shadow:0 5px 14px rgba(37,99,235,.20);
          "
        >
          ✓ ตกลง
        </button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    if(!document.getElementById("posStockCountDialogStyle")){
      const style = document.createElement("style");
      style.id = "posStockCountDialogStyle";
      style.textContent = `
        @keyframes posStockCountDialogIn {
          from {
            opacity:0;
            transform:translateY(8px) scale(.98);
          }
          to {
            opacity:1;
            transform:translateY(0) scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }

    const finish = value => {
      overlay.remove();
      resolve(value);
    };

    dialog
      .querySelector("[data-stock-count-dialog-cancel]")
      ?.addEventListener("click", () => finish(false));

    dialog
      .querySelector("[data-stock-count-dialog-ok]")
      ?.addEventListener("click", () => finish(true));

    overlay.addEventListener("click", event => {
      if(event.target === overlay){
        finish(false);
      }
    });

  });
};


POS.stockCountShowMessage = function(message, options = {}){
  return new Promise(resolve => {

    const type = options.type || "success";

    const isSuccess = type === "success";

    const icon = isSuccess ? "✓" : "⚠️";
    const title = options.title ||
      (isSuccess ? "บันทึกสำเร็จ" : "เกิดข้อผิดพลาด");

    const iconBg = isSuccess ? "#eaf8ef" : "#fff4e5";
    const iconColor = isSuccess ? "#16803c" : "#c26a00";
    const buttonBg = isSuccess ? "#16803c" : "#c26a00";

    const overlay = document.createElement("div");

    overlay.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      box-sizing:border-box;
      background:rgba(15,23,42,.48);
      backdrop-filter:blur(3px);
    `;

    const dialog = document.createElement("div");

    dialog.style.cssText = `
      width:min(430px,100%);
      box-sizing:border-box;
      background:#fff;
      border-radius:18px;
      box-shadow:0 22px 60px rgba(15,23,42,.22);
      overflow:hidden;
      border:1px solid rgba(226,232,240,.9);
      animation:posStockCountDialogIn .18s ease-out;
    `;

    dialog.innerHTML = `
      <div style="
        padding:24px 22px 16px;
        text-align:center;
      ">
        <div style="
          width:58px;
          height:58px;
          margin:0 auto 13px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:${iconBg};
          color:${iconColor};
          font-size:28px;
          font-weight:800;
        ">
          ${icon}
        </div>

        <div style="
          font-size:19px;
          font-weight:800;
          color:#1f2937;
          line-height:1.4;
        ">
          ${POS.stockCountEscape(title)}
        </div>

        <div style="
          margin-top:8px;
          font-size:14px;
          color:#64748b;
          line-height:1.6;
          white-space:pre-line;
        ">
          ${POS.stockCountEscape(message)}
        </div>
      </div>

      <div style="
        display:flex;
        justify-content:center;
        padding:0 22px 22px;
      ">
        <button
          type="button"
          data-stock-count-dialog-ok
          style="
            min-width:110px;
            height:42px;
            padding:0 20px;
            border:0;
            border-radius:10px;
            background:${buttonBg};
            color:#fff;
            font-size:14px;
            font-weight:700;
            cursor:pointer;
            box-shadow:0 5px 14px rgba(22,128,60,.18);
          "
        >
          ตกลง
        </button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const finish = () => {
      overlay.remove();
      resolve();
    };

    dialog
      .querySelector("[data-stock-count-dialog-ok]")
      ?.addEventListener("click", finish);

    overlay.addEventListener("click", event => {
      if(event.target === overlay){
        finish();
      }
    });

  });
};


/* =====================================================
   SAVE
   ===================================================== */



POS.inventoryCountSave = async function(){

  const items =
    Array.isArray(
      POS.stockCountData
    )
      ? POS.stockCountData
      : [];


  const checkedItems =
    items.filter(item =>
      item.counted_qty !== null &&
      item.counted_qty !== undefined &&
      String(item.counted_qty) !== ""
    );


  if(checkedItems.length === 0){

    await POS.stockCountShowMessage(
      "กรุณากรอกจำนวนที่นับได้อย่างน้อย 1 รายการ",
      {
        type:"warning",
        title:"ยังไม่มีรายการตรวจนับ"
      }
    );

    return;
  }


  const confirmed =
    await POS.stockCountShowConfirm(
      "ยืนยันบันทึกการตรวจนับ " +
      checkedItems.length +
      " รายการใช่หรือไม่?"
    );

  if(!confirmed){
    return;
  }


  const saveBtn =
    document.getElementById(
      "posStockCountSaveBtn"
    );


  const originalText =
    saveBtn?.textContent ||
    "💾 บันทึกการตรวจนับ";


  if(saveBtn){

    saveBtn.disabled = true;

    saveBtn.textContent =
      "⏳ กำลังบันทึก...";

    saveBtn.style.opacity =
      "0.7";

  }


  try{

    const payload = {

      items:
        checkedItems.map(item => ({

          ingredient_id:
            item.id,

          counted_qty:
            Number(item.counted_qty),

          remark:
            "ตรวจนับสต็อก"

        }))

    };


    if(
      !POS.api ||
      typeof POS.api.stockCountAdd !==
        "function"
    ){
      throw new Error(
        "ไม่พบ API stockCountAdd"
      );
    }


    const result =
      await POS.api.stockCountAdd(
        payload
      );


    if(
      !result ||
      result.success !== true
    ){
      throw new Error(
        result?.error ||
        result?.message ||
        "บันทึกการตรวจนับไม่สำเร็จ"
      );
    }


    await POS.stockCountShowMessage(
      "บันทึกการตรวจนับเรียบร้อยแล้ว",
      {
        type:"success",
        title:"บันทึกสำเร็จ"
      }
    );


    await POS.inventoryCountLoad();

  }
  catch(error){

    console.error(
      "STOCK COUNT SAVE ERROR:",
      error
    );


    await POS.stockCountShowMessage(
      "บันทึกการตรวจนับไม่สำเร็จ\n\n" +
      (error?.message || error),
      {
        type:"warning",
        title:"บันทึกไม่สำเร็จ"
      }
    );

  }
  finally{

    if(saveBtn){

      saveBtn.disabled = false;

      saveBtn.textContent =
        originalText;

      saveBtn.style.opacity =
        "1";

    }

  }

};


/* =====================================================
   EVENTS / AUTO LOAD
   ===================================================== */

(function(){

  POS.inventoryCountInit = function(){

    const body =
      document.getElementById(
        "posStockCountTableBody"
      );

    if(!body){

      setTimeout(
        POS.inventoryCountInit,
        50
      );

      return;
    }


    /*
     * กันการผูก event ซ้ำ หากเปิดหน้าเดิมหลายครั้ง
     */
    if(body.dataset.stockCountEventsBound === "1"){
      POS.inventoryCountLoad();
      return;
    }

    body.dataset.stockCountEventsBound = "1";


    const search =
      document.getElementById(
        "posStockCountSearch"
      );

    if(search){

      search.addEventListener(
        "input",
        function(){
          POS.inventoryCountRender();
        }
      );

    }


    const refreshBtn =
      document.getElementById(
        "posStockCountRefreshBtn"
      );

    if(refreshBtn){

      refreshBtn.addEventListener(
        "click",
        function(){
          POS.inventoryCountLoad();
        }
      );

    }


    const saveBtn =
      document.getElementById(
        "posStockCountSaveBtn"
      );

    if(saveBtn){

      saveBtn.addEventListener(
        "click",
        function(){
          POS.inventoryCountSave();
        }
      );

    }


    POS.inventoryCountLoad();

  };


  POS.inventoryCountInit();

})();
