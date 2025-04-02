import React from "react";
import { Routes, Route } from "react-router-dom";
import Todos from "./templetes/Todos";
import Register from "./templetes/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Todos />} />
      <Route path="/login" element={<Todos />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
