import { React, useState, useEffect } from "react";
import "../styles/App.css";
import 'animate.css';
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { SubsetSuggestion } from "../pages/SubsetSuggestion.jsx";
import { 
  Acknowledgements, CreateDistributedConnection, DatasetResultsPage, 
  DownloadStarted, Graph, Homepage, Layout, Login, Profile, Register, 
  SubsetResultsPage, Upload, UploadComplete, Zoom
} from "./pages";
  
export const App = () => {
  // variable definitions
  const [data, setData] = useState(JSON.parse(localStorage.getItem('democracy-viewer')));
  const [dataset, setDataset] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const [navigated, setNavigated] = useState(false);

  // Function definitions
  const chooseDataset = (choice) =>{
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if(!demoV)
    {
      demoV = {user:undefined, dataset:undefined}
    }
    demoV.dataset = choice;
    localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
    setDataset(choice);
    setData(demoV);
  }

  //
  const login = (profile) => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if(!demoV)
    {
      demoV = {user:undefined, dataset:undefined}
    }
    demoV.user = profile;
    localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
    setUser(profile);
    setData(demoV);
  }
  const logout = () => {
    localStorage.removeItem("democracy-viewer");
    localStorage.removeItem("graph-settings");
    localStorage.removeItem("selected");
    setData(undefined);
  }

  useEffect(() => {
    setDataset(data ? data.dataset : undefined);
    setUser(data ? data.user : undefined);
  }, [data])

  return (
    <div className="App">
      <BrowserRouter>
        <Layout user={user} logout={()=>logout()}/>
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/acknowledgements" element={<Acknowledgements/>}/>
            <Route path='/datasets/search' element={<DatasetResultsPage login={login} currUser={user} setUser={(x)=>setUser(x)} setDataset={(x) => chooseDataset(x)} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path='/datasets/subsets/search' element={<SubsetResultsPage dataset={dataset} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path='/datasets/subsets/suggestion/:id' element={<SubsetSuggestion/>} />
            <Route path="/download/:type" element={<DownloadStarted/>} />
            <Route path="/graph" element={<Graph navigated={navigated} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/graph/zoom" element={<Zoom data={data} navigated={navigated} setNavigated={(x) => setNavigated(x)} />}></Route>
            <Route path="/login" element={<Login currUser={user} login={login} navigated={navigated} setNavigated={(x) => setNavigated(x)}/>} />
            <Route path="/profile/:email" element={<Profile currUser={user} setDataset={chooseDataset} logout={logout}/>} />
            <Route path="/register" element={<Register currUser={user} login={login}/>} />
            <Route path="/upload" element={<Upload currUser={user} setNavigated={(x) => setNavigated(x)}/>}></Route>
            <Route path="/upload/complete" element={<UploadComplete/>}></Route>
            {/* <Route path="/distributed" element={<CreateDistributedConnection currUser={user} setNavigated={(x) => setNavigated(x)}/>}/> */}
            
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;