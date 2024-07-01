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

export const CreateDataset = async (dataset) =>  {
    const formData = new FormData();
    formData.append("file", dataset);
    let headers = apiConfig();
    headers.headers = {
        ...headers.headers,
        "Content-Type": "multipart/form-data"
    }
    const res = await axios.post(`${baseURL}/datasets`, formData, headers);
    if(res.status !== 201){
        console.error(`Couldn't create. ${res.status}`)
        return null;
    }
    return res.data;
};

export const UploadDataset = async (table_name, metadata, text, tags) =>  {
    const params = {
        table_name, metadata, text, tags
    }
    const res = await axios.post(`${baseURL}/datasets/upload`, params, apiConfig());
    if(res.status !== 201){
        console.error(`Couldn't upload. ${res.status}`)
        return null;
    }
    return res.data;
};

export const AddTextColumn = async (dataset,cols) =>  {
    const res = await axios.post(`${baseURL}/datasets/text`,{dataset:dataset,cols:cols}, apiConfig());
    if(res.status !== 201){
        console.error(`Couldn't post columns. ${res.status}`)
        return null;
    }
    return res.data;
};

export const AddTags = async (dataset, tags) =>  {
    const res = await axios.post(`${baseURL}/datasets/tags`, {dataset:dataset, tags:tags}, apiConfig());
    if(res.status !== 201){
        console.error(`Couldn't add tags. ${res.status}`)
        return null;
    }
    return res.data;
};

export const DeleteTag = async (dataset, tag) =>  {
    const res = await axios.delete(`${baseURL}/datasets/${ dataset }/tags/${ tag }`, apiConfig());
    if(res.status !== 201){
        console.error(`Couldn't add tags. ${res.status}`)
        return null;
    }
    return res.data;
};

export const UpdateMetadata = async (dataset, params) =>  {
    const res = await axios.put(`${baseURL}/datasets/metadata/${dataset}`, params, apiConfig());
    if(res.status !== 200){
        console.error(`Couldn't update metadata. ${res.status}`)
        return null;
    }
    return res.data;
};



export const GetCSVFromAPI = async (endpoint, token) =>  {
    const res = await axios.post(`${baseURL}/datasets/api`, {endpoint, token}, apiConfig());
    if(res.status !== 201){
        console.error(`Couldn't get API csv. ${res.status}`)
        return null;
    }
    return res.data;
};