from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime
from typing import Optional, List
from app.schemas.schemas import DashboardResponse, AreaDashboardResponse
from app.auth.jwt import get_current_user
from app.excel.db import read_sheet

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def calculate_area_metrics(target_area_id: Optional[str] = None):
    customers = read_sheet("Customers")
    loans = read_sheet("Loans")
    payments = read_sheet("Payments")
    installments = read_sheet("Installments")
    areas = read_sheet("Areas")

    today_str = datetime.now().strftime("%Y-%m-%d")

    if target_area_id:
        customers = [c for c in customers if c.get("area_id") == target_area_id]
        loans = [l for l in loans if l.get("area_id") == target_area_id]
        payments = [p for p in payments if p.get("area_id") == target_area_id]

    total_customers = len(customers)
    active_loans = len([l for l in loans if l.get("status") in ["ACTIVE", "OVERDUE"]])
    total_loan_given = sum(float(l.get("loan_amount", 0) or 0) for l in loans)

    today_payments = [p for p in payments if p.get("payment_date", "").startswith(today_str)]
    todays_collection = sum(float(p.get("amount_paid", 0) or 0) for p in today_payments)

    # Filter installments by loan/area
    area_loan_ids = {l["loan_id"] for l in loans}
    insts = [i for i in installments if i.get("loan_id") in area_loan_ids] if target_area_id else installments

    todays_due_insts = [i for i in insts if i.get("due_date") == today_str]
    todays_due = sum(float(i.get("due_amount", 0) or 0) for i in todays_due_insts)

    overdue_insts = [i for i in insts if i.get("due_date", "") < today_str and float(i.get("balance", 0) or 0) > 0]
    overdue_amount = sum(float(i.get("balance", 0) or 0) for i in overdue_insts)
    overdue_cust_ids = {i.get("customer_id") for i in overdue_insts}
    overdue_customers_count = len(overdue_cust_ids)

    # Total pending amount across active loans
    total_collected = sum(float(p.get("amount_paid", 0) or 0) for p in payments)
    total_payable_sum = sum(float(l.get("total_payable", 0) or 0) for l in loans)
    total_pending = max(0.0, round(total_payable_sum - total_collected, 2))

    return {
        "total_customers": total_customers,
        "active_loans": active_loans,
        "total_loan_given": total_loan_given,
        "total_collected": total_collected,
        "total_pending": total_pending,
        "todays_due": todays_due,
        "todays_collection": todays_collection,
        "overdue_amount": overdue_amount,
        "overdue_customers": overdue_customers_count
    }

@router.get("", response_model=DashboardResponse)
def get_dashboard(
    area_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    metrics = calculate_area_metrics(area_id)
    areas = read_sheet("Areas")

    area_summaries = []
    for a in areas:
        a_metrics = calculate_area_metrics(a["area_id"])
        area_summaries.append({
            "area_id": a["area_id"],
            "area_name": a["area_name"],
            **a_metrics
        })

    return DashboardResponse(
        total_customers=metrics["total_customers"],
        active_loans=metrics["active_loans"],
        total_loan_given=metrics["total_loan_given"],
        collection_today=metrics["todays_collection"],
        pending_amount=metrics["total_pending"],
        overdue_customers=metrics["overdue_customers"],
        area_summaries=area_summaries
    )

@router.get("/area/{area_id}", response_model=AreaDashboardResponse)
def get_area_dashboard(area_id: str, current_user: dict = Depends(get_current_user)):
    areas = read_sheet("Areas")
    area = next((a for a in areas if a["area_id"] == area_id), None)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")

    m = calculate_area_metrics(area_id)

    return AreaDashboardResponse(
        area_id=area["area_id"],
        area_name=area["area_name"],
        total_customers=m["total_customers"],
        total_active_loans=m["active_loans"],
        total_loan_given=m["total_loan_given"],
        total_collected=m["total_collected"],
        total_pending=m["total_pending"],
        todays_due=m["todays_due"],
        todays_collection=m["todays_collection"],
        overdue_amount=m["overdue_amount"],
        overdue_customers=m["overdue_customers"]
    )
