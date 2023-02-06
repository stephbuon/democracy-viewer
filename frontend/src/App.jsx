import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SubsetResultsPage } from "./SubsetSearch/SubsetResultsPage";

//Page imports
import { SubsetSearch } from "./SubsetSearch/SubsetSearch";


export const App = () => {
  return (
    <div className={`App`} >
      <BrowserRouter>
        <Routes>
          <Route
            path='/subsetsearch'
            element={<SubsetSearch />} />

          <Route
            path='/subsetsearch/:searchterm'
            element={<SubsetResultsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
