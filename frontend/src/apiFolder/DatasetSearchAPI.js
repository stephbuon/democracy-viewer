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

export const FilterDatasets = async (params, page) =>  {
    console.log("Filtering Datasets", params);
    // console.log(`GET  -  ${BACKEND_ENDPOINT}/datasets/filter?type=${params.type}${params.searchTerm}`)

    const config = { ...apiConfig() };
    if (params) {
        config.params = params;
    }

    const res = await axios.get(`${ BACKEND_ENDPOINT }/datasets/filter/${ page }`, config)

    if(res.status !== 200){
        console.log(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const FilterDatasetsCount = async (params) =>  {
    console.log("Filtering Datasets", params);
    // console.log(`GET  -  ${BACKEND_ENDPOINT}/datasets/filter?type=${params.type}${params.searchTerm}`)

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
        console.log(`Couldn't get datasets information. ${res.status}`, params)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const GetAllTags = async () =>  {
    console.log("Getting Tags");
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/tags/unique`);
    if(res.status !== 200){
        console.log(`Couldn't get tags. ${res.status}`, apiConfig())
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const Popularize = async (dataset) =>  {
    console.log("Popularizing", dataset)
    const res = await axios.put(`${BACKEND_ENDPOINT}/datasets/click/${dataset}`)

    if(res.status !== 200){
        console.log(`Couldn't popularize. ${res.status}`)
        return;
    }

    return;
};