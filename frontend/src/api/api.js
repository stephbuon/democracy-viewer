import axios from 'axios';
import { baseURL } from './support/baseURL';

export const getGraph = (dataset, params) => new Promise((resolve, reject) => {
  // Get graph from endpoint
  axios.get(`${baseURL}/graphs/${dataset}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    },
    params
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getGroupNames = (dataset) => new Promise((resolve, reject) => {
  // Get graph from endpoint
  axios.get(`${baseURL}/datasets/columns/${dataset}`, {
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
export const getColumnValues = (dataset, group, params) => new Promise((resolve, reject) => {
  // Get graph from endpoint
  axios.get(`${baseURL}/datasets/columns/${dataset}/values/${group}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    },
    params
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getRecordsByIds = (dataset, ids) => new Promise((resolve, reject) => {
  var endpoint = `${baseURL}/datasets/ids/${dataset}?` // Stores concatenated endpoint

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
    axios.delete(`${ baseURL }/datasets/${ dataset }`, {
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
  axios.get(`${ baseURL }/datasets/text/${ dataset }`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getEmbedCols = (dataset) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/datasets/embeddings/${ dataset }`, {
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
  axios.post(`${ baseURL }/datasets/like/${ table }`, {}, {
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
  axios.delete(`${ baseURL }/datasets/like/${ table }`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getDistributedConnections = () => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/distributed`, {
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
  const res = await axios.post(`${ baseURL }/distributed/${ name }`, connection, apiConfig());
  if(res.status !== 201){
      console.error(`Couldn't create connection. ${res.status}`)
      return null;
  }
  return res.data;
};

export const getMetadata = (name) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/datasets/metadata/full/${ name }`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    }
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getZoomIds = (table, params) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/graphs/zoom/ids/${ table }`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    },
    params
  }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getZoomRecords = (table, params) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/graphs/zoom/records/${ table }`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${ getToken() }`
    },
    params
  }).then(x => resolve(x.data)).catch(x => {
    // alert(x);
    reject(x);
  });
});

export const createResetPasswordCode = (email) => new Promise((resolve, reject) => {
  axios.post(`${ baseURL }/users/reset/${ email }`, {}).then(x => resolve(x.data)).catch(x => {
    // alert(x);
    reject(x);
  });
});

export const verifyResetPasswordCode = (email, code) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/users/reset/verify/${ email }`, { params: { code } }).then(x => resolve(x.data)).catch(x => {
    // alert(x);
    reject(x);
  });
});

export const resetPassword = (email, password, code) => new Promise((resolve, reject) => {
  axios.put(`${ baseURL }/users/reset/${ email }`, {
    password, code
  }).then(x => resolve(x.data)).catch(x => {
    // alert(x);
    reject(x);
  });
});

export const addSuggestion = (params) => new Promise((resolve, reject) => {
  axios.post(`${ baseURL }/datasets/suggest`, params, apiConfig()).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getSuggestionsFor = (params) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/datasets/suggest/for`, { ...apiConfig(), params }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getSuggestionsFrom = (params) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/datasets/suggest/from`, { ...apiConfig(), params }).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getSuggestion = (id) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/datasets/suggest/id/${ id }`, apiConfig()).then(x => resolve(x.data)).catch(x => {
    // alert(x);
    reject(x);
  });
});

export const confirmSuggestion = (id) => new Promise((resolve, reject) => {
  axios.put(`${ baseURL }/datasets/suggest/${ id }`, {}, apiConfig()).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const deleteSuggestion = (id) => new Promise((resolve, reject) => {
  axios.delete(`${ baseURL }/datasets/suggest/${ id }`, apiConfig()).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});

export const getTopWords = (table_name, params) => new Promise((resolve, reject) => {
  axios.get(`${ baseURL }/datasets/words/top/${ table_name }`, { ...apiConfig(), params }).then(x => resolve(x.data)).catch(x => {
    // alert(x);
    reject(x);
  });
});

export const reprocessDataset = (table_name) => new Promise((resolve, reject) => {
  axios.put(`${ baseURL }/datasets/reprocess/${ table_name }`).then(x => resolve(x.data)).catch(x => {
    alert(x);
    reject(x);
  });
});