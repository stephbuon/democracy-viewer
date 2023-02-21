import React from "react";
import { TextField } from "../common/textField.jsx";
import { useEffect, useState } from "react";
import { MDBContainer } from "mdbreact";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { SelectField } from "../common/selectField.jsx";
import { Range } from "../common/range.jsx";

export function Graph() {
  Chart.register(CategoryScale);
  const data = {
    labels: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    datasets: [
      {
        label: "Hours/Day",
        data: [24, 24, 24, 24, 24, 24, 24],
        backgroundColor: "#02b844",
        borderWidth: 1,
        borderColor: "#000000",
      },
    ],
  };

  const keywordValue = 0;

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
      <div className="row justify-content-center">
        <div className="col-2 border border-secondary border-3 rounded m-1">
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
          <div className="col mb-2 mx-auto">
            <button
              type="button"
              className="btn btn-md btn-primary"
              style={{ width: "45%" }}
            >
              Law
            </button>
            <button
              type="button"
              className="btn btn-md btn-primary mx-2 ps-2"
              style={{ width: "45%" }}
            >
              Government
            </button>
          </div>
          <div className="col w-100 mb-2">
            <button
              type="button"
              className="btn btn-md btn-primary"
              style={{ width: "45%" }}
            >
              Men
            </button>
            <button
              type="button"
              className="btn btn-md btn-primary mx-2"
              style={{ width: "45%" }}
            >
              Women
            </button>
          </div>
          <TextField
            label="Custom Search:"
            value={searchValue}
            setValue={setSearchValue}
          />
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="keywordRadioDefault"
              id="keywordRadio1"
              checked
            />
            <label class="form-check-label" for="keywordRadio1">
              Include Keyword
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="keywordRadioDefault"
              id="keywordRadio2"
            />
            <label class="form-check-label" for="keywordRadio2">
              Match Keyword
            </label>
          </div>
          <SelectField
            label="Sentiment"
            value={sentiment}
            setValue={setSentiment}
            options={sentimentOptions}
            hideBlankOption={1}
          />
        </div>
        <div className="col ms-2">
          <MDBContainer>
            <Bar data={data} />
          </MDBContainer>
        </div>
      </div>
    </>
  );
}
