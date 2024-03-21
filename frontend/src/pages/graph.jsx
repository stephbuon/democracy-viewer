// TODO Impliment other metrics
// TODO add groupBy option for column or value

// Imports for Graph page. This page is used for visualizing the selected dataset.
// Props include: props.dataset
// props.dataset - table_name

import React, { useEffect, useState } from "react";
import { SelectField } from "../common/selectField.jsx";
import Select from 'react-select'
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Grid, Paper, Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { getGraph, getGroupNames, getColumnValues } from "../api/api.js"
import { GraphComponent } from "../common/graphComponent.jsx";

export const Graph = (props) => {
// useState definitions
  const [data, setData] = useState([]);
  const [searchTerms, setSearchTerms] = useState(["trade", "press", "industry", "work"]);
  const [groupOptions, setGroupOptions] = useState(undefined);
  const [valueOptions, setValueOptions] = useState(undefined);
  const [groupList, setGroupList] = useState([]);
  const [group, setGroup] = useState("");
  const [buttonToggle, setButtonToggle] = useState(false);
  const [selectToggle, setSelectToggle] = useState(true);
  const [openModal, setOpenModal] = useState(false);const [searchValue, setSearchValue] = useState("");
  const [metric, setMetric] = useState("counts");
  const [metricOptions] = useState([
    { value: "counts", label: "Count" },
    { value: "proportion", label: "Proportion" },
    { value: "tf-idf", label: "tf-idf" },
    { value: "ll", label: "Log Likelihood" },
    { value: "jsd", label: "Jensen-Shannon Divergence" },
    { value: "ojsd", label: "Original Jensen-Shannon Divergence" },
    // { value: "embedding", label: "Word Embeddings" }
  ]);

// other variable definitions
  var layout = { title: "" };
  var first = true;
  const navigate = useNavigate();

  // Dataset has been selected -> Populates group options array for column name dropdown
  // Navigate to datasetSearch page otherwise
  //settings:{group:group, groupList:groupList, search:searchTerms}}
  useEffect(() => {
    console.log("This is a graph test", searchTerms)
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV == undefined || props.dataset == undefined) {
      navigate('/datasetSearch')
      props.setNavigated(true)
    }

    updateGroupNames();
    let graphData = JSON.parse(localStorage.getItem('graph-data'));
    if(graphData != undefined && graphData.table == props.dataset.table_name){
      console.log("Uploading graph", graphData);
      setMetric(graphData.settings.metric);
      setGroup(graphData.settings.group);
      nameSelected(graphData.settings.group);

      let searchList = []
      graphData.settings.groupList.forEach((element) => {
        let object = {label:element, value:element};
        searchList.push(object)
      })
      setGroupList(searchList);
      console.log("GroupList test", groupList, searchList)

      setData(graphData.data)
    }
    
  }, []);

// Function definitions

  // Updates column name dropdown values
  const updateGroupNames = () => {
    getGroupNames(props.dataset.table_name).then(async (res) => {
      let _groupOptions = []
      for(let i = 0; i < res.length; i++){
        _groupOptions.push({value: res[i], label: res[i].replace(/_/g, ' ')})
      }
      setGroupOptions([..._groupOptions])
    });
  }

  // Called when enter is pressed on custom search text entry
  // Adds current text to the word list and empties the textbox
  const addSearchTerm = (key) => {
    if(key == 'Enter'){
      searchTerms.push(searchValue);
      setSearchValue("");
    }
  }

  // Called when a column is selected
  // updates array for column value dropdown
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

   // Runs on graph settings subit
   // Generate a graph or update the existing graph
  const updateGraph = () => {
    setButtonToggle(true); // Disable submit button until finished
    
    getGraph(props.dataset.table_name, group, groupList, metric, searchTerms).then(async (res) => {
      console.log("graph res test", res)
      let tempData = []
      res.forEach((dataPoint) => { // Populate data array with request output
        let index = tempData.findIndex((x) => x.name == dataPoint.group);
        if (index >= 0) {
          tempData[index].x.push(dataPoint.word)
          tempData[index].y.push(dataPoint.n)
          tempData[index].ids += dataPoint.ids
        }
        else {
          tempData.push({
            x: [dataPoint.word],
            y: [dataPoint.n],
            ids: dataPoint.ids,
            name: dataPoint.group,
            type: "bar"
          })
        }
      });
      setData(tempData);
      let graphData = {table:props.dataset.table_name, data:tempData, settings:{metric:metric, group:group, groupList:groupList, search:searchTerms}}
      console.log("Saving graph data!", graphData)
      localStorage.setItem('graph-data', JSON.stringify(graphData))
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

                {/* Metric select dropdown */}
                <SelectField label="Metric"
                  value={metric}
                  setValue={setMetric}
                  options={metricOptions}
                  hideBlankOption={1} />

                {/* Column select dropdown */}
                <SelectField label="Column name"
                  value={group}
                  setValue={(x)=>{
                    setGroup(x)
                    nameSelected(x)
                  }}
                  options={groupOptions}
                  on
                  hideBlankOption={0} />

                {/* Column value multiselect dropdown */}
                <label htmlFor="valueSelect">Column Value</label>
                {/* TODO No selection = top 10 */}
                <Select options={valueOptions}
                id="valueSelect"
                className="mb-3"
                closeMenuOnSelect={false}
                isDisabled={selectToggle}
                // value={groupList}
                onChange={(x) => {
                  setGroupList(x);
                  console.log("search test", x)
                }} isMulti></Select>


                {/* Custom search + terms list */}
                <div>
                  {/* Custom search textfield */}
                  <label htmlFor="value">{ "Custom Search:" }</label>
                  <input type="text" value={searchValue}
                      onChange={ (event)=>setSearchValue(event.target.value) }
                      onKeyPress={event => {addSearchTerm(event.key)}}
                      className="form-control" />
                  
                  {/* Terms list */}
                  {searchTerms.map((term, index) =><li
                  onClick={(event) => {
                    updateGroupNames();
                    searchTerms.splice(event.target.id, 1)
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
                disabled={buttonToggle || !(searchTerms.length > 0 && groupList.length > 0 && group != "")}
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
              {data.length > 0 && <GraphComponent data={data} table={props.dataset.table_name} setData={props.setData}
              settings={{metric:metric}}/>}
          </Grid>

        </Grid>
      </Box>
    </>
  );
}