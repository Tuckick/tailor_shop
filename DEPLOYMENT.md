# ✂️ Tailor Shop - Step-by-Step Deployment Guide with SQLite

## 🚀 การ Deploy แบบละเอียด - ใช้งานได้จริง

### 🥇 วิธีที่ 1: Railway (แนะนำสำหรับ SQLite)

Railway รองรับ SQLite ได้ดีที่สุด และ deploy ง่าย

#### ขั้นตอนที่ 1: เตรียมโปรเจกต์

```bash
# 1. ตรวจสอบโปรเจกต์ทำงานบนเครื่องก่อน
cd /path/to/tailor-shop
npm install
npm run dev

# 2. Build ทดสอบ
npm run build
```

#### ขั้นตอนที่ 2: เตรียม Production Configuration

```bash
# 1. สร้าง .env.production
touch .env.production

# 2. เพิ่มเนื้อหา:
echo 'DATABASE_URL="file:/app/data/tailor.db"
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="ระบบจัดการร้านเย็บผ้า"' > .env.production
```

#### ขั้นตอนที่ 3: Deploy บน Railway

1. **สมัคร Railway** → ไปที่ [railway.app](https://railway.app)
2. **เชื่อม GitHub** → Connect GitHub repository
3. **เลือกโปรเจกต์** → tailor_shop
4. **Configure**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. **Environment Variables**:
   ```
   DATABASE_URL=file:/app/data/tailor.db
   NODE_ENV=production
   ```
6. **Deploy** → คลิก Deploy

#### ขั้นตอนที่ 4: ตั้งค่าฐานข้อมูลหลัง Deploy

```bash
# Railway จะรัน commands เหล่านี้อัตโนมัติ:
npm run prisma:generate
npm run prisma:migrate
```

---

### 🥈 วิธีที่ 2: Render (ทางเลือก)

Render ก็รองรับ SQLite ได้

#### Deploy บน Render:

1. **สมัคร** → [render.com](https://render.com)
2. **เชื่อม GitHub** → Connect repository
3. **Create Web Service**
4. **Configuration**:
   - **Name**: tailor-shop
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     DATABASE_URL=file:./data/tailor.db
     NODE_ENV=production
     ```
5. **Deploy**

---

### 🥉 วิธีที่ 3: VPS (ควบคุมได้มากที่สุด)

สำหรับผู้ที่ต้องการควบคุมเต็มที่

#### Deploy บน VPS (Ubuntu):

```bash
# 1. เชื่อมต่อ VPS
ssh user@your-server-ip

# 2. ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. ติดตั้ง PM2
sudo npm install -g pm2

# 4. Clone โปรเจกต์
git clone https://github.com/Tuckick/tailor_shop.git
cd tailor_shop

# 5. ติดตั้ง dependencies
npm install

# 6. ตั้งค่า environment
cp .env.example .env
nano .env # แก้ไข DATABASE_URL

# 7. Build และ setup database
npm run build
npm run prisma:generate
npm run prisma:migrate

# 8. Start ด้วย PM2
pm2 start npm --name "tailor-shop" -- start
pm2 save
pm2 startup

# 9. ตั้งค่า Nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/tailor-shop

# เพิ่มเนื้อหา:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# เปิดใช้งาน
sudo ln -s /etc/nginx/sites-available/tailor-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 การแก้ไขปัญหาที่อาจเกิดขึ้น

### ปัญหา 1: Database ไม่ทำงาน

```bash
# บน Railway/Render Console:
npx prisma db push
npx prisma generate
```

### ปัญหา 2: ไฟล์อัปโหลดหาย

```bash
# เพิ่ม volume mounting หรือใช้ cloud storage
# ตัวอย่างการแก้ไข upload route:
```

### ปัญหา 3: Build Error

```bash
# ลบ .next และ build ใหม่
rm -rf .next
npm run build
```

---

## 🎯 วิธีใช้งานหลัง Deploy

### 1. ทดสอบเว็บไซต์

- เข้า URL ที่ได้จากการ deploy
- ทดสอบสร้างรายการใหม่
- ทดสอบอัปโหลดรูปภาพ
- ทดสอบบน mobile และ desktop

### 2. การสำรองข้อมูล (สำคัญ!)

```bash
# สำหรับ Railway:
railway run bash
cp /app/data/tailor.db /tmp/backup-$(date +%Y%m%d).db

# สำหรับ VPS:
scp user@server:/path/to/tailor.db ./backup-$(date +%Y%m%d).db
```

### 3. การอัปเดท

```bash
# บน Railway: git push จะ deploy อัตโนมัติ
git add .
git commit -m "Update features"
git push origin main

# บน VPS:
git pull
npm install
npm run build
pm2 restart tailor-shop
```

---

## ⚡ Quick Start - Railway (แนะนำ)

```bash
# 1. Git และ Push
git add .
git commit -m "Ready for deploy"
git push origin main

# 2. ไปที่ railway.app → New Project → Deploy from GitHub
# 3. เลือก repository → Deploy
# 4. รอ 5-10 นาที → เสร็จ!
```

---

## 📞 การช่วยเหลือ

หากมีปัญหาในการ deploy:

1. **ตรวจสอบ logs**:

   - Railway: ดูใน Dashboard → Logs
   - Render: ดูใน Dashboard → Logs
   - VPS: `pm2 logs tailor-shop`

2. **Database issues**: รัน `npx prisma db push` ใน console

3. **Build errors**: ตรวจสอบ dependencies ใน package.json

**Happy Deploying! 🚀**
