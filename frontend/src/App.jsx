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
import { UploadProgress } from "./UploadDownloadProgress/UploadProgress";
import { DownloadProgress } from "./UploadDownloadProgress/DownloadProgress";
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
  const [user, setUser] = useState(undefined);
  const [navigated, setNavigated] = useState(false);

  const chooseDataset = (choice) =>{
    setDataset(choice)
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if(!demoV)
    {
      demoV = {user:undefined, dataset:undefined}
    }
    demoV.dataset = choice;
    localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
  }

  const login = (profile) => {
    console.log(profile);
    setUser(profile)
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if(!demoV)
    {
      demoV = {user:undefined, dataset:undefined}
    }
    console.log(demoV)
    demoV.user = profile;
    localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
  }

  useEffect(() => {
    console.log("Strating Democracy Viewer App")
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'))
    //TODO implement this (only when logged in?)
    if(demoV != undefined)
    {
      if(demoV.user != undefined){setUser(demoV.user)}
      if(demoV.dataset != undefined){setDataset(demoV.dataset)}
    }
  },[]);
  
  useEffect(()=>{
    console.log("NOW USING NEW DATASET", dataset);
  }, [dataset]);

  useEffect(()=>{
    console.log("NOW LOGGED IN", user);
  }, [user]);

  

  return (
    <div className="App">
      <BrowserRouter>
        <Layout user={user}/>
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login login={login} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path="/register" element={<Register login={login}/>} />
            <Route path="/profile/:username" element={<Profile currUser={user}/>} />
            <Route path="/login-register" element={<LoginRegister login={login}/>}></Route>
            <Route path="/graph" element={<Graph dataset={dataset} setData={setData} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/zoom" element={<Zoom data={data} />}></Route>
            <Route path='/subsetsearch' element={<SubsetResultsPage dataset={dataset} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path='/datasetsearch' element={<DatasetResultsPage setDataset={(x) => chooseDataset(x)} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path="/upload" element={<Upload />}></Route>
            <Route path="/uploadprogress" element={<UploadProgress navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/downloadprogress" element={<DownloadProgress dataset={dataset} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
