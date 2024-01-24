import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

export const LoginRequest = async (user) =>  {
    console.log("Logging In", user.username, user.password);
    const res = await axios.post(`${BACKEND_ENDPOINT}/session`, user);
    if(res.status !== 201){
        console.log(`Couldn't login. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const RegisterRequest = async (user) =>  {
    console.log("Registering", user.username, user.password);
    const res = await axios.post(`${BACKEND_ENDPOINT}/users`, user);
    if(res.status !== 201){
        console.log(`Couldn't register. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};