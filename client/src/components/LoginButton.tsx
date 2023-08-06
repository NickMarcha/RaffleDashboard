import React, { useState } from "react";
import { login } from "../raffleApi";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAccessCodeChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setAccessCode(event.target.value);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLogin = async () => {
    const { success, message } = await login(accessCode);
    if (success) {
      handleModalClose();
      navigate("/raffle");
      window.location.reload(); // Reload the page
    } else {
      setError(message);
    }
  };

  return (
    <div className="z-50">
      <button onClick={handleModalOpen}>Login</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Login</h2>
            <input
              type="password"
              value={accessCode}
              onChange={handleAccessCodeChange}
            />
            <button onClick={handleLogin}>Submit</button>
            <button onClick={handleModalClose}>Close</button>
          </div>
        </div>
      )}

      {error && <p>error: {error}</p>}
    </div>
  );
};

export default LoginButton;
