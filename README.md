# Discord → LINE Notification Bridge

ระบบส่งต่อข้อความจาก Discord ไปยัง LINE อัตโนมัติ ผ่าน LINE Messaging API

## สิ่งที่ต้องเตรียม

### 1. Discord Bot
1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. เลือก Application ของคุณ (ID: `1502771921014624509`)
3. ไปที่ **Bot** → Copy **Token**
4. ✅ เปิด **MESSAGE CONTENT INTENT** ใน Bot > Privileged Gateway Intents
5. ไปที่ **OAuth2 > URL Generator** → เลือก `bot` scope → เลือก permissions:
   - Read Messages/View Channels
   - Read Message History
6. ใช้ URL ที่ได้เชิญ Bot เข้า Server

### 2. LINE Messaging API
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Channel ใหม่ (Messaging API) หรือใช้ที่มีอยู่
3. ไปที่ **Messaging API** tab → Issue **Channel access token** (long-lived)
4. ไปที่ **Basic settings** → จด **Your user ID** (เพื่อให้ Bot ส่งข้อความเข้าแชทส่วนตัว)
5. ⚠️ **เพิ่ม Bot เป็นเพื่อน** — scan QR code หรือ search LINE ID ของ Bot

### 3. Discord Channel IDs
1. เปิด Discord > User Settings > Advanced > เปิด **Developer Mode**
2. คลิกขวาที่ channel ที่ต้องการ → **Copy Channel ID**
3. ถ้ามีหลาย channel ใส่คั่นด้วย comma

## ติดตั้ง

```bash
# Clone และติดตั้ง dependencies
npm install

# คัดลอก .env
cp .env.example .env

# แก้ไข .env ใส่ค่าทั้งหมด
```

## ตั้งค่า .env

```env
DISCORD_BOT_TOKEN=your_discord_bot_token
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_TARGET_ID=your_line_user_id
DISCORD_CHANNEL_IDS=channel_id_1,channel_id_2
```

## รัน

```bash
# Development (auto-restart on file change)
npm run dev

# Production
npm start
```

## Deploy บน Railway

1. Push โค้ดขึ้น GitHub
2. ไปที่ [Railway](https://railway.app/) → New Project → Deploy from GitHub
3. ตั้งค่า Environment Variables ตาม `.env.example`
4. Railway จะ build Dockerfile อัตโนมัติ

## Deploy บน Render

1. Push โค้ดขึ้น GitHub
2. ไปที่ [Render](https://render.com/) → New > Web Service → เชื่อม GitHub
3. Build Command: `npm install`
4. Start Command: `node src/index.js`
5. ตั้ง Environment Variables
6. เลือก Instance Type: Free (หรือ Starter สำหรับ 24/7)

## รูปแบบข้อความที่ส่งใน LINE

ข้อความจะถูกส่งเป็น **Flex Message** แบบ table:

| ฟิลด์ | รายละเอียด |
|-------|-----------|
| 📍 Server | ชื่อ Discord Server |
| 💬 Channel | ชื่อห้อง |
| 👤 ผู้ส่ง | ชื่อผู้ส่ง |
| ⏰ เวลา | เวลาไทย |
| 📝 เนื้อหา | เนื้อหาข้อความ |
| 📎 ไฟล์แนบ | ลิงก์ไฟล์ + preview รูป |
