from fastapi import APIRouter, Depends, HTTPException
import io
import pandas as pd
from app.schemas.schemas import EmailReportRequest
from app.auth.jwt import get_current_user
from app.config import settings
from app.excel.db import read_sheet, log_audit
from app.reports.pdf_generator import generate_report_pdf
from app.email.sender import send_email_with_attachments

router = APIRouter(prefix="/email", tags=["Email"])

@router.post("/report")
def send_email_report(req: EmailReportRequest, current_user: dict = Depends(get_current_user)):
    to_email = req.recipient_email or settings.REPORT_EMAIL
    payments = read_sheet("Payments")
    areas = {a["area_id"]: a["area_name"] for a in read_sheet("Areas")}

    area_name = areas.get(req.area_id, "All Areas") if req.area_id else "All Areas"
    subject = f"{area_name} {req.report_type.capitalize()} Collection Report"

    filtered_pays = []
    for p in payments:
        if req.area_id and p.get("area_id") != req.area_id:
            continue
        filtered_pays.append(p)

    # 1. Generate Excel Attachment
    df = pd.DataFrame(filtered_pays)
    excel_buffer = io.BytesIO()
    with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Report")
    excel_bytes = excel_buffer.getvalue()
    excel_filename = f"{area_name.replace(' ', '_')}_{req.report_type}_report.xlsx"

    # 2. Generate PDF Attachment
    headers = ["Receipt #", "Customer", "Area", "Date", "Method", "Amount Paid"]
    rows = []
    for p in filtered_pays:
        rows.append([
            p.get("receipt_number", ""),
            p.get("customer_name", ""),
            p.get("area_name", ""),
            p.get("payment_date", "")[:10],
            p.get("payment_method", "Cash"),
            f"₹{float(p.get('amount_paid', 0) or 0):,.2f}"
        ])
    pdf_bytes = generate_report_pdf(subject, f"Recipient: {to_email}", headers, rows)
    pdf_filename = f"{area_name.replace(' ', '_')}_{req.report_type}_report.pdf"

    attachments = [
        (excel_filename, excel_bytes),
        (pdf_filename, pdf_bytes)
    ]

    body = f"""
    <h2>Loan Management System - Financial Report</h2>
    <p><b>Report Type:</b> {req.report_type.capitalize()}</p>
    <p><b>Area:</b> {area_name}</p>
    <p><b>Total Transactions:</b> {len(filtered_pays)}</p>
    <p>Please find attached the detailed Excel spreadsheet and PDF document for your records.</p>
    <br>
    <p>Regards,<br>Finance Office</p>
    """

    success = send_email_with_attachments(subject, body, to_email, attachments)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email report")

    log_audit(current_user["user_id"], current_user["username"], "EMAIL", "REPORTS", req.report_type, f"Emailed report to {to_email}")

    return {
        "message": f"Report email sent successfully to {to_email}",
        "recipient": to_email,
        "attachments": [excel_filename, pdf_filename]
    }
