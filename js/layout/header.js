POS.renderHeader = function(shopName = ""){

  setTimeout(
    () => POS.loadHeaderBusinessDate(),
    0
  );

  return `
    <header class="topbar">

      <div
        class="topbar-left"
        style="
          display:flex;
          align-items:center;
          gap:24px;
          flex-wrap:wrap;
        "
      >

        <!-- วันทำการ -->
        <span
          id="headerBusinessDate"
          style="
            font-weight:700;
            white-space:nowrap;
          "
        >
          📅 วันทำการ -
        </span>


        <!-- วันที่ปัจจุบัน -->
        <span
          id="headerCurrentDate"
          style="
            font-weight:700;
            white-space:nowrap;
          "
        >
          🗓️ วันนี้ -
        </span>


        <!-- สถานะระบบ -->
        <span
          id="headerClosingStatus"
          style="
            font-weight:700;
            white-space:nowrap;
          "
        ></span>

      </div>


      <div
        style="
          display:flex;
          align-items:center;
          gap:12px;
        "
      >

        <span
          id="headerUser"
        ></span>

        <button
          class="btn btn-light"
          onclick="POS.logout()"
        >
          ออกจากระบบ
        </button>

      </div>

    </header>
  `;
};


// ===================================================
// โหลดวันทำการ + วันที่ปัจจุบัน + สถานะ
// ===================================================

POS.loadHeaderBusinessDate = async function(){

  const businessEl =
    document.getElementById(
      "headerBusinessDate"
    );

  const currentEl =
    document.getElementById(
      "headerCurrentDate"
    );

  const statusEl =
    document.getElementById(
      "headerClosingStatus"
    );


  // =================================================
  // วันที่ปัจจุบัน
  // =================================================

  const now =
    new Date();


  const currentDay =
    String(
      now.getDate()
    ).padStart(2,"0");


  const currentMonth =
    String(
      now.getMonth() + 1
    ).padStart(2,"0");


  const currentYear =
    now.getFullYear();


  const currentDate =
    `${currentDay}/${currentMonth}/${currentYear}`;


  if(currentEl){

    currentEl.textContent =
      `🗓️ วันนี้ ${currentDate}`;

  }


  // =================================================
  // โหลด BUSINESS_DATE
  // =================================================

  if(!businessEl) return;


  try{

    const result =
      await POS.api.systemSettings();


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
          )
          .trim()
          .toUpperCase() ===
          "BUSINESS_DATE"
      );


    let businessDate =
      item?.value
        ? String(
            item.value
          ).substring(0,10)
        : (
            result?.business_date ||
            result?.businessDate ||
            ""
          );


    // =================================================
    // YYYY-MM-DD → DD/MM/YYYY
    // =================================================

    if(
      /^\d{4}-\d{2}-\d{2}$/.test(
        businessDate
      )
    ){

      const parts =
        businessDate.split("-");


      businessDate =
        `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    // =================================================
    // แสดงวันทำการ
    // =================================================

    if(businessDate){

      businessEl.textContent =
        `📅 วันทำการ ${businessDate}`;

    }else{

      businessEl.textContent =
        "📅 วันทำการ -";

    }


    // =================================================
    // ตรวจสอบสถานะ
    //
    // วันทำการ < วันนี้
    // → ⚠️ ยังไม่ได้ปิดยอด
    //
    // วันทำการ = วันนี้
    // → 🟢 พร้อมใช้งาน
    //
    // วันทำการ > วันนี้
    // → 🔵 พร้อมใช้งานวันถัดไป
    // =================================================

    if(
      statusEl &&
      businessDate
    ){

      const businessParts =
        businessDate.split("/");


      const businessTime =
        new Date(
          Number(
            businessParts[2]
          ),
          Number(
            businessParts[1]
          ) - 1,
          Number(
            businessParts[0]
          )
        ).setHours(
          0,
          0,
          0,
          0
        );


      const currentTime =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).setHours(
          0,
          0,
          0,
          0
        );


      // =================================================
      // วันทำการเก่ากว่าวันนี้
      // =================================================

      if(
        businessTime <
        currentTime
      ){

        statusEl.textContent =
          "⚠️ ยังไม่ได้ปิดยอด";

        statusEl.style.color =
          "#d97706";

      }


      // =================================================
      // วันทำการตรงกับวันนี้
      // =================================================

      else if(
        businessTime ===
        currentTime
      ){

        statusEl.textContent =
          "🟢 พร้อมใช้งาน";

        statusEl.style.color =
          "#15803d";

      }


      // =================================================
      // วันทำการมากกว่าวันนี้
      // =================================================

      else{

        statusEl.textContent =
          "🔵 พร้อมใช้งานวันถัดไป";

        statusEl.style.color =
          "#2563eb";

      }

    }


  }catch(error){

    console.error(
      "LOAD HEADER BUSINESS DATE ERROR:",
      error
    );


    businessEl.textContent =
      "📅 วันทำการ -";


    if(statusEl){

      statusEl.textContent =
        "";

    }

  }

};