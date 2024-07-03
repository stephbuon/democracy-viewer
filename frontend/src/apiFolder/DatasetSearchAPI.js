import axios from 'axios';
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

export const FilterDatasets = async (params, page) =>  {
    const config = { ...apiConfig() };
    if (params) {
        config.params = params;
    }

    const res = await axios.get(`${ baseURL }/datasets/filter/${ page }`, config)

    if(res.status !== 200){
        console.error(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    return res.data;
};

export const FilterDatasetsCount = async (params) =>  {
    const config = { ...apiConfig() };
    if (params) {
        config.params = params;
    }

    const res = await axios.get(`${ baseURL }/datasets/count/filter`, config)

    if(res.status !== 200){
        console.error(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    return res.data;
};

export const GetAllTags = async () =>  {
    const res = await axios.get(`${baseURL}/datasets/tags/unique`);
    if(res.status !== 200){
        console.error(`Couldn't get tags. ${res.status}`, apiConfig())
        return null;
    }
    return res.data;
};

export const Popularize = async (dataset) =>  {
    const res = await axios.put(`${baseURL}/datasets/click/${dataset}`)

    if(res.status !== 200){
        console.error(`Couldn't popularize. ${res.status}`)
        return;
    }

    return;
};