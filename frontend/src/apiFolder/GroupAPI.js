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

export const FilterGroups = async (params, page) =>  {
    const config = { ...apiConfig() };
    if (params) {
        config.params = params;
    }

    const res = await axios.get(`${ baseURL }/groups/user`, config) //will add pagination

    if(res.status !== 200){
        console.error(`Couldn't get groups information. ${res.status}`, params)
        return null;
    }
    return res.data;
};