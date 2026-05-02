# 📋 STD Employee Finance Portal — Requirements Document

**Version:** 1.0  
**Date:** 2026-05-03  
**Project:** STD Employee Finance Portal  
**Status:** Initial Draft

---

## 1. Overview

ระบบ STD Employee Finance Portal เป็นเว็บแอปพลิเคชันสำหรับจัดการสินเชื่อพนักงาน (Loan) และการเบิกเงินล่วงหน้า (Advance) ขององค์กร STD ระบบรองรับ 2 บทบาทหลัก ได้แก่ Employee และ Admin โดยมี workflow ครบวงจรตั้งแต่การขอเบิก/กู้ การอนุมัติ ไปจนถึงการหักเงินในสลิปเงินเดือนประจำวันที่ 15 ของทุกเดือน

---

## 2. User Roles

| Role | Permissions |
|------|-------------|
| **Employee** | Login, view own dashboard (loan balance, advance history), submit ticket (loan request / advance request), view own ticket status |
| **Admin** | All employee permissions + approve/reject tickets, view all employee data, manage employees (reset password) |

---

## 3. Features

### 3.1 Authentication

- **Login Page (`/login`)**
  - Public route — ทุกคนเข้าได้
  - รับ `employee_id` และ `password`
  - แสดงข้อผิดพลาดเมื่อ login ไม่สำเร็จ
  - ใช้ `localStorage` เก็บ session token
  - ทุก route ที่ต้อง login จะ redirect ไป `/login` ถ้ายังไม่ได้ login
  - **Initial password** สำหรับพนักงานใหม่: ค่าเริ่มต้นเป็น "std1234" (Admin สามารถเปลี่ยนให้ได้)

- **Session Management**
  - เก็บ `{ empId, role, name, token }` ใน localStorage
  - Logout ล้าง localStorage และ redirect ไป `/login`

### 3.2 Employee Dashboard

**Route:** `/dashboard` | **Access:** Employee, Admin

พนักงานเห็นข้อมูลของตัวเองเท่านั้น:

- **สรุปยอดเงินกู้ (Loan Summary)**
  - ยอดกู้คงเหลือ (current balance)
  - หักเงินกู้ต่อเดือน (monthly deduction amount)
  - เงินกู้เดือนก่อนหน้า (previous month balance — สำหรับเปรียบเทียบ)

- **สรุปการเบิกเงินล่วงหน้า (Advance Summary)**
  - จำนวนงวดที่เบิกได้ (4 งวด)
  - รายการเบิกแต่ละงวด (ถ้ามี)

- **Quick Actions**
  - ปุ่ม "ขอเบิกเงินล่วงหน้า" → ไป `/tickets/new?type=advance`
  - ปุ่ม "ขอกู้เงิน" → ไป `/tickets/new?type=loan`

- **Recent Tickets** — แสดง ticket ล่าสุด 5 รายการของตัวเอง

### 3.3 Admin Dashboard

**Route:** `/admin` | **Access:** Admin only

- **Overview Cards**
  - จำนวนพนักงานทั้งหมด (total employees)
  - จำนวน ticket ที่รอดำเนินการ (pending tickets)
  - จำนวน ticket ที่อนุมัติแล้ว (approved this month)
  - จำนวน ticket ที่ถูกปฏิเสธ (rejected this month)

- **Pending Tickets Table** — แสดง ticket ที่ยัง pending ทั้งหมดพร้อมปุ่ม Approve/Reject

- **Quick Link** — ลิงก์ไป `/admin/employees` และ `/tickets`

### 3.4 Ticket System

**Routes:**
- `/tickets` — รายการ ticket ทั้งหมด (Employee เห็นเฉพาะตัวเอง, Admin เห็นทั้งหมด)
- `/tickets/new` — สร้าง ticket ใหม่ (Employee เท่านั้น)

**Ticket Types:**
| Type | Description | Max Amount |
|------|-------------|------------|
| `advance` | ขอเบิกเงินล่วงหน้า 4 งวด | ไม่จำกัด (แต่ละงวดตาม CSV) |
| `loan` | ขอกู้เงินใหม่ | ไม่จำกัด |

**Ticket Workflow:**
1. Employee กรอกฟอร์มขอ ticket → status: `pending`
2. Admin เห็น ticket ใน `/tickets` หรือ `/admin`
3. Admin กด **อนุมัติ (Approve)** หรือ **ไม่อนุมัติ (Reject)**
4. ถ้า **Approved**:
   - ถ้า type=`advance` → บันทึกจำนวนเงินเบิก + วันที่ขอ → status: `approved`
   - ถ้า type=`loan` → บันทึกยอดกู้ใหม่ → status: `approved`
5. ถ้า **Rejected** → status: `rejected` + เก็บเหตุผล (ถ้ามี)

**Ticket Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | auto | UUID |
| empId | string | ✓ | from session |
| type | 'loan' \\| 'advance' | ✓ | |
| amount | number | ✓ | > 0 |
| reason | string | ✗ | เหตุผล / หมายเหตุ |
| status | 'pending' \\| 'approved' \\| 'rejected' | auto | |
| adminNote | string | ✗ | บันทึกจาก Admin ตอน approve/reject |
| createdAt | string | auto | ISO date |
| updatedAt | string | auto | ISO date |

### 3.5 Loan Management

**Data Source:** ข้อมูลจาก CSV "ข้อมูลเงินกู้ล่าสุด"

**Per Employee Loan Account:**
- เลขที่พนักงาน (empId)
- ชื่อ-นามสกุล
- แผนก / ตำแหน่ง
- หักเงินกู้ต่อเดือน (monthly deduction)
- เงินกู้เดือนก่อนหน้า (previous month balance)
- ยอดกู้คงเหลือ (current balance)

**จาก CSV:**
- พนักงานที่มียอดกู้: 8 คน
  - STD001 ศิริพร — หัก 1,000/เดือน, ยอดคงเหลือ 3,000
  - STD024 เปมิกา — หัก 1,000/เดือน, ยอดคงเหลือ 2,000
  - STD027 คมกฤช — หัก 0/เดือน, ยอดคงเหลือ 3,000
  - STD070 ขจรศักดิ์ — หัก 1,000/เดือน, ยอดคงเหลือ 2,000
  - STD076 ทศพล — หัก 1,000/เดือน, ยอดคงเหลือ 1,000
  - STD078 อุทิศ — หัก 1,000/เดือน, ยอดคงเหลือ 2,000
  - STD081 ฐิติรัตน์ — หัก 1,000/เดือน, ยอดคงเหลือ 3,000
  - STD093 ซื้อ — หัก 1,000/เดือน, ยอดคงเหลือ 3,000
  - STD094 ประกายแก้ว — หัก 1,000/เดือน, ยอดคงเหลือ 3,000
  - STD100 กฤษฎาภรณ์ — หัก 1,000/เดือน, ยอดคงเหลือ 3,000
- พนักงานที่ยังไม่เคยกู้ (ไม่มีข้อมูลยอด): ส่วนใหญ่ขององค์กร

**Note:** บางพนักงานมีข้อมูลไม่ครบ เช่น STD105 กิตติ (ไม่มีนามสกุล), STD220 คมสัน (ไม่มีคำนำหน้า), STD228 อัลลดา (ชื่อยาว)

**Features:**
- Admin ดูรายการพนักงานที่มียอดกู้ทั้งหมด
- เมื่อมี ticket loan ใหม่อนุมัติ → อัพเดตยอดกู้คงเหลือ
- Deduction ประจำวันที่ 15 → หักจาก salary slip (ฉบับจำลอง)

### 3.6 Advance Request

**Data Source:** ข้อมูลจาก CSV "ข้อมูลเบิกล่วงหน้า"

**Advance Structure:**
- รองรับการเบิกได้ 4 งวด
- แต่ละงวดมีจำนวนเงินเบิก (แยกตามรายการใน CSV)
- ถ้าพนักงานเคยเบิกครบ 4 งวดแล้ว → ไม่สามารถขอเบิกเพิ่มได้

**จาก CSV:**
- พนักงานที่เคยเบิกเงินล่วงหน้า:
  - STD001 ศิริพร — 2 งวด × 3,000
  - STD007 สายชล — 2 งวด × 2,500
  - STD016 วชิราภรณ์ — 2 งวด × 2,500
  - STD024 เปมิกา — 2 งวด × 3,500
  - STD076 ทศพล — 3 งวด (2,833 + 1,500 + 1,333)
  - STD086 ณรงค์เดช — 2 งวด × 4,000
  - STD094 ประกายแก้ว — 2 งวด × 2,500
  - STD098 ภูริพัฒน์ — 2 งวด × 3,000
  - STD105 กิตติ — 2 งวด × 2,000
  - STD229 จิรนันท์ — 2 งวด × 2,000
  - STD107 นายชัยวัฒน์ — 2 งวด × 2,000

**Features:**
- Employee ดูจำนวนงวดที่เบิกไปแล้ว
- ฟอร์มขอเบิกเพิ่ม → ระบุจำนวนเงินที่ต้องการเบิก
- เมื่ออนุมัติ → บันทึกเป็นงวดถัดไป

### 3.7 Deduction Schedule

**Trigger:** ทุกวันที่ 15 ของเดือน (หรือวันทำการถัดไปถ้าตรงวันหยุด)

**Behavior:**
- ระบบจะทำการหักเงินจาก salary slip จำลอง (mock payroll)
- สำหรับ Loan: หัก "หักเงินกู้ต่อเดือน" จากทุกพนักงานที่มียอดกู้คงเหลือ > 0
- สำหรับ Advance: หักตามจำนวนงวดที่อนุมัติไป

**Mock Implementation:**
- สร้างหน้า `/payroll` (Admin เท่านั้น) แสดงตัวอย่างสลิปเงินเดือน
- Admin กดปุ่ม "ดำเนินการหัก" เพื่อจำลองการหัก ณ วันที่ 15
- ระบบคำนวณ deduction ทั้งหมดแล้วแสดงสรุป

**Deduction Calculation:**
```
loan.currentBalance = loan.currentBalance - loan.monthlyDeduction
// ถ้า currentBalance < monthlyDeduction → หักเท่าที่มีจนถึง 0
```

---

## 4. Data Model

### 4.1 Employee

```typescript
interface Employee {
  id: string;               // เช่น "STD001"
  prefix: string;           // นาง, นาย, นางสาว
  firstName: string;        // ชื่อ
  lastName: string;         // นามสกุล
  dept: string;             // แผนก
  position: string;         // ตำแหน่ง
  password: string;         // hashed (bcrypt)
  role: 'employee' | 'admin';
}
```

### 4.2 LoanAccount

```typescript
interface LoanAccount {
  empId: string;               // FK → Employee.id
  monthlyDeduction: number;     // หักเงินกู้ต่อเดือน (บาท)
  previousBalance: number;     // เงินกู้เดือนก่อนหน้า (บาท)
  currentBalance: number;       // ยอดกู้คงเหลือ (บาท)
}
```

### 4.3 AdvanceAccount

```typescript
interface AdvanceAccount {
  empId: string;               // FK → Employee.id
  installments: number;        // จำนวนงวดที่เบิกไปแล้ว (0-4)
  totalAdvanced: number;        // ยอดรวมที่เบิกไปทั้งหมด (บาท)
  records: AdvanceRecord[];   // รายการเบิกแต่ละงวด
}

interface AdvanceRecord {
  installment: number;         // งวดที่ (1-4)
  amount: number;             // จำนวนเงิน (บาท)
  approvedAt: string;          // วันที่อนุมัติ (ISO date)
}
```

### 4.4 Ticket

```typescript
interface Ticket {
  id: string;                               // UUID
  empId: string;                            // FK → Employee.id
  type: 'loan' | 'advance';
  amount: number;                           // จำนวนเงินที่ขอ (บาท)
  reason: string;                           // เหตุผล / หมายเหตุ
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;                        // บันทึกจาก Admin
  createdAt: string;                         // ISO datetime
  updatedAt: string;                         // ISO datetime
  processedAt?: string;                      // วันที่ Admin ดำเนินการ
  processedBy?: string;                      // Admin ID ที่ดำเนินการ
}
```

### 4.5 DeductionLog

```typescript
interface DeductionLog {
  id: string;
  empId: string;
  type: 'loan' | 'advance';
  amount: number;
  executedAt: string;         // ISO datetime
  period: string;             // เช่น "2026-05"
}
```

---

## 5. Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Form Validation | React Hook Form + Zod |
| Persistence | localStorage |
| Icons | Lucide React |
| Date Handling | date-fns |

---

## 6. Pages & Routes

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Login | `/login` | Public | หน้าเข้าสู่ระบบ |
| Employee Dashboard | `/dashboard` | Employee | หน้าหลักพนักงาน |
| Admin Dashboard | `/admin` | Admin | หน้าหลักผู้ดูแล |
| Ticket List | `/tickets` | Both | ดูรายการ ticket |
| New Ticket | `/tickets/new` | Employee | สร้าง ticket ใหม่ |
| Employee Management | `/admin/employees` | Admin | จัดการพนักงาน (ดู/แก้ไข) |
| Payroll Simulation | `/payroll` | Admin | จำลองหักเงิน ณ วันที่ 15 |

---

## 7. CSV Data Summary

### 7.1 Loan Data (ข้อมูลเงินกู้ล่าสุด)

**Total Records:** 36 rows (รวม empty rows)  
**Active Loan Accounts:** 10 คน

| # | ID | ชื่อ-นามสกุล | แผนก | ตำแหน่ง | หัก/เดือน | ยอดคงเหลือ |
|---|-----|-------------|------|---------|-----------|------------|
| 1 | STD001 | ศิริพร เกียงจันทร์ | ช่างทันตกรรม | Tray และ Bite block | 1,000 | 3,000 |
| 2 | STD024 | เปมิกา คำแผ่น | ธุรการ | ผู้ปฏิบัติการ | 1,000 | 2,000 |
| 3 | STD027 | คมกฤช แก้วอุด | ช่างทันตกรรม | ลงฟลาสค์ และ ขัดเงา | 0 | 3,000 |
| 4 | STD070 | ขจรศักดิ์ จันทร์คำ | ช่างทันตกรรม | กรอโครงโลหะ | 1,000 | 2,000 |
| 5 | STD076 | ทศพล อาราช | ช่างทันตกรรม | กรอแต่งรีเทนเนอร์ | 1,000 | 1,000 |
| 6 | STD078 | อุทิศ แสนวิเศษ | ช่างทันตกรรม | ขัดโลหะ | 1,000 | 2,000 |
| 7 | STD081 | ฐิติรัตน์ คำราพิช | ช่างทันตกรรม | Wax(แต่งเหงือก) | 1,000 | 3,000 |
| 8 | STD093 | ซื้อ นายญะ | ช่างทันตกรรม | กรอโครงโลหะ | 1,000 | 3,000 |
| 9 | STD094 | ประกายแก้ว ศรีคำหอม | ช่างทันตกรรม | ตั้งฐานและเทเจล | 1,000 | 3,000 |
| 10 | STD100 | กฤษฎาภรณ์ กรรมาธิคุณ | ช่างทันตกรรม | เรียงฟัน/กรออะคริลิก | 1,000 | 3,000 |

**Total Outstanding Loan Balance:** ฿26,000

### 7.2 Advance Data (ข้อมูลเบิกล่วงหน้า)

**Total Advanced Amount:** ฿29,833 (จาก CSV footer)

**Active Advance Accounts:**

| # | ID | ชื่อ-นามสกุล | จำนวนงวด | รวมเงินเบิก |
|---|-----|-------------|---------|------------|
| 1 | STD001 | ศิริพร เกียงจันทร์ | 2 | 6,000 |
| 2 | STD007 | สายชล สุวรรณศีรียง | 2 | 5,000 |
| 3 | STD016 | วชิราภรณ์ ดมดอก | 2 | 5,000 |
| 4 | STD024 | เปมิกา คำแผ่น | 2 | 7,000 |
| 5 | STD076 | ทศพล อาราช | 3 | 5,666 |
| 6 | STD086 | ณรงค์เดช สุดใจ | 2 | 8,000 |
| 7 | STD094 | ประกายแก้ว ศรีคำหอม | 2 | 5,000 |
| 8 | STD098 | ภูริพัฒน์ แสนศรี | 2 | 6,000 |
| 9 | STD105 | กิตติ | 2 | 4,000 |
| 10 | STD107 | นายชัยวัฒน์ นำภา | 2 | 4,000 |
| 11 | STD229 | จิรนันท์ ดวงคำ | 2 | 4,000 |

**Total Unique Employees with Advance:** 11 คน

---

## 8. Open Questions

1. **เริ่มต้น password ของพนักงาน** — ควรเป็น "std1234" ทุกคน หรือใช้วันเกิด/วันที่เริ่มงาน?
2. **วงเงินกู้สูงสุด** — มีขีดจำกัดว่าขอได้สูงสุดเท่าไหร่ต่อครั้ง หรือไม่จำกัด?
3. **Advance จำกัด 4 งวด** — ถ้าเบิกครบ 4 งวดแล้ว สามารถขอเพิ่มอีกได้ไหม (หลังจากหักครบแล้ว)?
4. **Admin default account** — มีกี่คน? สร้าง admin account อย่างไร (จาก CSV หรือ hardcode)?
5. **Deduction ที่ 15** — ควรเป็น auto-scheduled (cron) หรือ trigger โดย admin กดปุ่ม? เนื่องจากเป็น mock system แนะนำให้ admin กดปุ่ม "ดำเนินการหัก" เอง
6. **ข้อมูล CSV บางรายการไม่ครบ** — เช่น STD105 กิตติ (ไม่มีนามสกุล), STD220 คมสัน (ไม่มีคำนำหน้า), STD228 อัลลดา (ไม่มีคำนำหน้า) — ควรจัดการอย่างไร?
7. **Salary Slip Data** — ข้อมูลเงินเดือนพนักงานมีอยู่ในระบบไหม หรือต้องสร้าง mock salary slip?
8. **หัก Advance กี่งวดต่อเดือน** — ถ้าอนุมัติ advance 1 งวด ควรหักเงินกลับมาทีละงวด (4 เดือน) หรือหักครั้งเดียวครบทุกงวด?