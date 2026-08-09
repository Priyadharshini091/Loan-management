export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const maskAadhaar = (value?: string) => {
  if (!value) return "-";
  const lastFour = value.replace(/\D/g, "").slice(-4);
  return lastFour ? `XXXX XXXX ${lastFour}` : "-";
};

export const receiptNumber = (seed: number) => `REC${String(seed).padStart(6, "0")}`;
