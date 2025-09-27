# ✂️ Tailor Shop Management System

### ระบบจัดการร้านเย็บผ้า

โปรเจกต์นี้เป็น **ระบบจัดการร้านเย็บผ้า** ที่สร้างด้วย Next.js 15 และ TypeScript เพื่อช่วยร้านเย็บผ้าจัดการคำสั่งซื้อ ติดตามความคืบหน้า และสร้างรายงานรายได้

## 🚀 เทคโนโล ジ ีที่ใช้

- **Frontend**: Next.js 15 (App Router) + React 19
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS + Radix UI
- **Language**: TypeScript
- **Build Tool**: Turbopack

## 📁 โครงสร้างโปรเจกต์

```
tailor-shop/
├── prisma/                 # การจัดการฐานข้อมูล
│   ├── schema.prisma       # Schema ของฐานข้อมูล
│   ├── tailor.db          # ไฟล์ SQLite database
│   └── migrations/        # ไฟล์ migration
├── src/
│   ├── app/               # App Router ของ Next.js 15
│   │   ├── (app)/         # Route group สำหรับหน้าหลัก
│   │   └── api/           # API Routes
│   ├── components/        # React Components
│   │   ├── navigation.tsx # Navigation bar
│   │   └── ui/           # UI Components (Button, Input, etc.)
│   └── lib/              # Utilities และ Prisma client
└── public/               # Static files และ uploads
```

## 🎯 ฟีเจอร์หลัก

### 1. **หน้าแรก (Dashboard)**

- แสดงภาพรวมของร้าน
- ลิงค์ไปยังฟีเจอร์ต่างๆ
- คำแนะนำวิธีใช้งาน

### 2. **จัดการรายการเย็บผ้า** (`/orders`)

- ✅ ดูรายการทั้งหมด
- ✅ สร้างรายการใหม่
- ✅ แก้ไขและอัปเดทสถานะ
- ✅ อัปโหลดรูปภาพ
- ✅ ติดตามความคืบหน้า

### 3. **รายงานรายได้** (`/reports`)

- 📊 รายงานรายได้ประจำวัน
- 📊 รายงานรายได้ประจำเดือน
- 📊 รายงานรายได้ประจำปี

## 🗄️ โครงสร้างฐานข้อมูล

```prisma
model Order {
  id              Int       @id @default(autoincrement())
  queueNumber     Int       // หมายเลขคิว
  customerName    String    // ชื่อลูกค้า
  customerPhone   String    // หมายเลขโทรศัพท์
  serviceType     String    // ประเภทบริการ (ตัด, เย็บ, ปัก)
  notes           String?   // หมายเหตุ
  pickupDate      DateTime  // วันที่นัดรับสินค้า
  price           Float     // ราคา
  paymentStatus   Boolean   // สถานะการชำระเงิน
  processingStatus String   // สถานะการดำเนินงาน
  imageUrls       String?   // รูปภาพ (JSON string)
  createdAt       DateTime  // วันที่สร้าง
  updatedAt       DateTime  // วันที่อัปเดท
}
```

## 🔧 การติดตั้งและใช้งาน

### 1. Clone โปรเจกต์

```bash
git clone <repository-url>
cd tailor-shop
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่าฐานข้อมูล

```bash
# สร้างและรัน migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

### 4. รันเซิร์ฟเวอร์พัฒนา

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 📜 คำสั่งที่สำคัญ

```bash
npm run dev              # รันเซิร์ฟเวอร์พัฒนา
npm run build            # Build สำหรับ production
npm run start            # รัน production server
npm run prisma:studio    # เปิด Prisma Studio (GUI สำหรับฐานข้อมูล)
npm run prisma:migrate   # รัน database migration
npm run prisma:generate  # Generate Prisma Client
npm run lint            # ตรวจสอบ ESLint
```

## 🛠️ API Endpoints

```
GET    /api/orders          # ดึงรายการทั้งหมด
POST   /api/orders          # สร้างรายการใหม่
GET    /api/orders/[id]     # ดึงรายการเฉพาะ
PUT    /api/orders/[id]     # แก้ไขรายการ
DELETE /api/orders/[id]     # ลบรายการ
GET    /api/reports/income  # ดึงข้อมูลรายได้
POST   /api/upload          # อัปโหลดรูปภาพ
```

## 💾 การใช้งาน SQLite และ Prisma

### 🔰 สำหรับผู้เริ่มต้น - วิธีเข้าถึงฐานข้อมูล

#### 1. **วิธีที่ง่ายที่สุด: ใช้ Prisma Studio (แนะนำ)**

```bash
# รันคำสั่งนี้ใน Terminal
npm run prisma:studio
```

- เปิดเบราว์เซอร์ที่ [http://localhost:5555](http://localhost:5555)
- จะได้หน้าจอ GUI สำหรับจัดการฐานข้อมูลแบบง่ายๆ
- สามารถดู แก้ไข เพิ่ม ลบข้อมูลได้โดยไม่ต้องเขียนโค้ด

#### 2. **วิธีการติดตั้งและเตรียมฐานข้อมูล**

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. รัน migration เพื่อสร้างตาราง
npm run prisma:migrate

# 4. เปิด Prisma Studio
npm run prisma:studio
```

#### 3. **ตรวจสอบไฟล์ฐานข้อมูล**

ไฟล์ SQLite อยู่ที่: `prisma/tailor.db`

- สามารถเปิดดูด้วยโปรแกรม SQLite Browser
- หรือใช้ VS Code extension สำหรับ SQLite

#### 4. **การทดสอบการเชื่อมต่อ**

สร้างไฟล์ทดสอบ `test-connection.js`:

```bash
# สร้างไฟล์ทดสอบ
touch test-connection.js

# เพิ่มโค้ดนี้ลงในไฟล์
echo 'const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testConnection() {
  try {
    const orders = await prisma.order.findMany();
    console.log("🎉 เชื่อมต่อฐานข้อมูลสำเร็จ!");
    console.log("📊 จำนวนรายการ:", orders.length);
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();' > test-connection.js

# รันไฟล์ทดสอบ
node test-connection.js
```

### 💡 การใช้งานผ่านโค้ด (สำหรับนักพัฒนา)

#### การเชื่อมต่อฐานข้อมูล

```typescript
import { prisma } from "@/lib/prisma";

// ดึงข้อมูลทั้งหมด
const orders = await prisma.order.findMany();

// สร้างรายการใหม่
const newOrder = await prisma.order.create({
  data: {
    queueNumber: 10,
    customerName: "สมชาย ใจดี",
    customerPhone: "0891234567",
    serviceType: "ตัดชุดสูท",
    pickupDate: new Date("2025-10-01"),
    price: 2500,
    paymentStatus: false,
    processingStatus: "not started",
  },
});

// ค้นหาด้วยเงื่อนไข
const inProgressOrders = await prisma.order.findMany({
  where: {
    processingStatus: "in progress",
  },
});

// อัปเดทรายการ
const updatedOrder = await prisma.order.update({
  where: { id: 1 },
  data: { processingStatus: "completed" },
});

// ลบรายการ
const deletedOrder = await prisma.order.delete({
  where: { id: 1 },
});
```

### 🛠️ เครื่องมือเสริมสำหรับ SQLite

#### VS Code Extensions

- **SQLite Viewer** - ดูไฟล์ .db ใน VS Code
- **Prisma** - Syntax highlighting สำหรับ schema.prisma

#### Desktop Applications

- **DB Browser for SQLite** - โปรแกรมฟรีสำหรับจัดการ SQLite
- **TablePlus** - GUI Database client (มี version ฟรี)

### 🚨 ข้อควรระวัง

1. **Backup ข้อมูล**: คัดลอกไฟล์ `prisma/tailor.db` เป็นประจำ
2. **Migration**: ใช้ `npm run prisma:migrate` เมื่อเปลี่ยน schema
3. **Generate Client**: รัน `npm run prisma:generate` หลังแก้ไข schema

### 🎯 Quick Start สำหรับผู้เริ่มต้น

```bash
# 1. รันโปรเจกต์
npm run dev

# 2. เปิด Terminal ใหม่ และรันคำสั่งนี้
npm run prisma:studio

# 3. เปิดเบราว์เซอร์ที่ localhost:5555
# 4. เริ่มเพิ่มข้อมูลใน Order table ได้เลย!
```

## 🎨 UI Components

โปรเจกต์ใช้ **Radix UI** + **Tailwind CSS** สำหรับ UI Components:

- `Button` - ปุ่มต่างๆ
- `Input` - ช่องกรอกข้อมูล
- `Select` - Dropdown selection
- `DatePicker` - เลือกวันที่
- `ImageUploader` - อัปโหลดรูปภาพ
- `Navigation` - แถบนำทาง

## 🚀 Flow การทำงาน

1. **สร้างรายการใหม่**: หน้าแรก → สร้างรายการใหม่ → กรอกข้อมูล → บันทึก
2. **จัดการรายการ**: รายการเย็บผ้า → เลือกรายการ → แก้ไขสถานะ → บันทึก
3. **ดูรายงาน**: รายงานรายได้ → เลือกช่วงเวลา → ดูสถิติและกราฟ

## 📱 Responsive Design

- ✅ รองรับมือถือ (Mobile First)
- ✅ รองรับแท็บเล็ต
- ✅ รองรับเดสก์ทอป
- ✅ ใช้ภาษาไทย

## 🔍 การทดสอบข้อมูล

สร้างไฟล์ `src/lib/test-db.ts` เพื่อทดสอบการเชื่อมต่อฐานข้อมูล:

```bash
npx tsx src/lib/test-db.ts
```

## 📦 Dependencies หลัก

- `next` - Next.js framework
- `react` - React library
- `@prisma/client` - Prisma ORM client
- `tailwindcss` - CSS framework
- `@radix-ui/react-*` - UI components
- `react-hook-form` - Form management
- `date-fns` - Date utilities

## 🚀 การ Deploy

### Deploy บน Vercel

1. Push code ไปยัง GitHub
2. เชื่อมต่อ repository กับ Vercel
3. Configure environment variables
4. Deploy

### Environment Variables

```env
DATABASE_URL="file:./tailor.db"
```

## 🤝 การพัฒนาต่อ

1. Fork repository
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. สร้าง Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

สร้างโดย: Tuckick
Repository: [tailor_shop](https://github.com/Tuckick/tailor_shop)

---

### 📞 การช่วยเหลือ

หากมีคำถามหรือปัญหาในการใช้งาน สามารถสร้าง Issue ใน GitHub repository หรือติดต่อผู้พัฒนาได้
