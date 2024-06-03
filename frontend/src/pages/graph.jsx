<<<<<<< HEAD
// TODO Impliment other metrics
// TODO add groupBy option for column or value

// Imports for Graph page. This page is used for visualizing the selected dataset.
// Props include: props.dataset
// props.dataset - table_name

import React, { useEffect, useState } from "react";
=======
// TODO Removing word embedding metric. Impliment other metrics

// Imports for Graph page. This page is used for visualizing the selected dataset.
// Props include: props.dataset
// props.dataset - table_name

import React, { useRef, useEffect, useState } from "react";
import { TextField } from '@mui/material'
import { SelectField } from "../common/selectField.jsx";
import Select from 'react-select'
import Plotly from "plotly.js-dist";
>>>>>>> parent of fc366b5 (Merge branch 'main' of https://github.com/stephbuon/democracy-viewer-demo)
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Grid, Paper, Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { getGraph, getGroupNames, getColumnValues } from "../api/api.js"

export const Graph = (props) => {
// useState definitions
<<<<<<< HEAD
  const [data, setData] = useState(undefined);
  const [graphData, setGraphData] = useState(undefined);
  const [settings, setSettings] = useState(true);
  const [modalText, setModalText] = useState("Create Graph");
  const [graph, setGraph] = useState(false);
=======
  const [data, setData] = useState([]);
  const searchTerms = useState([]);
  const [groupOptions, setGroupOptions] = useState(undefined);
  const [valueOptions, setValueOptions] = useState(undefined);
  const [groupList, setGroupList] = useState([]);
  const [group, setGroup] = useState("");
  const [value, setValue] = useState("");
  const [buttonToggle, setButtonToggle] = useState(false);
  const [selectToggle, setSelectToggle] = useState(true);
  const [topDecade, setTopDecade] = useState(1900);
  const [bottomDecade, SetBottomDecade] = useState(1900);
  const [vocabulary, setVocabulary] = useState("");
  const [vocabOptions] = useState([{ value: 1, label: "All" }]);
  const [openModal, setOpenModal] = useState(false);const [searchValue, setSearchValue] = useState("");
  const [metric, setMetric] = useState("counts");
  const [metricOptions] = useState([
    { value: "counts", label: "Count" },
    { value: "proportion", label: "Proportion" },
    { value: "tf-idf", label: "tf-idf" },
    { value: "ll", label: "Log Likelihood" },
    { value: "jsd", label: "Jensen-Shannon Divergence" },
    // { value: "embedding", label: "Word Embeddings" }
  ]);
>>>>>>> parent of fc366b5 (Merge branch 'main' of https://github.com/stephbuon/democracy-viewer-demo)

// other variable definitions
  var layout = { title: "" };
  var first = true;
  const navigate = useNavigate();
  const graph = useRef(null);

<<<<<<< HEAD
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
=======
>>>>>>> parent of fc366b5 (Merge branch 'main' of https://github.com/stephbuon/democracy-viewer-demo)
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

<<<<<<< HEAD
  useEffect(() => {
  }, [graph])

  return (
    <>
      {data != undefined && <GraphSettings dataset={data} setData={setData} show={settings} setSettings={setSettings}
      updateGraph={updateGraph} buttonText={modalText}/>}

      <Box component="div" sx={{ marginLeft: "20px", marginRight: "16px" }}>
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
=======
// Function definitions

  // Updates column name dropdown values
  const updateGroupNames = () => {
    getGroupNames(props.dataset.table_name).then(async (res) => {
      console.log(res)
      let _groupOptions = []
      for(let i = 0; i < res.length; i++){
        _groupOptions.push({value: res[i], label: res[i].replace(/_/g, ' ')})
      }
      setGroupOptions([..._groupOptions])
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

  // When a column is selected, update array for column value dropdown
  const nameSelected = (g) => { 
    setSelectToggle(g == "");

    getColumnValues(props.dataset.table_name, g).then(async (res) => {
      let _valueOptions = []
      for(let i = 0; i < res.length; i++){
        _valueOptions.push({value: res[i], label: res[i].replace(/_/g, ' ')})
      }
      setValueOptions([..._valueOptions])
    });
  }

   // Runs on graph setting subit to generate a graph or update the existing graph
  const updateGraph = () => {

    setButtonToggle(true); // Disable submit button until finished

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
      <Box component="div" sx={{ marginLeft: "20px", marginRight: "16px" }}>
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

>>>>>>> parent of fc366b5 (Merge branch 'main' of https://github.com/stephbuon/democracy-viewer-demo)
        </Grid>
      </Box>
    </>
  );
}