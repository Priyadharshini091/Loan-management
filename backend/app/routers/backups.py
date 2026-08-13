from fastapi import APIRouter, Depends, HTTPException, Response
import os
import shutil
from datetime import datetime
from typing import List, Dict, Any
from app.schemas.schemas import RestoreRequest
from app.auth.jwt import get_current_user, require_admin
from app.config import settings
from app.excel.db import create_backup, log_audit

router = APIRouter(prefix="", tags=["Backups"])

@router.post("/backup")
def trigger_manual_backup(current_user: dict = Depends(require_admin)):
    backup_path = create_backup()
    if not backup_path:
        raise HTTPException(status_code=500, detail="Failed to create backup")

    filename = os.path.basename(backup_path)
    log_audit(current_user["user_id"], current_user["username"], "BACKUP", "SYSTEM", filename, "Created manual backup")

    return {
        "message": "Backup created successfully",
        "filename": filename,
        "backup_path": backup_path,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/backups")
def list_backups(current_user: dict = Depends(require_admin)):
    backup_dir = settings.BACKUP_DIR
    if not os.path.exists(backup_dir):
        return []

    files = os.listdir(backup_dir)
    backup_list = []

    for f in files:
        if f.endswith(".xlsx"):
            fpath = os.path.join(backup_dir, f)
            stat = os.stat(fpath)
            backup_list.append({
                "filename": f,
                "size_bytes": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            })

    backup_list.sort(key=lambda x: x["created_at"], reverse=True)
    return backup_list

@router.get("/backups/download/{filename}")
def download_backup(filename: str, current_user: dict = Depends(require_admin)):
    fpath = os.path.join(settings.BACKUP_DIR, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="Backup file not found")

    with open(fpath, "rb") as f:
        content = f.read()

    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/restore")
def restore_backup(req: RestoreRequest, current_user: dict = Depends(require_admin)):
    backup_path = os.path.join(settings.BACKUP_DIR, req.backup_filename)
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Selected backup file not found")

    # Create safety backup of current state first
    safety_backup = create_backup()

    target_excel = settings.EXCEL_FILE_PATH
    shutil.copy2(backup_path, target_excel)

    log_audit(current_user["user_id"], current_user["username"], "RESTORE", "SYSTEM", req.backup_filename, f"Restored backup from {req.backup_filename}. Safety snapshot created at {os.path.basename(safety_backup)}")

    return {
        "message": f"Successfully restored Excel database from backup {req.backup_filename}",
        "restored_file": req.backup_filename,
        "safety_backup_created": os.path.basename(safety_backup)
    }
