# 🗄️ Medical Bills Database Setup Guide

## Overview

This guide explains how to set up the Supabase database tables for the medical billing system used in MediLink.

---

## 📊 Database Schema

### Table 1: medical_bills

**Purpose:** Store all medical bills for patients

```sql
CREATE TABLE public.medical_bills (
    id BIGSERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    hospital TEXT NOT NULL,
    date DATE NOT NULL,
    amount BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    description TEXT,
    category VARCHAR(50),
    billNumber TEXT UNIQUE NOT NULL,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    CONSTRAINT valid_status CHECK (status IN ('paid', 'unpaid', 'partial')),
    CONSTRAINT valid_category CHECK (category IN ('consultation', 'lab-tests', 'emergency', 'surgery', 'hospitalization', 'dental', 'vaccination', 'other')),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for faster queries
CREATE INDEX idx_medical_bills_patient_id ON public.medical_bills(patient_id);
CREATE INDEX idx_medical_bills_date ON public.medical_bills(date DESC);
CREATE INDEX idx_medical_bills_hospital ON public.medical_bills(hospital);
CREATE INDEX idx_medical_bills_status ON public.medical_bills(status);
```

---

## 🛡️ Row Level Security (RLS)

### Enable RLS on medical_bills table

```sql
ALTER TABLE public.medical_bills ENABLE ROW LEVEL SECURITY;

-- Policy 1: Hospital staff can insert bills
CREATE POLICY "Hospital staff can insert bills"
    ON public.medical_bills
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'hospital');

-- Policy 2: Patients can view only their bills
CREATE POLICY "Patients can view only their own bills"
    ON public.medical_bills
    FOR SELECT
    USING (patient_id = auth.jwt() ->> 'patient_id');

-- Policy 3: Admins can view all bills
CREATE POLICY "Admins can view all bills"
    ON public.medical_bills
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy 4: Hospital staff can update their own bills
CREATE POLICY "Hospital staff can update bills"
    ON public.medical_bills
    FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'hospital');
```

---

## 📈 Useful Views

### View 1: Bills Summary by Hospital

```sql
CREATE VIEW public.bills_by_hospital AS
SELECT 
    hospital,
    COUNT(*) as total_bills,
    SUM(amount) as total_amount,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_bills,
    COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid_bills,
    COUNT(CASE WHEN status = 'partial' THEN 1 END) as partial_bills,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount
FROM public.medical_bills
GROUP BY hospital
ORDER BY total_amount DESC;
```

### View 2: Outstanding Bills

```sql
CREATE VIEW public.outstanding_bills AS
SELECT 
    patient_id,
    patient_name,
    hospital,
    SUM(amount) as outstanding_amount,
    COUNT(*) as bill_count,
    MAX(date) as latest_bill_date,
    MIN(date) as oldest_bill_date
FROM public.medical_bills
WHERE status IN ('unpaid', 'partial')
GROUP BY patient_id, patient_name, hospital
ORDER BY outstanding_amount DESC;
```

### View 3: Monthly Revenue

```sql
CREATE VIEW public.monthly_revenue AS
SELECT 
    DATE_TRUNC('month', date)::DATE as month,
    hospital,
    COUNT(*) as bill_count,
    SUM(amount) as total_revenue,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount
FROM public.medical_bills
GROUP BY DATE_TRUNC('month', date), hospital
ORDER BY month DESC;
```

---

## 🔧 Setup Steps

### Step 1: Create the Table

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Paste the CREATE TABLE statement above
6. Click **Run**

### Step 2: Add Indexes

1. In SQL Editor, create a new query
2. Paste the CREATE INDEX statements
3. Click **Run**

### Step 3: Enable RLS

1. Go to **Authentication** → **Policies**
2. Select `medical_bills` table
3. Enable RLS toggle
4. Add each policy by clicking **New Policy**

### Step 4: Create Views (Optional)

1. In SQL Editor, create new queries
2. Paste each CREATE VIEW statement
3. Run each query

---

## 📝 Sample Data Insertion

### Insert Sample Bills

```sql
INSERT INTO public.medical_bills 
(patient_id, patient_name, hospital, date, amount, status, description, category, billNumber, created_by)
VALUES 
('ML-2026-001', 'Rajesh Kumar', 'City Medical Center', '2026-03-15', 15000, 'paid', 'Consultation & Lab Tests', 'lab-tests', 'CMC-2026-0001', 'hospital-staff'),
('ML-2026-001', 'Rajesh Kumar', 'City Medical Center', '2026-02-10', 8500, 'paid', 'Dental Checkup', 'dental', 'CMC-2026-0002', 'hospital-staff'),
('ML-2026-001', 'Rajesh Kumar', 'Apollo Hospital', '2026-03-25', 25000, 'unpaid', 'Emergency Room Visit', 'emergency', 'APO-2026-0001', 'hospital-staff'),
('ML-2026-001', 'Rajesh Kumar', 'Apollo Hospital', '2026-01-20', 12000, 'paid', 'Surgery & Hospital Stay', 'surgery', 'APO-2026-0002', 'hospital-staff'),
('ML-2026-001', 'Rajesh Kumar', 'Green Valley Clinic', '2026-03-30', 5500, 'unpaid', 'Vaccination & Check-up', 'vaccination', 'GVC-2026-0001', 'hospital-staff'),
('ML-2026-002', 'Priya Singh', 'Apollo Hospital', '2026-03-20', 18000, 'paid', 'X-Ray & Consultation', 'consultation', 'APO-2026-0003', 'hospital-staff'),
('ML-2026-002', 'Priya Singh', 'City Medical Center', '2026-02-28', 7500, 'paid', 'Blood Test & Pathology', 'lab-tests', 'CMC-2026-0003', 'hospital-staff'),
('ML-2026-003', 'Amit Patel', 'Green Valley Clinic', '2026-03-10', 4000, 'paid', 'Regular Checkup', 'consultation', 'GVC-2026-0002', 'hospital-staff'),
('ML-2026-003', 'Amit Patel', 'Apollo Hospital', '2026-02-15', 22000, 'unpaid', 'ICU Admission (3 days)', 'hospitalization', 'APO-2026-0004', 'hospital-staff');
```

---

## 🔍 Useful Queries

### Get All Bills for a Patient

```sql
SELECT * FROM public.medical_bills
WHERE patient_id = 'ML-2026-001'
ORDER BY date DESC;
```

### Get Unpaid Bills

```sql
SELECT * FROM public.medical_bills
WHERE status = 'unpaid'
ORDER BY date DESC;
```

### Get Bills by Hospital

```sql
SELECT * FROM public.medical_bills
WHERE hospital = 'Apollo Hospital'
ORDER BY date DESC;
```

### Get Monthly Total

```sql
SELECT 
    DATE_TRUNC('month', date)::DATE as month,
    COUNT(*) as total_bills,
    SUM(amount) as total_amount
FROM public.medical_bills
WHERE date >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

### Get Outstanding Bills

```sql
SELECT 
    patient_id,
    patient_name,
    SUM(amount) as outstanding_amount
FROM public.medical_bills
WHERE status IN ('unpaid', 'partial')
GROUP BY patient_id, patient_name
ORDER BY outstanding_amount DESC;
```

---

## 🔄 Functions & Triggers

### Function: Update Updated_at Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_medical_bills_updated_at
BEFORE UPDATE ON public.medical_bills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 📊 Integration with Application

### Fetch Bills in patient.html

```javascript
async function fetchBills(patientId) {
    const sb = getSupabase();
    if (!sb) return [];

    try {
        const { data, error } = await sb
            .from('medical_bills')
            .select('*')
            .eq('patient_id', patientId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
    }
}
```

### Upload Bill in hospital-admin.html

```javascript
async function uploadBill(billData) {
    const sb = getSupabase();
    if (!sb) return false;

    try {
        const { data, error } = await sb
            .from('medical_bills')
            .insert([billData])
            .select();

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error uploading bill:', error);
        return false;
    }
}
```

---

## 🔐 Security Checklist

- ✅ RLS enabled on medical_bills table
- ✅ Patients can only view their own bills
- ✅ Hospital staff cannot modify other staff's bills
- ✅ Admins have full access
- ✅ Amount validation (positive numbers only)
- ✅ Status validation (only allowed values)
- ✅ Audit trail with created_by and timestamps
- ✅ Unique bill numbers prevent duplicates

---

## 🧪 Testing Queries

### Test 1: Insert a Bill

```sql
INSERT INTO public.medical_bills 
(patient_id, patient_name, hospital, date, amount, status, description, category, billNumber)
VALUES 
('ML-TEST-001', 'Test Patient', 'Test Hospital', NOW()::DATE, 10000, 'unpaid', 'Test Bill', 'consultation', 'TEST-001');
```

### Test 2: Verify Insertion

```sql
SELECT * FROM public.medical_bills 
WHERE patient_id = 'ML-TEST-001';
```

### Test 3: Update Status

```sql
UPDATE public.medical_bills
SET status = 'paid'
WHERE billNumber = 'TEST-001';
```

### Test 4: Delete Test Data

```sql
DELETE FROM public.medical_bills
WHERE patient_id = 'ML-TEST-001';
```

---

## 📈 Performance Optimization

### Add More Indexes (Optional)

```sql
-- Index for filtering by date range
CREATE INDEX idx_medical_bills_date_range 
ON public.medical_bills(date, status);

-- Index for hospital + status queries
CREATE INDEX idx_medical_bills_hospital_status 
ON public.medical_bills(hospital, status);

-- Full-text search on description
CREATE INDEX idx_medical_bills_description_gin 
ON public.medical_bills USING GIN (
    to_tsvector('english', description)
);
```

---

## 🔄 Backup & Migration

### Export Bills Data

```sql
-- Get all bills as CSV
SELECT patient_id, patient_name, hospital, date, amount, status, billNumber
FROM public.medical_bills
ORDER BY date DESC;
```

### Backup Procedure

1. Go to **Project Settings** → **Database**
2. Click **Backups**
3. Click **Create Backup Now**
4. Download backup when ready

---

## 🚀 Deployment Checklist

- [ ] Database tables created
- [ ] Indexes created
- [ ] RLS policies enabled
- [ ] Sample data inserted
- [ ] Test queries pass
- [ ] hospital-admin.html can upload bills
- [ ] patient.html can view bills
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Updates/edits working

---

## 📞 Troubleshooting

### Issue: "Permission denied" error

**Solution:** Check RLS policies are correctly configured

### Issue: Duplicate billNumber

**Solution:** Ensure billNumber is unique in the application before insert

### Issue: Null values in required fields

**Solution:** Add NOT NULL constraints to required columns

### Issue: Slow queries

**Solution:** Check indexes are created on frequently queried columns

---

## 📚 Related Files

- [HOSPITAL-PORTAL.md](HOSPITAL-PORTAL.md) - Hospital staff guide
- [patient.html](patient.html) - Patient dashboard integration
- [hospital-admin.html](hospital-admin.html) - Hospital staff portal

---

**Version:** 1.0
**Last Updated:** April 1, 2026
**Database:** Supabase PostgreSQL

---

*For application setup without database, sample data will be used automatically.*
