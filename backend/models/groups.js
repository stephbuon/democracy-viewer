const group_table = "private_groups";
const member_table = "group_members";
const invite_table = "group_invites";

class groups {
    constructor(knex) {
        if (!knex) {
            throw new Error("Database connection not defined");
        }
        this.knex = knex;
    }

    // Create a new group
    async addGroup(params) {
        const insert = await this.knex(group_table).insert({ ...params });
        const records = await this.knex(group_table).where({ name: params.name });
        return records[records.length - 1];
    }

    // Add a member to a group
    async addMember(params) {
        const insert = await this.knex(member_table).insert({ ...params });
        const records = await this.knex(member_table).where({ private_group: params.private_group, member: params.member });
        return records[0];
    }

    // Invite a user to a group
    async addInvite(params) {
        const insert = await this.knex(invite_table).insert({ ...params });
        const records = await this.knex(invite_table).where({ private_group: params.private_group, username: params.username });
        return records[0];
    }

    // Edit a group's information
    async editGroup(id, params) {
        const update = await this.knex(group_table).where({ id }).update({ ...params });
        const record = await this.knex(group_table).where({ id });
        return record[0];
    }

    // Edit a group member
    async editMember(private_group, member, params) {
        const update = await this.knex(member_table).where({ private_group, member }).update({ ...params });
        const record = await this.knex(member_table).where({ private_group, member });
        return record[0];
    }

    // Get a private group by id
    async getGroupById(id) {
        const record = await this.knex(group_table).where({ id });
        return record[0];
    }

    // Get groups with a name like the given search
    async getGroupsByName(search) {
        const record = await this.knex(group_table).whereILike("name", `%${ search }%`);
        return record;
    }

    // Get groups that a user is in
    async getGroupsByUser(member) {
        const member_records = await this.knex(member_table).where({ member });
        const group_ids = member_records.map(x => x.private_group);
        const groups = await this.knex(group_table).where(q => {
            for (let i = 0; i < group_ids.length; i++) {
                q.orWhere({ id: group_ids[i] });
            }
        }); 
        return groups;
    }

    // Get members by group
    async getMembersByGroup(private_group) {
        const records = await this.knex(member_table).where({ private_group });
        return records;
    }

    // Get group member info by member and group
    async getMember(member, private_group) {
        const records = await this.knex(member_table).where({ member, private_group });
        return records[0];
    }

    // Get the members of the given private group and rank (if defined)
    async getMembersByGroupRank(private_group, member_rank) {
        let records;
        if (member_rank !== undefined) {
            records = await this.knex(member_table).where({ private_group, member_rank });
        } else {
            records = await this.knex(member_table).where({ private_group });
        }
        return records;
    }

    // Get all group invites with the given parameters
    async getInvites(params) {
        const records = await this.knex(invite_table).where({ ...params });
        return records;
    }

    // Delete a private group
    async deleteGroup(id) {
        const del = await this.knex(group_table).delete().where({ id });
        return null;
    }

    // Delete a member from a group
    async deleteMember(member, private_group) {
        const del = await this.knex(member_table).delete().where({ member, private_group });
        return null;
    }

    // Delete a group invite
    async deleteInvite(username, private_group) {
        const del = await this.knex(invite_table).delete().where({ username, private_group });
        return null;
    }
}

module.exports = groups;