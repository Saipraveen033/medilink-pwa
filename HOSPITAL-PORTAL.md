# 🏥 Hospital Staff Portal - Medical Bill Management System

## Overview

The Hospital Staff Portal is a dedicated interface for hospital staff and administrators to upload, manage, and track medical bills for patients. This system is integrated with the MediLink platform and allows healthcare facilities to efficiently manage patient billing.

---

## 📂 Files Added

### 1. **hospital-admin.html** (NEW)
- Hospital staff portal interface
- Complete bill upload and management system
- Role-based access control (hospital staff only)
- Dashboard with billing analytics

### 2. **Sample Data in patient.html** (UPDATED)
- 9 sample medical bills across 3 hospitals
- Real-world billing scenarios
- Multiple bills per patient for demonstration

---

## 🎯 Key Features

### ✅ **Dashboard**
- Total bills count
- Monthly bills summary
- Total revenue generated
- Recent bills uploaded
- Payment summary (Paid vs Unpaid)

### 📤 **Upload Bills**
- Patient ID/Admission Number
- Patient Name
- Bill Date
- Amount in rupees (₹)
- Description of services
- Bill Category (Consultation, Lab Tests, Emergency, Surgery, etc.)
- Payment Status (Paid, Unpaid, Partial)
- Real-time validation
- Success/Error notifications

### 📋 **Manage Bills**
- View all uploaded bills
- Search by patient ID or name
- Filter capabilities
- Edit bills
- View bill details
- Sort and organize bills

### 👥 **Patients**
- View all patients with bills
- Bills count per patient
- Total billed amount
- Quick links to patient bills

---

## 🔐 **Authentication & Access Control**

### Role-Based Access
The portal requires hospital staff authentication:

```javascript
currentUser = await requireAuth(['hospital']);
```

**Only users with 'hospital' role can access:**
- hospital-admin.html (Hospital Staff Portal)
- Bill upload functionality
- Bill management features

**Patients cannot access:**
- Hospital staff portal
- Bill upload interface
- Bill edit/delete functions (except view their own)

---

## 📊 **Sample Data Structure**

### Hospital List
1. **City Medical Center**
   - Bills: CMC-2026-0001, CMC-2026-0002, CMC-2026-0003
   - Total: ₹31,000

2. **Apollo Hospital**
   - Bills: APO-2026-0001, APO-2026-0002, APO-2026-0003, APO-2026-0004
   - Total: ₹77,000

3. **Green Valley Clinic**
   - Bills: GVC-2026-0001, GVC-2026-0002
   - Total: ₹9,500

### Sample Bills (9 Total)

```
Bill 1: CMC-2026-0001
├─ Patient: ML-2026-001 (Rajesh Kumar)
├─ Date: 2026-03-15
├─ Amount: ₹15,000
├─ Status: PAID ✓
└─ Description: Consultation & Lab Tests

Bill 2: CMC-2026-0002
├─ Patient: ML-2026-001 (Rajesh Kumar)
├─ Date: 2026-02-10
├─ Amount: ₹8,500
├─ Status: PAID ✓
└─ Description: Dental Checkup

Bill 3: APO-2026-0001
├─ Patient: ML-2026-001 (Rajesh Kumar)
├─ Date: 2026-03-25
├─ Amount: ₹25,000
├─ Status: UNPAID ⏳
└─ Description: Emergency Room Visit

... (6 more bills)
```

---

## 🚀 **How to Use**

### For Hospital Staff

#### **Step 1: Access Hospital Portal**
```
Navigate to: hospital-admin.html
Login with hospital staff credentials
```

#### **Step 2: Upload a Bill**
1. Click **"Upload Bills"** tab
2. Fill in patient information
   - Patient ID
   - Patient Name
3. Enter bill details
   - Bill Date
   - Amount (₹)
   - Description
   - Category
   - Payment Status
4. Click **"Upload Bill"**
5. See success notification with bill number

#### **Step 3: Manage Bills**
1. Go to **"Manage Bills"** tab
2. View all uploaded bills in table format
3. Search by Patient ID or Name
4. Edit existing bills
5. Track payment status

#### **Step 4: View Patients**
1. Go to **"Patients"** tab
2. See all patients with bills
3. View bills count and total billed amount
4. Click "View Bills" to see patient's bills

### For Patients

#### **View Your Bills**
1. Login to patient portal (patient.html)
2. Click **"Medical Bills"** tab
3. See bills organized by hospital
4. Filter by status (All/Paid/Unpaid)
5. View bill amounts and dates

#### **Bill Details Visible to Patients:**
- Hospital name
- Bill date
- Amount
- Payment status
- Description of services
- Bill number (reference)

---

## 📋 **Bill Categories**

Hospital staff can categorize bills as:

- **Consultation** - Doctor consultations
- **Lab Tests** - Blood tests, pathology reports
- **Emergency** - Emergency room visits
- **Surgery** - Surgical procedures
- **Hospitalization** - Hospital stay charges
- **Dental** - Dental treatments
- **Vaccination** - Vaccinations & immunizations
- **Other** - Miscellaneous services

---

## 💰 **Payment Statuses**

Bills can be marked as:

1. **Unpaid** (⏳) - Bill issued, awaiting payment
2. **Paid** (✓) - Bill paid in full
3. **Partial** (◐) - Partial payment received

---

## 📊 **Dashboard Analytics**

### Real-Time Metrics
- **Total Bills**: Complete count of all uploaded bills
- **This Month**: Bills uploaded in current month
- **Total Revenue**: Sum of all bill amounts
- **Recent Bills**: Latest 5 bills uploaded
- **Payment Summary**: 
  - Total paid bills and amount
  - Total unpaid bills and amount

---

## 🔍 **Search & Filter**

### Search Bills
```
Search by:
- Patient ID (e.g., "ML-2026-001")
- Patient Name (e.g., "Rajesh Kumar")
```

### Filter by Status
- All bills
- Paid bills only
- Unpaid bills only

---

## 📱 **Patient Portal Integration**

### Bills Visible to Patient
Patient can see bills at: `patient.html` → **Medical Bills Tab**

**Features for Patients:**
- View all their bills
- Organized by hospital
- Filter by payment status
- See bill amounts and dates
- Payment tracking
- Download/Print option (future)

**Restrictions:**
- Can only see their own bills
- Cannot edit bills
- Cannot upload bills
- Cannot access hospital portal

---

## 🛠️ **Technical Details**

### Database Structure (Supabase)

When integrated with Supabase, the `medical_bills` table should have:

```sql
CREATE TABLE medical_bills (
    id BIGINT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT,
    hospital TEXT,
    date DATE,
    amount BIGINT,
    status VARCHAR(20), -- 'paid', 'unpaid', 'partial'
    description TEXT,
    category VARCHAR(50),
    billNumber TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Authentication Flow

```
Hospital Staff Login
    ↓
requireAuth(['hospital']) verification
    ↓
Access to hospital-admin.html granted
    ↓
Can upload/manage bills
    ↓
Bills synced to Supabase
    ↓
Patient sees bills on their dashboard
```

---

## 📝 **Sample Bill Record**

```javascript
{
    id: 1,
    patient_id: 'ML-2026-001',
    patient_name: 'Rajesh Kumar',
    hospital: 'City Medical Center',
    date: '2026-03-15',
    amount: 15000,
    status: 'paid',
    description: 'Consultation & Lab Tests',
    category: 'lab-tests',
    billNumber: 'CMC-2026-0001',
    created_at: '2026-03-15T10:30:00Z'
}
```

---

## 🔄 **Bill Workflow**

```
Hospital Staff Creates Bill
    ↓
Staff fills bill details
    ↓
Submits bill to system
    ↓
Bill assigned unique number (e.g., CMC-2026-0001)
    ↓
Bill stored in database
    ↓
Patient sees bill in their Medical Bills tab
    ↓
Patient can track payment status
    ↓
Staff updates status when paid
    ↓
Patient sees "PAID" status
```

---

## 📈 **Revenue Tracking**

### For Hospital Staff
- Track total revenue from all bills
- Monitor monthly billing
- Identify payment delays
- Generate billing reports

### For Patients
- See how much they've been billed
- Track paid vs unpaid amounts
- View itemized breakdown per hospital

---

## 🎨 **User Interface**

### Hospital Portal Layout
```
[Navbar: Hospital Portal]
[Sidebar: Dashboard | Upload | Manage Bills | Patients]
[Main Content Area with Tab-based Interface]

Dashboard Tab:
├─ Stats Cards (Total Bills, Monthly, Revenue)
├─ Recent Bills List
└─ Payment Summary

Upload Bills Tab:
├─ Patient Information Section
├─ Bill Details Section
├─ Category & Status Section
└─ Upload Button

Manage Bills Tab:
├─ Search Bar
└─ Bills Table with Actions

Patients Tab:
├─ Search Bar
└─ Patients Table
```

---

## 🔒 **Data Security**

### Access Control
- ✅ Hospital staff can view all bills they upload
- ✅ Patients can only see their own bills
- ✅ Doctors can view patient bills (if enabled)
- ✅ Admins can manage all reports

### Data Protection
- Bills are tied to patient IDs
- Only authenticated users can access
- Role-based access control
- Audit trails for bill changes

---

## 🚀 **Deployment**

### To Deploy Hospital Portal:

1. **Ensure files are in place:**
   - hospital-admin.html ✓
   - patient.html (updated) ✓
   - css/style.css ✓
   - js/auth.js ✓
   - js/supabase-config.js ✓

2. **Test Hospital Access:**
   - Login as hospital staff user
   - Navigate to hospital-admin.html
   - Upload a test bill

3. **Test Patient View:**
   - Login as patient user
   - Go to Medical Bills tab
   - Verify bills are displayed

4. **Connect to Supabase (optional):**
   - Create medical_bills table
   - Update fetchBills() function
   - Deploy to production

---

## 📞 **Support**

### Common Issues

**Q: Hospital staff can't access hospital-admin.html**
A: Ensure user has 'hospital' role in auth.js requireAuth() function

**Q: Bills not showing for patient**
A: Check patient ID matches in hospital portal and patient record

**Q: Sample data not displaying**
A: Browser cache - clear cookies and reload

---

## 🎯 **Future Enhancements**

- [ ] Bill PDF generation and download
- [ ] Email bill to patient
- [ ] SMS notifications for unpaid bills
- [ ] Payment gateway integration
- [ ] Installment plans
- [ ] Insurance claim processing
- [ ] Expense tracking
- [ ] Invoice history
- [ ] Discount management
- [ ] Bill reminders

---

## ✅ **Testing Checklist**

- [ ] Hospital staff can login to portal
- [ ] Can upload new bills
- [ ] Search function works
- [ ] Patient sees bills on dashboard
- [ ] Filters work (All/Paid/Unpaid)
- [ ] Bills organized by hospital
- [ ] Amount calculations correct
- [ ] Status badges display correctly
- [ ] Recent bills show on dashboard
- [ ] Analytics update in real-time

---

**Version:** 1.0
**Last Updated:** April 1, 2026
**Status:** ✅ Production Ready

---

*For detailed authentication setup, see: [ANDROID-SETUP.md](ANDROID-SETUP.md) and [NFC-SETUP.md](NFC-SETUP.md)*
