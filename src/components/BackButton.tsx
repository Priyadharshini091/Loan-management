import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";

export function BackButton({ fallback = "/dashboard" }: { fallback?: string }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  };

  return (
    <Button type="button" variant="secondary" icon={<ArrowLeft size={18} />} onClick={goBack}>
      Back
    </Button>
  );
}
