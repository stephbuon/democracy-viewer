const emailUtil = require("../util/email_management");

// Create a private group and add the creator as the admin
const addGroup = async(groups, username, params) => {
    // Create the group
    const group_record = await groups.addGroup(params);

    // Add creator to group
    const member_record = await groups.addMember({
        member: username,
        private_group: group_record.id,
        rank: 1
    });

    return group_record;
}

// Send an invite to a private group
const sendInvite = async(models, user_from, user_to, private_group) => {
    // Get user_from info
    const from_record = await models.groups.getMember(user_from, private_group);

    // If user_from is not the admin of the group, throw error
    if (!from_record || from_record.rank !== 1) {
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
const addMember = async(groups, private_group, username, rank) => {
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
    if (rank !== undefined) {
        record = await groups.addMember({ private_group, username, rank });
    } else {
        record = await groups.addMember({ private_group, username });
    }

    return record;
}

module.exports = {
    addGroup,
    sendInvite,
    addMember
};