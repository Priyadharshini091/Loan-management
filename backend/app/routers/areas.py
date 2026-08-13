from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from typing import List
from app.schemas.schemas import AreaCreate, AreaUpdate, AreaResponse
from app.auth.jwt import get_current_user, require_admin
from app.excel.db import read_sheet, write_sheet, log_audit

router = APIRouter(prefix="/areas", tags=["Areas"])

@router.get("", response_model=List[AreaResponse])
def get_areas(current_user: dict = Depends(get_current_user)):
    areas = read_sheet("Areas")
    return [
        AreaResponse(
            area_id=a["area_id"],
            area_name=a["area_name"],
            district=a.get("district", "Karur"),
            pincode=a.get("pincode", ""),
            status=a.get("status", "Active"),
            created_at=a.get("created_at", "")
        )
        for a in areas
    ]

@router.post("", response_model=AreaResponse)
def create_area(area_in: AreaCreate, current_user: dict = Depends(get_current_user)):
    areas = read_sheet("Areas")
    if any(a.get("area_name", "").strip().lower() == area_in.area_name.strip().lower() for a in areas):
        raise HTTPException(status_code=400, detail=f"Area '{area_in.area_name}' already exists")

    new_id = f"AREA{len(areas) + 1:03d}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    new_area = {
        "area_id": new_id,
        "area_name": area_in.area_name.strip(),
        "district": area_in.district.strip(),
        "pincode": area_in.pincode.strip(),
        "status": "Active",
        "created_at": now_str
    }
    areas.append(new_area)
    write_sheet("Areas", areas)

    log_audit(current_user["user_id"], current_user["username"], "CREATE", "AREAS", new_id, f"Created area {area_in.area_name}")

    return AreaResponse(**new_area)

@router.put("/{area_id}", response_model=AreaResponse)
def update_area(area_id: str, area_in: AreaUpdate, current_user: dict = Depends(get_current_user)):
    areas = read_sheet("Areas")
    area_idx = next((i for i, a in enumerate(areas) if a["area_id"] == area_id), None)
    if area_idx is None:
        raise HTTPException(status_code=404, detail="Area not found")

    target = areas[area_idx]
    old_name = target["area_name"]
    if area_in.area_name is not None:
        target["area_name"] = area_in.area_name.strip()
    if area_in.district is not None:
        target["district"] = area_in.district.strip()
    if area_in.pincode is not None:
        target["pincode"] = area_in.pincode.strip()
    if area_in.status is not None:
        target["status"] = area_in.status.strip()

    areas[area_idx] = target
    write_sheet("Areas", areas)

    # If area name changed, update Customers, Loans, Payments sheet area_name references
    if area_in.area_name and target["area_name"] != old_name:
        for sheet_name in ["Customers", "Loans", "Payments"]:
            records = read_sheet(sheet_name)
            updated = False
            for r in records:
                if r.get("area_id") == area_id:
                    r["area_name"] = target["area_name"]
                    updated = True
            if updated:
                write_sheet(sheet_name, records)

    log_audit(current_user["user_id"], current_user["username"], "UPDATE", "AREAS", area_id, f"Updated area {target['area_name']}")

    return AreaResponse(**target)

@router.delete("/{area_id}")
def delete_area(area_id: str, current_user: dict = Depends(require_admin)):
    areas = read_sheet("Areas")
    customers = read_sheet("Customers")
    if any(c.get("area_id") == area_id for c in customers):
        raise HTTPException(status_code=400, detail="Cannot delete area with existing registered customers")

    filtered_areas = [a for a in areas if a["area_id"] != area_id]
    if len(filtered_areas) == len(areas):
        raise HTTPException(status_code=404, detail="Area not found")

    write_sheet("Areas", filtered_areas)
    log_audit(current_user["user_id"], current_user["username"], "DELETE", "AREAS", area_id, "Deleted area")
    return {"message": "Area deleted successfully"}
