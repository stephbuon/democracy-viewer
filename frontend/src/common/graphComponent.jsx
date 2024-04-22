import React, { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const GraphComponent = ({ data, setData }) => {
    // UseState definitions

    // Other variable definitions
    var layout = { 
        title: "", 
        paper_bgcolor: 'rgba(0,0,0,0)', 
        plot_bgcolor: 'rgba(0,0,0,0)',
        colorway: [
            '#C5DAF6', '#9DB6ED', '#A2A2F2', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
        ]
    };
    const navigate = useNavigate();
    const graph = useRef(null);

    // UseEffect definition
    useEffect(() => {
        Plotly.newPlot('graph', data.graph, layout, { displayModeBar: false });
        graph.current.on('plotly_click', function (event) { // Click event for zoom page
            let dataPoint = event.points[0];
            let tempData = {};
            tempData.selected = {
                group: dataPoint.data.name,
                word: dataPoint.x,
                count: dataPoint.y,
                ids: dataPoint.data.ids,
                dataset: data.table_name
              }
            localStorage.setItem('selected', JSON.stringify(tempData))
            console.log("Saved selected datapoint")
            navigate("/zoom");
          });
      }, [data]);

    // Function definitions

    return <>
        {/* Graph */}
        <Box className="d-flex vh-100 align-items-center" sx={{ margin: "8px" }}>
            <div id='graph' ref={graph} hidden={data.graph == undefined}></div>
        </Box>
    </>
}
