from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from typing import List, Optional
from decimal import Decimal, ROUND_HALF_UP

from app.schemas.schemas import PaymentCreate, PaymentResponse
from app.auth.jwt import get_current_user
from app.excel.db import read_sheet, write_sheet, log_audit

router = APIRouter(prefix="/payments", tags=["Payments"])

def generate_receipt_number(payments: List[dict]) -> str:
    year = datetime.now().year
    count = len(payments) + 1
    return f"RC-{year}-{count:06d}"

@router.get("", response_model=List[PaymentResponse])
def get_payments(
    area_id: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    loan_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    payments = read_sheet("Payments")
    res = []
    for p in payments:
        if area_id and p.get("area_id") != area_id:
            continue
        if customer_id and p.get("customer_id") != customer_id:
            continue
        if loan_id and p.get("loan_id") != loan_id:
            continue
        p_date = p.get("payment_date", "")[:10]
        if date_from and p_date < date_from:
            continue
        if date_to and p_date > date_to:
            continue

        res.append(
            PaymentResponse(
                payment_id=p.get("payment_id", ""),
                receipt_number=p.get("receipt_number", ""),
                loan_id=p.get("loan_id", ""),
                customer_id=p.get("customer_id", ""),
                customer_name=p.get("customer_name", ""),
                area_id=p.get("area_id", ""),
                area_name=p.get("area_name", ""),
                payment_date=p.get("payment_date", ""),
                due_date=p.get("due_date", ""),
                amount_due=float(p.get("amount_due", 0) or 0),
                amount_paid=float(p.get("amount_paid", 0) or 0),
                partial_payment=float(p.get("partial_payment", 0) or 0),
                balance=float(p.get("balance", 0) or 0),
                payment_status=p.get("payment_status", "PAID"),
                payment_method=p.get("payment_method", "Cash"),
                collected_by=p.get("collected_by", "Staff"),
                remarks=p.get("remarks", "")
            )
        )
    return res

@router.post("", response_model=PaymentResponse)
def record_payment(pay_in: PaymentCreate, current_user: dict = Depends(get_current_user)):
    if pay_in.amount_paid <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

    loans = read_sheet("Loans")
    loan = next((l for l in loans if l["loan_id"] == pay_in.loan_id), None)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    installments = read_sheet("Installments")
    loan_insts = [i for i in installments if i.get("loan_id") == pay_in.loan_id]

    target_inst = None
    if pay_in.installment_id:
        target_inst = next((i for i in loan_insts if i["installment_id"] == pay_in.installment_id), None)
    
    if not target_inst:
        # Find earliest pending or partial installment
        target_inst = next((i for i in loan_insts if float(i.get("balance", 0) or 0) > 0), None)

    due_amount = float(target_inst.get("due_amount", loan.get("emi_amount", 0))) if target_inst else float(loan.get("emi_amount", 0))
    current_inst_balance = float(target_inst.get("balance", due_amount)) if target_inst else due_amount
    due_date = target_inst.get("due_date", datetime.now().strftime("%Y-%m-%d")) if target_inst else datetime.now().strftime("%Y-%m-%d")

    paid = Decimal(str(pay_in.amount_paid))
    inst_bal = Decimal(str(current_inst_balance))

    new_inst_bal = max(Decimal("0.00"), inst_bal - paid)
    new_inst_paid = Decimal(str(target_inst.get("paid_amount", "0") if target_inst else "0")) + paid

    payment_status = "PAID" if new_inst_bal == Decimal("0.00") else "PARTIAL"

    payments = read_sheet("Payments")
    receipt_num = generate_receipt_number(payments)
    payment_id = f"PAY{len(payments) + 1:06d}"
    today_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Save payment record
    new_payment = {
        "payment_id": payment_id,
        "receipt_number": receipt_num,
        "loan_id": loan["loan_id"],
        "customer_id": loan["customer_id"],
        "customer_name": loan["customer_name"],
        "area_id": loan["area_id"],
        "area_name": loan["area_name"],
        "payment_date": today_str,
        "due_date": due_date,
        "amount_due": str(due_amount),
        "amount_paid": str(paid),
        "partial_payment": str(paid) if payment_status == "PARTIAL" else "0.00",
        "balance": str(new_inst_bal),
        "payment_status": payment_status,
        "payment_method": pay_in.payment_method,
        "collected_by": current_user["username"],
        "remarks": pay_in.remarks or ""
    }
    payments.append(new_payment)
    write_sheet("Payments", payments)

    # Update Installment
    if target_inst:
        for idx, inst in enumerate(installments):
            if inst["installment_id"] == target_inst["installment_id"]:
                inst["paid_amount"] = str(new_inst_paid)
                inst["balance"] = str(new_inst_bal)
                inst["status"] = payment_status
                inst["paid_date"] = today_str[:10]
                inst["receipt_number"] = receipt_num
                installments[idx] = inst
                break
        write_sheet("Installments", installments, auto_backup=False)

    # Update Loan status if completely paid off
    loan_payments = [p for p in read_sheet("Payments") if p.get("loan_id") == loan["loan_id"]]
    total_paid_loan = sum(float(p.get("amount_paid", 0) or 0) for p in loan_payments)
    if total_paid_loan >= float(loan.get("total_payable", 0)):
        for idx, l in enumerate(loans):
            if l["loan_id"] == loan["loan_id"]:
                l["status"] = "COMPLETED"
                loans[idx] = l
                break
        write_sheet("Loans", loans, auto_backup=False)

    log_audit(current_user["user_id"], current_user["username"], "PAYMENT", "PAYMENTS", payment_id, f"Collected {paid} for Loan {loan['loan_number']}, Receipt: {receipt_num}")

    return PaymentResponse(
        payment_id=payment_id,
        receipt_number=receipt_num,
        loan_id=loan["loan_id"],
        customer_id=loan["customer_id"],
        customer_name=loan["customer_name"],
        area_id=loan["area_id"],
        area_name=loan["area_name"],
        payment_date=today_str,
        due_date=due_date,
        amount_due=due_amount,
        amount_paid=float(paid),
        partial_payment=float(paid) if payment_status == "PARTIAL" else 0.0,
        balance=float(new_inst_bal),
        payment_status=payment_status,
        payment_method=pay_in.payment_method,
        collected_by=current_user["username"],
        remarks=pay_in.remarks or ""
    )
