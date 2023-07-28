import React from "react";
import { logout } from "../raffleApi";
import { useNavigate } from "react-router-dom";
const LoginButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload(); // Reload the page
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LoginButton;
