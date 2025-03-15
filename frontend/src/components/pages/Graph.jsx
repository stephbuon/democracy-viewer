
// Imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Snackbar, Alert, Container } from "@mui/material";
import { GraphComponent, GraphSettings } from "./subcomponents/graphs";
import { getGraph } from "../../api";
import { Settings, RotateLeft, Download } from '@mui/icons-material';
import { metricTypes, metricNames } from "./subcomponents/graphs/metrics.js";
import Plotly from "plotly.js-dist";
import { std } from "mathjs";

export const Graph = (props) => {
  // useState definitions
  const [data, setData] = useState(undefined);
  const [graphData, setGraphData] = useState(undefined);
  const [annotationData, setAnnotationData] = useState(undefined);
  const [settings, setSettings] = useState(true);
  const [graph, setGraph] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);
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

  // Runs on graph settings submit
  // Generate a graph or update the existing graph
  const updateGraph = (params) => {
    setGraph(false);
    setLoading(true);

    getGraph(data.dataset.table_name, params).then(async (res) => {
      setAnnotationData(undefined);

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
        tempData.graph.sort((a, b) => {
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
      } else if (metricTypes.directedGraph.includes(params.metric)) {
        const annotations = [];
      
        // Get unique nodes
        const nodes = [...new Set([...res.map(x => x.source), ...res.map(x => x.target)])];

        const weights = res.map(x => x.count);
        const weightStd = std(weights);

        // Initialize nodes around the unit circle
        const positions = {};
        nodes.forEach((x, i) => {
          const angle = (2 * Math.PI * i) / nodes.length;
          positions[x] = {
            x: Math.cos(angle),
            y: Math.sin(angle)
          }
        });

        // Use gradient descent to choose node locations
        const iterations = 10; // Number of iterations to refine positions
        const learning_rate = 0.01;

        for (let it = 0; it < iterations; it++) {
          res.forEach(edge => {
            const sourcePos = positions[edge.source];
            const targetPos = positions[edge.target];

            const dx = (targetPos.x - sourcePos.x) * learning_rate;
            const dy = (targetPos.y - sourcePos.y) * learning_rate;

            // Move source slightly towards target
            positions[edge.source] = {
              x: sourcePos.x + dx,
              y: sourcePos.y + dy
            };

            // Move target slightly towards source
            positions[edge.target] = {
              x: targetPos.x - dx,
              y: targetPos.y - dy
            };
          });
        }

        const generateOffset = (x0, y0, x1, y1, direction = 1, strength = 0.2) => {
          // Compute direction vector
          const dx = x1 - x0;
          const dy = y1 - y0;
          const length = Math.sqrt(dx * dx + dy * dy);

          // Normalize and rotate 90 degrees to get perpendicular vector
          const normX = (-1 * direction) * dy / length;
          const normY = direction * dx / length;

          // Compute midpoint
          const mx = (x0 + x1) / 2;
          const my = (y0 + y1) / 2;

          // Offset midpoint in the perpendicular direction
          const cX = mx + normX * strength * length;
          const cY = my + normY * strength * length;

          return { cX, cY };
        }

        const generateCurve = (x0, y0, cx, cy, x1, y1, numPoints = 20) => {
          let curveX = [];
          let curveY = [];

          for (let t = 0; t <= 1; t += 1 / numPoints) {
            const xt = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
            const yt = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
            curveX.push(xt);
            curveY.push(yt);
          }

          return { x: curveX, y: curveY };
        }

        const placeArrow = (x, y, curveX, curveY, direction = "back") => {
          const n = curveX.length;
          if (n < 2) {
            return {
              ax: x, ay: y
            }
          }

          // Get two points
          let x0, x1, y0, y1;
          if (direction == "front") {
            x0 = curveX[1];
            y0 = curveY[1];
            x1 = curveX[0];
            y1 = curveY[0];
          } else if (direction == "back") {
            x0 = curveX[n - 2];
            y0 = curveY[n - 2];
            x1 = curveX[n - 1];
            y1 = curveY[n - 1];
          } else {
            throw new Error(`Unknown arrow direction: ${ direction }`)
          }

          // Compute the direction vector
          const dx = x1 - x0;
          const dy = y1 - y0;
          const length = Math.sqrt(dx * dx + dy * dy);

          // Normalize and move slightly back to align the arrow with the curve
          const offset = 0.05; // Adjust as needed
          const ax = x1 - (dx / length) * offset;
          const ay = y1 - (dy / length) * offset;

          return { ax, ay };
        }

        const visited = [];
        const edgeTraces = [];
        res.map((edge, idx) => {
          if (!visited.includes(idx)) {
            visited.push(idx);

            let x0 = positions[edge.source]?.x
            let y0 = positions[edge.source]?.y
            let x1 = positions[edge.target]?.x
            let y1 = positions[edge.target]?.y

            const index = res.findIndex(x => x.source === edge.target && x.target === edge.source);
            if (index !== -1) {
              visited.push(index);
              const edge2 = res[index];

              const { cX, cY } = generateOffset(x0, y0, x1, y1, -1);
              const curve = generateCurve(x0, y0, cX, cY, x1, y1);
              const edgeWidth = edge2.count / weightStd;

              edgeTraces.push({
                x: curve.x,
                y: curve.y,
                hovertext: `${ edge2.source } -> ${ edge2.target }<br>Weight: ${ edge2.count }`,
                hoverinfo: 'text',
                mode: 'lines',
                line: {
                  color: "red",
                  shape: "spline",
                  width: edgeWidth
                },
                type: 'scatter'
              });

              const { ax, ay } = placeArrow(x0, y0, curve.x, curve.y, "front");
              annotations.push({
                x: x0,
                y: y0,
                ax: ax,
                ay: ay,
                xref: "x",
                yref: "y",
                axref: "x",
                ayref: "y",
                showarrow: true,
                // arrowhead: 2,
                // arrowsize: 1.2,
                arrowwidth: edgeWidth,
                arrowcolor: "red"
              });
            }

            const { cX, cY } = generateOffset(x0, y0, x1, y1);
            const curve = generateCurve(x0, y0, cX, cY, x1, y1);
            const edgeWidth = edge.count / weightStd;

            edgeTraces.push({
              x: curve.x,
              y: curve.y,
              hovertext: `${ edge.source } -> ${ edge.target }<br>Weight: ${ edge.count }`,
              hoverinfo: 'text',
              mode: 'lines',
              line: {
                color: "red",
                shape: "spline",
                width: edgeWidth
              },
              type: 'scatter'
            });

            const { ax, ay } = placeArrow(x1, y1, curve.x, curve.y, "back");
            annotations.push({
              x: x1,
              y: y1,
              ax: ax,
              ay: ay,
              xref: "x",
              yref: "y",
              axref: "x",
              ayref: "y",
              showarrow: true,
              // arrowhead: 2,
              // arrowsize: 1.2,
              arrowwidth: edgeWidth,
              arrowcolor: "red"
            });
          }
        });

        const nodeTrace = {
          x: Object.values(positions).map(pos => pos?.x),
          y: Object.values(positions).map(pos => pos?.y),
          text: Object.keys(positions),
          mode: 'markers+text',
          textposition: 'top center',
          marker: { size: 10 },
          type: 'scatter',
          hovertext: Object.keys(positions),
          hoverinfo: 'text',
        };

        tempData.graph = [nodeTrace, ...edgeTraces];
        setAnnotationData(annotations);
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

      // let graph = JSON.parse(localStorage.getItem('graph-data'));
      // if (graph) {
      //   if (graph["table_name"] === demoV["dataset"]["table_name"] && graph.graph.length > 0) {
      //     setGraphData(graph);
      //     setGraph(true);
      //     setSettings(false);
      //   } else {
      //     localStorage.removeItem("graph-data")
      //   }
      // }
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
                setData={setData}
                setZoomLoading={setZoomLoading}
                isOverlappingScatter={isOverlappingScatter}
                annotations={annotationData}
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