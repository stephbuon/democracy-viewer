import axios from 'axios';

var token;
// const apiEndpoint = 'http://classroomdb.smu.edu:55433';
const apiEndpoint = 'http://localhost:8000';
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

export const getGraph = (dataset, groupName, groupList, metric, wordList) => new Promise((resolve, reject) => {
  var endpoint = `${apiEndpoint}/graphs/${dataset}?group_name=${groupName}` // Stores concatenated endpoint

  groupList.forEach((group) => { // Add all groups in groupList to endpoint
    endpoint += `&group_list=${group}`
  })

  // Add metric to endpoint
  endpoint += `&metric=${metric}`

  wordList.forEach((word) => { // Add all words in wordList to endpoint
    endpoint += `&word_list=${word}`
  })
  // Get graph from endpoint
  axios.get(endpoint, apiConfig, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});