import React, { useRef, useEffect, useState } from "react";
import { TextField } from '@mui/material'
import { SelectField } from "../common/selectField.jsx";
import { Range } from "../common/range.jsx";
import Plotly from "plotly.js-dist";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import {Grid,Paper,Button,Radio,RadioGroup,FormControl,FormControlLabel,} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

export const Graph = (props) => {
  const [data, setData] = useState([]);
  const searchTerms = useState(["trade", "press", "industry", "work"]);
  const [test, setTest] = useState(true);

  var layout = { title: "" }
  var first = true

  useEffect(() => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if(demoV == undefined || demoV.props.dataset == undefined)
    {
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
  }, [test]);

  const navigate = useNavigate();
  const graph = useRef(null);

  const [groupOptions, setGroupOptions] = useState(undefined);
  const [valueOptions, setValueOptions] = useState(undefined);
  const [groupList, setGroupList] = useState([]);
  const [group, setGroup] = useState("");
  const [value, setValue] = useState("");
  const [buttonToggle, setButtonToggle] = useState(false);
  const [selectToggle, setSelectToggle] = useState(true);

  const addSearchTerm = (key) => {
    if(key == 'Enter'){
      searchTerms[0].push(searchValue);
      setSearchValue("");
    }
  }

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
    getGraph(props.dataset.table_name, group, groupList, metric, searchTerms[0]).then(async (res) => {
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

  const removeItem = (event) => {
    console.log("removed item", event);
  };

  const [searchValue, setSearchValue] = useState("");

  const [topDecade, setTopDecade] = useState(1900);
  const [bottomDecade, SetBottomDecade] = useState(1900);

  const [vocabulary, setVocabulary] = useState("");
  const [vocabOptions] = useState([{ value: 1, label: "All" }]);

  const [sentiment, setSentiment] = useState("");
  const [sentimentOptions] = useState([
    { value: 1, label: "All" },
    { value: 2, label: "Positive" },
    { value: 3, label: "Negative" },
  ]);

  const [measure, setMeasure] = useState("");
  const [measureOptions] = useState([
    { value: 1, label: "Count" },
    { value: 2, label: "tf-idf" },
  ]);
  
  return (
    <>
      <Box component="div" sx={{ marginLeft: "20px", marginRight: "16px" }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={2}>
            <Box sx={{ position: "relative" }}>
              <Paper elevation={3} sx={{ padding: "16px", margin: "8px" }}>
                <SelectField
                  label="Vocabulary"
                  value={vocabulary}
                  setValue={setVocabulary}
                  options={vocabOptions}
                  hideBlankOption={1}
                />
                <SelectField
                  label="Measure"
                  value={measure}
                  setValue={setMeasure}
                  options={measureOptions}
                  hideBlankOption={1}
                />
                <Range
                  value={topDecade}
                  setValue={setTopDecade}
                  label="Decade (Top)"
                  min={1900}
                  max={2000}
                  step={10}
                />
                <Range
                  value={bottomDecade}
                  setValue={SetBottomDecade}
                  label="Decade (Bottom)"
                  min={1900}
                  max={2000}
                  step={10}
                />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }}>
                      Law
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }}>
                      Government
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }}>
                      Men
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }}>
                      Women
                    </Button>
                  </Grid>
                </Grid>
                <TextField
                  label="Custom Search:"
                  value={searchValue}
                  onChange={(event)=>setSearchValue(event.target.value)}
                  onKeyPress={event => {addSearchTerm(event.key)}}
                />

                {searchTerms[0].map((term, index) =><li
                onClick={(event) => {
                  setTest(!test);
                  searchTerms[0].splice(event.target.id, 1)
                }}
                onMouseOver={(event) => {event.target.style.color='red'}}
                onMouseOut={(event) => {event.target.style.color='black'}}
                style={{"color":"black"}}
                id={index}>{term}</li>)}

                <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }}
                className="mb-3 mt-3"
                disabled={buttonToggle || !(searchTerms[0].length > 0 && groupList.length > 0 && group != "")}
                onClick={updateGraph}>
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
            <Box sx={{ margin: "8px" }}>
              <div ref={graph}></div>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}