import axios from 'axios';

export const BACKEND_ENDPOINT = "http://3.15.2.102:8000";

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

    const res = await axios.get(`${ BACKEND_ENDPOINT }/datasets/filter/${ page }`, config)

    if(res.status !== 200){
        console.error(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    return res.data;
};

export const FilterDatasetsCount = async (params) =>  {
    let res;
    if(params.advanced)
    {
        //ADVANCED SEARCH
        res = await axios.get(`${BACKEND_ENDPOINT}/datasets/count/filter/?type=${params.type}${params.title}${params.description}${params.username}${params.tags}`,apiConfig());
    }
    else
    {
        //SIMPLE SEARCH
        res = await axios.get(`${BACKEND_ENDPOINT}/datasets/count/filter/?type=${params.type}${params.searchTerm}`,apiConfig());
    }
    if(res.status !== 200){
        console.error(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    return res.data;
};

export const GetAllTags = async () =>  {
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/tags/unique`);
    if(res.status !== 200){
        console.error(`Couldn't get tags. ${res.status}`, apiConfig())
        return null;
    }
    return res.data;
};

export const Popularize = async (dataset) =>  {
    const res = await axios.put(`${BACKEND_ENDPOINT}/datasets/click/${dataset}`)

    if(res.status !== 200){
        console.error(`Couldn't popularize. ${res.status}`)
        return;
    }

    return;
};