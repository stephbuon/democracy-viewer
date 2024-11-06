const emailUtil = require("../util/email_management");
const bcrypt = require("bcryptjs");
const chance = require("chance").Chance();
const { getName } = require("../util/user_name");

const groups = require("../models/groups");

// Create a private group and add the creator as the admin
const addGroup = async(knex, email, params) => {
    const model = new groups(knex);

    // Create the group
    const group_record = await model.addGroup(params);

    // Add creator to group
     await model.addMember({
        member: email,
        private_group: group_record.id,
        member_rank: 1
    });

    return group_record;
}

// Send an invite to a private group
const sendInvite = async(knex, user_from, user_to, private_group) => {
    const model = new groups(knex);

    // Get user_from info
    const from_record = await model.getMember(user_from, private_group);

    // If user_from is not the admin of the group, throw error
    if (!from_record || from_record.member_rank <= 2) {
        throw new Error(`User ${ user_from } does not have permission to invite users to private group ${ private_group }`);
    }

    // Get private group info
    const group_record = await model.getGroupById(private_group);

    // Generate code
    const code = chance.string({ length: 8, casing: 'upper', alpha: true, numeric: true });
    // Hash generated code
    const hashedCode = bcrypt.hashSync(code, 10);
    // Delete old code
    await model.deleteInvite(user_to, private_group);
    // Add invite to database
    const record = await model.addInvite({
        private_group,
        email: user_to,
        code: hashedCode
    });

    // Send invite email
    await emailUtil.invitePrivateGroup(knex, user_to, group_record.name, user_from, code)

    return record;
}

// Add a user as a member to a group from an invite
const addMember = async(knex, private_group, email, member_rank) => {
    const model = new groups(knex);

    // Get the invite record
    const invite_record = await model.getInvites({ private_group, email });
    // If no record found, throw error
    if (invite_record.length === 0) {
        throw new Error(`No private group invitation was found for user ${ email } for group ${ private_group }`);
    }
    // Delete invite record
    await model.deleteInvite(email, private_group);

    // Add member record
    let record;
    if (member_rank !== undefined) {
        record = await model.addMember({ private_group, member: email, member_rank });
    } else {
        record = await model.addMember({ private_group, member: email });
    }

    return record;
}

// Edit a group if the user is an admin
const editGroup = async(knex, email, id, params) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(email, id);
    // If record not found or user not an admin, throw error
    if (!member_record || (typeof member_record.member_rank === "number" && member_record.member_rank <= 2)) {
        throw new Error(`User ${ email } is not an admin in private group ${ id }`);
    }

    // Edit the private group
    const result = await model.editGroup(id, params);
    
    return result;
}

// Edit a group if the user is an admin
const editMember = async(knex, email, id, member, params) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(email, id);
    // If record not found or user not an admin, throw error
    if (!member_record || (typeof member_record.member_rank === "number" && member_record.member_rank <= 2)) {
        throw new Error(`User ${ email } is not an admin in private group ${ id }`);
    }

    // Edit the private group
    const result = await model.editMember(id, member, params);
    
    return result;
}

// Get group information by id
const getGroupById = async(knex, id) => {
    const model = new groups(knex);

    const result = await model.getGroupById(id);
    return result;
}

// Get groups a user is in
const getGroupsByUser = async(knex, email) => {
    const model = new groups(knex);

    const result = await model.getGroupsByUser(email);
    return result;
}

// Get group members if user is in the group
const getGroupMembers = async(knex, email, private_group) => {
    const model = new groups(knex);

    // Get all members of the private group
    const records = await model.getMembersByGroup(private_group);
    // Check if user is in group
    const record = records.filter(x => x.member === email);
    // If no record found, throw error
    if (record.length === 0) {
        throw new Error(`User ${ email } not a member of private group ${ private_group }`);
    }
    // Replace email with name
    const finalRecords = [];
    for (let i = 0; i < records.length; i++) {
        finalRecords.push({
            ...records[i],
            name: await getName(knex, records[i].member)
        });
    }

    return finalRecords;
}

// Get the group member record by group and user
const getMember = async(knex, email, group) => {
    const model = new groups(knex);

    const result = await model.getMember(email, group);
    return result;
}

// Delete a private group
const deleteGroup = async(knex, email, private_group) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(email, private_group);
    // If record not found or user not an admin, throw error
    if (!member_record || member_record.member_rank === 1) {
        throw new Error(`User ${ email } is not an admin in private group ${ private_group }`);
    }

    // Delete group
    await model.deleteGroup(private_group);
}

// Delete a private group
const deleteGroupMember = async(knex, admin, email, private_group) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(admin, private_group);
    // If record not found or user not an admin, throw error
    if (admin !== email && !member_record || (typeof member_record.member_rank === "number" && member_record.member_rank <= 2)) {
        throw new Error(`User ${ admin } is not an admin in private group ${ private_group }`);
    }

    // Delete group member
    await model.deleteMember(email, private_group);
}

// Delete a private group invite
const deleteGroupInvite = async(knex, admin, email, private_group) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(admin, private_group);
    // If record not found or user not an admin, throw error
    if (admin !== email && !member_record || (typeof member_record.member_rank === "number" && member_record.member_rank <= 2)) {
        throw new Error(`User ${ admin } is not an admin in private group ${ private_group }`);
    }

    // Delete group invite
    await model.deleteInvite(email, private_group);
}

module.exports = {
    addGroup,
    sendInvite,
    addMember,
    editGroup,
    editMember,
    getGroupById,
    getGroupsByUser,
    getGroupMembers,
    getMember,
    deleteGroup,
    deleteGroupMember,
    deleteGroupInvite
};