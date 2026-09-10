// ===================================================
// USER ROLE
// ===================================================

POS.USER_ROLE = "STAFF";


// ===================================================
// โหลดสิทธิ์จาก public.users
// ===================================================

POS.loadUserRole = async function(){

  try{

    const session =
      await POS.auth.session();


    // -----------------------------------------------
    // ไม่มี Session
    // -----------------------------------------------

    if(!session){

      POS.USER_ROLE = "STAFF";

      return;

    }


    // -----------------------------------------------
    // ขอข้อมูลผู้ใช้จาก Backend
    // ไม่อ่าน public.users ตรงจาก Browser
    // -----------------------------------------------

    const result =
      await POS.supabase.functions.invoke(
        "system",
        {
          body:{
            action:"GET_CURRENT_USER"
          }
        }
      );


    console.log(
      "CURRENT USER RESULT:",
      result
    );


    // -----------------------------------------------
    // Database / Function Error
    // -----------------------------------------------

    if(result.error){

      console.error(
        "GET CURRENT USER ERROR:",
        result.error
      );

      POS.USER_ROLE = "STAFF";

      return;

    }


    const data =
      result.data;


    // -----------------------------------------------
    // Backend Error
    // -----------------------------------------------

    if(
      !data ||
      data.success !== true ||
      !data.user
    ){

      console.error(
        "GET CURRENT USER FAILED:",
        data
      );

      POS.USER_ROLE = "STAFF";

      return;

    }


    // -----------------------------------------------
    // User ถูกปิดใช้งาน
    // -----------------------------------------------

    if(
      data.user.active !== true
    ){

      POS.USER_ROLE = "STAFF";

      return;

    }


    // -----------------------------------------------
    // กำหนด Role
    // -----------------------------------------------

    if(
      String(
        data.user.role || ""
      ).toUpperCase() === "OWNER"
    ){

      POS.USER_ROLE = "OWNER";

    }else{

      POS.USER_ROLE = "STAFF";

    }


    console.log(
      "POS USER ROLE:",
      POS.USER_ROLE
    );


  }catch(error){

    console.error(
      "LOAD USER ROLE ERROR:",
      error
    );

    POS.USER_ROLE = "STAFF";

  }

};


// ===================================================
// SIDEBAR
// ===================================================

POS.renderSidebar = function(){

  const isOwner =
    POS.USER_ROLE === "OWNER";


  return `

    <aside class="sidebar">

      <div class="brand">
        🍹 ล้างไป ชิลล์ไป
      </div>


      <nav class="nav">

        <a
          class="nav-item"
          href="#dashboard"
        >
          📊 Dashboard
        </a>


        <a
          class="nav-item"
          href="#pos"
        >
          🧾 POS
        </a>


        <a
          class="nav-item"
          href="#orders"
        >
          🍽️ โต๊ะ / Orders
        </a>


        <a
          class="nav-item"
          href="#expenses"
        >
          💸 รายจ่าย
        </a>



        <a
          class="nav-item"
          href="#sales"
        >
          💰 ยอดขาย
        </a>


        ${
          isOwner
          ? `

            <a
              class="nav-item"
              href="#inventory"
            >
              📦 สต็อก
            </a>


            <a
              class="nav-item"
              href="#reports"
            >
              📈 รายงาน
            </a>


            <a
              class="nav-item"
              href="#settings"
            >
              ⚙️ ตั้งค่า
            </a>

          `
          : ""
        }


      </nav>

    </aside>

  `;

};