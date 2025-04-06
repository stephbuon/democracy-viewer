const { DateTime } = require("luxon");

const group_table = "private_groups";
const member_table = "group_members";
const invite_table = "group_invites";
const datasets_table = "group_datasets";
const graphs_table = "group_graphs";

class groups {
    constructor(knex) {
        if (!knex) {
            throw new Error("Database connection not defined");
        }
        this.knex = knex;
    }

    // Create a new group
    async addGroup(params) {
        await this.knex(group_table).insert({ ...params, date_created: new Date() });
        const records = await this.knex(group_table).where({ name: params.name });
        return records[records.length - 1];
    }

    // Add a member to a group
    async addMember(params) {
        await this.knex(member_table).insert({ ...params, date_joined: new Date() });
        const records = await this.knex(member_table).where({ private_group: params.private_group, member: params.member });
        return records[0];
    }

    // Invite a user to a group
    async addInvite(params) {
        const expires = DateTime.fromJSDate(new Date()).plus({ hours: 24 }).toJSDate();
        await this.knex(invite_table).insert({ ...params, expires });
        const records = await this.knex(invite_table).where({ private_group: params.private_group, email: params.email });
        return records[0];
    }

    // Add datasets to a group
    async addDatasets(records) {
        await this.knex(datasets_table).insert([ ...records ]);
        return null;
    }

    // Add graphs to a group
    async addGraphs(records) {
        await this.knex(graphs_table).insert([ ...records ]);
        return null;
    }

    // Edit a group's information
    async editGroup(id, params) {
        await this.knex(group_table).where({ id }).update({ ...params });
        const record = await this.knex(group_table).where({ id });
        return record[0];
    }

    // Edit a group member
    async editMember(private_group, member, params) {
        await this.knex(member_table).where({ private_group, member }).update({ ...params });
        const record = await this.knex(member_table).where({ private_group, member });
        return record[0];
    }

    // Get a private group by id
    async getGroupById(id) {
        const record = await this.knex(group_table).where({ id });
        return record[0];
    }

    // Get groups that a user is in
    async getGroupsByUser(member, currentPage = 1) {
        const member_records = await this.knex(member_table).where({ member }).paginate({ currentPage, perPage: 5});
        const group_ids = member_records.data.map(x => x.private_group);
        // Check if there are any groups
        if (group_ids.length > 0) {
            // If the member is in at least 1 group, return the groups
            const groups = await this.knex(group_table).where(q => {
                for (let i = 0; i < group_ids.length; i++) {
                    q.orWhere({ id: group_ids[i] });
                }
            }); 
            return {
                results: groups,
                total: member_records.pagination.total
            };
        } else {
            // Else return no groups
            return {
                results: [],
                total: 0
            }
        }
        
    }

    // Get members by group
    async getMembersByGroup(private_group, currentPage) {
        const records = await this.knex(member_table).where({ private_group }).paginate({ currentPage, perPage: 10 });
        return {
            results: records.data,
            total: records.pagination.total
        };
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
        await this.knex(group_table).delete().where({ id });
        return null;
    }

    // Delete a member from a group
    async deleteMember(member, private_group) {
        await this.knex(member_table).delete().where({ member, private_group });
        return null;
    }

    // Delete a group invite
    async deleteInvite(email, private_group) {
        await this.knex(invite_table).delete().where({ email, private_group });
        return null;
    }

    // Remove a dataset from a group
    async removeDatasets(private_group, tables) {
        await this.knex(datasets_table).delete().where(q => {
            q.where({ private_group });
            q.whereIn("table_name", tables);
        });
        return null;
    }

    // Remove graphs from a group
    async removeGraphs(private_group, ids) {
        await this.knex(graphs_table).delete().where(q => {
            q.where({ private_group });
            q.whereIn("graph_id", ids);
        });
        return null;
    }
}

module.exports = groups;