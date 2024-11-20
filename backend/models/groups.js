const { DateTime } = require("luxon");

const group_table = "private_groups";
const member_table = "group_members";
const invite_table = "group_invites";
const datasets_table = "group_datasets";

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

    // Adding data to group
    async addDataset(private_group, table_name) {
        await this.knex(datasets_table).insert({private_group, table_name});
        const records = await this.knex(datasets_table).where({private_group, table_name});
        return records[0];
    }

    // Edit a group's information
    async editGroup(id, params) {
        await this.knex(group_table).where({ id }).update({ ...params });
        const record = await this.knex(group_table).where({ id });
        return record[0];
    }

    // Edit a group member
    async editMember(private_group, member, member_rank) {
        await this.knex(member_table).where({ private_group, member }).update({ member_rank });
        const record = await this.knex(member_table).where({ private_group, member });
        return record[0];
    }

    // Get a private group by id
    async getGroupById(id) {
        const record = await this.knex(group_table).where({ id });
        return record[0];
    }

    // Get members by group
    async getMembersByGroup(private_group) {
        const records = await this.knex(member_table).where({ private_group }).orderBy("member_rank").orderBy("date_joined");
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

    // Filter groups
    async getFilteredGroups(params, email, paginate = true, currentPage = 1) {
        const query = this.knex(group_table).select(`${ group_table }.*`).distinct()
            .leftJoin(member_table, `${ group_table }.id`, `${ member_table }.private_group`)
            .where(q => {
                // Filter by user 
                q.where(`${ member_table }.member`, email);

                // Search all text fields
                const search = params.__search__;
                if (search) {
                    q.where(q => {
                        const terms = search.split(" ");
                        terms.forEach(term => {
                            q.orWhereILike(`${ group_table }.name`, `%${ term }%`);
                            q.orWhereILike(`${ group_table }.description`, `%${ term }%`);
                        });
                    })
                }

                // Search for liked datasets  NOT YET IMPLAMENTED
                // const liked = params.liked;
                // if (liked) {
                //     q.where(`${ likes_table }.email`, liked);
                // }
            })
            .orderBy(`${ group_table }.date_created`, "desc");

        let results;
        if (paginate) {
            const perPage = params.pageLength ? params.pageLength : 10;
            results = await query.paginate({ perPage, currentPage });
            results = results.data;
        } else {
            results = await query;
        }

        return results;
    }

    // Get the number of datasets for a given set of filters
    async getFilteredGroupCount(params, email) {
        const results = await this.getFilteredGroups(params, email, false);
        return results.length;
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

    // Delete datset from group
    async deleteDataset(private_group, table_name) {
        await this.knex(datasets_table).delete().where({ table_name, private_group });
        return null;
    }
}

module.exports = groups;