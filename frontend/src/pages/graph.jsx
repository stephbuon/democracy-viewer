import React, { useRef, useEffect, useState } from "react";
import { TextField } from "../common/textField.jsx";
import { MDBContainer } from "mdbreact";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
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

export const Graph = ({ dataset, setData }) => {
  const graph = useRef(null);
  const navigate = useNavigate();

  var data = [
    {
      x: dataset.x,
      y: dataset.y,
      type: 'bar'
    }
  ];
  var layout = {
    title: dataset.label
  };

  useEffect(() => {
    Plotly.newPlot(graph.current, data, layout);
    graph.current.on('plotly_click', function (data) {
      let i = data.points[0].pointIndex;
      setData({
        x: dataset.x[i],
        y: dataset.y[i],
        description: dataset.other[i]
      });
      navigate("/zoom");
    });
  })
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
                  setValue={setSearchValue}
                />
                <FormControl component="fieldset">
                  <RadioGroup
                    name="keywordRadioDefault"
                    defaultValue="includeKeyword"
                  >
                    <FormControlLabel
                      value="includeKeyword"
                      control={<Radio />}
                      label="Include Keyword"
                    />
                    <FormControlLabel
                      value="matchKeyword"
                      control={<Radio />}
                      label="Match Keyword"
                    />
                  </RadioGroup>
                </FormControl>
                <SelectField
                  label="Sentiment"
                  value={sentiment}
                  setValue={setSentiment}
                  options={sentimentOptions}
                  hideBlankOption={1}
                />

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