from fastapi import APIRouter, Depends, HTTPException, Query, Response
from typing import Optional
from app.auth.jwt import get_current_user
from app.excel.db import read_sheet
from app.reports.pdf_generator import generate_receipt_pdf, generate_report_pdf

router = APIRouter(prefix="/pdf", tags=["PDF"])

@router.get("/receipt/{receipt_number}")
def get_receipt_pdf_api(receipt_number: str, current_user: dict = Depends(get_current_user)):
    payments = read_sheet("Payments")
    payment = next((p for p in payments if p.get("receipt_number") == receipt_number), None)
    if not payment:
        raise HTTPException(status_code=404, detail="Receipt not found")

    pdf_bytes = generate_receipt_pdf(payment)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Receipt_{receipt_number}.pdf"}
    )

@router.get("/report")
def get_report_pdf_api(
    report_type: str = Query("daily"),
    area_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    payments = read_sheet("Payments")
    loans = read_sheet("Loans")
    areas = {a["area_id"]: a["area_name"] for a in read_sheet("Areas")}

    area_name = areas.get(area_id, "All Areas") if area_id else "All Areas"
    title = f"{area_name.upper()} - {report_type.upper()} REPORT"
    subtitle = f"Generated on {read_sheet('Audit_Log')[-1]['timestamp'] if read_sheet('Audit_Log') else 'Today'}"

    headers = ["Receipt #", "Customer", "Area", "Date", "Method", "Amount Paid"]
    rows = []
    for p in payments:
        if area_id and p.get("area_id") != area_id:
            continue
        rows.append([
            p.get("receipt_number", ""),
            p.get("customer_name", ""),
            p.get("area_name", ""),
            p.get("payment_date", "")[:10],
            p.get("payment_method", "Cash"),
            f"₹{float(p.get('amount_paid', 0) or 0):,.2f}"
        ])

    pdf_bytes = generate_report_pdf(title, subtitle, headers, rows)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={report_type}_report.pdf"}
    )
