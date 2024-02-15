import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

export const CreateConnection = async (connection) =>  {
    console.log("Creating connection", connection);
    const res = await axios.post(`${BACKEND_ENDPOINT}/databases`, connection);
    if(res.status !== 201){
        console.log(`Couldn't create connection. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};