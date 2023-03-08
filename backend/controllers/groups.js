

// Create a private group and add the creator as the admin
const addGroup = async(groups, username, params) => {
    // Create the group
    const group_record = await groups.addGroup(params);

    // Add creator to group
    const group_params = {
        member: username,
        private_group: group_record.id,
        rank: 1
    }
    const member_record = await groups.addMember(group_params);

    return group_record;
}

// Send an invite to a private group
const sendInvite = async() => {

}

module.exports = {
    addGroup,
    sendInvite
};