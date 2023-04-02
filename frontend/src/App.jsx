import { React, useState, useEffect } from "react";
import { LoginRegister } from "./pages/login-register.jsx";
import { Graph } from "./pages/graph.jsx";
import { Layout } from "./pages/layout.jsx";
import { Zoom } from "./pages/zoom.jsx";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { SubsetResultsPage } from "./SubsetSearch/SubsetResultsPage";
import { DatasetResultsPage } from "./DatasetSearch/DatasetResultsPage";
import { Upload } from "./pages/upload.jsx";
import "./App.css";
import 'animate.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
  
export const App = () => {

  const graphData = {
    x: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    y: [24, 24, 24, 24, 24, 24, 24],
    label: "Hours/Day",
    other: [
      "SUNDAY is 24 hours",
      "MONDAY is also 24 hours long",
      "TUESDAY, as we can see, is also 24 hours",
      "I wonder if WEDNESDAY follows the same pattern (24 hours)",
      "'THURSDAY.hours == 24' returns true",
      "FRIDAY is 23 hours long if we exclude the final hour",
      "SATURDAY is not any amount of hours, except 24"
    ]
  };

  const [data, setData] = useState(undefined);
  
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
    <div className="App">
      <BrowserRouter>
        <Layout />
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/login-register" element={<LoginRegister />}></Route>
            <Route path="/graph" element={<Graph dataset={graphData} setData={setData} />}></Route>
            <Route path="/zoom" element={<Zoom data={data} />}></Route>
            <Route path='/subsetsearch' element={<SubsetResultsPage dataset={dataset} />} />
            <Route path='/datasetsearch' element={<DatasetResultsPage setDataset={(x) => chooseDataset(x)}/>} />
            <Route path="/upload" element={<Upload />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
