import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

// const instance = axios.create({
//     baseURL: 'https://some-domain.com/api/',
//     timeout: 1000,
//     headers: {'X-Custom-Header': 'foobar'},
//     httpAgent: new http.Agent({ keepAlive: true }),
//   });

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

export const GetUploadProgress = async (query, page) =>  {
    console.log("Getting Upload Progress", query.table_name);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/upload/${query.table_name}`, apiConfig());
    if(res.status !== 200){
        console.log(`Couldn't get subset information. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
    
};

export const GetDownloadProgress = async (query) =>  {
    console.log("Getting Download Progress", query.table_name);
    const res = await axios.get(`${BACKEND_ENDPOINT}/datasets/download/record/${query.table_name}${query.search}`);
    // console.log("Num of entries",res.data)
    if(res.status !== 200){
        console.log(`Couldn't get subset information. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};