# POS CHILL Frontend

Frontend แยกจาก Backend อย่างชัดเจน

## หลักการ
- Frontend ไม่แตะ service_role
- Frontend เรียก Supabase Edge Functions ผ่าน `js/core/api.js`
- Backend / RLS / Database อยู่ฝั่ง Supabase
- แต่ละหน้าถูกแยกเป็นไฟล์ใน `js/pages/`

## แผนผัง
- dashboard.js = Dashboard
- pos.js = หน้าขาย
- orders.js = โต๊ะ / Orders
- sales.js = รายรับ
- expenses.js = รายจ่าย
- inventory.js = สต็อก
- reports.js = รายงาน
- settings.js = ตั้งค่า

## ก่อนเปิดใช้งาน
แก้ `js/config.js`
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
