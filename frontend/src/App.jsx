import { React, useState, useEffect } from "react";
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
import CreateDistributedConnection from "./CreateDistributedConnection/CreateDistributedConnection.jsx";
  
export const App = () => {
  
  // variable definitions
  let demoV = JSON.parse(localStorage.getItem('democracy-viewer'))
  const [data, setData] = useState(demoV);
  const [dataset, setDataset] = useState(demoV.dataset);
  const [user, setUser] = useState(demoV.user);
  const [navigated, setNavigated] = useState(false);

  // Log onstart
  useEffect(() => {
    console.log("Strating Democracy Viewer App")
  },[]);

  // Function definitions

  //
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

  //
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

  return (
    <div className="App">
      <BrowserRouter>
        <Layout user={user}/>
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login login={login} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path="/register" element={<Register login={login}/>} />
            <Route path="/profile/:username" element={<Profile currUser={user}/>} />
            <Route path="/graph" element={<Graph dataset={dataset} setData={setData} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/zoom" element={<Zoom data={data} />}></Route>
            <Route path='/subsetsearch' element={<SubsetResultsPage dataset={dataset} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path='/datasetsearch' element={<DatasetResultsPage login={login} currUser={user} setUser={(x)=>setUser(x)} setDataset={(x) => chooseDataset(x)} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path="/upload" element={<Upload currUser={user} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/uploadprogress" element={<UploadProgress navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/downloadprogress" element={<DownloadProgress dataset={dataset} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/createdistributedconnection" element={<CreateDistributedConnection/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
