from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, Query
import io
import pandas as pd
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.schemas.schemas import ExcelImportPreview
from app.auth.jwt import get_current_user, require_admin
from app.excel.db import read_sheet, write_sheet, log_audit, create_backup

router = APIRouter(prefix="", tags=["Excel"])

@router.post("/import/excel", response_model=ExcelImportPreview)
async def preview_excel_import(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_admin)
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file extension. Please upload an Excel .xlsx file.")

    contents = await file.read()
    try:
        excel_file = pd.ExcelFile(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse Excel file: {str(e)}")

    sheet_names = excel_file.sheet_names
    errors = []
    summary = {"Customers": 0, "Areas": 0, "Loans": 0}
    preview_custs = []
    preview_areas = []

    existing_areas = {a["area_name"].lower(): a["area_id"] for a in read_sheet("Areas")}
    existing_mobiles = {c["mobile_number"] for c in read_sheet("Customers")}

    if "Customers" in sheet_names:
        df_cust = pd.read_excel(excel_file, sheet_name="Customers")
        required_cols = ["customer_name", "mobile_number", "area_name"]
        missing = [col for col in required_cols if col not in df_cust.columns]
        if missing:
            errors.append(f"Customers sheet is missing columns: {', '.join(missing)}")
        else:
            for idx, row in df_cust.iterrows():
                row_idx = idx + 2
                c_name = str(row.get("customer_name", "")).strip()
                mobile = str(row.get("mobile_number", "")).strip().split(".")[0]
                a_name = str(row.get("area_name", "")).strip()

                if not c_name or c_name == "nan":
                    errors.append(f"Row {row_idx}: Customer name is empty")
                    continue
                if len(mobile) != 10 or not mobile.isdigit():
                    errors.append(f"Row {row_idx}: Invalid mobile number '{mobile}' for {c_name}")
                    continue
                if mobile in existing_mobiles:
                    errors.append(f"Row {row_idx}: Mobile number '{mobile}' already exists in database")
                    continue
                if a_name.lower() not in existing_areas:
                    errors.append(f"Row {row_idx}: Unknown area '{a_name}' for customer {c_name}")
                    continue

                preview_custs.append({
                    "customer_name": c_name,
                    "mobile_number": mobile,
                    "address": str(row.get("address", "")),
                    "area_id": existing_areas[a_name.lower()],
                    "area_name": a_name,
                    "aadhaar_number": str(row.get("aadhaar_number", "")).split(".")[0] if pd.notna(row.get("aadhaar_number")) else ""
                })
            summary["Customers"] = len(preview_custs)

    if "Areas" in sheet_names:
        df_area = pd.read_excel(excel_file, sheet_name="Areas")
        if "area_name" in df_area.columns:
            for idx, row in df_area.iterrows():
                a_name = str(row.get("area_name", "")).strip()
                if a_name and a_name.lower() not in existing_areas:
                    preview_areas.append({
                        "area_name": a_name,
                        "district": str(row.get("district", "Karur")),
                        "pincode": str(row.get("pincode", ""))
                    })
            summary["Areas"] = len(preview_areas)

    valid = len(errors) == 0

    return ExcelImportPreview(
        valid=valid,
        summary=summary,
        preview_customers=preview_custs,
        preview_areas=preview_areas,
        errors=errors
    )

@router.post("/import/excel/commit")
def commit_excel_import(data: Dict[str, Any], current_user: dict = Depends(require_admin)):
    create_backup()

    areas_to_add = data.get("preview_areas", [])
    custs_to_add = data.get("preview_customers", [])

    existing_areas = read_sheet("Areas")
    for a in areas_to_add:
        new_id = f"AREA{len(existing_areas) + 1:03d}"
        existing_areas.append({
            "area_id": new_id,
            "area_name": a["area_name"],
            "district": a.get("district", "Karur"),
            "pincode": a.get("pincode", ""),
            "status": "Active",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    if areas_to_add:
        write_sheet("Areas", existing_areas, auto_backup=False)

    existing_custs = read_sheet("Customers")
    for c in custs_to_add:
        new_id = f"CUST{len(existing_custs) + 1:04d}"
        existing_custs.append({
            "customer_id": new_id,
            "customer_name": c["customer_name"],
            "mobile_number": c["mobile_number"],
            "address": c.get("address", ""),
            "area_id": c["area_id"],
            "area_name": c["area_name"],
            "aadhaar_number": c.get("aadhaar_number", ""),
            "photo_path": "",
            "guarantor_name": "",
            "guarantor_mobile": "",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Active"
        })
    if custs_to_add:
        write_sheet("Customers", existing_custs, auto_backup=False)

    log_audit(current_user["user_id"], current_user["username"], "IMPORT", "EXCEL", "SYSTEM", f"Imported {len(custs_to_add)} customers and {len(areas_to_add)} areas")

    return {
        "message": "Excel data imported successfully",
        "imported_customers": len(custs_to_add),
        "imported_areas": len(areas_to_add)
    }

@router.get("/export/customers")
def export_customers(area_id: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    customers = read_sheet("Customers")
    if area_id:
        customers = [c for c in customers if c.get("area_id") == area_id]

    df = pd.DataFrame(customers)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Customers")

    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Customers_Export.xlsx"}
    )

@router.get("/export/loans")
def export_loans(area_id: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    loans = read_sheet("Loans")
    if area_id:
        loans = [l for l in loans if l.get("area_id") == area_id]

    df = pd.DataFrame(loans)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Loans")

    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Loans_Export.xlsx"}
    )

@router.get("/export/payments")
def export_payments(area_id: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    payments = read_sheet("Payments")
    if area_id:
        payments = [p for p in payments if p.get("area_id") == area_id]

    df = pd.DataFrame(payments)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Payments")

    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Payments_Export.xlsx"}
    )

@router.get("/export/area")
def export_area_report(area_id: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    areas = {a["area_id"]: a["area_name"] for a in read_sheet("Areas")}
    area_name = areas.get(area_id, "All Areas") if area_id else "All Areas"

    payments = read_sheet("Payments")
    if area_id:
        payments = [p for p in payments if p.get("area_id") == area_id]

    total_due = sum(float(p.get("amount_due", 0) or 0) for p in payments)
    total_collected = sum(float(p.get("amount_paid", 0) or 0) for p in payments)
    total_pending = max(0.0, round(total_due - total_collected, 2))

    summary_rows = [
        {"Report Title": f"{area_name.upper()} COLLECTION REPORT", "Generated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")},
        {"Total Due": f"₹{total_due:,.2f}", "Total Collected": f"₹{total_collected:,.2f}", "Pending": f"₹{total_pending:,.2f}"},
        {}
    ]
    df_summary = pd.DataFrame(summary_rows)
    df_data = pd.DataFrame(payments)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df_summary.to_excel(writer, index=False, sheet_name="Summary")
        df_data.to_excel(writer, index=False, sheet_name="Details")

    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={area_name.replace(' ', '_')}_Collection_Report.xlsx"}
    )
