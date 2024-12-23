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

export const CreateDataset = (dataset, setProgress) => new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", dataset);
    let headers = apiConfig();
    headers.headers = {
        ...headers.headers,
        "Content-Type": "multipart/form-data"
    }
    if (setProgress) {
        headers.onUploadProgress = (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(progress);
        }
    }
    axios.post(`${baseURL}/datasets`, formData, headers)
        .then(x => resolve(x.data))
        .catch(x => {
            // alert(x);
            reject(x);
        }
    );
});

export const UploadDataset = async (table_name, metadata, text, embed, tags) =>  {
    const params = {
        table_name, metadata, text, embed, tags
    }
    const res = await axios.post(`${baseURL}/datasets/upload`, params, apiConfig());
    if(res.status !== 201){
        console.error(`Couldn't upload. ${res.status}`)
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



export const GetCSVFromAPI = (endpoint, token) => new Promise((resolve, reject) => {
    axios.post(`${baseURL}/datasets/api`, {endpoint, token}, apiConfig())
        .then(x => resolve(x.data))
        .catch(x => {
            // alert(x);
            reject(x);
        }
    );
});

export const UploadStopwords = (file, table_name) => new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    let headers = apiConfig();
    headers.headers = {
        ...headers.headers,
        "Content-Type": "multipart/form-data"
    }
    axios.post(`${baseURL}/datasets/upload/stopwords/${ table_name }`, formData, headers)
        .then(x => resolve(x.data))
        .catch(x => {
            // alert(x);
            reject(x);
        }
    );
});