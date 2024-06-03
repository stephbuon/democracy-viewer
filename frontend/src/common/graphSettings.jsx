// TODO: 

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from '@mui/material/Modal';
import { getGroupNames, getColumnValues } from "../api/api.js"
import { Paper, Button } from "@mui/material";
import { SelectField } from "../common/selectField.jsx";
import Select from 'react-select';

export const GraphSettings = ( props ) => {
    // UseState definitions
    const [searchValue, setSearchValue] = useState("");
    const [searchTerms, setSearchTerms] = useState(["trade", "press", "industry", "work"]);
    const [groupOptions, setGroupOptions] = useState(undefined);
    const [valueOptions, setValueOptions] = useState(undefined);
    const [groupList, setGroupList] = useState([]);
    const [group, setGroup] = useState("");
    const [metric, setMetric] = useState("counts");
    const [selectToggle, setSelectToggle] = useState(true);
    const [generated, setGenerated] = useState(false);
    const [metricOptions] = useState([
    { value: "counts", label: "Word Counts" },
    { value: "proportion", label: "Proportion" },
    { value: "tf-idf", label: "tf-idf" },
    { value: "ll", label: "Log Likelihood" },
    { value: "jsd", label: "Jensen-Shannon Divergence" },
    // { value: "embedding", label: "Word Embeddings" }
  ]);

    // Variable definitions
    const navigate = useNavigate();

    // UseEffect definition. Updates graph settings from local storage and group names from api
    useEffect(() => {
        let graphData = JSON.parse(localStorage.getItem('graph-data'));
        if(graphData != undefined && graphData.dataset != undefined && graphData.dataset.table == props.dataset.dataset.table_name){
            setMetric(graphData.graphData.settings.metric);
            setGroup(graphData.graphData.settings.group);
            nameSelected(graphData.graphData.settings.group);

            let searchList = []
            graphData.settings.groupList.forEach((element) => {
                let object = {label:element, value:element};
                searchList.push(object)
            })
            setGroupList(searchList);
            // props.setData(graphData.data)
        }
        updateGroupNames();
    }, []);

    // Function definitions

    // Called when enter is pressed on custom search text entry
    // Adds current text to the word list and empties the textbox
    const addSearchTerm = (key) => {
        if(key == 'Enter'){
        searchTerms.push(searchValue);
        setSearchValue("");
        }
    }

    // Closes modal and updates graph data
    const handleClose = (event, reason) => {
        if(reason == undefined){
            props.setSettings(false);
            props.updateGraph(group, groupList, metric, searchTerms);
            setGenerated(true);
        }
    }

    // Closes modal and updates graph data
    const handleCancel = (event) => {
        props.setSettings(false);
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
    const nameSelected = (g) => { 
        setSelectToggle(g == "");
        getColumnValues(props.dataset.dataset.table_name, g).then(async (res) => {
        let _valueOptions = []
        for(let i = 0; i < res.length; i++){
            _valueOptions.push({value: res[i], label: res[i].replace(/_/g, ' ')})
        }
        setValueOptions([..._valueOptions])
        });
    }

    return <>
        < Modal open={props.show}
            onClose={handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            className="mx-auto"
            style={{width:"75%", marginTop:"50px"}}
            >
            <Paper className="mt-0" elevation={3} sx={{ padding: "16px", margin: "8px"}}>
                <h2 id="child-modal-title">Graph Settings</h2>

                {/* Metric select dropdown */}
                <SelectField label="Metric"
                value={metric}
                setValue={setMetric}
                options={metricOptions}
                hideBlankOption={1} />

                {/* Column select dropdown */}
                <SelectField label="Column name"
                value={group}
                setValue={(x)=>{ setGroup(x); nameSelected(x); }}
                options={groupOptions}
                on
                hideBlankOption={0} />

                {/* Column value multiselect dropdown */}
                {/* TODO No selection = top 10 */}
                <label htmlFor="valueSelect">Column Value</label>
                <Select options={valueOptions}
                    id="valueSelect"
                    className="mb-3"
                    closeMenuOnSelect={false}
                    isDisabled={selectToggle}
                    // value={groupList}
                    onChange={(x) => {
                    setGroupList(x);
                }} isMulti></Select>


                {/* Custom search + terms list */}
                <div>
                    {/* Custom search textfield */}
                    <label htmlFor="value">{ "Custom Search:" }</label>
                    <input type="text" value={searchValue}
                        onChange={ (event)=>setSearchValue(event.target.value) }
                        onKeyPress={event => {addSearchTerm(event.key)}}
                        className="form-control" />
                    
                    {/* Terms list */}
                    {searchTerms.map((term, index) =><li
                    onClick={(event) => {
                        updateGroupNames();
                        searchTerms.splice(event.target.id, 1)
                    }}
                    onMouseOver={(event) => {event.target.style.color='red'}}
                    onMouseOut={(event) => {event.target.style.color='black'}}
                    style={{"color":"black"}}
                    id={index}
                    key={index}>{term}</li>)}
                </div>

                <Button variant="contained"
                onClick={handleClose}
                className="mt-2"
                style={{marginLeft:"2%"}}
                disabled={!(searchTerms.length > 0 && groupList.length > 0 && group != "")}
                >{props.buttonText}</Button>

                <Button variant="contained"
                onClick={handleCancel}
                className="mt-2"
                style={{marginLeft:"1%"}}
                color="error"
                hidden={!generated}
                >Cancel</Button>

            </Paper>
        </Modal>
    </>
}
