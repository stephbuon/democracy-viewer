// Imports
import React, { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { metricTypes } from "./metrics";
import { getZoomIds } from "../api/api";

export const GraphComponent = ({ data, setData, setZoomLoading, isOverlappingScatter }) => {
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
            categoryorder: 'category ascending',
            title: {
                text: data.xLabel,
                standoff: 20
            }
        },
        yaxis: {
            automargin: true,
            categoryorder: 'category descending',
            tickangle: 0,
            title: {
                text: data.yLabel,
                standoff: 40
            }
        }
    });

    const navigate = useNavigate();
    const graph = useRef(null);

    // Function to choose which labels to show in a scatter plot
    const chooseLabels = (data, xRange, yRange) => {
        const rangeX = xRange[1] - xRange[0];
        const rangeY = yRange[1] - yRange[0];
        const nonOverlappingLabels = [];
        const labels = [];

        data.forEach(trace => {
            const traceLabels = [];
            for (let i = 0; i < trace.x.length; i++) {
                const x = trace.x[i];
                const y = trace.y[i];
                if (x >= xRange[0] && x <= xRange[1] && y >= yRange[0] && y <= yRange[1]) {
                    const overlap = nonOverlappingLabels.some((existingPoint) =>
                        isOverlappingScatter(existingPoint.x, existingPoint.y, x, y, rangeX, rangeY)
                    );

                    if (overlap) {
                        traceLabels.push("");
                    } else {
                        traceLabels.push(trace.hovertext[i]);
                        nonOverlappingLabels.push({ x, y });
                    }
                } else {
                    traceLabels.push("");
                }
            }
            labels.push(traceLabels);
        });

        return labels;
    }

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
                metricTypes.multibar.includes(data.metric) ||
                (metricTypes.scatter.includes(data.metric) && data.graph.length === 1) ||
                (metricTypes.bar.includes(data.metric) && data.graph.length === 1)
            ) {
                layout_ = {
                    ...layout_,
                    showlegend: false
                };
            } else {
                layout_ = {
                    ...layout_,
                    showlegend: true
                };
            }

            setLayout({ ...layout_ });
        }
    }, [data]);

    useEffect(() => {
        if (foundData) {
            Plotly.newPlot('graph', data.graph, layout, { displayModeBar: "hover" });

            // Relayout event to handle labels on a scatter plot
            graph.current.on("plotly_relayout", event => {
                if (metricTypes.scatter.includes(data.metric)) {
                    let xRange, yRange;
                    if (event["xaxis.range[0]"] && event["xaxis.range[1]"]) {
                        xRange = [event["xaxis.range[0]"], event["xaxis.range[1]"]];
                    } else {
                        let min = Infinity;
                        let max = -Infinity;
                        data.graph.forEach(trace => {
                            if (Array.isArray(trace.x)) {
                                trace.x.forEach(x => {
                                    if (x < min) {
                                        min = x;
                                    }
                                    if (x > max) {
                                        max = x;
                                    }
                                });
                            }
                        });
                        if (min == Infinity || max == Infinity) {
                            xRange = [0, 1];
                        } else {
                            xRange = [min, max];
                        }
                    }

                    if (event["yaxis.range[0]"] && event["yaxis.range[1]"]) {
                        yRange = [event["yaxis.range[0]"], event["yaxis.range[1]"]];
                    } else {
                        let min = Infinity;
                        let max = -Infinity;
                        data.graph.forEach(trace => {
                            if (Array.isArray(trace.y)) {
                                trace.y.forEach(y => {
                                    if (y < min) {
                                        min = y;
                                    }
                                    if (y > max) {
                                        max = y;
                                    }
                                });
                            }
                        });
                        if (min == Infinity || max == Infinity) {
                            yRange = [0, 1];
                        } else {
                            yRange = [min, max];
                        }
                    }

                    const updatedLabels = chooseLabels(data.graph, xRange, yRange);
                    updatedLabels.forEach((labels, index) => {
                        Plotly.restyle("graph", { text: [labels] }, index);
                    });
                }
            });

            // Click event for zoom page
            graph.current.on('plotly_click', (event) => { 
                setZoomLoading(true);
                const dataPoint = event.points[0];
                let idx;
                if (typeof dataPoint.pointIndex === "number") {
                    idx = dataPoint.pointIndex;
                } else {
                    idx = (dataPoint.pointIndex[0] + 1) * (dataPoint.pointIndex[1] + 1) - 1;
                }

                const params = JSON.parse(localStorage.getItem("graph-settings"));
                if (metricTypes.bar.includes(data.metric)) {
                    params.group_list = dataPoint.data.name;
                    params.word_list = [dataPoint.x];
                } else if (metricTypes.scatter.includes(data.metric)) {
                    params.word_list = [dataPoint.hovertext];
                } else if (metricTypes.heatmap.includes(data.metric)) {
                    params.group_list = [dataPoint.x, dataPoint.y];
                } else if (metricTypes.dotplot.includes(data.metric)) {
                    params.group_list = dataPoint.x;
                    params.word_list = [dataPoint.text, data.titleList[0]];
                } else if (metricTypes.multibar.includes(data.metric)) {
                    params.group_list = dataPoint.x;
                    params.word_list = [dataPoint.text];
                } else {
                    throw new Error("Graph type not supported")
                }

                getZoomIds(data.table_name, params).then(res => {
                    const tempData = {
                        x: dataPoint.x,
                        y: dataPoint.y,
                        name: res.name,
                        count: res.count,
                        dataset: data.table_name,
                        metric: data.metric,
                        word_list: params.word_list,
                        group_name: params.group_name,
                        group_list: params.group_list
                    };
                    localStorage.setItem('selected', JSON.stringify(tempData))
                    setZoomLoading(false);
                    navigate("/graph/zoom");
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
