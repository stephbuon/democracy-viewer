
// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid } from "@mui/material";
import { GraphComponent } from "../common/graphComponent.jsx";
import { GraphSettings } from "../common/graphSettings.jsx";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { getGraph, getGroupNames, getColumnValues } from "../api/api.js"
import background from "../images/graphs_background.png"

export const Graph = (props) => {
// useState definitions
  const [data, setData] = useState(undefined);
  const [graphData, setGraphData] = useState(undefined);
  const [settings, setSettings] = useState(true);
  const [modalText, setModalText] = useState("Create Graph");
  const [graph, setGraph] = useState(false);
  const [loading, setLoading] = useState(false);

// variable definitions
  const navigate = useNavigate();

// Function definitions

   // Runs on graph settings submit
   // Generate a graph or update the existing graph
  const updateGraph = (group, groupList, metric, searchTerms) => {
    setGraph(false);
    setLoading(true);

    getGraph(data.dataset.table_name, group, groupList, metric, searchTerms).then(async (res) => {
      let tempData = {
        graph: [],
        table_name: data.dataset.table_name,
        metric: metric,
        titleList:[]
      };

      if(metric == "counts"){
        tempData.xLabel = "Word"
        tempData.yLabel = "Count"
        tempData.titleList = searchTerms;

        res.forEach((dataPoint) => { // Populate data array with request output
          let index = tempData.graph.findIndex((x) => x.name == dataPoint.group);
          if (index >= 0) { // Runs if datapoint already exists in tempData
            tempData.graph[index].x.push(dataPoint.word)
            tempData.graph[index].y.push(dataPoint.count)
            dataPoint.ids.forEach((id) => tempData.graph[index].ids.push(id));
          }
          else {
            tempData.graph.push({
              x: [dataPoint.word],
              y: [dataPoint.count],
              ids: dataPoint.ids,
              name: dataPoint.group,
              type: "bar"
            })
          }
        });
      }
      else if(metric == "tf-idf"){
        let keys = Object.keys(res[0])

        tempData.xLabel = keys[1]
        tempData.yLabel = keys[2]
        tempData.titleList.push(keys[1], keys[2])

        tempData.graph.push({
          x:[],
          y:[],
          ids:[],
          text:[],
          mode:"markers",
          type:"scatter"
        })
        tempData.wordList = [];

        res.forEach((dataPoint) => { // Populate data array with request output
          console.log("Datapoint test", dataPoint)
          tempData.graph[0].x.push(dataPoint[keys[1]])
          tempData.graph[0].y.push(dataPoint[keys[2]])
          tempData.graph[0].ids.push(dataPoint.ids);
          tempData.graph[0].text.push(dataPoint[keys[0]])
          tempData.wordList.push(dataPoint.word);
        });
      }
      else {
        console.log("Metric not implimented")
      }
      localStorage.setItem('graph-data', JSON.stringify(tempData))
      console.log("Saved graph data", tempData)
      setGraphData(tempData);
      setGraph(true);
      setLoading(false);
    });
  };

  // Opens modal
  const handleOpen = (event) => {
    setSettings(true);
  }

  // Resets to blank graph
  const resetGraph = (event) => {
    setGraph(false);
  }

  // UseEffect: Gets dataset information from local storage
  // Dataset has been selected -> Populates group options array for column name dropdown
  // Navigate to datasetSearch page otherwise
  useEffect(() => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV == undefined) {
      navigate('/datasetSearch')
      props.setNavigated(true);
    }
    setData(demoV);

    let graph = JSON.parse(localStorage.getItem('graph-data'));
    if(graph){
      if (graph["table_name"] === demoV["dataset"]["table_name"]) {
        setGraphData(graph);
        setGraph(true);
        setSettings(false);
      } else {
        localStorage.removeItem("graph-data")
      }
    }
  }, []);

  // UseEffect: Updates screen on graph change
  useEffect(() => {
  }, [graph])

  return (
    <>
      {data != undefined && <GraphSettings dataset={data} show={settings} setSettings={setSettings}
      updateGraph={updateGraph} generated={graph}/>}

      <Box component="div" sx={{ marginLeft: "10%", marginRight: "16px", marginTop:"10%"}}>
        <Grid container justifyContent="center">
          
          {"Open Graph settings button"}
          <Grid item xs={5}>
            <Button variant="contained"
              onClick={handleOpen}
              className="mt-2"
              style={{marginLeft:"5%"}}
            >Open graph settings</Button>
          </Grid>

          {"Reset graph button"}
          <Grid item xs={5}>
            <Button variant="contained"
            onClick={resetGraph}
            className="mt-2"
            style={{marginLeft:"5%"}}
            >Reset Graph</Button>
          </Grid>

          {"Graph component if graph exists"}
          <Grid item xs={12}>
            {/* Graph */}
            {loading && <p>loading...</p>}
            {graph && <GraphComponent border data={graphData} setData={setData}/>}
          </Grid>
        
        </Grid>
      </Box>
    </>
  );
}