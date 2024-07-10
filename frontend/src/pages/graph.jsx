
// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Snackbar, Alert } from "@mui/material";
import { GraphComponent } from "../common/graphComponent.jsx";
import { GraphSettings } from "../common/graphSettings.jsx";
import { getGraph } from "../api/api.js";
import { Settings, RotateLeft, Loop } from '@mui/icons-material';
import { metricTypes, metricNames } from "../common/metrics.js";

export const Graph = (props) => {
  // useState definitions
  const [data, setData] = useState(undefined);
  const [graphData, setGraphData] = useState(undefined);
  const [settings, setSettings] = useState(true);
  const [graph, setGraph] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(1);
  const [snackBarOpen1, setSnackBarOpen1] = useState(false);

  // variable definitions
  const navigate = useNavigate();

  // Function definitions
  const openSnackbar1 = () => {
      setSnackBarOpen1(true)
  }

  const handleSnackBarClose1 = (event, reason) => {
      if (reason === 'clickaway') {
          return;
      }
      setSnackBarOpen1(false);
  };

  // Runs on graph settings submit
  // Generate a graph or update the existing graph
  const updateGraph = (params) => {
    setGraph(false);
    setLoading(true);

    getGraph(data.dataset.table_name, params).then(async (res) => {
      let tempData = {
        graph: [],
        table_name: data.dataset.table_name,
        metric: params.metric,
        titleList: []
      };

      if (metricTypes.bar.indexOf(params.metric) !== -1) {
        tempData.xLabel = "Word"
        if (params.metric === "counts") {
          tempData.yLabel = "Count"
        } else if (params.metric === "proportions") {
          tempData.yLabel = "Proportion"
        } else if (params.metric === "embeddings-similar") {
          tempData.yLabel = "Embedding Similarity"
        }
        tempData.titleList = params.word_list;

        res.forEach((dataPoint) => { // Populate data array with request output
          let index = tempData.graph.findIndex((x) => x.name === dataPoint.group);
          if (index >= 0) { // Runs if datapoint already exists in tempData
            tempData.graph[index].x.push(dataPoint.x)
            tempData.graph[index].y.push(dataPoint.y)
          }
          else {
            tempData.graph.push({
              x: [dataPoint.x],
              y: [dataPoint.y],
              name: dataPoint.group,
              type: "bar"
            })
          }
        });
      } else if (metricTypes.scatter.indexOf(params.metric) !== -1) {
        let keys;
        if (!params.group_list || params.group_list.length < 2) {
          keys = ["X", "Y"];
        } else {
          keys = [params.group_list[0], params.group_list[1]];
        }
        tempData.xLabel = keys[0];
        tempData.yLabel = keys[1];
        tempData.titleList.push(keys[0], keys[1])

        tempData.graph.push({
          x: [],
          y: [],
          text: [],
          mode: "markers",
          type: "scatter"
        });

        res.forEach((dataPoint) => { // Populate data array with request output
          tempData.graph[0].x.push(dataPoint.x);
          tempData.graph[0].y.push(dataPoint.y);
          tempData.graph[0].text.push(dataPoint.word);
        });
      } else if (metricTypes.heatmap.indexOf(params.metric) !== -1) {
        tempData.xLabel = "";
        tempData.yLabel = "";
        tempData.titleList = params.word_list;

        tempData.graph.push({
          x: [],
          y: [],
          z: [],
          zmin: 0,
          zmax: 1,
          mode: "markers",
          type: "heatmap",
          hoverongaps: false
        })

        const groups = [...new Set([...res.map(pnt => pnt.x), ...res.map(pnt => pnt.y)])];
        groups.forEach(grp => {
          tempData.graph[0].x.push(grp);
          tempData.graph[0].y.push(grp);
          tempData.graph[0].z.push([]);
        })

        groups.forEach((grp1, i) => {
          groups.forEach((grp2, j) => {
            if (i === j) {
              tempData.graph[0].z[i].push(null);
            } else {
              const dataPoint = res.filter(data => (data.x === grp1 && data.y === grp2) || (data.x === grp2 && data.y === grp1));
              if (dataPoint.length > 0 && dataPoint[0].fill) {
                tempData.graph[0].z[i].push(dataPoint[0].fill);
              } else {
                tempData.graph[0].z[i].push(null);
              }
            }
          });
        });
      } else if (metricTypes.dotplot.indexOf(params.metric) !== -1) {
        tempData.xLabel = "Group";
        tempData.yLabel = metricNames[params.metric];
        tempData.titleList = [params.word_list[0]];

        res.forEach((dataPoint) => { // Populate data array with request output
          let index = tempData.graph.findIndex((x) => x.name === dataPoint.x);
          if (index >= 0) { // Runs if datapoint already exists in tempData
            tempData.graph[index].x.push(dataPoint.x)
            tempData.graph[index].y.push(dataPoint.y)
          }
          else {
            tempData.graph.push({
              x: [dataPoint.group],
              y: [dataPoint.y],
              name: dataPoint.x,
              type: "scatter"
            })
          }
        });
      } else {
        throw new Error(`Metric '${params.metric}' not implimented`)
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
    debugger;
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
    if (!demoV || !demoV.dataset || !demoV.dataset.tokens_done) {
      navigate('/datasetsearch')
      props.setNavigated(true);
    } else {
      setData(demoV);

      if (props.navigated) {
        props.setNavigated(false)
        setAlert(1);
        openSnackbar1()
      }

      let graph = JSON.parse(localStorage.getItem('graph-data'));
      if (graph) {
        if (graph["table_name"] === demoV["dataset"]["table_name"]) {
          setGraphData(graph);
          setGraph(true);
          setSettings(false);
        } else {
          debugger;
          localStorage.removeItem("graph-data")
        }
      }
    }
  }, []);

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackBarOpen1}
        autoHideDuration={6000}
        onClose={() => handleSnackBarClose1()}
      >
        <Alert onClose={handleSnackBarClose1} severity="error" sx={{ width: '100%' }}>
          {alert === 1 && <>You must select a data point first</>}
        </Alert>
      </Snackbar>

      {data !== undefined && <GraphSettings dataset={data} show={settings} setSettings={setSettings}
        updateGraph={updateGraph} generated={graph} />}

      <Box component="div" sx={{ marginLeft: "10%", marginRight: "16px", marginTop: "5%" }}>
        <Grid container justifyContent="center" direction="column">

          {/* {"Open Graph settings button"} */}
          <Grid item xs={12}>
            <Button variant="contained"
              onClick={handleOpen}
              className="mt-2"
              sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
            ><Settings /> Graph Settings</Button>
          </Grid>

          {/* {"Reset graph button"} */}
          <Grid item xs={12} sx={{ mt: 1.5 }}>
            <Button variant="contained"
              onClick={resetGraph}
              className="mt-2"
              sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
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
                <Loop sx={{ fontSize: 80 }} />
              </Box>
            )}
            {graph && <GraphComponent border data={graphData} setData={setData} />}
          </Grid>

        </Grid>
      </Box>
    </>
  );
}