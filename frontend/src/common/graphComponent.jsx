// Imports
import React, { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { metricTypes } from "./metrics";
import { graphIds } from "../api/api";

export const GraphComponent = ({ data, setData }) => {
    // UseState definitions
    const [foundData, setFoundData] = useState(false);
    const [layout, setLayout] = useState({
        title: data.title,
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
            }
        },
        yaxis: {
            automargin: true,
            tickangle: 0,
            title: {
                text: data.yLabel,
                standoff: 40
            }
        }
    });

    const navigate = useNavigate();
    const graph = useRef(null);

    // UseEffect: Generates graph object with zoom click event definition
    useEffect(() => {
        if (!data || !data.graph || data.graph.length === 0) {
            // Hide graph if no data
            setFoundData(false);
        } else {
            // Generate graph if there is data
            setFoundData(true);

            // Update layout
            let layout_ = { ...layout };
            // Hide legend
            if (
                metricTypes.dotplot.includes(data.metric) ||
                metricTypes.scatter.includes(data.metric) ||
                (metricTypes.bar.includes(data.metric) && data.graph.length === 1)
            ) {
                layout_ = {
                    ...layout_,
                    showlegend: false
                };
            } else if (metricTypes.multibar.includes(data.metric)) {
                layout_ = {
                    ...layout_,
                    legend: {
                        title: {
                            text: "Rank"
                        }
                    }
                }
            } else {
                layout_ = {
                    ...layout_,
                    showlegend: true
                };
            }

            // Unsort x-axis
            if (metricTypes.bar.includes(data.metric)) {
                layout_ = {
                    ...layout_,
                    xaxis: {
                        ...layout_.xaxis,
                        categoryorder: 'array',
                        categoryarray: data.graph[0].x
                    }
                }
            }

            setLayout({ ...layout_ });
        }
    }, [data]);

    useEffect(() => {
        if (foundData) {
            Plotly.newPlot('graph', data.graph, layout, { displayModeBar: "hover" });
            graph.current.on('plotly_click', function (event) { // Click event for zoom page
                const dataPoint = event.points[0];
                let idx;
                if (typeof dataPoint.pointIndex === "number") {
                    idx = dataPoint.pointIndex;
                } else {
                    idx = (dataPoint.pointIndex[0] + 1) * (dataPoint.pointIndex[1] + 1) - 1;
                }
                const params = JSON.parse(localStorage.getItem("graph-settings"));
                if (metricTypes.bar.indexOf(data.metric) !== -1) {
                    params.group_list = dataPoint.data.name;
                    params.word_list = [dataPoint.x];
                } else if (metricTypes.scatter.indexOf(data.metric) !== -1) {
                    params.word_list = [dataPoint.text];
                } else if (metricTypes.heatmap.indexOf(data.metric) !== -1) {
                    params.group_list = [dataPoint.x, dataPoint.y];
                } else if (metricTypes.dotplot.indexOf(data.metric) !== -1) {
                    params.group_list = dataPoint.x;
                    params.word_list = [dataPoint.data.name, data.titleList[0]];
                } else {
                    throw new Error("Graph type not supported")
                }
                graphIds(data.table_name, params).then(ids => {
                    const tempData = {
                        x: dataPoint.x,
                        y: dataPoint.y,
                        ids,
                        dataset: data.table_name,
                        metric: data.metric,
                        words: params.word_list
                    };
                    localStorage.setItem('selected', JSON.stringify(tempData))
                    navigate("/zoom");
                });
            });
        }
    }, [foundData]);

    return <>
        {/* Graph */}
        <Box className="d-flex" sx={{ margin: "8px" }}>
            <div id='graph' style={{ margin: "0 auto" }} ref={graph} hidden={data.graph == undefined}></div>
        </Box>
    </>
}
