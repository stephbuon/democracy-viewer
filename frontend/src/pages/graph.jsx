import React, { useRef, useEffect, useState } from "react";
import { TextField } from "../common/textField.jsx";
import { SelectField } from "../common/selectField.jsx";
import Select from 'react-select'
import Plotly from "plotly.js-dist";
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
  const [data, setData] = useState([]);
  var layout = { title: "" }
  var first = true

  useEffect(() => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV == undefined || props.dataset == undefined) {
      navigate('/datasetSearch')
      props.setNavigated(true)
    }
      getGroupNames(props.dataset.table_name).then(async (res) => {
        let _groupOptions = []
        for(let i = 0; i < res.length; i++){
          _groupOptions.push({value: res[i], label: res[i].replace(/_/g, ' ')})
        }
        setGroupOptions([..._groupOptions])
      });
  }, []);

  const navigate = useNavigate();
  const graph = useRef(null);

  const [groupOptions, setGroupOptions] = useState(undefined);
  const [valueOptions, setValueOptions] = useState(undefined);
  const [groupList, setGroupList] = useState([]);
  const [group, setGroup] = useState("");
  const [value, setValue] = useState("");
  const [buttonToggle, setButtonToggle] = useState(false);
  const [selectToggle, setSelectToggle] = useState(true);

  const nameSelected = (g) => {
    setSelectToggle(g == "");

    getColumnValues(props.dataset.table_name, g).then(async (res) => {
      console.log(res)
      // setValueOptions(res)
      let _valueOptions = []
      for(let i = 0; i < res.length; i++){
        _valueOptions.push({value: res[i], label: res[i].replace(/_/g, ' ')})
      }
      setValueOptions([..._valueOptions])
    });
  }

  const updateGraph = () => {
    setButtonToggle(true);
    getGraph(props.dataset.table_name, group, groupList, metric, ["trade", "press", "industry", "work"]).then(async (res) => {
      console.log(res)
      res.forEach((dataPoint) => {
        let index = data.findIndex((x) => x.name == dataPoint.group);
        if (index >= 0) {
          data[index].x.push(dataPoint.word)
          data[index].y.push(dataPoint.n)
          data[index].ids.push(dataPoint.ids)
        }
        else {
          data.push({
            x: [dataPoint.word],
            y: [dataPoint.n],
            ids: [dataPoint.ids],
            name: dataPoint.group,
            type: "bar"
          })
        }
      });
      if (first) {
        Plotly.newPlot('graph', data, layout);
  
        graph.current.on('plotly_click', function (data) {
          let dataPoint = data.points[0];
          console.log(":-O zoom test", dataPoint, dataPoint.data.name)
          props.setData({
            group: dataPoint.data.name,
            word: dataPoint.x,
            count: dataPoint.y
          });
          navigate("/zoom");
        });
        first = false;
      }
      else {
        Plotly.redraw('graph', data);
      }
      console.log("Updated graph data!")
      setButtonToggle(false);
    });
  };

  const logData = () => {
    console.log('--Logging data--', data)
  };

  //For Modal
  const [openModal, setOpenModal] = useState(false);

  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  const [searchValue, setSearchValue] = useState("");

  const [metric, setMetric] = useState("counts");
  const [metricOptions] = useState([
    { value: "counts", label: "Count" },
    { value: "proportion", label: "Proportion" },
    { value: "tf-idf", label: "tf-idf" },
    { value: "ll", label: "Log Likelihood" },
    { value: "jsd", label: "Jensen-Shannon Divergence" },
    { value: "ojsd", label: "Original Jensen-Shannon Divergence" },
    { value: "embedding", label: "Word Embeddings" }
  ]);

  return (
    <>
      <Box component="div" sx={{ marginLeft: "20px", marginRight: "16px" }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={2}>
            <Box className="d-flex vh-100 align-items-center" sx={{ position: "relative" }}>
              <Paper className="mt-0" elevation={3} sx={{ padding: "16px", margin: "8px" }}>
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
                }}
                isMulti></Select>

                <TextField
                  label="Custom Search:"
                  value={searchValue}
                  setValue={setSearchValue}
                />
                <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }}
                className="mb-3"
                onClick={updateGraph} disabled={buttonToggle}>
                  Update graph
                </Button>

              </Paper>
              {/* Help icon that opens Modal */}
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
            </Box>
          </Grid>
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