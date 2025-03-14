
// Imports
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Grid, Snackbar, Alert, Container, Modal } from "@mui/material";
import { GraphComponent, GraphPublishModal, GraphSettings } from "./subcomponents/graphs";
import { getGraph, getPublishedGraph } from "../../api";
import { Settings, RotateLeft, Download, Upload } from '@mui/icons-material';
import { metricTypes, metricNames } from "./subcomponents/graphs/metrics.js";
import Plotly from "plotly.js-dist";

export const Graph = (props) => {
  // useState definitions
  const [data, setData] = useState(undefined);
  const [graphData, setGraphData] = useState(undefined);
  const [settings, setSettings] = useState(true);
  const [newSettings, setNewSettings] = useState(false);
  const [graph, setGraph] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [alert, setAlert] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishDisabled, setPublishDisabled] = useState(true);

  // variable definitions
  const navigate = useNavigate();
  const urlParams = useParams();

  // Function to determine if two labels overlap in a scatter plot
  const isOverlappingScatter = (x1, y1, x2, y2, rangeX, rangeY) => {
    // Adjust fraction to change how many labels to hide
    const fraction = 0.05;
    const xThreshold = rangeX * fraction;
    const yThreshold = rangeY * fraction;
    const xDistance = Math.abs(x1 - x2);
    const yDistance = Math.abs(y1 - y2);
    return xDistance < xThreshold && yDistance < yThreshold;
  };

  // Close publish modal
  const handlePublishClose = () => {
    setPublishOpen(false);
  }

  // Runs on graph settings submit
  // Generate a graph or update the existing graph
  const updateGraph = (params) => {
    localStorage.removeItem('selected');
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

        // Get the range of x and y axes
        const maxX = res.reduce((max, dataPoint) => Math.max(max, dataPoint.x), -Infinity);
        const minX = res.reduce((min, dataPoint) => Math.min(min, dataPoint.x), Infinity);
        const rangeX = maxX - minX;
        const maxY = res.reduce((max, dataPoint) => Math.max(max, dataPoint.y), -Infinity);
        const minY = res.reduce((min, dataPoint) => Math.min(min, dataPoint.y), Infinity);
        const rangeY = maxY - minY;

        // Array to store non-overlapping labels
        const nonOverlappingLabels = [];
        // Populate data array with request output
        res.forEach(dataPoint => {
          // Check for overlap with previously added labels
          const overlap = nonOverlappingLabels.some((existingPoint) =>
            isOverlappingScatter(existingPoint.x, existingPoint.y, dataPoint.x, dataPoint.y, rangeX, rangeY)
          );

          // Add point to the graph regardless of overlap
          let index = tempData.graph.findIndex(x => x.name === dataPoint.group);
          if (index === -1) {
            index = tempData.graph.length;
            tempData.graph.push({
              x: [dataPoint.x],
              y: [dataPoint.y],
              text: [],
              hovertext: [dataPoint.word],
              name: dataPoint.group,
              mode: "markers+text",
              type: "scatter",
              textposition: "top center",
              textfont: {
                color: 'rgba(0, 0, 0, 0.5)'
              },
              marker: {
                opacity: 0.5
              }
            });
          } else {
            tempData.graph[index].x.push(dataPoint.x);
            tempData.graph[index].y.push(dataPoint.y);
            tempData.graph[index].hovertext.push(dataPoint.word); // Show on hover
          }  

          if (!overlap) {
            // If no overlap, display the text on the graph
            nonOverlappingLabels.push(dataPoint);
            tempData.graph[index].text.push(dataPoint.word);
          } else {
            // If overlapping, hide the text on the graph
            tempData.graph[index].text.push(''); // Empty string for hidden text
          }
        });

        // Sort for legend
        tempData.graph.sort((a,b) => {
            if (a.name < b.name) {
              return -1;
            } else if (a.name > b.name) {
              return 1;
            } else {
              return 0;
            }
        });
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

        // Get the range of y axis
        const maxY = res.reduce((max, dataPoint) => Math.max(max, dataPoint.y), -Infinity);
        const minY = res.reduce((min, dataPoint) => Math.min(min, dataPoint.y), Infinity);
        const rangeY = maxY - minY;
        // Function to determine if two labels overlap
        const isOverlapping = (x1, y1, x2, y2) => {
          if (x1 !== x2) {
            return false;
          }
          // Adjust fraction to change how many labels to hide
          const fraction = 0.1;
          const yThreshold = rangeY * fraction;
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
    localStorage.removeItem('selected');
    localStorage.removeItem('graph-settings');
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
    if (urlParams.id) {
      setSettings(false);
    }

    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (!demoV || !demoV.dataset || !demoV.dataset.tokens_done) {
      navigate('/datasets/search')
      props.setNavigated(true);
    } else {
      setData(demoV);

      if (props.navigated) {
        props.setNavigated(false)
        setAlert(1);
      }

      // Disable publish button if user is not logged in
      if (!demoV.user) {
        setLoggedIn(false);
      } else {
        setLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    if (data && urlParams.id) {
      getPublishedGraph(urlParams.id).then(params => {
        localStorage.setItem('graph-settings', JSON.stringify(params));
        setNewSettings(!newSettings);
        updateGraph(params);
      });
    }
  }, [data]);

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={alert !== 0}
        autoHideDuration={6000}
      >
        <Alert 
          onClose={() => setAlert(0)} 
          severity={alert === 2 ? "success" : "error"} 
          sx={{ width: '100%' }}
        >
          {alert === 1 && <>You must select a data point first</>}
          {alert === 2 && <>Successfully published graph!</>}
        </Alert>
      </Snackbar>

      {
        data !== undefined && 
        <GraphSettings 
          dataset={data} 
          show={settings} 
          setSettings={setSettings}
          updateGraph={updateGraph} 
          generated={graph} 
          newSettings={newSettings} 
        />
      }

      <Modal open={publishOpen} onClose={() => handlePublishClose()}>
        <div>
          <GraphPublishModal
            disabled={publishDisabled}
            setDisabled={setPublishDisabled}
            handleClose={handlePublishClose}
            downloadGraph={downloadGraph}
            setAlert={setAlert}
          />
        </div>
      </Modal>

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
                  disabled={loading || zoomLoading}
                ><Settings sx={{ mr: "10px" }} />Settings</Button>
              </Grid>

              {/* {"Reset graph button"} */}
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained"
                  onClick={resetGraph}
                  className="mt-2"
                  sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
                  disabled={loading || zoomLoading}
                ><RotateLeft sx={{ mr: "10px" }} />Reset</Button>
              </Grid>

              {/* {"Download graph button"} */}
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained"
                  onClick={() => downloadGraph()}
                  className="mt-2"
                  sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
                  disabled={loading || zoomLoading}
                ><Download sx={{ mr: "10px" }} />Download</Button>
              </Grid>

              {/* {"Publish graph button"} */}
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained"
                  onClick={() => setPublishOpen(true)}
                  className="mt-2"
                  sx={{ marginLeft: "5%", backgroundColor: "black", width: "220px" }}
                  disabled={loading || zoomLoading || !loggedIn}
                ><Upload sx={{ mr: "10px" }} />Publish</Button>
              </Grid>
            </Grid>
          </Container>

          {/* {"Graph component if graph exists"} */}
          <Grid item xs="auto">
            {(loading === true || zoomLoading === true) && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: "50px"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "60vh"
                }}>
                  <div class="spinner-border" style={{
                      width: "5rem",
                      height: "5rem"
                    }} role="status">
                    <span class="sr-only"></span>
                  </div>
                </div>
              </Box>
            )}

            {
              graph === true && zoomLoading === false && 
                <GraphComponent 
                  border 
                  data={graphData} 
                  setZoomLoading={setZoomLoading} 
                  isOverlappingScatter={isOverlappingScatter}
                />
            }

            {
              graph === false && settings === false && loading === false && 
                <div id="test" style={{ textAlign: "center" }}>
                  No Results Found
                </div>
            }
          </Grid>
        </Grid>
      </Box>
    </>
  );
}