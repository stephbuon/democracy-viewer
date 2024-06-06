// Imports
import React, { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const GraphComponent = ({ data, setData }) => {
    // UseState definitions

    // Function definitions
    const listToString = (list) => {
        let string = ""
        list.forEach((word, i) => {
            if(i < list.length - 1){
                string += word + " ";

            } else {
                string += "and " + word;
            }
        });
        return string;
    }

    // Other variable definitions
    try {
        var layout = {
            title: data.metric[0].toUpperCase() + data.metric.slice(1) + " for " + listToString(data.titleList),
            width: 1000,
            height: 500,
            margin: {
                l: 50,
                r: 50,
                b: 100,
                t: 50,
                pad: 4
            },
            xaxis: {
                automargin: true,
                title: {
                  text: data.xLabel,
                  standoff: 20
                }},
              yaxis: {
                automargin: true,
                tickangle: 0,
                title: {
                  text: data.yLabel,
                  standoff: 40
                }}
        };
    } catch {
        localStorage.removeItem("graph-data");
    }
    
    const navigate = useNavigate();
    const graph = useRef(null);

    // UseEffect: Generates graph object with zoom click event definition
    useEffect(() => {
        console.log("zoom test", data)
        Plotly.newPlot('graph', data.graph, layout, {displayModeBar: false});
        graph.current.on('plotly_click', function (event) { // Click event for zoom page
            let dataPoint = event.points[0];
            console.log("TEST!!", dataPoint, "and", data);
            let tempData = {
                x: dataPoint.x,
                y: dataPoint.y,
                ids: dataPoint.data.ids,
                dataset: data.table_name
                }
            localStorage.setItem('selected', JSON.stringify(tempData))
            console.log("Saved selected datapoint", tempData, " from ", dataPoint, "and", data)
            navigate("/zoom");
          });
      }, [data]);

    return <>
        {/* Graph */}
        <Box className="d-flex vh-100" sx={{ margin: "8px" }}>
            <div id='graph' ref={graph} hidden={data.graph == undefined}></div>
        </Box>
    </>
}
