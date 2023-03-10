const emailUtil = require("../util/email_management");

// Create a private group and add the creator as the admin
const addGroup = async(groups, username, params) => {
    // Create the group
    const group_record = await groups.addGroup(params);

    // Add creator to group
    const member_record = await groups.addMember({
        member: username,
        private_group: group_record.id,
        member_rank: 1
    });

    return group_record;
}

// Send an invite to a private group
const sendInvite = async(models, user_from, user_to, private_group) => {
    // Get user_from info
    const from_record = await models.groups.getMember(user_from, private_group);
    console.log(from_record)

    // If user_from is not the admin of the group, throw error
    if (!from_record || from_record.member_rank !== 1) {
        throw new Error(`User ${ user_from } does not have permission to invite users to private group ${ private_group }`);
    }

    // Get user_to info
    const user_record = await models.users.findUserByUsername(user_to);
    // Get private group info
    const group_record = await models.groups.getGroupById(private_group);

    // Invite email subject
    const subject = `You have been invited to join ${ group_record.name }!`;
    // Invite email body
    const body = `
        Hello ${ user_to },

        You have been invited to join the private group ${ group_record.name } by ${ user_from }. Click this link to respond to the invite:
    `;
    // Send the email
    emailUtil.sendEmail(user_record.email, subject, body);

    // Add invite to database
    const record = await models.groups.addInvite({
        private_group,
        username: user_to
    });

    return record;
}

// Add a user as a member to a group from an invite
const addMember = async(groups, private_group, username, member_rank) => {
    // Get the invite record
    const invite_record = await groups.getInvites({ private_group, username });
    // If no record found, throw error
    if (invite_record.length === 0) {
        throw new Error(`No private group invitation was found for user ${ username } for group ${ private_group }`);
    }
    // Delete invite record
    await groups.deleteInvite(username, private_group);

    // Add member record
    let record;
    if (member_rank !== undefined) {
        record = await groups.addMember({ private_group, member: username, member_rank });
    } else {
        record = await groups.addMember({ private_group, member: username });
    }

    return record;
}

// Edit a group if the user is an admin
const editGroup = async(groups, username, id, params) => {
    // Get user's group member record
    const member_record = await groups.getMember(username, id);
    // If record not found or user not an admin, throw error
    if (!member_record || member_record.member_rank !== 1) {
        throw new Error(`User ${ username } is not an admin in private group ${ id }`);
    }

    // Edit the private group
    const result = await groups.editGroup(id, params);
    
    return result;
}

// Edit a group if the user is an admin
const editMember = async(groups, username, id, member, params) => {
    // Get user's group member record
    const member_record = await groups.getMember(username, id);
    // If record not found or user not an admin, throw error
    if (!member_record || member_record.member_rank !== 1) {
        throw new Error(`User ${ username } is not an admin in private group ${ id }`);
    }

    // Edit the private group
    const result = await groups.editMember(id, member, params);
    
    return result;
}

// Get group members if user is in the group
const getGroupMembers = async(groups, username, private_group) => {
    // Get all members of the private group
    const records = await groups.getMembersByGroup(private_group);
    // Check if user is in group
    const record = records.filter(x => x.member === username);
    // If no record found, throw error
    if (record.length === 0) {
        throw new Error(`User ${ username } not a member of private group ${ private_group }`);
    }

    return records;
}

// Delete a private group
const deleteGroup = async(groups, username, private_group) => {
    // Get user's group member record
    const member_record = await groups.getMember(username, private_group);
    // If record not found or user not an admin, throw error
    if (!member_record || member_record.member_rank !== 1) {
        throw new Error(`User ${ username } is not an admin in private group ${ private_group }`);
    }

    // Delete group
    await groups.deleteGroup(private_group);

    return null;
}

// Delete a private group
const deleteGroupMember = async(groups, admin, username, private_group) => {
    // Get user's group member record
    const member_record = await groups.getMember(admin, private_group);
    // If record not found or user not an admin, throw error
    if (admin !== username && !member_record || member_record.member_rank !== 1) {
        throw new Error(`User ${ admin } is not an admin in private group ${ private_group }`);
    }

    // Delete group member
    await groups.deleteMember(username, private_group);
    
    return null;
}

// Delete a private group invite
const deleteGroupInvite = async(groups, admin, username, private_group) => {
    // Get user's group member record
    const member_record = await groups.getMember(admin, private_group);
    // If record not found or user not an admin, throw error
    if (admin !== username && !member_record || member_record.member_rank !== 1) {
        throw new Error(`User ${ admin } is not an admin in private group ${ private_group }`);
    }

    // Delete group invite
    await groups.deleteInvite(username, private_group);
    
    return null;
}

module.exports = {
    addGroup,
    sendInvite,
    addMember,
    editGroup,
    editMember,
    getGroupMembers,
    deleteGroup,
    deleteGroupMember,
    deleteGroupInvite
};