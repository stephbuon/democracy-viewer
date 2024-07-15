import axios from "axios";

import { baseURL } from "./baseURL";
const baseEndpoint = `${ baseURL }/users`;

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

//I am so sad at this function. :(
export const getUser = (email) => new Promise((resolve, reject) => {
    axios.get(`${ baseEndpoint }/${ email }`, apiConfig)
        .then(x => resolve(x.data))
        .catch(x => {
          alert(x);
          reject(x);
        });
});

export const updateUser = async (email, params) => {
  const res = await axios.put(`${ baseEndpoint }/${email}`,params,apiConfig());

  if(res.status !== 200){
    console.error(`Couldn't update user information. ${res.status}`, params)
    return null;
  }
  return res.data;
}

export const deleteAccount = () => new Promise((resolve, reject) => {
  axios.delete(`${ baseURL }/users`, apiConfig()).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});