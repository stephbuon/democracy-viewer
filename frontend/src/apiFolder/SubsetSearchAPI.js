import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

const apiConfig = () => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV && demoV.user) {
        return {
            headers:{
                Authorization: `Bearer ${ demoV.user.token }`
            }
        }
    } else {
        return {};
    }
  };

export const GetSubsetOfDataByPage = async (table, query, page = 1, pageLength = 50) =>  {
    const config = { ...apiConfig() };
    if (query) {
        config.params = query;
    }
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/subset/${table}/${page}/${ pageLength }`, config);
    if(res.status !== 200){
        console.log(`Couldn't get subset information. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const GetNumOfEntries = async (query) =>  {
    console.log("Getting Subset Count", query.table_name);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/count/subset/${query.table_name}${query.search}`, apiConfig());
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
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/download/subset/${query.table_name}${query.search}`, apiConfig());//,{ keepAlive: true });
    if(res.status !== 200){
        console.log(`Couldn't download data. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const DownloadFullDataset = async (query) =>  {
    console.log("Attempting to download table", query.table_name);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/download/subset/${query.table_name}`, apiConfig());//, { keepAlive: true });
    if(res.status !== 200){
        console.log(`Couldn't download data. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};