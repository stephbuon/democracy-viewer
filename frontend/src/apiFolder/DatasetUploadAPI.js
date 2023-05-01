import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";


const apiConfig = () => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    return {
        headers:{
            Authorization: `Bearer ${ demoV.user.token }`
        }
    }
  };

export const UploadDataset = async (dataset) =>  {
    const formData = new FormData();
    formData.append("file", dataset);
    let headers = apiConfig();
    headers.headers = {
        ...headers.headers,
        "Content-Type": "multipart/form-data"
    }
    console.log("Uploading", dataset, headers);
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets`, formData, headers);
    if(res.status !== 201){
        console.log(`Couldn't upload. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const AddTextColumn = async (dataset,cols) =>  {
    console.log("add text cols", dataset, cols, apiConfig());
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets/text`,{dataset,cols}, apiConfig());
    if(res.status !== 201){
        console.log(`Couldn't post columns. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const AddTags = async (dataset, tags) =>  {
    console.log("Adding tags", dataset, tags, apiConfig());
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets/tags`, {dataset, tags}, apiConfig());
    if(res.status !== 201){
        console.log(`Couldn't add tags. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const UpdateMetadata = async (dataset, title, decription,is_public) =>  {
    const res = await axios.put(`${BACKEND_ENDPOINT}/datasets/metadata/${dataset}`, {title, decription,is_public}, apiConfig());
    if(res.status !== 200){
        console.log(`Couldn't update metadata. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};