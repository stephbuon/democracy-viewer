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
import { UploadComplete } from "./pages/UploadComplete.jsx";
import { Upload } from "./pages/upload.jsx";
import "./App.css";
import 'animate.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreateDistributedConnection from "./pages/CreateDistributedConnection.jsx";
import {Acknowledgements} from "./pages/Acknowledgements.jsx";
  
export const App = () => {
  
  // variable definitions
  let demoV = JSON.parse(localStorage.getItem('democracy-viewer'))
  const [data, setData] = useState(demoV);
  const [dataset, setDataset] = useState(demoV ? demoV.dataset : undefined);
  const [user, setUser] = useState(demoV ? demoV.user : undefined);
  const [navigated, setNavigated] = useState(false);

  // Function definitions
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
    setUser(profile)
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if(!demoV)
    {
      demoV = {user:undefined, dataset:undefined}
    }
    demoV.user = profile;
    localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
  }
  const logout = () => {
    setUser(undefined);
    demoV = {user:undefined, dataset:undefined};
    demoV.user = undefined;
    localStorage.removeItem("democracy-viewer");
    //navigate('/') //where ever you call logout also navigate back to homepage. Error occurs if here since App not in Router
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Layout user={user} logout={()=>logout()}/>
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login currUser={user} login={login} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path="/register" element={<Register currUser={user} login={login}/>} />
            <Route path="/profile/:username" element={<Profile currUser={user} setDataset={setDataset}/>} />
            <Route path="/graph" element={<Graph navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/zoom" element={<Zoom data={data} />}></Route>
            <Route path='/subsetsearch' element={<SubsetResultsPage dataset={dataset} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path='/datasetsearch' element={<DatasetResultsPage login={login} currUser={user} setUser={(x)=>setUser(x)} setDataset={(x) => chooseDataset(x)} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path="/upload" element={<Upload currUser={user} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/upload/complete" element={<UploadComplete/>}></Route>
            <Route path="/distributed" element={<CreateDistributedConnection currUser={user} setNavigated={(x) => setNavigated(x)}/>}/>
            <Route path="/acknowledgements" element={<Acknowledgements/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
