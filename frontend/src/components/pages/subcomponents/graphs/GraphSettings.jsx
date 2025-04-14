// Imports
import { useEffect, useState } from "react";
import { getGroupNames, getColumnValues, getTopWords, getEmbedCols } from "../../../../api"
import { Paper, Button, FormControl, InputLabel, MenuItem, Modal, Select, Tooltip, Typography } from "@mui/material";
import { metricNames, metricSettings, posOptionalMetrics, embeddingMetrics, posOptions, metricTypes, clusteringMetrics } from "./metrics.js";
import { FormattedMultiTextField, FormattedMultiSelectField, FormattedTextField } from "../../../common";
import "../../../../styles/List.css";
import { useNavigate } from "react-router-dom";

const allMetricOptions = Object.keys(metricNames).map(x => {
    return {
        "value": x,
        "label": metricNames[x]
    }
});

export const GraphSettings = ( props ) => {
    // UseState definitions
    const [disabled, setDisabled] = useState(true);
    const [disabledMessage, setDisabledMessage] = useState("");
    const [searchTerms, setSearchTerms] = useState([]);
    const [checkGroupOptions, setCheckGroupOptions] = useState(false);
    const [groupOptions, setGroupOptions] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [networkValid, setNetworkValid] = useState(false);
    const [toCol, setToCol] = useState("");
    const [fromCol, setFromCol] = useState("");
    const [refreshGroupOptions, setRefreshGroupOptions] = useState(true);
    const [group, setGroup] = useState("");
    const [metric, setMetric] = useState("counts");
    const [selectToggle, setSelectToggle] = useState(false);
    const [metricOptions, setMetricOptions] = useState([ ...allMetricOptions ]);
    const [posValid, setPosValid] = useState(false);
    const [posList, setPosList] = useState([]);
    const [topn, setTopn] = useState("5");
    const [numClusters, setNumClusters] = useState("5");
    const [savedSettings, setSavedSettings] = useState(undefined);
    const [firstUpdate, setFirstUpdate] = useState(true);
    const [embedCols, setEmbedCols] = useState([]);
    const [lastMetric, setLastMetric] = useState("counts");

    const navigate = useNavigate();

    // UseEffect: Updates graph settings from local storage and group names from api
    useEffect(() => {
        const settings = JSON.parse(localStorage.getItem("graph-settings"));
        setSavedSettings(settings);
        if(settings && settings.table_name === props.dataset.dataset.table_name){
            setCheckGroupOptions(false);
            setMetric(settings.metric);
            setLastMetric(settings.metric);
            setGroup(settings.group_name);
            setTopn(String(settings.topn));
            setNumClusters(String(settings.num_clusters));
            setToCol(settings.to_col);
            setFromCol(settings.from_col);

            let searchList = []
            settings.group_list.forEach(x => {
                let object = { label: x, value: x };
                searchList.push(object)
            })
            setGroupList(searchList);

            let wordList = []
            settings.word_list.forEach(x => {
                let object = { label: x, value: x };
                wordList.push(object)
            })
            setSearchTerms(wordList);

            let pos_list = []
            settings.pos_list.forEach(x => {
                const record = posOptions.filter(y => y.value === x);
                if (record.length > 0) {
                    pos_list.push(record[0]);
                }
            })
            setPosList(pos_list);
        }

        updateGroupNames();

        if (!props.dataset.dataset.embeddings || !props.dataset.dataset.embeddings_done) {
            setMetricOptions([ ...metricOptions ].filter(x => !embeddingMetrics.includes(x.value)));
        } else {
            getEmbedCols(props.dataset.dataset.table_name).then(cols => {
                if (cols.length > 0) {
                    setEmbedCols(cols);
                } else if (props.dataset.dataset.embed_col) {
                    setEmbedCols([ props.dataset.dataset.embed_col]);
                }
            })
        }
    }, [props.newSettings]);

    useEffect(() => {
        if (posOptionalMetrics.includes(metric) && props.dataset.dataset.preprocessing_type === "lemma") {
            setPosValid(true);
        } else {
            setPosValid(false);
            setPosList([]);
        }

        if (embeddingMetrics.includes(metric) && (!embeddingMetrics.includes(lastMetric) || embedCols.length != groupOptions.length)) {
            if (checkGroupOptions) {
                setGroupList([]);
            }

            if (embedCols.length > 0) {
                setGroup(embedCols[0]);
                setGroupOptions(embedCols.map(col => {
                    return {
                        value: col, 
                        label: col.replace(/_/g, ' ')
                    }
                }));
            } else {
                setGroup("");
                setGroupOptions([{
                    value: "",
                    label: ""
                }]);
            }
        } else if (!embeddingMetrics.includes(metric) && embeddingMetrics.includes(lastMetric)) {
            updateGroupNames();
        }

        if (metricTypes.directedGraph.includes(metric)) {
            setNetworkValid(true);
        } else {
            setNetworkValid(false);
        }

        setLastMetric(metric);
    }, [metric, embedCols]);

    // Closes modal and updates graph data
    const handleClose = (event, reason) => {
        if(reason == undefined){
            const params = {
                table_name: props.dataset.dataset.table_name,
                group_name: group,
                group_list: groupList.map(x => x.value),
                metric: metric,
                word_list: searchTerms.map(x => x.value),
                pos_list: posList.map(x => x.value),
                topn: parseInt(topn),
                num_clusters: parseInt(numClusters),
                to_col: toCol,
                from_col: fromCol
            };
            props.updateGraph(params);
            localStorage.setItem('graph-settings', JSON.stringify(params));
            setSavedSettings(params);
            // setGroupList([]);
            // setPosList([]);
            props.setSettings(false);
        }
    }

    // Handles cancel to close settings if a graph exists
    const handleCancel = (event) => {
        // setGroupList([]);
        if (props.generated) {
            props.setSettings(false);
        } else {
            navigate(-1);
        }
    }

    // Updates column name dropdown values
    const updateGroupNames = () => {
        getGroupNames(props.dataset.dataset.table_name).then(async (res) => {
            let _groupOptions = []
            for(let i = 0; i < res.length; i++){
                _groupOptions.push({value: res[i], label: res[i].replace(/_/g, ' ')})
            }
            setGroupOptions([..._groupOptions])
        });
    }

    // Dynamically get word suggestions as user types
    const getWordSuggestions = async(params) => {
        if (params.search) {
            const results = await getTopWords(props.dataset.dataset.table_name, {
                ...params,
                column: group,
                values: groupList.map(x => x.value)
            });
            return results;
        } else {
            return [];
        }
    }

    const getGroupSuggestions = async(params) => {
        if (group) {
            return await getColumnValues(props.dataset.dataset.table_name, group, params);
        } else {
            return [];
        }
    }

    // Called when a column is selected
    // updates array for column value dropdown
    useEffect(() => {
        if (checkGroupOptions) {
            setSelectToggle(group === "");
            setRefreshGroupOptions(!refreshGroupOptions);
            if (!firstUpdate) {
                setGroupList([]);
            } else if (savedSettings) {
                setFirstUpdate(false);
            }
        }
    }, [group]);

    useEffect(() => {
        const settings = metricSettings[metric];
        if (settings.column !== false && !group) {
            setDisabled(true);
            setDisabledMessage("You must select a column to group by for this metric");
        } else if (
            (settings.toCol && !toCol) ||
            (settings.fromCol && !fromCol)
        ) {
            setDisabled(true);
            setDisabledMessage(`You must select a to column and a from column`);
        } else if (settings.values !== false && groupList.length !== settings.values) {
            setDisabled(true);
            setDisabledMessage(`You must select ${ settings.values } column value(s) for this metric`);
        } else if (
            (settings.wordsOptional === false && settings.words !== false && searchTerms.length !== settings.words) ||
            (settings.wordsOptional === true && searchTerms.length > 0 && searchTerms.length < settings.words)
        ) {
            setDisabled(true);
            setDisabledMessage(`You must enter ${ settings.words } custom search word(s) for this metric`);
        } else {
            setDisabled(false);
            setDisabledMessage("");
        }
    }, [metric, group, searchTerms, groupList, toCol, fromCol]);

    return <>
        <Modal open={props.show}
            onClose={handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            className="mx-auto"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
            >
            <Paper className="mt-0" elevation={3} sx={{ width: "90%", 
            maxWidth: "600px", 
            maxHeight: "80vh", 
            overflowY: "auto", 
            padding: "16px", 
            position: "relative"}}>
                {/* {"Title"} */}
                <h2 id="child-modal-title">Graph Settings For "{ props.dataset.dataset.title }"</h2>

                {/* Metric select dropdown */}
                <FormControl className="mb-3" fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                    <InputLabel>Metric</InputLabel>
                    <Select
                        value = {metric}
                        onChange = {event => setMetric(event.target.value)}
                    >
                        {
                            metricOptions.map(option => (
                                <MenuItem value = { option.value }>
                                    { option.label }
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>

                {
                    posValid === true &&
                    <>
                        {/* Column value multiselect dropdown */}
                        <FormattedMultiSelectField
                            label = "Parts of Speech"
                            selectedOptions={posList}
                            setSelectedOptions={setPosList}
                            getData={posOptions}
                            id="posSelect"
                            className="mb-3"
                            closeMenuOnSelect={false}
                        />
                    </>
                }

                {
                    networkValid === false &&
                    <>
                        {/* Column select dropdown */}
                        <FormControl className="mb-3" fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                            <InputLabel>Group By</InputLabel>
                            <Select
                                value = {group}
                                onChange = {event => {
                                    setCheckGroupOptions(true);
                                    setGroup(event.target.value);
                                }}
                            >
                                {
                                    embeddingMetrics.includes(metric) === false &&
                                    <MenuItem value = ""> &nbsp;</MenuItem>
                                }
                                {
                                    groupOptions.map(option => (
                                        <MenuItem value = { option.value }>
                                            { option.label }
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>

                        <FormattedMultiSelectField
                            label = "Filter For"
                            selectedOptions={groupList}
                            setSelectedOptions={setGroupList}
                            getData={params => getGroupSuggestions(params)}
                            id="valueSelect"
                            isDisabled={selectToggle}
                            className="mb-3"
                            closeMenuOnSelect={false}
                            refresh={refreshGroupOptions}
                        />

                        {/* Custom search + terms list */}
                        <FormattedMultiSelectField
                            label = "Custom Search"
                            selectedOptions={searchTerms}
                            setSelectedOptions={setSearchTerms}
                            // getData={params => getColumnValues(props.dataset.dataset.table_name, group, params)}
                            getData={getWordSuggestions}
                            id="customSearchSelect"
                            className="mb-3"
                            closeMenuOnSelect={false}
                        />
                    </>
                }

                {
                    networkValid === true &&
                    <>
                        <FormControl className="mb-3" fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                            <InputLabel>To Column</InputLabel>
                            <Select
                                value = {toCol}
                                onChange = {event => {
                                    setToCol(event.target.value);
                                }}
                            >
                                <MenuItem value = ""> &nbsp;</MenuItem>
                                {
                                    groupOptions.map(option => (
                                        <MenuItem value = { option.value }>
                                            { option.label }
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>

                        <FormControl className="mb-3" fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                            <InputLabel>From Column</InputLabel>
                            <Select
                                value = {fromCol}
                                onChange = {event => {
                                    setFromCol(event.target.value);
                                }}
                            >
                                {
                                    embeddingMetrics.includes(metric) === false &&
                                    <MenuItem value = ""> &nbsp;</MenuItem>
                                }
                                {
                                    groupOptions.map(option => (
                                        <MenuItem value = { option.value }>
                                            { option.label }
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </>
                }

                {
                    (
                        (metricTypes.bar.includes(metric) && metric !== "embeddings-different" && searchTerms.length === 0) ||
                        (metricTypes.dotplot.includes(metric)) ||
                        (metricTypes.multibar.includes(metric) && searchTerms.length === 0)
                    ) && (
                        <FormattedTextField
                            id="topn"
                            label="Top Words"
                            fullWidth
                            defaultValue={topn}
                            setValue={setTopn}
                            numeric
                            sx={{ zIndex: 0, marginTop: "10px" }}
                        />
                    )
                }

                {
                    clusteringMetrics.includes(metric) && (
                        <FormattedTextField
                            id="num-clusters"
                            label="Number of Clusters"
                            fullWidth
                            defaultValue={numClusters}
                            setValue={setNumClusters}
                            numeric
                            sx={{ zIndex: 0, marginTop: "10px" }}
                        />
                    )
                }

                <div style={{display: "flex", justifyContent: "center", marginTop: "2%"}}>
                    {/* {"Cancel button"} */}
                    <Button 
                        variant="contained"
                        onClick={handleCancel}
                        className="mt-2"
                        sx={{marginLeft:"1%", backgroundColor: "black"}}
                    >
                        Cancel
                    </Button>

                    {/* {"Generate/update graph button"} */}
                    {
                        disabled === true &&
                        <Tooltip
                            arrow
                            title={disabledMessage}
                        >
                            <div style = {{ marginLeft: "2%"}}>
                                <Button 
                                    variant="contained"
                                    className="mt-2"
                                    sx={{
                                        backgroundColor: "black", 
                                        color: "white"
                                    }}
                                    disabled={true}
                                >
                                    {props.generated ? 'Update graph' : 'Create graph'}
                                </Button>
                            </div>
                        </Tooltip>
                        
                    }
                    {
                        disabled === false &&
                        <Button 
                            variant="contained"
                            onClick={handleClose}
                            className="mt-2"
                            sx={{
                                marginLeft:"2%", 
                                backgroundColor: "black", 
                                color: "white"
                            }}
                            disabled={false}
                        >
                            {props.generated ? 'Update graph' : 'Create graph'}
                        </Button>
                    }
                </div>
            </Paper>
        </Modal>
    </>
}
