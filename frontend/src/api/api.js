import axios from 'axios';

const apiEndpoint = 'http://localhost:8000';

export const getToken = () => {
  let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
  if (demoV && demoV.user) {
    return demoV.user.token;
  } else {
    return undefined;
  }
}

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

export const upload = (file) => new Promise((resolve, reject) => {
    axios.post(`${apiEndpoint}/datasets/`, file, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${ getToken() }`
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
    endpoint += `&group_list=${group.value}`
  })

  // Add metric to endpoint
  endpoint += `&metric=${metric}`

  wordList.forEach((word) => { // Add all words in wordList to endpoint
    endpoint += `&word_list=${word}`
  })
  // Get graph from endpoint
  axios.get(endpoint, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getGroupNames = (dataset) => new Promise((resolve, reject) => {
  // Get graph from endpoint
  axios.get(`${apiEndpoint}/datasets/columns/${dataset}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

//{{base_url}}/datasets/columns/{{hansard_1870}}/values/speaker
export const getColumnValues = (dataset, group) => new Promise((resolve, reject) => {
  // Get graph from endpoint
  axios.get(`${apiEndpoint}/datasets/columns/${dataset}/values/${group}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getRecordsByIds = (dataset, ids) => new Promise((resolve, reject) => {
  var endpoint = `${apiEndpoint}/datasets/ids/${dataset}?` // Stores concatenated endpoint

  ids.forEach((id) => { // Add all groups in groupList to endpoint
    endpoint += `id=${id}&`
  })
  endpoint = endpoint.slice(0, -1);

  axios.get(endpoint, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const deleteDataset = (dataset) => new Promise((resolve, reject) => {
    axios.delete(`${ apiEndpoint }/datasets/${ dataset }`, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${ getToken() }`
      }
    }).then(x => resolve(x.data)).catch(x => {
      alert(x);
      reject(x);
    });
});

export const getTextCols = (dataset) => new Promise((resolve, reject) => {
  axios.get(`${ apiEndpoint }/datasets/text/${ dataset }`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const addLike = (table) => new Promise((resolve, reject) => {
  axios.post(`${ apiEndpoint }/datasets/like/${ table }`, {}, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const deleteLike = (table) => new Promise((resolve, reject) => {
  axios.delete(`${ apiEndpoint }/datasets/like/${ table }`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const updateText = (table, params) => new Promise((resolve, reject) => {
  axios.put(`${ apiEndpoint }/datasets/text/${ table }`, params, apiConfig()).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getDistributedConnections = () => new Promise((resolve, reject) => {
  axios.get(`${ apiEndpoint }/distributed`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const addDistributedConnection = async (name, connection) =>  {
  debugger;
  console.log("Creating connection", connection);
  const res = await axios.post(`${ apiEndpoint }/distributed/${ name }`, connection, apiConfig());
  if(res.status !== 201){
      console.log(`Couldn't create connection. ${res.status}`)
      return null;
  }
  console.log("Returning", res.data);
  return res.data;
};

// export const addDistributedConnection = (name, params) => new Promise((resolve, reject) => {
//   debugger;
//   axios.post(`${ apiEndpoint }/distributed/${ name }`, { ...params }, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       Authorization: `Bearer ${ getToken() }`
//     }
//   }).then(x => resolve(x.data)).catch(x => {
//     alert(x);
//     reject(x);
//   });
// });