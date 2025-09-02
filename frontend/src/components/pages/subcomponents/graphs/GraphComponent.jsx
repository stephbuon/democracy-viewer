// Imports
import { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { metricTypes, metricNames } from "./metrics";
import { getZoomIds } from "../../../../api";

export const GraphComponent = ({ data, setData, setZoomLoading, annotations, dataset }) => {
    // UseState definitions
    const [foundData, setFoundData] = useState(false);
    const [labelMode, setLabelMode] = useState("dynamic"); // "none", "all", "dynamic"
    const [plotInitialized, setPlotInitialized] = useState(false);

    const isOverlappingScatter = (x1, y1, x2, y2, rangeX, rangeY) => {
        // Adjust fraction to change how many labels to hide
        const fraction = 0.007;
        const xThreshold = rangeX * fraction;
        const yThreshold = rangeY * fraction;
        const xDistance = Math.abs(x1 - x2);
        const yDistance = Math.abs(y1 - y2);
        return xDistance < xThreshold && yDistance < yThreshold;
    };

    // Helper function to check if current metric supports dynamic labels
    const supportsDynamicLabels = () => {
        return metricTypes.scatter.includes(data.metric);
    };

    // Helper function to get available label modes based on graph type
    const getAvailableLabelModes = () => {
        const baseModes = [
            { value: "none", label: "No Labels" },
            { value: "all", label: "All Labels" }
        ];
        
        if (supportsDynamicLabels()) {
            baseModes.push({ value: "dynamic", label: "Dynamic Labels" });
        }
        
        return baseModes;
    };

    // Helper function to get default label mode based on graph type
    const getDefaultLabelMode = () => {
        if (supportsDynamicLabels()) {
            return "dynamic";
        }
        return "all"; // Default to showing all labels for non-scatter plots
    };

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
    const chooseLabels = (traces, xRange, yRange) => {
        const rangeX = xRange[1] - xRange[0];
        const rangeY = yRange[1] - yRange[0];
        const nonOverlappingLabels = [];
        const labels = [];

        traces.forEach(trace => {
            // Check if trace has text labels
            if (!trace.text || !Array.isArray(trace.text)) {
                labels.push([]); // Push empty array for traces without text
                return;
            }

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
                        traceLabels.push(trace.text[i]); // Use original text, not hovertext
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

    // Function to get current axis ranges from the plot
    const getCurrentRanges = () => {
        const plotElement = document.getElementById("graph");
        let xRange, yRange;
        
        if (plotElement && plotElement.layout && plotElement.layout.xaxis && plotElement.layout.yaxis) {
            // Try to get current ranges from plot layout
            xRange = plotElement.layout.xaxis.range || [
                Math.min(...data.graph.flatMap(trace => trace.x)),
                Math.max(...data.graph.flatMap(trace => trace.x))
            ];
            yRange = plotElement.layout.yaxis.range || [
                Math.min(...data.graph.flatMap(trace => trace.y)),
                Math.max(...data.graph.flatMap(trace => trace.y))
            ];
        } else {
            // Fallback to data ranges
            xRange = [
                Math.min(...data.graph.flatMap(trace => trace.x)),
                Math.max(...data.graph.flatMap(trace => trace.x))
            ];
            yRange = [
                Math.min(...data.graph.flatMap(trace => trace.y)),
                Math.max(...data.graph.flatMap(trace => trace.y))
            ];
        }

        return { xRange, yRange };
    };

    // Function to apply labels based on current state (works for all graph types)
    const applyLabels = () => {
        // Apply labels based on current labelMode
        let updatedLabels;
        if (labelMode === "none") {
            updatedLabels = data.graph.map(trace => {
                if (!trace.text || !Array.isArray(trace.text)) {
                    return []; // Return empty array if no text property
                }
                return trace.text.map(() => "");
            });
        } else if (labelMode === "all") {
            // Use the original text array which contains all labels
            updatedLabels = data.graph.map(trace => {
                if (!trace.text || !Array.isArray(trace.text)) {
                    return []; // Return empty array if no text property
                }
                return [...trace.text];
            });
        } else if (labelMode === "dynamic" && supportsDynamicLabels()) {
            // Set dynamic labels with function (only for scatter plots)
            const { xRange, yRange } = getCurrentRanges();
            updatedLabels = chooseLabels(data.graph, xRange, yRange);
        } else {
            // Fallback to all labels if dynamic is not supported
            updatedLabels = data.graph.map(trace => {
                if (!trace.text || !Array.isArray(trace.text)) {
                    return []; // Return empty array if no text property
                }
                return [...trace.text];
            });
        }

        console.log("Updated labels:", updatedLabels.map((labels, i) => `Trace ${i}: ${labels.filter(l => l !== "").length} visible labels`));

        // Update the plot with new labels - only update traces that have text
        try {
            updatedLabels.forEach((labels, index) => {
                if (labels.length > 0) {
                    Plotly.restyle("graph", { text: [labels] }, index);
                }
            });
        } catch (error) {
            console.error("Error updating labels:", error);
        }
    };

    // Function to create initial graph data with appropriate labels
    const getInitialGraphData = () => {
        return data.graph.map(trace => {
            // Check if trace has a text property that's iterable
            if (!trace.text || !Array.isArray(trace.text)) {
                // Return trace as-is if no text labels
                return { ...trace };
            }

            let initialText;
            if (labelMode === "none") {
                initialText = trace.text.map(() => "");
            } else if (labelMode === "all") {
                initialText = [...trace.text];
            } else if (labelMode === "dynamic" && supportsDynamicLabels()) {
                // For dynamic on scatter plots, apply labels after the plot is created
                initialText = [...trace.text];
            } else {
                // Default to all labels
                initialText = [...trace.text];
            }

            return {
                ...trace,
                text: initialText
            };
        });
    };

    // UseEffect: Reset label mode when metric changes
    useEffect(() => {
        if (data && data.metric) {
            const defaultMode = getDefaultLabelMode();
            setLabelMode(defaultMode);
        }
    }, [data?.metric]);

    // UseEffect: Generates graph object with zoom click event definition
    useEffect(() => {
        if (!data || !data.graph || data.graph.length === 0) {
            // Hide graph if no data
            setFoundData(false);
            setPlotInitialized(false);
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

    // UseEffect to handle label mode changes
    useEffect(() => {
        if (foundData && plotInitialized) {
            // Small delay to ensure any plot updates are complete
            setTimeout(() => {
                applyLabels();
            }, 50);
        }
    }, [labelMode, plotInitialized]);

    // UseEffect to create and manage the plot
    useEffect(() => {
        if (foundData) {
            setPlotInitialized(false);
            
            const initialGraphData = getInitialGraphData();
            
            Plotly.newPlot('graph', initialGraphData, layout, { displayModeBar: "hover" }).then(() => {
                setPlotInitialized(true);
                
                // Apply initial labels after plot creation
                setTimeout(() => {
                    applyLabels();
                }, 100);
            });

            // Relayout event to handle dynamic labels on scatter plots
            graph.current.on("plotly_relayout", event => {
                console.log("🔄 Plotly relayout event triggered:", event);
                
                if (supportsDynamicLabels() && labelMode === "dynamic" && plotInitialized) {
                    setTimeout(() => {
                        applyLabels();
                    }, 50);
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
    }, [foundData, layout, labelMode]); // Added labelMode here so plot recreates with correct initial labels

    return (
    <Box sx={{ width: '100%', pb: 3 }}>
        {/* Graph container */}
        <Box className="d-flex" sx={{ px: 2, overflow: 'visible' }}>
            <div id="graph"
                style={{ margin: "0 auto" }}
                ref={graph}
                hidden={!data.graph}
            ></div>
        </Box>

        {/* Dropdown for Label Mode - Only show if at least one trace has text labels */}
        {foundData && data.graph && data.graph.some(trace => trace.text && Array.isArray(trace.text)) && (
            <Box sx={{ 
                display: 'flex',
                justifyContent: 'center'
            }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="label-mode-select-label">Labels</InputLabel>
                    <Select
                        labelId="label-mode-select-label"
                        value={labelMode}
                        onChange={(e) => {
                            setLabelMode(e.target.value);
                        }}
                        label="Labels"
                    >
                        {getAvailableLabelModes().map(mode => (
                            <MenuItem key={mode.value} value={mode.value}>
                                {mode.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        )}
    </Box>
);
}