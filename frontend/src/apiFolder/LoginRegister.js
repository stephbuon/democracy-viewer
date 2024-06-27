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

export const GetSession = async () => {
    console.log("Getting Session");
    const res = await axios.get(`${BACKEND_ENDPOINT}/session`, apiConfig());
    if(res.status !== 200){
        console.log(`Couldn't get session. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
}