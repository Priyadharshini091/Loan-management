from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "Staff"  # Admin or Staff

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    status: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AreaCreate(BaseModel):
    area_name: str
    district: str = "Karur"
    pincode: str = ""

class AreaUpdate(BaseModel):
    area_name: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    status: Optional[str] = None

class AreaResponse(BaseModel):
    area_id: str
    area_name: str
    district: str
    pincode: str
    status: str
    created_at: str

class CustomerCreate(BaseModel):
    customer_name: str
    mobile_number: str
    address: str
    area_id: str
    aadhaar_number: Optional[str] = ""
    photo_path: Optional[str] = ""
    guarantor_name: Optional[str] = ""
    guarantor_mobile: Optional[str] = ""

class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    mobile_number: Optional[str] = None
    address: Optional[str] = None
    area_id: Optional[str] = None
    aadhaar_number: Optional[str] = None
    guarantor_name: Optional[str] = None
    guarantor_mobile: Optional[str] = None
    status: Optional[str] = None

class CustomerResponse(BaseModel):
    customer_id: str
    customer_name: str
    mobile_number: str
    address: str
    area_id: str
    area_name: str
    aadhaar_number: str
    photo_path: str
    guarantor_name: str
    guarantor_mobile: str
    created_at: str
    status: str
    active_loans_count: int = 0
    total_outstanding: float = 0.0

class LoanCalculationRequest(BaseModel):
    loan_amount: float
    interest_percentage: float
    emi_type: str  # Daily, Weekly, Monthly
    number_of_installments: int
    first_due_date: str

class LoanCalculationResponse(BaseModel):
    interest_amount: float
    total_payable: float
    emi_amount: float
    final_due_date: str

class LoanCreate(BaseModel):
    customer_id: str
    loan_amount: float
    interest_percentage: float
    emi_type: str  # Daily, Weekly, Monthly
    number_of_installments: int
    loan_date: str
    first_due_date: str

class LoanResponse(BaseModel):
    loan_id: str
    loan_number: str
    customer_id: str
    customer_name: str
    area_id: str
    area_name: str
    loan_amount: float
    interest_percentage: float
    interest_amount: float
    total_payable: float
    loan_date: str
    emi_type: str
    number_of_installments: int
    emi_amount: float
    first_due_date: str
    final_due_date: str
    status: str
    paid_amount: float = 0.0
    outstanding: float = 0.0

class InstallmentResponse(BaseModel):
    installment_id: str
    loan_id: str
    customer_id: str
    customer_name: str = ""
    area_id: str = ""
    area_name: str = ""
    loan_number: str = ""
    mobile_number: str = ""
    installment_number: int
    due_date: str
    due_amount: float
    paid_amount: float
    balance: float
    status: str  # PAID, PENDING, PARTIAL, OVERDUE
    paid_date: str
    receipt_number: str

class PaymentCreate(BaseModel):
    loan_id: str
    installment_id: Optional[str] = None
    amount_paid: float
    payment_method: str = "Cash"  # Cash, UPI, Bank Transfer, Other
    remarks: Optional[str] = ""

class PaymentResponse(BaseModel):
    payment_id: str
    receipt_number: str
    loan_id: str
    customer_id: str
    customer_name: str
    area_id: str
    area_name: str
    payment_date: str
    due_date: str
    amount_due: float
    amount_paid: float
    partial_payment: float
    balance: float
    payment_status: str
    payment_method: str
    collected_by: str
    remarks: str

class AreaDashboardResponse(BaseModel):
    area_id: str
    area_name: str
    total_customers: int
    total_active_loans: int
    total_loan_given: float
    total_collected: float
    total_pending: float
    todays_due: float
    todays_collection: float
    overdue_amount: float
    overdue_customers: int

class DashboardResponse(BaseModel):
    total_customers: int
    active_loans: int
    total_loan_given: float
    collection_today: float
    pending_amount: float
    overdue_customers: int
    area_summaries: List[Dict[str, Any]] = []

class EmailReportRequest(BaseModel):
    report_type: str  # daily, weekly, monthly, area, pending, overdue
    area_id: Optional[str] = None
    recipient_email: Optional[str] = None

class ExcelImportPreview(BaseModel):
    valid: bool
    summary: Dict[str, int]
    preview_customers: List[Dict[str, Any]] = []
    preview_areas: List[Dict[str, Any]] = []
    errors: List[str] = []

class RestoreRequest(BaseModel):
    backup_filename: str
