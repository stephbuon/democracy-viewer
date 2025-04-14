import { React, useState, useEffect } from "react";
import "../styles/App.css";
import 'animate.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { 
  Acknowledgements, DatasetResultsPage, 
  DownloadStarted, Graph, GraphResultsPage, Homepage, Layout, Login, Profile, Register, 
  SubsetResultsPage, SubsetSuggestion, Upload, UploadComplete, Zoom, 
  SelectedDataSet  
} from "./pages";


export const App = () => {
  // Variable definitions
  const [data, setData] = useState(JSON.parse(localStorage.getItem('democracy-viewer')));
  const [dataset, setDataset] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const [navigated, setNavigated] = useState(false);

  // Function definitions
  const chooseDataset = (choice) => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer')) || { user: undefined, dataset: undefined };
    demoV.dataset = choice;
    localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
    setDataset(choice);
    setData(demoV);
  };

  const login = (profile) => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer')) || { user: undefined, dataset: undefined };
    demoV.user = profile;
    localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
    setUser(profile);
    setData(demoV);
  };

  const logout = () => {
    localStorage.removeItem("democracy-viewer");
    localStorage.removeItem("graph-settings");
    localStorage.removeItem("selected");
    setData(undefined);
  };

  useEffect(() => {
    // Redirect to domain if running on http and not localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttp = window.location.protocol === "http:";
    if (!isLocalhost && isHttp) {
      window.location.href = `https://democracyviewer.com${window.location.pathname}`;
    }
  }, []);

  useEffect(() => {
    setDataset(data ? data.dataset : undefined);
    setUser(data ? data.user : undefined);
  }, [data]);

  return (
    <div className="App" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <BrowserRouter>
        <Layout user={user} logout={logout} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/acknowledgements" element={<Acknowledgements />} />
            <Route path="/datasets/search" element={<DatasetResultsPage login={login} currUser={user} setUser={setUser} setDataset={chooseDataset} navigated={navigated} setNavigated={setNavigated} />} />
            <Route path="/datasets/subsets/search" element={<SubsetResultsPage dataset={dataset} navigated={navigated} setNavigated={setNavigated} />} />
            <Route path="/datasets/subsets/suggestion/:id" element={<SubsetSuggestion />} />
            <Route path="/download/:type" element={<DownloadStarted />} />
            <Route path="/graph" element={<Graph navigated={navigated} setNavigated={setNavigated} />} />
            <Route path="/graph/published/:id" element={<Graph navigated={navigated} setNavigated={setNavigated} setDataset={setDataset} />} />
            <Route path="/graph/zoom" element={<Zoom data={data} navigated={navigated} setNavigated={setNavigated} />} />
            <Route path="/graphs/search" element={<GraphResultsPage login={login} currUser={user} setUser={setUser} setDataset={chooseDataset} navigated={navigated} setNavigated={setNavigated} />} />
            <Route path="/login" element={<Login currUser={user} login={login} navigated={navigated} setNavigated={setNavigated} />} />
            <Route path="/profile/:email" element={<Profile currUser={user} setDataset={chooseDataset} logout={logout} />} />
            <Route path="/register" element={<Register currUser={user} login={login} />} />
            <Route path="/upload" element={<Upload currUser={user} setNavigated={setNavigated} />} />
            <Route path="/upload/complete" element={<UploadComplete />} />
            {/* <Route path="/selected-dataset" element={<SelectedDataSet dataset={dataset} />} /> */}
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
