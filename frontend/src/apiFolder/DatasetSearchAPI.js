import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

const apiConfig = () => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    return {
        headers:{
            Authorization: `Bearer ${ demoV.user.token }`
            //'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJkc2NoYWVmZXIiLCJlbWFpbCI6InJkc2NoYWVmZXJAc211LmVkdSIsInRpdGxlIjoiU3R1ZGVudCIsImZpcnN0X25hbWUiOiJSeWFuIiwibGFzdF9uYW1lIjoiU2NoYWVmZXIiLCJzdWZmaXgiOm51bGwsIm9yY2lkIjoiMDAwMDAwMDE3Njk0Mzk5NCIsImxpbmtlZGluX2xpbmsiOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vaW4vcnlhbmRzY2hhZWZlci8iLCJpYXQiOjE2NzY0MzMyNzd9.L9Ue0CBU3QkPFUrKdxlKr2loXNWoeK-pDFkC9eFgOng'
        }
    }
  };

export const FilterDatasets = async (params, page) =>  {
    console.log("Filtering Datasets", params);
    // console.log(`GET  -  ${BACKEND_ENDPOINT}/datasets/filter?type=${params.type}${params.searchTerm}`)

    let res;
    if(params.advanced)
    {
        //ADVANCED SEARCH
        res = await axios.get(`${BACKEND_ENDPOINT}/datasets/filter/${page}?type=${params.type}${params.title}${params.description}${params.username}${params.tags}`,params.type === 'private' && apiConfig());
    }
    else
    {
        //SIMPLE SEARCH
        res = await axios.get(`${BACKEND_ENDPOINT}/datasets/filter/${page}?type=${params.type}${params.searchTerm}`,params.type === 'private' && apiConfig());
    }
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
        res = await axios.get(`${BACKEND_ENDPOINT}/datasets/count/filter/?type=${params.type}${params.title}${params.description}${params.username}${params.tags}`,params.type === 'private' && apiConfig());
    }
    else
    {
        //SIMPLE SEARCH
        res = await axios.get(`${BACKEND_ENDPOINT}/datasets/count/filter/?type=${params.type}${params.searchTerm}`,params.type === 'private' && apiConfig());
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
    const res = await axios.put(`${BACKEND_ENDPOINT}/datasets/click/${dataset.table_name}`)

    if(res.status !== 200){
        console.log(`Couldn't popularize. ${res.status}`)
        return;
    }

    return;
};