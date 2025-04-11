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
const sendInvites = async(knex, user_from, invite_emails, private_group) => {
    const model = new groups(knex);

    // Get user_from info
    const from_record = await model.getMember(user_from, private_group);

    // If user_from is not the admin of the group, throw error
    if (!from_record || from_record.member_rank > 2) {
        throw new Error(`User ${ user_from } does not have permission to invite users to private group ${ private_group }`);
    }

    // Get private group info
    const group_record = await model.getGroupById(private_group);

    // Convert invite emails to an array if it isn't one already
    invite_emails = Array.isArray(invite_emails) ? invite_emails : [invite_emails];

    // Attempt to send an invite to each email in invite emails
    const invite_records = [];
    const success_emails = [];
    const fail_emails = []
    for (let i = 0; i < invite_emails.length; i++) {
        const email = invite_emails[i];
        try {
            // Generate code
            const code = chance.string({ length: 8, casing: 'upper', alpha: true, numeric: true });
            // Hash generated code
            const hashedCode = bcrypt.hashSync(code, 10);
            // Delete old code
            await model.deleteInvite(email, private_group);
            // Add invite to database
            const record = await model.addInvite({
                private_group,
                email,
                code: hashedCode
            });
            // Send invite email
            await emailUtil.invitePrivateGroup(knex, email, group_record.name, user_from, code);
            success_emails.push(email);
            delete record.code;
            invite_records.push(record);
        } catch (err) {
            fail_emails.push(email);
            console.error(err);
        }
    }

    // Send report to invite sender on successes and failures
    await emailUtil.invitePrivateGroupReport(knex, user_from, group_record.name, success_emails, fail_emails);

    return invite_records;
}

// Add a user as a member to a group from an invite
const addMember = async(knex, private_group, email, code) => {
    const model = new groups(knex);

    // Get the invite record
    const invite_records = await model.getInvites({ private_group, email });
    // If no record found, throw error
    if (invite_records.results.length === 0) {
        throw new Error(`No private group invitation was found for user ${ email } for group ${ private_group }`);
    }

    const invite_record = invite_records.results[0];
    const result = await bcrypt.compare(code, invite_record.code);
    if(!result){
        throw new Error ("This invite code is not correct.");
    }

    // Delete invite record
    await model.deleteInvite(email, private_group);

    // Add member record
    const record = await model.addMember({ private_group, member: email });

    return record;
}

// Add a dataset to a group
const addDatasets = async(knex, private_group, tables, email) => {
    const model = new groups(knex);

    // Get user_from info
    const member_record = await model.getMember(email, private_group);

    // If user_from is not the admin of the group, throw error
    if (!member_record || member_record.member_rank > 3) {
        throw new Error(`User ${ email } does not have permission to add datasets to private group ${ private_group }`);
    }

    const records = tables.map(table_name => {
        return {
            private_group,
            table_name
        }
    })
    await model.addDatasets(records);
}

// Add a graph to a group
const addGraphs = async(knex, private_group, ids, email) => {
    const model = new groups(knex);

    // Get user_from info
    const member_record = await model.getMember(email, private_group);

    // If user_from is not the admin of the group, throw error
    if (!member_record || member_record.member_rank > 3) {
        throw new Error(`User ${ email } does not have permission to add datasets to private group ${ private_group }`);
    }

    const records = ids.map(graph_id => {
        return {
            private_group,
            graph_id
        }
    })
    await model.addGraphs(records);
}

// Edit a group if the user is an admin
const editGroup = async(knex, email, id, params) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(email, id);
    // If record not found or user not an admin, throw error
    if (!member_record || (typeof member_record.member_rank === "number" && member_record.member_rank > 2)) {
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
    if (!member_record || (typeof member_record.member_rank === "number" && member_record.member_rank > 2)) {
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
const getGroupsByUser = async(knex, email, page) => {
    const model = new groups(knex);

    const result = await model.getGroupsByUser(email, Number(page));
    return result;
}

// Get group members if user is in the group
const getGroupMembers = async(knex, email, private_group, page) => {
    const model = new groups(knex);

    // Get all members of the private group
    const records = await model.getMembersByGroup(private_group, Number(page));
    // Check if user is in group
    const record = records.results.filter(x => x.member === email);
    // If no record found, throw error
    if (record.length === 0) {
        throw new Error(`User ${ email } not a member of private group ${ private_group }`);
    }
    // Replace email with name
    for (let i = 0; i < records.results.length; i++) {
        records.results[i] = {
            ...records.results[i],
            name: await getName(knex, records.results[i].member)
        }
    }

    return records;
}

// Get the group member record by group and user
const getMember = async(knex, email, group) => {
    const model = new groups(knex);

    const result = await model.getMember(email, group);
    if (!result) {
        throw new Error(`Failed to find record of user ${ email } in private group ${ group }`);
    }
    return result;
}

// Get the group invites by the given filter parameters
const getInvites = async(knex, params, page) => {
    const model = new groups(knex);

    const invites = await model.getInvites(params, Number(page));
    const results = [];
    for (let i = 0; i < invites.results.length; i++) {
        const temp = invites.results[i];
        delete temp.code;
        const group = await model.getGroupById(temp.private_group);
        results.push({
            ...temp,
            ...group
        });
    }

    return {
        results,
        total: invites.total
    };
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
    if (admin !== email && !member_record || (typeof member_record.member_rank === "number" && member_record.member_rank > 2)) {
        throw new Error(`User ${ admin } is not an admin in private group ${ private_group }`);
    }

    // Check if this is the last member of this group
    const members = await getGroupMembers(knex, admin, private_group, 1);
    if (members.total <= 1) {
        // If this is the last member, delete the group
        await model.deleteGroup(private_group);
    } else {
        // If this is not the last member, delete the group member
        await model.deleteMember(email, private_group);
    }
}

// Delete a private group invite
const deleteGroupInvite = async(knex, admin, email, private_group) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(admin, private_group);
    // If record not found or user not an admin, throw error
    if (admin !== email && !member_record || (typeof member_record.member_rank === "number" && member_record.member_rank > 2)) {
        throw new Error(`User ${ admin } is not an admin in private group ${ private_group }`);
    }

    // Delete group invite
    await model.deleteInvite(email, private_group);
}

// Remove private group datasets
const removeGroupDatasets = async(knex, private_group, tables, email) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(email, private_group);
    // If record not found or user not an admin, throw error
    if (!member_record || (typeof member_record.member_rank === "number" && member_record.member_rank > 2)) {
        throw new Error(`User ${ email } is not an admin in private group ${ private_group }`);
    }

    // Delete group invite
    await model.removeDatasets(private_group, tables);
}

// Remove private group graphs
const removeGroupGraphs = async(knex, private_group, ids, email) => {
    const model = new groups(knex);

    // Get user's group member record
    const member_record = await model.getMember(email, private_group);
    // If record not found or user not an admin, throw error
    if (!member_record || (typeof member_record.member_rank === "number" && member_record.member_rank > 2)) {
        throw new Error(`User ${ email } is not an admin in private group ${ private_group }`);
    }

    // Delete group invite
    await model.removeGraphs(private_group, ids)
}

module.exports = {
    addGroup,
    sendInvites,
    addMember,
    addDatasets,
    addGraphs,
    editGroup,
    editMember,
    getGroupById,
    getGroupsByUser,
    getGroupMembers,
    getMember,
    getInvites,
    deleteGroup,
    deleteGroupMember,
    deleteGroupInvite,
    removeGroupDatasets,
    removeGroupGraphs
};