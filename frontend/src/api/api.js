import axios from 'axios';

var token;
const apiEndpoint = 'http://classroomdb.smu.edu:55433';
var apiConfig;

export const getToken = () => {
  return token;
}

export const upload = (file) => new Promise((resolve, reject) => {
    axios.post(`${apiEndpoint}/datasets/`, file, apiConfig, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    })
        .then(x => resolve(x.data))
        .catch(x => {
          alert(x);
          reject(x);
        });
});