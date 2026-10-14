# Play Digital — Human-led. AI-amplified.

ต้นแบบเว็บไซต์ใหม่ของ **Play Digital Co., Ltd.** ออกแบบและพัฒนาใหม่ทั้งเว็บไซต์ โดยคงวิดีโอ YouTube และอัตลักษณ์จากเว็บไซต์เดิมไว้

## แนวทางออกแบบ
- Off-white / Charcoal เป็นหลัก ใช้ม่วงอ่อนจากแบรนด์เป็น Accent เพียงสีเดียว
- Editorial typography, พื้นที่ว่าง, เส้นบาง และกราฟิก Play Loop
- เมนู Desktop เดิม: **Home / Services / Work / Client / About / Contact**
- **Blog** ยังคงอยู่ในเมนูมือถือและ Footer เช่นเว็บไซต์เดิม และเข้าถึงได้จาก Play Notes บนหน้า Home
- เนื้อหาไทย/อังกฤษ สลับ TH / EN ได้จริง

## หน้าที่ทำแล้ว
| หน้า | สิ่งที่ใช้งานได้ |
|---|---|
| Home | วิดีโอเต็มความกว้าง, Showreel dialog, บริการ, ผลงาน, Human × AI, บทความ |
| Services | บริการเดิม 13 รายการ จัดใหม่เป็น 4 กลุ่ม, Accordion, Deep links, ตัวช่วยเลือกบริการตามเป้าหมาย |
| Work | ภาพจากคลังเว็บไซต์เดิม 5 โปรเจกต์, ตัวกรอง, ค้นหา, Project archive dialogs |
| Client | โลโก้เดิมครบ 32 แบรนด์, ตัวกรองหมวดหมู่, ค้นหาชื่อ |
| About | แนวคิดแบรนด์, ค่านิยมเดิมที่เรียบเรียงใหม่, กระบวนการทำงาน |
| Blog | บทความร่าง 3 เรื่อง ไทย/อังกฤษ, ตัวกรอง, หน้าอ่านบทความเต็ม |
| Contact | ช่องทางโทรศัพท์ / Facebook / แผนที่จริง, แบบฟอร์มสร้างบรีฟและดาวน์โหลดไฟล์ข้อความ |
| Privacy | อธิบายพฤติกรรมของต้นแบบและบริการภายนอก |

## YouTube เดิม
- Video ID: **`gBPHuwaHQQc`**
- URL: https://www.youtube.com/watch?v=gBPHuwaHQQc
- YouTube oEmbed ระบุชื่อวิดีโอว่า **Playdigital Reel 2026**
- พื้นหลัง Hero แบบเต็มความกว้าง ไม่ใช่วิดีโอใหม่หรือภาพ AI แทนวิดีโอ
- `autoplay=1`, `mute=1`, `loop=1`, `playlist=gBPHuwaHQQc`, `playsinline=1`
- เปิด–ปิดเสียง และ Play/Pause ผ่าน YouTube IFrame Player API
- เริ่มปิดเสียงตามข้อจำกัด Autoplay ของเบราว์เซอร์
- หยุดเล่นเมื่อออกจากหน้าจอ/เปลี่ยนแท็บ และเคารพการตั้งค่า Reduced Motion
- มีภาพ Poster และลิงก์ YouTube สำรอง หากบริการภายนอกถูกบล็อก
- การเล่นวิดีโอจริงต้องใช้อินเทอร์เน็ตและเบราว์เซอร์ที่ YouTube อนุญาต ภายในตัวดูไฟล์ที่ไม่อนุญาตเครือข่ายจะเห็น Poster แทน ให้ทดสอบผ่าน Live Preview หรือเว็บที่เสิร์ฟผ่าน HTTPS

## เทคนิคที่เพิ่ม
- React + TypeScript + Vite
- Responsive layout บนมือถือ แท็บเล็ต และ Desktop
- View Transitions เมื่อเบราว์เซอร์รองรับ
- Scroll reveals / reading progress / pointer parallax / SVG motion
- Native dialogs พร้อม Escape, focus restoration และ keyboard navigation
- Local WOFF2 fonts และรูป WebP ไม่มี CDN สำหรับ UI
- ภาษาเก็บเฉพาะค่า TH/EN ใน Local Storage ไม่เก็บข้อมูลแบบฟอร์ม
- เป้าหมายใน Service Matcher ใช้กฎจับคู่ที่กำหนดไว้ **ไม่ใช่ AI API**

## เริ่มใช้งานซอร์ส
ต้องใช้ Node.js 20 ขึ้นไป

```bash
npm ci
npm run dev
```

Dev server ใช้ port 3000 และ bind `0.0.0.0` รองรับโดเมน Live Preview

```bash
npm run build
npm run preview
```

ผลการ Build อยู่ใน `dist/` (หรือโฟลเดอร์ `production/` ในไฟล์ ZIP ที่ส่งมอบ) เมื่อนำขึ้น Static hosting ต้องตั้งค่า SPA fallback ให้เส้นทางต่าง ๆ เช่น `/work` และ `/services` กลับมาที่ `index.html` มีตัวอย่าง Apache และ Netlify แนบไว้

### ไฟล์ Preview แบบไฟล์เดียว
`Play-Digital-Preview.html` ฝัง JavaScript, CSS, รูปภาพ และฟอนต์ทั้งหมดไว้ในไฟล์เดียว สามารถดูดีไซน์และเปลี่ยนหน้าต่าง ๆ ได้โดยไม่ต้องติดตั้ง ใช้ HashRouter เมื่อเปิดไฟล์โดยตรง และ MemoryRouter เมื่อตัวดูไฟล์ฝังอยู่ใน Sandbox

YouTube ยังต้องใช้อินเทอร์เน็ตและ Referrer ที่เหมาะสม บางตัวดูไฟล์อาจไม่อนุญาต iframe ภายนอกหรือการดาวน์โหลดบรีฟ ให้ใช้ Live Preview สำหรับการทดสอบฟีเจอร์เหล่านี้

## ขอบเขตและสิ่งที่ต้องยืนยันก่อนนำขึ้นเว็บจริง
1. **ยังไม่ได้แก้ไขหรือ Deploy ทับ playdigital.co.th** นี่เป็นต้นแบบแยกต่างหาก
2. ฟอร์ม Contact **สร้างไฟล์บนอุปกรณ์เท่านั้น ยังไม่ได้ส่งข้อมูลเข้าบริษัท** หากต้องการรับ Lead ต้องเชื่อม backend/email/CRM พร้อม validation ฝั่งเซิร์ฟเวอร์, spam protection และนโยบายข้อมูล
3. เนื้อหา Human-led / AI-amplified และบริการ AI-assisted เป็นข้อเสนอสำหรับเว็บไซต์ใหม่ ต้องยืนยันความสามารถและกระบวนการกับทีมก่อนเผยแพร่
4. บทความทั้ง 3 เรื่องเป็น **Editorial drafts** ที่เขียนขึ้นสำหรับต้นแบบ ไม่ใช่บทความเก่าหรือข่าวที่บริษัทเคยเผยแพร่
5. ภาพ Work มาจากรายการภาพสไลด์ใน HTML เว็บไซต์เดิม ชื่อหมวดหมู่และคำอธิบายเรียบเรียงจากภาพ ไม่เติมตัวเลขผลลัพธ์ ต้องยืนยันขอบเขตงานก่อนเปลี่ยนเป็น Case Study อย่างเป็นทางการ
6. โลโก้ Client เป็น Client Archive เดิม ไม่ได้ยืนยันว่าทุกแบรนด์ยังเป็นลูกค้าในปัจจุบัน
7. ก่อนเปิดจริงควรตรวจ Brand guidelines, ข้อความ, สิทธิ์รูป, redirects จาก URL PHP เดิม, SEO แต่ละหน้า และเชื่อม CMS หากต้องการแก้ไขเนื้อหาโดยไม่แก้โค้ด
8. หน้า Privacy เป็นคำอธิบายต้นแบบ ไม่ใช่นโยบายฉบับทางการของบริษัท

## แหล่งข้อมูลและทรัพย์สิน
- https://playdigital.co.th/ — เมนู, วิดีโอ, ข้อความแบรนด์, ค่านิยม, บริการ, ที่อยู่และโทรศัพท์
- https://playdigital.co.th/index.php?page=clients — โลโก้ทั้ง 32 แบรนด์
- รูป `images/slideMain/` จาก HTML หน้า Home เดิม — Cellox, Sriraja Panich, Singha, Krungsri, Yen Yen
- โลโก้เดิมเก็บทรงเดิม ปรับเป็นสีขาว/ดำด้วย CSS; โลโก้ในแถบ Client ใช้ภาพเดิมปรับพื้นหลังและสีสำหรับงาน Monochrome
- รูปประติมากรรม Play Loop เป็นภาพที่สร้างด้วย AI สำหรับงานออกแบบใหม่นี้
- กราฟิกบทความเป็น SVG ที่สร้างใหม่
- ฟอนต์ Space Grotesk, Manrope, Noto Sans Thai — มี SIL Open Font License ใน `public/licenses/`
- เครื่องหมายการค้าและภาพผลงานเดิมเป็นของเจ้าของสิทธิ์แต่ละราย

## QA
- TypeScript และ Production build ผ่าน
- ทดสอบการสลับภาษา, ค้นหา/กรองผลงาน, Dialog, Services accordion, Client filter, Blog reader, Mobile navigation และ Brief download
- ไม่พบ horizontal overflow ใน 10 เส้นทาง ที่ขนาด 360 / 390 / 768 / 1024 / 1440 px
- axe-core WCAG A/AA ไม่พบ violations ในหน้าที่ตรวจ (ผลอัตโนมัติไม่แทนการตรวจ Accessibility ด้วยคน)
- ID และ metadata ของ YouTube ตรวจผ่าน oEmbed; loop/sound/pause/restart API logic ตรวจด้วย mock เพราะ YouTube ป้องกัน bot ใน Headless browser จึงควรทดสอบเสียงและการเล่นจริงบน Browser ปกติอีกครั้ง

สคริปต์ตรวจสอบอยู่ใน `scripts/` (ติดตั้ง Chromium ด้วย `npx playwright install --with-deps chromium` ก่อนใช้)
