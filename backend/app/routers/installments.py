from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import List, Optional
from app.schemas.schemas import InstallmentResponse
from app.auth.jwt import get_current_user
from app.excel.db import read_sheet

router = APIRouter(prefix="/installments", tags=["Installments"])

def compute_installment_status(due_date_str: str, balance: float, paid_amount: float, today_str: str) -> str:
    if balance <= 0:
        return "PAID"
    if due_date_str < today_str:
        return "OVERDUE"
    if paid_amount > 0:
        return "PARTIAL"
    return "PENDING"

@router.get("", response_model=List[InstallmentResponse])
def get_installments(
    area_id: Optional[str] = Query(None),
    loan_id: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    installments = read_sheet("Installments")
    loans = {l["loan_id"]: l for l in read_sheet("Loans")}
    customers = {c["customer_id"]: c for c in read_sheet("Customers")}

    today_str = datetime.now().strftime("%Y-%m-%d")
    res = []

    for inst in installments:
        l_id = inst.get("loan_id", "")
        c_id = inst.get("customer_id", "")
        loan = loans.get(l_id, {})
        customer = customers.get(c_id, {})

        a_id = loan.get("area_id", customer.get("area_id", ""))
        a_name = loan.get("area_name", customer.get("area_name", ""))

        if area_id and a_id != area_id:
            continue
        if loan_id and l_id != loan_id:
            continue
        if customer_id and c_id != customer_id:
            continue
        if date and inst.get("due_date", "") != date:
            continue

        due_amt = float(inst.get("due_amount", 0) or 0)
        paid_amt = float(inst.get("paid_amount", 0) or 0)
        bal = float(inst.get("balance", due_amt) or 0)
        computed_status = compute_installment_status(inst.get("due_date", ""), bal, paid_amt, today_str)

        if status and computed_status.upper() != status.upper():
            continue

        res.append(
            InstallmentResponse(
                installment_id=inst.get("installment_id", ""),
                loan_id=l_id,
                customer_id=c_id,
                customer_name=customer.get("customer_name", loan.get("customer_name", "")),
                area_id=a_id,
                area_name=a_name,
                loan_number=loan.get("loan_number", ""),
                mobile_number=customer.get("mobile_number", ""),
                installment_number=int(inst.get("installment_number", 1)),
                due_date=inst.get("due_date", ""),
                due_amount=due_amt,
                paid_amount=paid_amt,
                balance=bal,
                status=computed_status,
                paid_date=inst.get("paid_date", ""),
                receipt_number=inst.get("receipt_number", "")
            )
        )
    return res

@router.get("/today", response_model=List[InstallmentResponse])
def get_today_due(
    area_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    today_str = datetime.now().strftime("%Y-%m-%d")
    return get_installments(area_id=area_id, date=today_str, current_user=current_user)
