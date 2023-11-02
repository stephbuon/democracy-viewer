import React, { useRef, useEffect, useState } from "react";
import { TextField } from "../common/textField.jsx";
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
import { getGraph } from "../api/api.js"

export const Graph = (props) => {
  var data = [];
  var layout = {
    title: "Number of in dataset: "
  };
  var first = true

  const navigate = useNavigate();
  const graph = useRef(null);

  useEffect(()=>{
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if(demoV == undefined || props.dataset == undefined)
    {
        navigate('/datasetSearch')
        props.setNavigated(true)
    }
  }, []);

  const updateData = () => {
    getGraph(props.dataset.table_name, "speaker", ["MR. GLADSTONE", "MR. DISRAELI"], {measure}, ["trade", "press", "industry", "work"]).then(async (res) => {
      res.forEach((dataPoint) =>{
        let index = data.findIndex((x) => x.name == dataPoint.group);
        console.log(index)
        if(index >= 0){
          data[index].x.push(dataPoint.word)
          data[index].y.push(dataPoint.n)
        }
        else{
          data.push({
            x: [dataPoint.word],
            y: [dataPoint.n],
            name: dataPoint.group,
            type: "bar"
          })
        }
      });
      console.log('-----', data)
    });
  }

  const updateGraph = () =>{
    if(first){
      Plotly.newPlot('test', data, layout);

      graph.current.on('plotly_click', function (data) {
        let i = data.points[0].pointIndex;
        let tempData = props.dataset[i]
        props.setData({
          group_name: tempData.group,
          word: tempData.word,
          count: tempData.length
        });
        navigate("/zoom");
      });
    }
    else{
      Plotly.redraw('test', data);
    }
  };
  const logData = () =>{
    console.log('--Logging data--', data)
  };
  //For Modal
  const [openModal, setOpenModal] = useState(false);

  const toggleModal = () => {
    setOpenModal(!openModal);
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

  const [measure, setMeasure] = useState("Count");
  const [measureOptions] = useState([
    { value: 0, label: "Count" },
    { value: 1, label: "Proportion" },
    { value: 2, label: "tf-idf" },
    { value: 3, label: "Log Likelihood" },
    { value: 4, label: "Jensen-Shannon Divergence" },
    { value: 5, label: "Original Jensen-Shannon Divergence" },
    { value: 6, label: "Word Embeddings" }
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
                  setValue={setSearchValue}
                />
                <SelectField
                  label="Sentiment"
                  value={sentiment}
                  setValue={setSentiment}
                  options={sentimentOptions}
                  hideBlankOption={1}
                />
                <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }} onClick={updateGraph}>
                  Update graph
                </Button>
                <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }} onClick={updateData}>
                  Update data
                </Button>
                <Button variant="contained" fullWidth sx={{ fontSize: "0.7rem", padding: "8px" }} onClick={logData}>
                  Log data
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
              <div id='test' ref={graph}></div>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}