import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";

const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Indlc29hIiwiZW1haWwiOiJ3ZXNhQHNtdS5lZHUiLCJ0aXRsZSI6IlN0dWRlbnQiLCJmaXJzdF9uYW1lIjoiV2VzIiwibGFzdF9uYW1lIjoiQW5kZXJzb24iLCJzdWZmaXgiOm51bGwsIm9yY2lkIjoiMDAwOTAwMDU2MzM5MDI3NCIsImxpbmtlZGluX2xpbmsiOiItIiwid2Vic2l0ZSI6bnVsbCwiaWF0IjoxNjc5OTQ5MjM1fQ.AaVzeiRIZIQRMeCK8A3OxNvBooTKqmX2p967Rol4o_g"

export const GetMembers = async (groupid) =>  {
    console.log("Getting Members");
    const res = await axios.get(`${BACKEND_ENDPOINT}/groups/members/${groupid}`, {headers: {
        'Authorization': token
    }}
    );
    if(res.status !== 200){
        console.log(`Couldn't get members information. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const SendInvite = async (invite) =>  {
    console.log(invite)
    console.log("Sending Invite to", invite.username, invite.private_group);
    const res = await axios.post(`${BACKEND_ENDPOINT}/groups/invite/`, invite, {headers: {
        'Authorization': token
    }}
    );
    if(res.status !== 201){
        console.log(`Couldn't post invite. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const UpdateGroup = async (private_group, update) =>  {
    console.log(update)
    console.log("Updating Group", private_group);
    const res = await axios.put(`${BACKEND_ENDPOINT}/groups/${private_group}`, update, {headers: {
        'Authorization': token
    }}
    );
    if(res.status !== 200){
        console.log(`Couldn't update group. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};