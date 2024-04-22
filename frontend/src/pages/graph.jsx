// TODO Impliment other metrics
// TODO add groupBy option for column or value

// Imports for Graph page. This page is used for visualizing the selected dataset.
// Props include: props.dataset
// props.dataset - table_name

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraphComponent } from "../common/graphComponent.jsx";
import { GraphSettings } from "../common/graphSettings.jsx";
import { Box, Grid, Paper, Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { getGraph, getGroupNames, getColumnValues } from "../api/api.js"
import background from "../images/GUI_gradient_background.png"

export const Graph = (props) => {
// useState definitions
  const [data, setData] = useState(undefined);
  const [graphData, setGraphData] = useState(undefined);
  const [settings, setSettings] = useState(true);
  const [modalText, setModalText] = useState("Create Graph");
  const [graph, setGraph] = useState(false);

// variable definitions
  const navigate = useNavigate();

// Function definitions

   // Runs on graph settings subit
   // Generate a graph or update the existing graph
  const updateGraph = (group, groupList, metric, searchTerms) => {
    getGraph(data.dataset.table_name, group, groupList, metric, searchTerms).then(async (res) => {
      let tempData = {};
      tempData.graph = [];
      tempData.table_name = data.dataset.table_name;
      res.forEach((dataPoint) => { // Populate data array with request output
        let index = tempData.graph.findIndex((x) => x.name == dataPoint.group);
        if (index >= 0) { // Runs if datapoint 
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
      localStorage.setItem('graph-data', JSON.stringify(tempData))
      console.log("Saved graph data")
      setGraphData(tempData);
      setGraph(true);
    });
  };

  // Closes modal and updates graph data
  const handleOpen = (event) => {
    setSettings(true);
  }

  // Use Effect definition - Gets dataset information from local storage
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
      setGraphData(graph);
      setGraph(true);
      setSettings(false);
    }
  }, []);

  useEffect(() => {
  }, [graph])

  return (
    <>
      {data != undefined && <GraphSettings dataset={data} setData={setData} show={settings} setSettings={setSettings}
      updateGraph={updateGraph} buttonText={modalText}/>}

      <Box component="div" sx={{ 
        marginLeft: "20px", 
        marginRight: "16px",
        backgroundImage:`url(${background})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover", }}
      >
        <Grid container justifyContent="center">
          <div>
            <Button variant="contained"
            onClick={handleOpen}
            className="mt-2"
            style={{marginLeft:"5%"}}
            >Open graph settings</Button>

            
          </div>
          {/* Graph */}
          {!graph && <p>loading...</p>}
          {graph && <Grid item xs={12} sm={9}>
            <GraphComponent border data={graphData} setData={setData}/>
          </Grid>}
        </Grid>
      </Box>
    </>
  );
}