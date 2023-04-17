import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

export const GetSubsetOfDataByPage = async (query, page) =>  {
    console.log("Getting Subset");
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/subset/${query.table_name}/${page}${query.search}`);
    if(res.status !== 200){
        console.log(`Couldn't get subset information. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const GetNumOfEntries = async (query) =>  {
    console.log("Getting Subset Count", query.table_name);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/count/subset/${query.table_name}${query.search}`);
    console.log("Num of entries",res.data)
    if(res.status !== 200){
        console.log(`Couldn't get subset information. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const DownloadSubset = async (query) =>  {
    console.log("Attempting to download table", query.table_name);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/download/subset/${query.table_name}${query.search}`);
    if(res.status !== 200){
        console.log(`Couldn't download data. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const DownloadFullDataset = async (query) =>  {
    console.log("Attempting to download table", query.table_name);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/download/subset/${query.table_name}`);
    if(res.status !== 200){
        console.log(`Couldn't download data. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};