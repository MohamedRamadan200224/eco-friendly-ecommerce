import { useNavigate } from "react-router-dom";

export const useCustomNavigate = () => {
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate("/");
  };

  return { navigateToHome };
};
