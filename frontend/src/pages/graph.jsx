
// Imports
import React, { useEffect, useState } from "react";
// TODO Removing word embedding metric. Impliment other metrics

// Imports for Graph page. This page is used for visualizing the selected dataset.
// Props include: props.dataset
// props.dataset - table_name

import React, { useRef, useEffect, useState } from "react";
import { TextField } from '@mui/material'
import { SelectField } from "../common/selectField.jsx";
import Select from 'react-select'
import Plotly from "plotly.js-dist";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid } from "@mui/material";
import { GraphComponent } from "../common/graphComponent.jsx";
import { GraphSettings } from "../common/graphSettings.jsx";
import { getGraph } from "../api/api.js"

const barGraphs = [
  "counts", "proportion"
];

const scatterPlots = [
  "tf-idf", "ll", "embeddings"
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
  const graph = useRef(null);

  // Dataset has been selected -> Populates group options array for column name dropdown
  // Navigate to datasetSearch page otherwise
  useEffect(() => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV == undefined || props.dataset == undefined) {
      navigate('/datasetSearch')
      props.setNavigated(true)
    }
    else{
      updateGroupNames();
    }
  }, []);

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
        tempData.yLabel = "Count"
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
      console.log("Saved graph data", tempData)
      setGraphData(tempData);
      setGraph(true);
      setLoading(false);
    });
  }

  // When enter is pressed on custom search text entry,
  // Add current text to the word list and empty the textbox
  const addSearchTerm = (key) => {
    if(key == 'Enter'){
      searchTerms[0].push(searchValue);
      setSearchValue("");
    }
  }

  // Resets to blank graph
  const resetGraph = (event) => {
    setGraph(false);
    localStorage.removeItem("graph-data");
    localStorage.removeItem('selected');
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

    getGraph(props.dataset.table_name, group, groupList, metric, searchTerms[0]).then(async (res) => {
      console.log("graph res test", res)
      setData([]);
      res.forEach((dataPoint) => { // Populate data array with request output
        console.log("Datapoint test", dataPoint)
        let index = data.findIndex((x) => x.name == dataPoint.group);
        if (index >= 0) {
          data[index].x.push(dataPoint.word)
          data[index].y.push(dataPoint.count)
          data[index].ids += dataPoint.ids
        }
        else {
          data.push({
            x: [dataPoint.word],
            y: [dataPoint.count],
            ids: dataPoint.ids,
            name: dataPoint.group,
            type: "bar"
          })
        }
      });
      console.log("Finished updating data", data)
      if (first) { // Generate graph on first passthrough
        Plotly.newPlot('graph', data, layout);

        graph.current.on('plotly_click', function (data) { // Click event for zoom page
          let dataPoint = data.points[0];
          console.log("Selected datapoint", dataPoint);
          props.setData({
            group: dataPoint.data.name,
            word: dataPoint.x,
            count: dataPoint.y,
            ids: dataPoint.data.ids,
            dataset: props.dataset
          });
          navigate("/zoom");
        });

        first = false; // Stops first from running again
      }
      else { // Update existing graph on any other passthrough
        Plotly.redraw('graph', data);
      }
      setButtonToggle(false); // Enable submit button after completion
    });
  };

  // Used to toggle help modal when ? is pressed
  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  return (
    <>
      {data !== undefined && <GraphSettings dataset={data} show={settings} setSettings={setSettings}
      updateGraph={updateGraph} generated={graph}/>}

      <Box component="div" sx={{ marginLeft: "10%", marginRight: "16px", marginTop:"10%"}}>
        <Grid container justifyContent="center">

          {/* Side menu for graph settings */}
          <Grid item xs={12} sm={2}>
            <Box className="d-flex vh-100 align-items-center" sx={{ position: "relative" }}>

              {/* Settings menu */}
              <Paper className="mt-0" elevation={3} sx={{ padding: "16px", margin: "8px" }}>

                {/* Metric, column name, and Column value dropdowns */}
                <div>

                  <SelectField
                    label="Metric"
                    value={metric}
                    setValue={setMetric}
                    options={metricOptions}
                    hideBlankOption={1}
                  />

                  <SelectField
                    label="Column name"
                    value={group}
                    setValue={(x)=>{
                      setGroup(x)
                      nameSelected(x)
                    }}
                    options={groupOptions}
                    on
                    hideBlankOption={0}
                  />

                  <label htmlFor="valueSelect">Column Value</label>
                  {/* TODO No selection = top 10 */}
                  <Select options={valueOptions}
                  id="valueSelect"
                  className="mb-3"
                  closeMenuOnSelect={false}
                  isDisabled={selectToggle}
                  onChange={(x) => {
                    setGroupList(x)
                  }} isMulti></Select>

                </div>

                {/* Custom search + terms list */}
                <div>
                  <TextField
                    label="Custom Search:"
                    value={searchValue}
                    onChange={(event)=>setSearchValue(event.target.value)}
                    onKeyPress={event => {addSearchTerm(event.key)}}
                  />

                  {searchTerms[0].map((term, index) =><li
                  onClick={(event) => {
                    updateGroupNames();
                    searchTerms[0].splice(event.target.id, 1)
                  }}
                  onMouseOver={(event) => {event.target.style.color='red'}}
                  onMouseOut={(event) => {event.target.style.color='black'}}
                  style={{"color":"black"}}
                  id={index}
                  key={index}>{term}</li>)}
                </div>

                {/* Update graph button */}
                <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }}
                className="mb-3 mt-3"
                disabled={buttonToggle || !(searchTerms[0].length > 0 && groupList.length > 0 && group != "")}
                onClick={updateGraph}>
                  Update graph
                </Button>

              </Paper>

              {/* TODO Help button + modal */}
              <div>
                <IconButton
                  onClick={toggleModal}
                  sx={{ position: "absolute", bottom: -5, right: 8 }}
                >
                  <HelpOutlineIcon />
                </IconButton>

                <Dialog
                  open={openModal}
                  onClose={toggleModal}
                  aria-labelledby="how-to-modal-title"
                >
                  <DialogTitle id="how-to-modal-title">How To</DialogTitle>

                  <DialogContent>
                    <div>This will explain how to use the graph</div>
                  </DialogContent>
                </Dialog>
              </div>

            </Box>
          </Grid>
          
          {/* Graph */}
          <Grid item xs={12} sm={9}>
            <Box className="d-flex vh-100 align-items-center" sx={{ margin: "8px" }}>
              <div id='graph' ref={graph}></div>
            </Box>
          </Grid>

        </Grid>
      </Box>
    </>
  );
}