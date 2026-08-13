from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from typing import List, Optional
import re
from app.schemas.schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from app.auth.jwt import get_current_user, require_admin
from app.excel.db import read_sheet, write_sheet, log_audit

router = APIRouter(prefix="/customers", tags=["Customers"])

def compute_customer_stats(customer_id: str, loans: List[dict]):
    cust_loans = [l for l in loans if l.get("customer_id") == customer_id and l.get("status") in ["ACTIVE", "OVERDUE"]]
    active_count = len(cust_loans)
    outstanding = sum(float(l.get("total_payable", 0)) - float(l.get("paid_amount", 0) or 0) for l in cust_loans)
    return active_count, max(0.0, round(outstanding, 2))

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    area_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    customers = read_sheet("Customers")
    loans = read_sheet("Loans")

    res = []
    for c in customers:
        if area_id and c.get("area_id") != area_id:
            continue
        if search:
            q = search.lower()
            if q not in c.get("customer_name", "").lower() and q not in c.get("mobile_number", "") and q not in c.get("customer_id", "").lower():
                continue

        active_count, outstanding = compute_customer_stats(c["customer_id"], loans)

        res.append(
            CustomerResponse(
                customer_id=c["customer_id"],
                customer_name=c.get("customer_name", ""),
                mobile_number=c.get("mobile_number", ""),
                address=c.get("address", ""),
                area_id=c.get("area_id", ""),
                area_name=c.get("area_name", ""),
                aadhaar_number=c.get("aadhaar_number", ""),
                photo_path=c.get("photo_path", ""),
                guarantor_name=c.get("guarantor_name", ""),
                guarantor_mobile=c.get("guarantor_mobile", ""),
                created_at=c.get("created_at", ""),
                status=c.get("status", "Active"),
                active_loans_count=active_count,
                total_outstanding=outstanding
            )
        )
    return res

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    customers = read_sheet("Customers")
    c = next((item for item in customers if item["customer_id"] == customer_id), None)
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")

    loans = read_sheet("Loans")
    active_count, outstanding = compute_customer_stats(customer_id, loans)

    return CustomerResponse(
        customer_id=c["customer_id"],
        customer_name=c.get("customer_name", ""),
        mobile_number=c.get("mobile_number", ""),
        address=c.get("address", ""),
        area_id=c.get("area_id", ""),
        area_name=c.get("area_name", ""),
        aadhaar_number=c.get("aadhaar_number", ""),
        photo_path=c.get("photo_path", ""),
        guarantor_name=c.get("guarantor_name", ""),
        guarantor_mobile=c.get("guarantor_mobile", ""),
        created_at=c.get("created_at", ""),
        status=c.get("status", "Active"),
        active_loans_count=active_count,
        total_outstanding=outstanding
    )

@router.post("", response_model=CustomerResponse)
def create_customer(cust_in: CustomerCreate, current_user: dict = Depends(get_current_user)):
    # Validate Area
    areas = read_sheet("Areas")
    area = next((a for a in areas if a["area_id"] == cust_in.area_id and a.get("status") == "Active"), None)
    if not area:
        raise HTTPException(status_code=400, detail="Invalid or inactive Area selected")

    # Validate Mobile
    clean_mobile = re.sub(r"\D", "", cust_in.mobile_number)
    if len(clean_mobile) != 10:
        raise HTTPException(status_code=400, detail="Mobile number must be a valid 10-digit number")

    # Validate Aadhaar if provided
    clean_aadhaar = re.sub(r"\D", "", cust_in.aadhaar_number or "")
    if cust_in.aadhaar_number and len(clean_aadhaar) != 12:
        raise HTTPException(status_code=400, detail="Aadhaar number must be a valid 12-digit number")

    customers = read_sheet("Customers")
    if any(c.get("mobile_number") == clean_mobile for c in customers):
        raise HTTPException(status_code=400, detail="Customer with this mobile number already exists")

    new_id = f"CUST{len(customers) + 1:04d}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    new_cust = {
        "customer_id": new_id,
        "customer_name": cust_in.customer_name.strip(),
        "mobile_number": clean_mobile,
        "address": cust_in.address.strip(),
        "area_id": area["area_id"],
        "area_name": area["area_name"],
        "aadhaar_number": clean_aadhaar,
        "photo_path": cust_in.photo_path or "",
        "guarantor_name": cust_in.guarantor_name.strip() if cust_in.guarantor_name else "",
        "guarantor_mobile": cust_in.guarantor_mobile.strip() if cust_in.guarantor_mobile else "",
        "created_at": now_str,
        "status": "Active"
    }

    customers.append(new_cust)
    write_sheet("Customers", customers)

    log_audit(current_user["user_id"], current_user["username"], "CREATE", "CUSTOMERS", new_id, f"Created customer {cust_in.customer_name}")

    return CustomerResponse(**new_cust, active_loans_count=0, total_outstanding=0.0)

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: str, cust_in: CustomerUpdate, current_user: dict = Depends(get_current_user)):
    customers = read_sheet("Customers")
    idx = next((i for i, c in enumerate(customers) if c["customer_id"] == customer_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    target = customers[idx]

    if cust_in.area_id:
        areas = read_sheet("Areas")
        area = next((a for a in areas if a["area_id"] == cust_in.area_id), None)
        if not area:
            raise HTTPException(status_code=400, detail="Invalid Area selected")
        target["area_id"] = area["area_id"]
        target["area_name"] = area["area_name"]

    if cust_in.customer_name is not None:
        target["customer_name"] = cust_in.customer_name.strip()
    if cust_in.mobile_number is not None:
        target["mobile_number"] = re.sub(r"\D", "", cust_in.mobile_number)
    if cust_in.address is not None:
        target["address"] = cust_in.address.strip()
    if cust_in.aadhaar_number is not None:
        target["aadhaar_number"] = re.sub(r"\D", "", cust_in.aadhaar_number)
    if cust_in.guarantor_name is not None:
        target["guarantor_name"] = cust_in.guarantor_name.strip()
    if cust_in.guarantor_mobile is not None:
        target["guarantor_mobile"] = cust_in.guarantor_mobile.strip()
    if cust_in.status is not None:
        target["status"] = cust_in.status.strip()

    customers[idx] = target
    write_sheet("Customers", customers)

    loans = read_sheet("Loans")
    active_count, outstanding = compute_customer_stats(customer_id, loans)

    log_audit(current_user["user_id"], current_user["username"], "UPDATE", "CUSTOMERS", customer_id, f"Updated customer {target['customer_name']}")

    return CustomerResponse(**target, active_loans_count=active_count, total_outstanding=outstanding)

@router.delete("/{customer_id}")
def delete_customer(customer_id: str, current_user: dict = Depends(require_admin)):
    customers = read_sheet("Customers")
    loans = read_sheet("Loans")
    if any(l.get("customer_id") == customer_id and l.get("status") in ["ACTIVE", "OVERDUE"] for l in loans):
        raise HTTPException(status_code=400, detail="Cannot delete customer with active loans")

    filtered = [c for c in customers if c["customer_id"] != customer_id]
    if len(filtered) == len(customers):
        raise HTTPException(status_code=404, detail="Customer not found")

    write_sheet("Customers", filtered)
    log_audit(current_user["user_id"], current_user["username"], "DELETE", "CUSTOMERS", customer_id, "Deleted customer")
    return {"message": "Customer deleted successfully"}
