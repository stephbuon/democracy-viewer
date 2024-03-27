import React, { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const GraphComponent = ({ data, table, setData }) => {
    // UseState definitions

    // Other variable definitions
    var layout = { title: "" };
    const navigate = useNavigate();
    const graph = useRef(null);

    // UseEffect definition
    useEffect(() => {
        console.log(data)
        Plotly.newPlot('graph', data, layout, { displayModeBar: false });
        graph.current.on('plotly_click', function (data) { // Click event for zoom page
            let dataPoint = data.points[0];
            console.log("Selected datapoint", dataPoint, table);
            setData({
              group: dataPoint.data.name,
              word: dataPoint.x,
              count: dataPoint.y,
              ids: dataPoint.data.ids,
              dataset: table
            });
            navigate("/zoom");
          });
      }, [data]);

    // Function definitions

    return <>
        {/* Graph */}
        <Box className="d-flex vh-100 align-items-center" sx={{ margin: "8px" }}>
            <div id='graph' ref={graph}></div>
        </Box>
    </>
}
