import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';


//Page imports
import { SubsetSearch } from "./SubsetSearch/SubsetSearch";
import { SubsetResultsPage } from "./SubsetSearch/SubsetResultsPage";
import { DatasetResultsPage } from "./DatasetSearch/DatasetResultsPage";


export const App = () => {
  
  const [dataset, setDataset] = useState(undefined);

  const chooseDataset = (choice) =>{
    setDataset(choice)
    localStorage.setItem('dataset', JSON.stringify(choice))
  }

  useEffect(() => {
    console.log("Strating Democracy Viewer App")

    //TODO implement this (only when logged in?)
    if(localStorage.getItem('dataset') != undefined)
    {
      setDataset(JSON.parse(localStorage.getItem('dataset')))
    }
  },[]);
  
  useEffect(()=>{
    console.log("NOW USING NEW DATASET", dataset);
  }, [dataset]);

  

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

          <Route
            path='/datasetsearch'
            element={<DatasetResultsPage setDataset={(x) => chooseDataset(x)}/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
