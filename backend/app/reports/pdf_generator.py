import io
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_receipt_pdf(payment_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0284c7'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'ReceiptSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    bold_label = ParagraphStyle('BoldLabel', parent=styles['Normal'], fontSize=10, leading=14, fontName='Helvetica-Bold')
    normal_val = ParagraphStyle('NormalVal', parent=styles['Normal'], fontSize=10, leading=14)

    elements = []

    # Header
    elements.append(Paragraph("FINANCE OFFICE - PAYMENT RECEIPT", title_style))
    elements.append(Paragraph("Official Payment Collection Voucher", subtitle_style))
    elements.append(Spacer(1, 15))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=15))

    # Receipt Info Table
    data = [
        [Paragraph("Receipt Number:", bold_label), Paragraph(str(payment_data.get("receipt_number", "")), normal_val),
         Paragraph("Date:", bold_label), Paragraph(str(payment_data.get("payment_date", "")[:10]), normal_val)],
        [Paragraph("Customer Name:", bold_label), Paragraph(str(payment_data.get("customer_name", "")), normal_val),
         Paragraph("Loan Number:", bold_label), Paragraph(str(payment_data.get("loan_number", payment_data.get("loan_id", ""))), normal_val)],
        [Paragraph("Area:", bold_label), Paragraph(str(payment_data.get("area_name", "")), normal_val),
         Paragraph("Payment Method:", bold_label), Paragraph(str(payment_data.get("payment_method", "Cash")), normal_val)],
        [Paragraph("Due Date:", bold_label), Paragraph(str(payment_data.get("due_date", "")), normal_val),
         Paragraph("Collected By:", bold_label), Paragraph(str(payment_data.get("collected_by", "Staff")), normal_val)],
    ]

    t1 = Table(data, colWidths=[100, 160, 100, 160])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#f1f5f9')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t1)
    elements.append(Spacer(1, 20))

    # Payment Breakdown
    elements.append(Paragraph("<b>Payment Financial Summary</b>", styles['Heading3']))
    elements.append(Spacer(1, 8))

    due_amt = float(payment_data.get("amount_due", 0) or 0)
    paid_amt = float(payment_data.get("amount_paid", 0) or 0)
    bal_amt = float(payment_data.get("balance", 0) or 0)
    status_str = payment_data.get("payment_status", "PAID")

    fin_data = [
        ["Description", "Amount (₹)"],
        ["Amount Due for Installment", f"₹{due_amt:,.2f}"],
        ["Amount Collected Today", f"₹{paid_amt:,.2f}"],
        ["Remaining Balance Outstanding", f"₹{bal_amt:,.2f}"],
        ["Payment Status", status_str]
    ]

    t2 = Table(fin_data, colWidths=[340, 180])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284c7')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#ffffff')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 30))

    # Signature Block
    sig_data = [
        ["", ""],
        ["_________________________", "_________________________\nAuthorized Collector Signature"],
        ["Customer Signature", "Finance Office Stamp"]
    ]
    t3 = Table(sig_data, colWidths=[260, 260])
    t3.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#64748b')),
    ]))
    elements.append(t3)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

def generate_report_pdf(title: str, subtitle: str, headers: List[str], rows: List[List[Any]]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=30, bottomMargin=30)
    styles = getSampleStyleSheet()

    elements = []
    elements.append(Paragraph(f"<b>{title}</b>", styles['Heading1']))
    elements.append(Paragraph(subtitle, styles['Normal']))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=15))

    table_data = [headers] + rows
    t = Table(table_data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284c7')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
