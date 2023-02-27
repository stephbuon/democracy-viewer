import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

export const FilterDatasets = async (params) =>  {
    console.log("Filtering Datasets", params);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/filter?type=${params.type}&search=${params.searchTerm}&title=${params.title}&username=${params.username}${params.tags}`);
    if(res.status !== 200){
        console.log(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};
