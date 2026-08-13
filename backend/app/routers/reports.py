from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from app.auth.jwt import get_current_user
from app.excel.db import read_sheet

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/daily")
def get_daily_report(
    area_id: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    target_date = date or datetime.now().strftime("%Y-%m-%d")
    payments = read_sheet("Payments")
    customers = {c["customer_id"]: c for c in read_sheet("Customers")}

    daily_pays = []
    for p in payments:
        if p.get("payment_date", "").startswith(target_date):
            if area_id and p.get("area_id") != area_id:
                continue
            daily_pays.append(p)

    total_collected = sum(float(p.get("amount_paid", 0) or 0) for p in daily_pays)
    by_method = {"Cash": 0.0, "UPI": 0.0, "Bank Transfer": 0.0, "Other": 0.0}

    for p in daily_pays:
        method = p.get("payment_method", "Cash")
        by_method[method] = by_method.get(method, 0.0) + float(p.get("amount_paid", 0) or 0)

    return {
        "date": target_date,
        "area_id": area_id,
        "total_payments_count": len(daily_pays),
        "total_collected": total_collected,
        "payment_methods": by_method,
        "payments": daily_pays
    }

@router.get("/weekly")
def get_weekly_report(
    area_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    start_str = start_of_week.strftime("%Y-%m-%d")
    end_str = end_of_week.strftime("%Y-%m-%d")

    payments = read_sheet("Payments")
    weekly_pays = []
    for p in payments:
        p_date = p.get("payment_date", "")[:10]
        if start_str <= p_date <= end_str:
            if area_id and p.get("area_id") != area_id:
                continue
            weekly_pays.append(p)

    total_collected = sum(float(p.get("amount_paid", 0) or 0) for p in weekly_pays)

    return {
        "week_start": start_str,
        "week_end": end_str,
        "area_id": area_id,
        "total_payments_count": len(weekly_pays),
        "total_collected": total_collected,
        "payments": weekly_pays
    }

@router.get("/monthly")
def get_monthly_report(
    area_id: Optional[str] = Query(None),
    month: Optional[str] = Query(None),  # YYYY-MM
    current_user: dict = Depends(get_current_user)
):
    target_month = month or datetime.now().strftime("%Y-%m")
    payments = read_sheet("Payments")

    monthly_pays = []
    for p in payments:
        if p.get("payment_date", "").startswith(target_month):
            if area_id and p.get("area_id") != area_id:
                continue
            monthly_pays.append(p)

    total_collected = sum(float(p.get("amount_paid", 0) or 0) for p in monthly_pays)

    return {
        "month": target_month,
        "area_id": area_id,
        "total_payments_count": len(monthly_pays),
        "total_collected": total_collected,
        "payments": monthly_pays
    }

@router.get("/area")
def get_area_report(
    area_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    customers = read_sheet("Customers")
    loans = read_sheet("Loans")
    payments = read_sheet("Payments")
    areas = read_sheet("Areas")

    if area_id:
        areas = [a for a in areas if a["area_id"] == area_id]

    report = []
    for a in areas:
        a_id = a["area_id"]
        a_custs = [c for c in customers if c.get("area_id") == a_id]
        a_loans = [l for l in loans if l.get("area_id") == a_id]
        a_pays = [p for p in payments if p.get("area_id") == a_id]

        total_given = sum(float(l.get("loan_amount", 0) or 0) for l in a_loans)
        total_payable = sum(float(l.get("total_payable", 0) or 0) for l in a_loans)
        total_collected = sum(float(p.get("amount_paid", 0) or 0) for p in a_pays)
        pending = max(0.0, round(total_payable - total_collected, 2))

        report.append({
            "area_id": a_id,
            "area_name": a["area_name"],
            "total_customers": len(a_custs),
            "total_loans": len(a_loans),
            "total_loan_amount": total_given,
            "total_expected_collection": total_payable,
            "total_collected": total_collected,
            "pending": pending
        })

    return report
