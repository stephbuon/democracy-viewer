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

export const LoginRequest = async (user) =>  {
    const res = await axios.post(`${BACKEND_ENDPOINT}/session`, user);
    if(res.status !== 201){
        console.error(`Couldn't login. ${res.status}`)
        return null;
    }
    return res.data;
};

export const RegisterRequest = async (user) =>  {
    const res = await axios.post(`${BACKEND_ENDPOINT}/users`, user);
    if(res.status !== 201){
        console.error(`Couldn't register. ${res.status}`)
        return null;
    }
    return res.data;
};

export const GetSession = async () => {
    const res = await axios.get(`${BACKEND_ENDPOINT}/session`, apiConfig());
    if(res.status !== 200){
        console.error(`Couldn't get session. ${res.status}`)
        return null;
    }
    return res.data;
}