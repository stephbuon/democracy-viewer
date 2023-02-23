import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

export const FilterDatasets = async (params) =>  {
    console.log("Filtering Datasets");

    const res = await axios.get(`${BACKEND_ENDPOINT}/datasetsearch`);
    if(res.status !== 200){
        console.log(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    return res.data;
};
