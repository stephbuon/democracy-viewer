import axios from 'axios';
import { baseURL } from './baseURL';

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
    const res = await axios.post(`${baseURL}/session`, user);
    if(res.status !== 201){
        console.error(`Couldn't login. ${res.status}`)
        return null;
    }
    return res.data;
};

export const RegisterRequest = async (user) =>  {
    const res = await axios.post(`${baseURL}/users`, user);
    if(res.status !== 201){
        console.error(`Couldn't register. ${res.status}`)
        return null;
    }
    return res.data;
};

export const GetSession = async () => {
    const res = await axios.get(`${baseURL}/session`, apiConfig());
    if(res.status !== 200){
        console.error(`Couldn't get session. ${res.status}`)
        return null;
    }
    return res.data;
}