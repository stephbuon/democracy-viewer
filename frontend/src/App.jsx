import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';


//Page imports
import { DatasetSearch } from "./DatasetSearch/DatasetSearch";
import { SubsetSearch } from "./SubsetSearch/SubsetSearch";
import { SubsetResultsPage } from "./SubsetSearch/SubsetResultsPage";
import { DatasetResultsPage } from "./DatasetSearch/DatasetResultsPage";


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

          {/* <Route
            path='/datasetsearch'
            element={<DatasetSearch />} /> */}

          <Route
            path='/datasetsearch'
            element={<DatasetResultsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
