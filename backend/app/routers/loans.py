from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from typing import List, Optional
from decimal import Decimal, ROUND_HALF_UP
import calendar

from app.schemas.schemas import LoanCreate, LoanResponse, LoanCalculationRequest, LoanCalculationResponse
from app.auth.jwt import get_current_user, require_admin
from app.excel.db import read_sheet, write_sheet, log_audit

router = APIRouter(prefix="/loans", tags=["Loans"])

def round_money(val: float | str | Decimal) -> Decimal:
    return Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def calculate_loan_schedule(amount: float, interest_percentage: float, emi_type: str, installments: int, first_due_date_str: str):
    dec_amount = round_money(amount)
    dec_rate = Decimal(str(interest_percentage))
    
    interest_amount = round_money(dec_amount * (dec_rate / Decimal("100")))
    total_payable = dec_amount + interest_amount
    emi_amount = round_money(total_payable / Decimal(str(installments)))

    first_due = datetime.strptime(first_due_date_str, "%Y-%m-%d")
    due_dates = []
    curr_date = first_due

    for i in range(installments):
        due_dates.append(curr_date.strftime("%Y-%m-%d"))
        if emi_type.lower() == "daily":
            curr_date += timedelta(days=1)
        elif emi_type.lower() == "weekly":
            curr_date += timedelta(weeks=1)
        elif emi_type.lower() == "monthly":
            year = curr_date.year + (curr_date.month // 12)
            month = (curr_date.month % 12) + 1
            day = min(curr_date.day, calendar.monthrange(year, month)[1])
            curr_date = datetime(year, month, day)

    final_due_date = due_dates[-1] if due_dates else first_due_date_str

    return {
        "interest_amount": float(interest_amount),
        "total_payable": float(total_payable),
        "emi_amount": float(emi_amount),
        "final_due_date": final_due_date,
        "due_dates": due_dates
    }

@router.post("/calculate", response_model=LoanCalculationResponse)
def calculate_loan_api(req: LoanCalculationRequest):
    res = calculate_loan_schedule(req.loan_amount, req.interest_percentage, req.emi_type, req.number_of_installments, req.first_due_date)
    return LoanCalculationResponse(
        interest_amount=res["interest_amount"],
        total_payable=res["total_payable"],
        emi_amount=res["emi_amount"],
        final_due_date=res["final_due_date"]
    )

@router.get("", response_model=List[LoanResponse])
def get_loans(
    area_id: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    loans = read_sheet("Loans")
    payments = read_sheet("Payments")

    res = []
    for l in loans:
        if area_id and l.get("area_id") != area_id:
            continue
        if customer_id and l.get("customer_id") != customer_id:
            continue
        if status and l.get("status", "").upper() != status.upper():
            continue

        loan_id = l["loan_id"]
        loan_payments = [p for p in payments if p.get("loan_id") == loan_id]
        total_paid = sum(float(p.get("amount_paid", 0) or 0) for p in loan_payments)
        total_payable = float(l.get("total_payable", 0))
        outstanding = max(0.0, round(total_payable - total_paid, 2))

        res.append(
            LoanResponse(
                loan_id=l["loan_id"],
                loan_number=l.get("loan_number", ""),
                customer_id=l.get("customer_id", ""),
                customer_name=l.get("customer_name", ""),
                area_id=l.get("area_id", ""),
                area_name=l.get("area_name", ""),
                loan_amount=float(l.get("loan_amount", 0)),
                interest_percentage=float(l.get("interest_percentage", 0)),
                interest_amount=float(l.get("interest_amount", 0)),
                total_payable=total_payable,
                loan_date=l.get("loan_date", ""),
                emi_type=l.get("emi_type", "Daily"),
                number_of_installments=int(l.get("number_of_installments", 0)),
                emi_amount=float(l.get("emi_amount", 0)),
                first_due_date=l.get("first_due_date", ""),
                final_due_date=l.get("final_due_date", ""),
                status=l.get("status", "ACTIVE"),
                paid_amount=total_paid,
                outstanding=outstanding
            )
        )
    return res

@router.get("/{loan_id}", response_model=LoanResponse)
def get_loan(loan_id: str, current_user: dict = Depends(get_current_user)):
    loans = read_sheet("Loans")
    l = next((item for item in loans if item["loan_id"] == loan_id), None)
    if not l:
        raise HTTPException(status_code=404, detail="Loan not found")

    payments = read_sheet("Payments")
    loan_payments = [p for p in payments if p.get("loan_id") == loan_id]
    total_paid = sum(float(p.get("amount_paid", 0) or 0) for p in loan_payments)
    total_payable = float(l.get("total_payable", 0))
    outstanding = max(0.0, round(total_payable - total_paid, 2))

    return LoanResponse(
        loan_id=l["loan_id"],
        loan_number=l.get("loan_number", ""),
        customer_id=l.get("customer_id", ""),
        customer_name=l.get("customer_name", ""),
        area_id=l.get("area_id", ""),
        area_name=l.get("area_name", ""),
        loan_amount=float(l.get("loan_amount", 0)),
        interest_percentage=float(l.get("interest_percentage", 0)),
        interest_amount=float(l.get("interest_amount", 0)),
        total_payable=total_payable,
        loan_date=l.get("loan_date", ""),
        emi_type=l.get("emi_type", "Daily"),
        number_of_installments=int(l.get("number_of_installments", 0)),
        emi_amount=float(l.get("emi_amount", 0)),
        first_due_date=l.get("first_due_date", ""),
        final_due_date=l.get("final_due_date", ""),
        status=l.get("status", "ACTIVE"),
        paid_amount=total_paid,
        outstanding=outstanding
    )

@router.post("", response_model=LoanResponse)
def create_loan(loan_in: LoanCreate, current_user: dict = Depends(get_current_user)):
    customers = read_sheet("Customers")
    customer = next((c for c in customers if c["customer_id"] == loan_in.customer_id), None)
    if not customer:
        raise HTTPException(status_code=400, detail="Customer not found")

    calc = calculate_loan_schedule(
        loan_in.loan_amount,
        loan_in.interest_percentage,
        loan_in.emi_type,
        loan_in.number_of_installments,
        loan_in.first_due_date
    )

    loans = read_sheet("Loans")
    loan_id = f"LOAN{len(loans) + 1:04d}"
    loan_number = f"LN{len(loans) + 1:04d}"

    new_loan = {
        "loan_id": loan_id,
        "loan_number": loan_number,
        "customer_id": customer["customer_id"],
        "customer_name": customer["customer_name"],
        "area_id": customer["area_id"],
        "area_name": customer["area_name"],
        "loan_amount": str(round_money(loan_in.loan_amount)),
        "interest_percentage": str(loan_in.interest_percentage),
        "interest_amount": str(calc["interest_amount"]),
        "total_payable": str(calc["total_payable"]),
        "loan_date": loan_in.loan_date,
        "emi_type": loan_in.emi_type,
        "number_of_installments": str(loan_in.number_of_installments),
        "emi_amount": str(calc["emi_amount"]),
        "first_due_date": loan_in.first_due_date,
        "final_due_date": calc["final_due_date"],
        "status": "ACTIVE"
    }
    loans.append(new_loan)
    write_sheet("Loans", loans)

    # Generate Installments
    installments = read_sheet("Installments")
    emi_dec = Decimal(str(calc["emi_amount"]))
    
    for idx, due_d in enumerate(calc["due_dates"], start=1):
        inst_id = f"INST_{loan_id}_{idx:03d}"
        inst_rec = {
            "installment_id": inst_id,
            "loan_id": loan_id,
            "customer_id": customer["customer_id"],
            "installment_number": str(idx),
            "due_date": due_d,
            "due_amount": str(emi_dec),
            "paid_amount": "0.00",
            "balance": str(emi_dec),
            "status": "PENDING",
            "paid_date": "",
            "receipt_number": ""
        }
        installments.append(inst_rec)

    write_sheet("Installments", installments)

    log_audit(current_user["user_id"], current_user["username"], "CREATE", "LOANS", loan_id, f"Created loan {loan_number} for customer {customer['customer_name']}")

    return LoanResponse(
        loan_id=loan_id,
        loan_number=loan_number,
        customer_id=customer["customer_id"],
        customer_name=customer["customer_name"],
        area_id=customer["area_id"],
        area_name=customer["area_name"],
        loan_amount=float(loan_in.loan_amount),
        interest_percentage=float(loan_in.interest_percentage),
        interest_amount=calc["interest_amount"],
        total_payable=calc["total_payable"],
        loan_date=loan_in.loan_date,
        emi_type=loan_in.emi_type,
        number_of_installments=loan_in.number_of_installments,
        emi_amount=calc["emi_amount"],
        first_due_date=loan_in.first_due_date,
        final_due_date=calc["final_due_date"],
        status="ACTIVE",
        paid_amount=0.0,
        outstanding=calc["total_payable"]
    )
