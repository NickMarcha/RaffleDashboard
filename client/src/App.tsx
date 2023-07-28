import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Raffle from "./pages/Raffle";
import NoPage from "./pages/NoPage";
import History from "./pages/History";
import { useEffect } from "react";
import React from "react";
import RaffleMore from "./pages/RaffleMore";

function App() {
  useEffect(() => {
    document.title = "Raffle Dashboard";
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="raffle" element={<Raffle />} />
          <Route path="rafflemore" element={<RaffleMore />} />
          <Route path="history" element={<History />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
