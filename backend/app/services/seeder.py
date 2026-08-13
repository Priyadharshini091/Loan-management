from datetime import datetime, timedelta
from app.auth.jwt import get_password_hash
from app.excel.db import read_sheet, write_sheet, init_excel

def seed_demo_data():
    init_excel()

    # 1. Seed Users if empty
    users = read_sheet("Users")
    if not users:
        admin_pwd = get_password_hash("admin123")
        staff_pwd = get_password_hash("staff123")
        users = [
            {
                "user_id": "USR0001",
                "username": "admin",
                "email": "admin@financeoffice.com",
                "password_hash": admin_pwd,
                "role": "Admin",
                "status": "Active",
                "created_at": "2026-01-01 09:00:00"
            },
            {
                "user_id": "USR0002",
                "username": "staff",
                "email": "staff@financeoffice.com",
                "password_hash": staff_pwd,
                "role": "Staff",
                "status": "Active",
                "created_at": "2026-01-01 09:00:00"
            }
        ]
        write_sheet("Users", users, auto_backup=False)

    # 2. Seed Areas if empty
    areas = read_sheet("Areas")
    if not areas:
        areas = [
            {"area_id": "AREA001", "area_name": "Thogamalai", "district": "Karur", "pincode": "621313", "status": "Active", "created_at": "2026-01-01 09:00:00"},
            {"area_id": "AREA002", "area_name": "Kulithalai", "district": "Karur", "pincode": "639107", "status": "Active", "created_at": "2026-01-01 09:00:00"},
            {"area_id": "AREA003", "area_name": "Musiri", "district": "Tiruchirappalli", "pincode": "621211", "status": "Active", "created_at": "2026-01-01 09:00:00"},
            {"area_id": "AREA004", "area_name": "Karur", "district": "Karur", "pincode": "639001", "status": "Active", "created_at": "2026-01-01 09:00:00"},
        ]
        write_sheet("Areas", areas, auto_backup=False)

    # 3. Seed Customers if empty
    customers = read_sheet("Customers")
    if not customers:
        customers = [
            {"customer_id": "CUST0001", "customer_name": "Priya Dharshini", "mobile_number": "9876543210", "address": "12 North St, Thogamalai", "area_id": "AREA001", "area_name": "Thogamalai", "aadhaar_number": "987654321012", "photo_path": "", "guarantor_name": "Murugan", "guarantor_mobile": "9876543219", "created_at": "2026-01-10 10:00:00", "status": "Active"},
            {"customer_id": "CUST0002", "customer_name": "Ravi Kumar", "mobile_number": "9876543211", "address": "45 Main Road, Thogamalai", "area_id": "AREA001", "area_name": "Thogamalai", "aadhaar_number": "987654321013", "photo_path": "", "guarantor_name": "Karthik", "guarantor_mobile": "9876543218", "created_at": "2026-01-12 10:00:00", "status": "Active"},
            {"customer_id": "CUST0003", "customer_name": "Kavitha S", "mobile_number": "9876543212", "address": "78 Temple St, Thogamalai", "area_id": "AREA001", "area_name": "Thogamalai", "aadhaar_number": "987654321014", "photo_path": "", "guarantor_name": "Sundar", "guarantor_mobile": "9876543217", "created_at": "2026-01-15 10:00:00", "status": "Active"},
            {"customer_id": "CUST0004", "customer_name": "Anand Mohan", "mobile_number": "9876543213", "address": "89 Market Rd, Thogamalai", "area_id": "AREA001", "area_name": "Thogamalai", "aadhaar_number": "987654321015", "photo_path": "", "guarantor_name": "Ramesh", "guarantor_mobile": "9876543216", "created_at": "2026-01-20 10:00:00", "status": "Active"},
            {"customer_id": "CUST0005", "customer_name": "Selvi R", "mobile_number": "9876543214", "address": "14 Bus Stand Rd, Thogamalai", "area_id": "AREA001", "area_name": "Thogamalai", "aadhaar_number": "987654321016", "photo_path": "", "guarantor_name": "Periasamy", "guarantor_mobile": "9876543215", "created_at": "2026-01-22 10:00:00", "status": "Active"},
            {"customer_id": "CUST0006", "customer_name": "Balan V", "mobile_number": "9876543220", "address": "22 River St, Kulithalai", "area_id": "AREA002", "area_name": "Kulithalai", "aadhaar_number": "987654321020", "photo_path": "", "guarantor_name": "Velu", "guarantor_mobile": "9876543229", "created_at": "2026-01-25 10:00:00", "status": "Active"},
            {"customer_id": "CUST0007", "customer_name": "Divya N", "mobile_number": "9876543221", "address": "90 Station Rd, Kulithalai", "area_id": "AREA002", "area_name": "Kulithalai", "aadhaar_number": "987654321021", "photo_path": "", "guarantor_name": "Natarajan", "guarantor_mobile": "9876543228", "created_at": "2026-01-28 10:00:00", "status": "Active"},
            {"customer_id": "CUST0008", "customer_name": "Ganesh K", "mobile_number": "9876543222", "address": "56 College Rd, Kulithalai", "area_id": "AREA002", "area_name": "Kulithalai", "aadhaar_number": "987654321022", "photo_path": "", "guarantor_name": "Kumar", "guarantor_mobile": "9876543227", "created_at": "2026-02-01 10:00:00", "status": "Active"},
            {"customer_id": "CUST0009", "customer_name": "Manikandan P", "mobile_number": "9876543230", "address": "33 Bridge St, Musiri", "area_id": "AREA003", "area_name": "Musiri", "aadhaar_number": "987654321030", "photo_path": "", "guarantor_name": "Palani", "guarantor_mobile": "9876543239", "created_at": "2026-02-02 10:00:00", "status": "Active"},
            {"customer_id": "CUST0010", "customer_name": "Deepa M", "mobile_number": "9876543231", "address": "11 High Rd, Karur", "area_id": "AREA004", "area_name": "Karur", "aadhaar_number": "987654321031", "photo_path": "", "guarantor_name": "Mani", "guarantor_mobile": "9876543238", "created_at": "2026-02-03 10:00:00", "status": "Active"},
        ]
        write_sheet("Customers", customers, auto_backup=False)

    # 4. Seed Loans & Installments & Payments if empty
    loans = read_sheet("Loans")
    if not loans:
        today = datetime.now()
        today_str = today.strftime("%Y-%m-%d")
        yesterday_str = (today - timedelta(days=1)).strftime("%Y-%m-%d")

        demo_loans = [
            {"loan_id": "LOAN0001", "loan_number": "LN0001", "customer_id": "CUST0001", "customer_name": "Priya Dharshini", "area_id": "AREA001", "area_name": "Thogamalai", "loan_amount": "50000.00", "interest_percentage": "12.0", "interest_amount": "6000.00", "total_payable": "56000.00", "loan_date": "2026-01-10", "emi_type": "Daily", "number_of_installments": "100", "emi_amount": "560.00", "first_due_date": "2026-01-11", "final_due_date": "2026-04-20", "status": "ACTIVE"},
            {"loan_id": "LOAN0002", "loan_number": "LN0002", "customer_id": "CUST0002", "customer_name": "Ravi Kumar", "area_id": "AREA001", "area_name": "Thogamalai", "loan_amount": "75000.00", "interest_percentage": "12.0", "interest_amount": "9000.00", "total_payable": "84000.00", "loan_date": "2026-01-12", "emi_type": "Daily", "number_of_installments": "100", "emi_amount": "840.00", "first_due_date": "2026-01-13", "final_due_date": "2026-04-22", "status": "ACTIVE"},
            {"loan_id": "LOAN0003", "loan_number": "LN0003", "customer_id": "CUST0003", "customer_name": "Kavitha S", "area_id": "AREA001", "area_name": "Thogamalai", "loan_amount": "30000.00", "interest_percentage": "10.0", "interest_amount": "3000.00", "total_payable": "33000.00", "loan_date": "2026-01-15", "emi_type": "Weekly", "number_of_installments": "20", "emi_amount": "1650.00", "first_due_date": "2026-01-22", "final_due_date": "2026-06-04", "status": "ACTIVE"},
            {"loan_id": "LOAN0004", "loan_number": "LN0004", "customer_id": "CUST0004", "customer_name": "Anand Mohan", "area_id": "AREA001", "area_name": "Thogamalai", "loan_amount": "100000.00", "interest_percentage": "15.0", "interest_amount": "15000.00", "total_payable": "115000.00", "loan_date": "2026-01-20", "emi_type": "Monthly", "number_of_installments": "12", "emi_amount": "9583.33", "first_due_date": "2026-02-20", "final_due_date": "2027-01-20", "status": "ACTIVE"},
            {"loan_id": "LOAN0005", "loan_number": "LN0005", "customer_id": "CUST0005", "customer_name": "Selvi R", "area_id": "AREA001", "area_name": "Thogamalai", "loan_amount": "40000.00", "interest_percentage": "10.0", "interest_amount": "4000.00", "total_payable": "44000.00", "loan_date": "2026-01-22", "emi_type": "Daily", "number_of_installments": "80", "emi_amount": "550.00", "first_due_date": "2026-01-23", "final_due_date": "2026-04-12", "status": "ACTIVE"},
            {"loan_id": "LOAN0006", "loan_number": "LN0006", "customer_id": "CUST0006", "customer_name": "Balan V", "area_id": "AREA002", "area_name": "Kulithalai", "loan_amount": "60000.00", "interest_percentage": "12.0", "interest_amount": "7200.00", "total_payable": "67200.00", "loan_date": "2026-01-25", "emi_type": "Daily", "number_of_installments": "100", "emi_amount": "672.00", "first_due_date": "2026-01-26", "final_due_date": "2026-05-05", "status": "ACTIVE"},
            {"loan_id": "LOAN0007", "loan_number": "LN0007", "customer_id": "CUST0007", "customer_name": "Divya N", "area_id": "AREA002", "area_name": "Kulithalai", "loan_amount": "25000.00", "interest_percentage": "10.0", "interest_amount": "2500.00", "total_payable": "27500.00", "loan_date": "2026-01-28", "emi_type": "Daily", "number_of_installments": "50", "emi_amount": "550.00", "first_due_date": "2026-01-29", "final_due_date": "2026-03-19", "status": "ACTIVE"},
            {"loan_id": "LOAN0008", "loan_number": "LN0008", "customer_id": "CUST0008", "customer_name": "Ganesh K", "area_id": "AREA002", "area_name": "Kulithalai", "loan_amount": "80000.00", "interest_percentage": "14.0", "interest_amount": "11200.00", "total_payable": "91200.00", "loan_date": "2026-02-01", "emi_type": "Weekly", "number_of_installments": "16", "emi_amount": "5700.00", "first_due_date": "2026-02-08", "final_due_date": "2026-05-24", "status": "ACTIVE"},
            {"loan_id": "LOAN0009", "loan_number": "LN0009", "customer_id": "CUST0009", "customer_name": "Manikandan P", "area_id": "AREA003", "area_name": "Musiri", "loan_amount": "45000.00", "interest_percentage": "10.0", "interest_amount": "4500.00", "total_payable": "49500.00", "loan_date": "2026-02-02", "emi_type": "Daily", "number_of_installments": "90", "emi_amount": "550.00", "first_due_date": "2026-02-03", "final_due_date": "2026-05-03", "status": "ACTIVE"},
            {"loan_id": "LOAN0010", "loan_number": "LN0010", "customer_id": "CUST0010", "customer_name": "Deepa M", "area_id": "AREA004", "area_name": "Karur", "loan_amount": "50000.00", "interest_percentage": "12.0", "interest_amount": "6000.00", "total_payable": "56000.00", "loan_date": "2026-02-03", "emi_type": "Daily", "number_of_installments": "100", "emi_amount": "560.00", "first_due_date": "2026-02-04", "final_due_date": "2026-05-14", "status": "ACTIVE"},
        ]
        write_sheet("Loans", demo_loans, auto_backup=False)

        # Seed Installments & Payments
        installments = []
        payments = []
        p_count = 1

        for l in demo_loans:
            l_id = l["loan_id"]
            c_id = l["customer_id"]
            emi = float(l["emi_amount"])
            num_insts = int(l["number_of_installments"])

            # First installment on first_due_date
            first_d = datetime.strptime(l["first_due_date"], "%Y-%m-%d")

            for i in range(1, min(num_insts + 1, 6)):
                due_d = (first_d + timedelta(days=(i-1))).strftime("%Y-%m-%d")
                inst_id = f"INST_{l_id}_{i:03d}"

                if due_d < today_str:
                    # Paid or Overdue installment
                    if i % 2 == 1:
                        # Paid
                        paid_amt = emi
                        bal = 0.0
                        status = "PAID"
                        rc_num = f"RC-2026-{p_count:06d}"
                        payments.append({
                            "payment_id": f"PAY{p_count:06d}",
                            "receipt_number": rc_num,
                            "loan_id": l_id,
                            "customer_id": c_id,
                            "customer_name": l["customer_name"],
                            "area_id": l["area_id"],
                            "area_name": l["area_name"],
                            "payment_date": f"{due_d} 11:30:00",
                            "due_date": due_d,
                            "amount_due": f"{emi:.2f}",
                            "amount_paid": f"{paid_amt:.2f}",
                            "partial_payment": "0.00",
                            "balance": "0.00",
                            "payment_status": "PAID",
                            "payment_method": "Cash",
                            "collected_by": "staff",
                            "remarks": "Regular collection"
                        })
                        p_count += 1
                    else:
                        # Overdue
                        paid_amt = 0.0
                        bal = emi
                        status = "OVERDUE"
                        rc_num = ""
                elif due_d == today_str:
                    # Today's due installment
                    paid_amt = emi if l_id == "LOAN0001" else 0.0
                    bal = 0.0 if paid_amt == emi else emi
                    status = "PAID" if paid_amt == emi else "PENDING"
                    rc_num = f"RC-2026-{p_count:06d}" if paid_amt > 0 else ""
                    if paid_amt > 0:
                        payments.append({
                            "payment_id": f"PAY{p_count:06d}",
                            "receipt_number": rc_num,
                            "loan_id": l_id,
                            "customer_id": c_id,
                            "customer_name": l["customer_name"],
                            "area_id": l["area_id"],
                            "area_name": l["area_name"],
                            "payment_date": f"{today_str} 10:15:00",
                            "due_date": due_d,
                            "amount_due": f"{emi:.2f}",
                            "amount_paid": f"{paid_amt:.2f}",
                            "partial_payment": "0.00",
                            "balance": "0.00",
                            "payment_status": "PAID",
                            "payment_method": "Cash",
                            "collected_by": "admin",
                            "remarks": "Morning collection"
                        })
                        p_count += 1
                else:
                    paid_amt = 0.0
                    bal = emi
                    status = "PENDING"
                    rc_num = ""

                installments.append({
                    "installment_id": inst_id,
                    "loan_id": l_id,
                    "customer_id": c_id,
                    "installment_number": str(i),
                    "due_date": due_d,
                    "due_amount": f"{emi:.2f}",
                    "paid_amount": f"{paid_amt:.2f}",
                    "balance": f"{bal:.2f}",
                    "status": status,
                    "paid_date": due_d if status == "PAID" else "",
                    "receipt_number": rc_num
                })

        write_sheet("Installments", installments, auto_backup=False)
        write_sheet("Payments", payments, auto_backup=False)
