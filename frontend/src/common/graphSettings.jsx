// Imports
import React, { useEffect, useState } from "react";
import { getGroupNames, getColumnValues } from "../api/api.js"
import { Paper, Button, Modal, Tooltip } from "@mui/material";
import { SelectField } from "../common/selectField.jsx";
import ReactSelect from 'react-select';
import { metricNames, metricSettings } from "./metrics.js";
import { FormattedMultiTextField } from "./forms";
import "./list.css";
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
    const [groupOptions, setGroupOptions] = useState(undefined);
    const [valueOptions, setValueOptions] = useState(undefined);
    const [groupList, setGroupList] = useState([]);
    const [group, setGroup] = useState("");
    const [metric, setMetric] = useState("counts");
    const [selectToggle, setSelectToggle] = useState(true);
    const [metricOptions, setMetricOptions] = useState([ ...allMetricOptions ]);
    const [groupLocked, setGroupLocked] = useState(false);

    const navigate = useNavigate();

    // UseEffect: Updates graph settings from local storage and group names from api
    useEffect(() => {
        let graphData = JSON.parse(localStorage.getItem('graph-data'));
        if(graphData && graphData.dataset !== undefined && graphData.dataset.table === props.dataset.dataset.table_name){
            setMetric(graphData.graphData.settings.metric);
            setGroup(graphData.graphData.settings.group);

            let searchList = []
            graphData.settings.groupList.forEach((element) => {
                let object = {label:element, value:element};
                searchList.push(object)
            })
            setGroupList(searchList);
        }
        updateGroupNames();

        if (!props.dataset.dataset.embeddings || !props.dataset.dataset.embeddings_done) {
            setMetricOptions([ ...metricOptions ].filter(x => !x.value.includes("embedding")))
        }
    }, []);

    useEffect(() => {
        if (metric.includes("embedding")) {
            if (props.dataset.dataset.embed_col) {
                setGroup(props.dataset.dataset.embed_col);
            } else {
                setGroup("");
            }
            setGroupLocked(true);
        } else {
            setGroupLocked(false);
        }
    }, [metric]);

    // Closes modal and updates graph data
    const handleClose = (event, reason) => {
        if(reason == undefined){
            props.setSettings(false);
            props.updateGraph(group, groupList, metric, searchTerms);
            setGroupList([]);
        }
    }

    // Handles cancel to close settings if a graph exists
    const handleCancel = (event) => {
        setGroupList([]);
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

    // Called when a column is selected
    // updates array for column value dropdown
    useEffect(() => {
        setSelectToggle(group === "");
        if (group !== "") {
            getColumnValues(props.dataset.dataset.table_name, group).then(async (res) => {
                let _valueOptions = []
                for(let i = 0; i < res.length; i++){
                    _valueOptions.push({value: res[i], label: res[i]})
                }
                setValueOptions([..._valueOptions])
            });
        }
    }, [group]);

    useEffect(() => {
        const settings = metricSettings[metric];
        if (settings.column !== false && !group) {
            setDisabled(true);
            setDisabledMessage("You must select a column to group by for this metric");
        } else if (settings.values !== false && groupList.length !== settings.values) {
            setDisabled(true);
            setDisabledMessage(`You must select ${ settings.values } column value(s) for this metric`);
        } else if (settings.words !== false && searchTerms.length !== settings.word) {
            setDisabled(true);
            setDisabledMessage(`You must enter ${ settings.words } custom search word(s) for this metric`);
        } else {
            setDisabled(false);
            setDisabledMessage("");
        }
    }, [metric, group, searchTerms, groupList]);

    return <>
        < Modal open={props.show}
            onClose={handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            className="mx-auto"
            style={{width:"75%", marginTop:"50px"}}
            >
            <Paper className="mt-0" elevation={3} sx={{ padding: "16px", margin: "8px"}}>
                {/* {"Title"} */}
                <h2 id="child-modal-title">Graph Settings</h2>

                {/* Metric select dropdown */}
                <SelectField label="Metric"
                value={metric}
                setValue={setMetric}
                options={metricOptions}
                hideBlankOption={1} />

                {/* Column select dropdown */}
                <SelectField label="Column Name"
                    value={group}
                    setValue={(x)=>setGroup(x)}
                    options={groupOptions}
                    hideBlankOption={0} 
                    disabled={groupLocked}
                />

                {/* Column value multiselect dropdown */}
                {/* TODO No selection = top 10 */}
                <label htmlFor="valueSelect">Column Value</label>
                <ReactSelect 
                    options={valueOptions}
                    id="valueSelect"
                    className="mb-3"
                    closeMenuOnSelect={false}
                    isDisabled={selectToggle}
                    onChange={(x) => setGroupList(x)} 
                    isMulti
                />

                {/* Custom search + terms list */}
                <FormattedMultiTextField
                    id="customsearch"
                    label="Custom Search"
                    // variant="filled"
                    fullWidth
                    sx={{ background: 'rgb(255, 255, 255)', zIndex: 0 }}
                    words={searchTerms}
                    setWords={setSearchTerms}
                />

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
