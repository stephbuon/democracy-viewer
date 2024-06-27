
// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid } from "@mui/material";
import { GraphComponent } from "../common/graphComponent.jsx";
import { GraphSettings } from "../common/graphSettings.jsx";
import { getGraph } from "../api/api.js";
import { Settings, RotateLeft, Loop } from '@mui/icons-material';

const barGraphs = [
  "counts", "proportions", "embeddings-similar"
];

const scatterPlots = [
  "tf-idf", "ll"
];

const heatMaps = [
  "jsd"
]

export const Graph = (props) => {
// useState definitions
  const [data, setData] = useState(undefined);
  const [graphData, setGraphData] = useState(undefined);
  const [settings, setSettings] = useState(true);
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

      if(barGraphs.indexOf(metric) !== -1){
        tempData.xLabel = "Word"
        if (metric === "counts") {
          tempData.yLabel = "Count"
        } else if (metric === "proportions") {
          tempData.yLabel = "Proportion"
        } else if (metric === "embeddings-similar") {
          tempData.yLabel = "Embedding Similarity"
        }
        tempData.titleList = searchTerms;

        res.forEach((dataPoint) => { // Populate data array with request output
          let index = tempData.graph.findIndex((x) => x.name === dataPoint.group);
          if (index >= 0) { // Runs if datapoint already exists in tempData
            tempData.graph[index].x.push(dataPoint.x)
            tempData.graph[index].y.push(dataPoint.y)
            tempData.graph[index].ids.push(dataPoint.ids)
          }
          else {
            tempData.graph.push({
              x: [dataPoint.x],
              y: [dataPoint.y],
              ids: [dataPoint.ids],
              name: dataPoint.group,
              type: "bar"
            })
          }
        });
      } else if(scatterPlots.indexOf(metric) !== -1){
        const keys = [groupList[0].label, groupList[1].label];
        tempData.xLabel = keys[0];
        tempData.yLabel = keys[1];
        tempData.titleList.push(keys[0], keys[1])

        tempData.graph.push({
          x:[],
          y:[],
          ids:[],
          text:[],
          mode:"markers",
          type:"scatter"
        });

        res.forEach((dataPoint) => { // Populate data array with request output
          tempData.graph[0].x.push(dataPoint.x);
          tempData.graph[0].y.push(dataPoint.y);
          tempData.graph[0].ids.push(dataPoint.ids);
          tempData.graph[0].text.push(dataPoint.word);
        });
      } else if (heatMaps.indexOf(metric) !== -1) {
        tempData.xLabel = "";
        tempData.yLabel = "";
        tempData.titleList = searchTerms;

        tempData.graph.push({
          x: [],
          y: [],
          z: [],
          zmin: 0,
          zmax: 1,
          ids: [],
          mode: "markers",
          type: "heatmap",
          hoverongaps: false
        })

        const groups = groupList.map(x => x.label);
        groups.forEach(grp => {
          tempData.graph[0].x.push(grp);
          tempData.graph[0].y.push(grp);
          tempData.graph[0].z.push([]);
        })

        groups.forEach((grp1, i) => {
          groups.forEach((grp2, j) => {
            if (i === j) {
              tempData.graph[0].z[i].push(null);
              tempData.graph[0].ids.push([]);
            } else {
              const dataPoint = res.filter(data => (data.x === grp1 && data.y === grp2) || (data.x === grp2 && data.y === grp1));
              if (dataPoint.length > 0 && dataPoint[0].fill) {
                tempData.graph[0].z[i].push(dataPoint[0].fill);
                tempData.graph[0].ids.push(dataPoint[0].ids);
              } else {
                tempData.graph[0].z[i].push(null);
                tempData.graph[0].ids.push([]);
              }
            }
          });
        });
      } else {
        throw new Error("Metric not implimented")
      }
      localStorage.setItem('graph-data', JSON.stringify(tempData))
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
    localStorage.removeItem("graph-data");
    localStorage.removeItem('selected');
    setSettings(true);
  }

  // UseEffect: Gets dataset information from local storage
  // Dataset has been selected -> Populates group options array for column name dropdown
  // Navigate to datasetSearch page otherwise
  useEffect(() => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV === undefined) {
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
      {data !== undefined && <GraphSettings dataset={data} show={settings} setSettings={setSettings}
      updateGraph={updateGraph} generated={graph}/>}

      <Box component="div" sx={{ marginLeft: "10%", marginRight: "16px", marginTop:"5%"}}>
        <Grid container justifyContent="center" direction="column">
          
          {/* {"Open Graph settings button"} */}
          <Grid item xs={12}>
            <Button variant="contained"
              onClick={handleOpen}
              className="mt-2"
              sx={{marginLeft:"5%", backgroundColor: "black", width: "220px"}}
            ><Settings /> Graph Settings</Button>
          </Grid>

          {/* {"Reset graph button"} */}
          <Grid item xs={12} sx={{ mt: 1.5}}>
            <Button variant="contained"
            onClick={resetGraph}
            className="mt-2"
            sx={{marginLeft:"5%", backgroundColor: "black", width: "220px" }}
            ><RotateLeft /> Reset Graph</Button>
          </Grid>

          {/* {"Graph component if graph exists"} */}
          <Grid item xs={12}>
            {/* Graph */}
          {loading && (
            <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
            >
              <Loop sx={{ fontSize: 80 }}/>
            </Box>
          )}
          {graph && <GraphComponent border data={graphData} setData={setData} />}
          </Grid>
        
        </Grid>
      </Box>
    </>
  );
}