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

export const CreateConnection = async (connection) =>  {
    console.log("Creating connection", connection);
    const res = await axios.post(`${BACKEND_ENDPOINT}/databases`, connection, apiConfig());
    if(res.status !== 201){
        console.log(`Couldn't create connection. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const ChangeConnection = async(database) => {//set connection_num to -1 if you want default (unfortunately undefined had issues with react)
    if(database !== -1)
    {
        console.log("Using database", database);
    
        const res = await axios.put(`${BACKEND_ENDPOINT}/session/database/add`, {"database":database}, apiConfig());
        if(res.status !== 200){
            console.log(`Couldn't use connection. ${res.status}`)
            return null;
        }
        console.log("Returning", res.data);
        return res.data;
    }
    else
    {
        console.log("Using default database", database);
    
        const res = await axios.put(`${BACKEND_ENDPOINT}/session/database/remove`, {}, apiConfig());
        if(res.status !== 200){
            console.log(`Couldn't update connection. ${res.status}`)
            return null;
        }
        console.log("Returning", res.data);
        return res.data;
    }
};

export const GetUserConnections = async() => {
    console.log("Getting Connections");
    const res = await axios.get(`${BACKEND_ENDPOINT}/databases`, apiConfig());
    if(res.status !== 200){
        console.log(`Couldn't get connections. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const DownloadSchema = async() => {
    console.log("Getting Template");
    const res = await axios.get(`${BACKEND_ENDPOINT}/databases/download/template/mysql`);
    if(res.status !== 200){
        console.log(`Couldn't get template. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};