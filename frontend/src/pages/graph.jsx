// TODO Impliment other metrics
// TODO add groupBy option for column or value

// Imports for Graph page. This page is used for visualizing the selected dataset.
// Props include: props.dataset
// props.dataset - table_name

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Grid } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { getGraph } from "../api/api.js"
import { GraphComponent } from "../common/graphComponent.jsx";
import { GraphSettings } from "../common/graphSettings.jsx";

export const Graph = (props) => {
// useState definitions
  const [show, setShow] = useState(true);
  const [data, setData] = useState(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [dataset, setDataset] = useState(undefined);

// other variable definitions
  var layout = { title: "" };
  var first = true;
  var modalText = "Create Graph"
  const navigate = useNavigate();
  let settingsInput = {dataset:dataset, setData:setData, show:show, setShow:setShow, updateGraph:undefined, buttonText:modalText};

// Function definitions

   // Runs on graph settings subit
   // Generate a graph or update the existing graph
  const updateGraph = (group, groupList, metric, searchTerms) => {
    getGraph(props.dataset.table_name, group, groupList, metric, searchTerms).then(async (res) => {
      console.log("graph res test", res)
      let tempData = []
      res.forEach((dataPoint) => { // Populate data array with request output
        let index = tempData.findIndex((x) => x.name == dataPoint.group);
        if (index >= 0) {
          tempData[index].x.push(dataPoint.word)
          tempData[index].y.push(dataPoint.count)
          tempData[index].ids += dataPoint.ids
        }
        else {
          tempData.push({
            x: [dataPoint.word],
            y: [dataPoint.count],
            ids: dataPoint.ids,
            name: dataPoint.group,
            type: "bar"
          })
        }
      });
      let graphData = {table:props.dataset.table_name, data:tempData, settings:{metric:metric, group:group, groupList:groupList, search:searchTerms}}
      console.log("Saving graph data!", JSON.stringify(graphData))
    });
  };

  // Used to toggle help modal when ? is pressed
  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  // Use Effect definition - Gets dataset information from local storage
  // Dataset has been selected -> Populates group options array for column name dropdown
  // Navigate to datasetSearch page otherwise
  useEffect(() => {
    settingsInput.updateGraph = updateGraph
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV == undefined || props.dataset == undefined) {
      navigate('/datasetSearch')
      props.setNavigated(true);
    }
    setDataset(demoV);
  }, []);

  return (
    <>
      <GraphSettings props={settingsInput}/>
      <Box component="div" sx={{ marginLeft: "20px", marginRight: "16px" }}>
        <Grid container justifyContent="center">

          {/* Side menu for graph settings */}
          <Grid item xs={12} sm={2}>
            <Box className="d-flex vh-100 align-items-center" sx={{ position: "relative" }}>

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
              {<GraphComponent data={data} table={props.dataset.table_name} setData={props.setData}/>}
          </Grid>

        </Grid>
      </Box>
    </>
  );
}