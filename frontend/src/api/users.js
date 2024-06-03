import axios from "axios";

import { baseURL } from "./baseURL";
const baseEndpoint = `${ baseURL }/users`;

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

//I am so sad at this function. :(
export const getUser = (username) => new Promise((resolve, reject) => {
    axios.get(`${ baseEndpoint }/${ username }`, apiConfig)
        .then(x => resolve(x.data))
        .catch(x => {
          alert(x);
          reject(x);
        });
});

export const updateUser = async (username, params) => {

  console.log("Updating User", username, params)

  const res = await axios.put(`${BACKEND_ENDPOINT}/users/${username}`,params,apiConfig());

  if(res.status !== 200){
    console.log(`Couldn't update user information. ${res.status}`, params)
    return null;
  }
  console.log("Returning", res.data);
  return res.data;
}