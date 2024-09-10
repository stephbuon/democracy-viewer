import axios from 'axios';
import download from "downloadjs";
import { baseURL } from '../api/baseURL';

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
    const res = await axios.get(`${baseURL}/datasets/subset/${table}/${page}/${ pageLength }`, config);
    if(res.status !== 200){
        console.error(`Couldn't get subset information. ${res.status}`)
        return null;
    }
    return res.data;
};

export const DownloadSubset = async (table, query) =>  {
    const config = { ...apiConfig() };
    if (query) {
        config.params = query;
    }
    const res = await axios.get(`${baseURL}/datasets/download/subset/${table}`, config);//,{ keepAlive: true });
    if(res.status !== 200){
        console.error(`Couldn't download data. ${res.status}`)
        return null;
    }
    return res.data;
};

export const DownloadIds = async (table, id) =>  {
    const config = { ...apiConfig() };
    if (id) {
        config.params = { id };
    }
    const res = await axios.get(`${baseURL}/datasets/download/ids/${table}`, config);//,{ keepAlive: true });
    if(res.status !== 200){
        console.error(`Couldn't download data. ${res.status}`)
        return null;
    }
    download(res.data, `download_${ Date.now() }.csv`);
};