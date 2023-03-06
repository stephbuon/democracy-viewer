import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

export const GetSubsetOfData = async (query) =>  {
    console.log("Getting Subset");
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/subset/${query.table_name}${query.search}`);
    if(res.status !== 200){
        console.log(`Couldn't get subset information. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};