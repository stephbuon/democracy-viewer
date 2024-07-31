
// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Snackbar, Alert, Container } from "@mui/material";
import { GraphComponent } from "../common/graphComponent.jsx";
import { GraphSettings } from "../common/graphSettings.jsx";
import { getGraph } from "../api/api.js";
import { Settings, RotateLeft, Loop, Download } from '@mui/icons-material';
import { metricTypes, metricNames } from "../common/metrics.js";
import Plotly from "plotly.js-dist";
import { quantileSeq } from "mathjs";

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

      if (metricTypes.bar.includes(params.metric)) {
        tempData.xLabel = "Word"
        if (params.metric === "counts") {
          tempData.yLabel = "Count";
        } else if (params.metric === "proportions") {
          tempData.yLabel = "Proportion";
        } else if (params.metric === "embeddings-different") {
          tempData.yLabel = "Embedding Similarity";
          tempData.xLabel = "Group";
        }
        tempData.titleList = params.word_list;

        res.forEach((dataPoint) => { // Populate data array with request output
          let index = tempData.graph.findIndex((x) => x.name === dataPoint.group);
          if (index >= 0) { // Runs if datapoint already exists in tempData
            tempData.graph[index].x.push(dataPoint.x)
            tempData.graph[index].y.push(dataPoint.y)
          } else {
            tempData.graph.push({
              x: [dataPoint.x],
              y: [dataPoint.y],
              name: dataPoint.group,
              type: "bar"
            })
          }
        });
      } else if (metricTypes.scatter.includes(params.metric)) {
        let keys;
        if (!params.group_list || params.group_list.length < 2) {
          keys = ["X", "Y"];
        } else {
          keys = [params.group_list[0], params.group_list[1]];
        }
        tempData.xLabel = keys[0];
        tempData.yLabel = keys[1];
        if (keys[0] === "X" && params.group_list && params.group_list.length > 0) {
          tempData.titleList.push(params.group_list[0]);
        } else {
          tempData.titleList.push(keys[0], keys[1]);
        }

        tempData.graph.push({
          x: [],
          y: [],
          text: [],
          hovertext: [],
          mode: "markers+text",
          type: "scatter",
          textposition: "top center",
          textfont: {
            color: 'rgba(0, 0, 0, 0.5)'
          },
          marker: {
            color: 'rgba(0, 0, 255, 0.5)'
          }
        });

        // Get the range of x and y axes
        const allX = [];
        const allY = [];
        res.forEach(dataPoint => {
          allX.push(dataPoint.x);
          allY.push(dataPoint.y);
        });
        const rangeX = Math.max(...allX) - Math.min(...allX);
        const rangeY = Math.max(...allY) - Math.min(...allY);
        // Function to determine if two labels overlap
        const isOverlapping = (x1, y1, x2, y2) => {
          // Adjust fraction to change how many labels to hide
          const fraction = 0.05;
          const xThreshold = rangeX * fraction;
          const yThreshold = rangeY * fraction;
          const xDistance = Math.abs(x1 - x2);
          const yDistance = Math.abs(y1 - y2);
          return xDistance < xThreshold && yDistance < yThreshold;
        };

        // Array to store non-overlapping labels
        const nonOverlappingLabels = [];
        // Populate data array with request output
        res.forEach(dataPoint => {
          // Check for overlap with previously added labels
          const overlap = nonOverlappingLabels.some((existingPoint) =>
            isOverlapping(existingPoint.x, existingPoint.y, dataPoint.x, dataPoint.y)
          );

          // Add point to the graph regardless of overlap
          tempData.graph[0].x.push(dataPoint.x);
          tempData.graph[0].y.push(dataPoint.y);
          tempData.graph[0].hovertext.push(dataPoint.word); // Show on hover

          if (!overlap) {
            // If no overlap, display the text on the graph
            nonOverlappingLabels.push(dataPoint);
            tempData.graph[0].text.push(dataPoint.word);
          } else {
            // If overlapping, hide the text on the graph
            tempData.graph[0].text.push(''); // Empty string for hidden text
          }
        });

        // Reverse arrays for formatting purposes
        Object.keys(tempData.graph[0]).forEach(key => {
          if (Array.isArray(tempData.graph[0][key])) {
            tempData.graph[0][key].reverse();
          }
        })
      } else if (metricTypes.heatmap.includes(params.metric)) {
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
      } else if (metricTypes.dotplot.includes(params.metric)) {
        tempData.xLabel = "Group";
        tempData.yLabel = metricNames[params.metric];
        tempData.titleList = [params.word_list[0]];

        // Get the range of x and y axes
        const allY = {};
        res.forEach(dataPoint => {
          if (Object.keys(allY).includes(dataPoint.group)) {
            allY[dataPoint.group].push(dataPoint.y);
          } else {
            allY[dataPoint.group] = [dataPoint.y];
          }
        });
        const rangeY = {};
        Object.keys(allY).forEach(key => {
          rangeY[key] = Math.max(...allY[key]) - Math.min(...allY[key]);
        });
        // Function to determine if two labels overlap
        const isOverlapping = (x1, y1, x2, y2) => {
          if (x1 !== x2) {
            return false;
          }
          // Adjust fraction to change how many labels to hide
          const fraction = 0.1;
          const yThreshold = rangeY[x1] * fraction;
          const yDistance = Math.abs(y1 - y2);
          return yDistance < yThreshold;
        };

        tempData.graph.push({
          x: [],
          y: [],
          text: [],
          hovertext: [],
          mode: "markers+text",
          type: "scatter",
          textposition: "right",
          textfont: {
            color: 'rgba(0, 0, 0, 0.5)'
          },
          marker: {
            color: 'rgba(0, 0, 255, 1)'
          }
        });

        // Array to store non-overlapping labels
        const nonOverlappingLabels = [];
        // Populate data array with request output
        res.forEach(dataPoint => {
          // Check for overlap with previously added labels
          const overlap = nonOverlappingLabels.some((existingPoint) =>
            isOverlapping(existingPoint.group, existingPoint.y, dataPoint.group, dataPoint.y)
          );

          // Add point to the graph regardless of overlap
          tempData.graph[0].x.push(dataPoint.group);
          tempData.graph[0].y.push(dataPoint.y);
          tempData.graph[0].hovertext.push(dataPoint.x); // Show on hover

          if (!overlap) {
            // If no overlap, display the text on the graph
            nonOverlappingLabels.push(dataPoint);
            tempData.graph[0].text.push(dataPoint.x);
          } else {
            // If overlapping, hide the text on the graph
            tempData.graph[0].text.push(''); // Empty string for hidden text
          }
        });

        // Reverse arrays for formatting purposes
        Object.keys(tempData.graph[0]).forEach(key => {
          if (Array.isArray(tempData.graph[0][key])) {
            tempData.graph[0][key].reverse();
          }
        });
      } else if (metricTypes.multibar.includes(params.metric)) {
        tempData.xLabel = "Group"
        if (params.metric === "tf-idf-bar") {
          tempData.yLabel = "TF-IDF"
        }
        tempData.titleList = params.word_list;

        res.forEach((dataPoint) => { // Populate data array with request output
          let index = tempData.graph.findIndex((x) => x.name === dataPoint.set);
          if (index >= 0) { // Runs if datapoint already exists in tempData
            tempData.graph[index].x.push(dataPoint.x);
            tempData.graph[index].y.push(dataPoint.y);
            tempData.graph[index].text.push(dataPoint.group);
          } else {
            tempData.graph.push({
              x: [dataPoint.x],
              y: [dataPoint.y],
              name: dataPoint.set,
              text: [dataPoint.group],
              type: "bar"
            })
          }
        });
      } else {
        throw new Error(`Metric '${params.metric}' not implimented`)
      }

      tempData.title = metricNames[tempData.metric].replace(/ \([^()]*\)/g, '') + listToString(tempData.titleList);
      if (tempData.graph.length > 0) {
        localStorage.setItem('graph-data', JSON.stringify(tempData))
        setGraphData(tempData);
        setGraph(true);
      }
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

  // Downloads the plot as a png
  const downloadGraph = (format = "png") => {
    Plotly.downloadImage("graph", {
      format: format,
      filename: graphData.title
    });
  }

  // Generate file name from title string
  const listToString = (list) => {
    if (!list || list.length === 0 || data.metric === "embeddings-raw") {
      return "";
    }

    let string = " for ";
    list.forEach((word, i) => {
      if (list.length == 1) {
        string += "'" + word + "'";
      }
      else if (list.length == 2) {
        if (i < list.length - 1) {
          string += "'" + word + "' and ";
        }
        else {
          string += "'" + word + "'";
        }
      }
      else if (i < list.length - 1) {
        string += "'" + word + "'" + ", ";

      } else {
        string += "and " + "'" + word + "'";
      }
    });
    return string;
  }

  // UseEffect: Gets dataset information from local storage
  // Dataset has been selected -> Populates group options array for column name dropdown
  // Navigate to datasetSearch page otherwise
  useEffect(() => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (!demoV || !demoV.dataset || !demoV.dataset.tokens_done) {
      navigate('/datasets/search')
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
        if (graph["table_name"] === demoV["dataset"]["table_name"] && graph.graph.length > 0) {
          setGraphData(graph);
          setGraph(true);
          setSettings(false);
        } else {
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

      <Box component="div" sx={{ marginTop: "5%" }}>
        <Grid container justifyContent="center" direction="column">
          <Container sx={{ py: 4, maxWidth: '70%' }} maxWidth={false}>
            <Grid container spacing={4} justifyContent="center">
              {/* {"Open Graph settings button"} */}
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained"
                  onClick={handleOpen}
                  className="mt-2"
                  sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
                ><Settings sx={{ mr: "10px" }} />Settings</Button>
              </Grid>

              {/* {"Reset graph button"} */}
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained"
                  onClick={resetGraph}
                  className="mt-2"
                  sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
                ><RotateLeft sx={{ mr: "10px" }} />Reset</Button>
              </Grid>

              {/* {"Download graph button"} */}
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained"
                  onClick={() => downloadGraph()}
                  className="mt-2"
                  sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
                ><Download sx={{ mr: "10px" }} />Download</Button>
              </Grid>
            </Grid>
          </Container>

          {/* {"Graph component if graph exists"} */}
          <Grid item xs="auto">
            {loading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: "50px"
                }}
              >
                <Loop sx={{ fontSize: 80 }} />
              </Box>
            )}
            {graph === true && <GraphComponent border data={graphData} setData={setData} />}
            {graph === false && settings === false && loading === false && <div id="test" style={{ textAlign: "center" }}>No Results Found</div>}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}