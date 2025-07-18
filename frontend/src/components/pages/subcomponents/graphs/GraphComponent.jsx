// Imports
import { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { metricTypes, metricNames } from "./metrics";
import { getZoomIds } from "../../../../api";

export const GraphComponent = ({ data, setData, setZoomLoading, isOverlappingScatter, annotations, dataset }) => {
    // UseState definitions
    const [foundData, setFoundData] = useState(false);
    const [showLabels, setShowLabels] = useState(true);
    const [layout, setLayout] = useState({
        // title: data.title,
        title: `${ metricNames[data.metric] } For "${ dataset.title }"`,
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

    // Function to apply scatter plot labels based on current state
    const applyScatterLabels = () => {
        if (!metricTypes.scatter.includes(data.metric)) return;

        let xRange, yRange;
        
        // Get current x range
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

        // Get current y range
        min = Infinity;
        max = -Infinity;
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

        const updatedLabels = showLabels
            ? chooseLabels(data.graph, xRange, yRange)
            : data.graph.map(() => []);

        updatedLabels.forEach((labels, index) => {
            Plotly.restyle("graph", { text: [labels] }, index);
        });
    };

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
                metricTypes.bar.includes(data.metric) ||
                (metricTypes.scatter.includes(data.metric) && data.graph.length === 1) ||
                metricTypes.directedGraph.includes(data.metric)
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

            // Treat x-axis as categorical
            if (!(metricTypes.scatter.includes(data.metric) || metricTypes.directedGraph.includes(data.metric))) {
                layout_ = {
                    ...layout_,
                    xaxis: {
                        ...layout_.xaxis,
                        type: "category"
                    }
                }

                // Set y-axis as categorical
                if (metricTypes.heatmap.includes(data.metric)) {
                    layout_ = {
                        ...layout_,
                        yaxis: {
                            ...layout_.yaxis,
                            type: "category"
                        }
                    }
                }
            }

            // Remove axis ticks
            if (metricTypes.directedGraph.includes(data.metric)) {
                layout_ = {
                    ...layout_,
                    xaxis: {
                        ...layout_.xaxis,
                        showticklabels: false
                    },
                    yaxis: {
                        ...layout_.yaxis,
                        showticklabels: false
                    }
                }
            }

            // Show annotations
            if (annotations) {
                layout_ = {
                    ...layout_,
                    annotations
                }
            } else if (Object.keys(layout_).includes("annotations")) {
                delete layout_.annotations;
            }

            setLayout({ ...layout_ });
        }
    }, [data, annotations]);

    useEffect(() => {
        if (foundData) {
            Plotly.newPlot('graph', data.graph, layout, { displayModeBar: "hover" }).then(() => {
                applyScatterLabels(); // Apply labels immediately after rendering
            });

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

                    const updatedLabels = showLabels
                        ? chooseLabels(data.graph, xRange, yRange)
                        : data.graph.map(() => []);
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
                    params.group_list = dataPoint.x;
                } else if (metricTypes.scatter.includes(data.metric)) {
                    params.word_list = [dataPoint.hovertext];
                } else if (metricTypes.heatmap.includes(data.metric)) {
                    params.group_list = [dataPoint.x, dataPoint.y];
                } else if (metricTypes.dotplot.includes(data.metric)) {
                    params.group_list = dataPoint.x;
                    params.word_list = [dataPoint.text, params.word_list[0]];
                } else if (metricTypes.multibar.includes(data.metric)) {
                    params.group_list = dataPoint.x;
                    params.word_list = [dataPoint.text];
                } else if (metricTypes.directedGraph.includes(data.metric)) {
                    if (dataPoint.data.hovertext.includes("<br>Weight: ")) {
                        // line
                        params.group_name = [params.from_col, params.to_col];
                        params.word_list = [];
                        let names = dataPoint.data.hovertext.split("<br>")[0];
                        params.group_list = names.split(" -> ");
                    } else {
                        // point
                        params.group_name = [params.to_col, params.from_col];
                        params.group_list = dataPoint.hovertext;
                        params.word_list = [];
                    }
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
    }, [foundData, layout, showLabels]);

    return (
        <Box sx={{ position: 'relative', minHeight: '550px' }}>
            {/* Toggle Button */}
            <Box sx={{ position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10
                }}
            >
            <Button variant="outlined" onClick={() => setShowLabels(prev => !prev)} sx={{ textTransform: 'none' }} >
                {showLabels ? "Hide Labels" : "Show Labels"}
            </Button>
            </Box>

            {/* Graph container */}
            <Box className="d-flex" sx={{ marginTop: '48px', px: 2 }}>
                <div id="graph"
                    style={{ margin: "0 auto" }}
                    ref={graph}
                    hidden={!data.graph}
                ></div>
            </Box>
        </Box>
    );
}
