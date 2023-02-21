import React from "react";
import { LoginRegister } from "./pages/login-register.jsx";
import { Graph } from "./pages/graph.jsx";
import { Layout } from "./pages/layout.jsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Layout />
        <div className="container border border-2">
          <Routes>
            <Route path="/login" element={<LoginRegister/>}></Route>
            <Route path="/graph" element={<Graph />}></Route>
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
