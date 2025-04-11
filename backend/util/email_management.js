const { readFile } = require("./file_management");
const nodemailer = require('nodemailer');
const { getName } = require("./user_name");

const sendEmail = async(knex, template, params, subject, to) => {
    // Get user details
    params.name = await getName(knex, to);

    // Read and fill in email template
    const templatePath = `./util/emails/${ template }.txt`;
    const templateContent = readFile(templatePath);
    let fullText = '';

    templateContent.split('\n').forEach(line => {
        if (line.length > 0) {
            let text = `<p>${line}</p>`;
            Object.keys(params).forEach(key => {
                text = text.replaceAll(`[[${key}]]`, params[key]);
            });
            fullText += text;
        }
    });

    // Set up email data
    const fromEmail = process.env.FROM_EMAIL;
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER,
        port: parseInt(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: fromEmail,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: fromEmail,
        to: to,
        subject: subject,
        html: fullText
    };

    // Send email
    await transporter.sendMail(mailOptions);
}

const suggestionEmail = async(knex, email, email2, title, old_text, new_text, id, type) => {
    const name2 = await getName(knex, email2);

    const params = {
        email,
        email2,
        name2,
        title,
        old_text,
        new_text,
        id,
        url: process.env.FRONTEND_ENDPOINT
    };

    let subject;
    let template;
    if (type.includes("confirm")) {
        subject = "Your Suggestion Has Been Confirmed";
        template = "suggestion_confirmed";
    } else if (type.includes("add")) {
        subject = "You Have Received a New Suggestion";
        template = "suggestion_added";
    } else if (type.includes("cancel")) {
        subject = "A Suggestion For Your Dataset Has Been Canceled";
        template = "suggestion_canceled";
    } else if (type.includes("reject")) {
        subject = "Your Suggestion Has Been Declined";
        template = "suggestion_rejected";
    } else {
        throw new Error(`Invalid email type: ${ type }`);
    }

    await sendEmail(knex, template, params, subject, email);
};

const resetPasswordEmail = async(knex, email, code) => {
    const params = {
        code
    };

    const subject = "Reset Your Password";
    const template = "reset_password";

    await sendEmail(knex, template, params, subject, email);
}

const invitePrivateGroup = async(knex, email, group_name, from_email, code) => {
    const params = {
        code,
        group_name,
        from_name: await getName(knex, from_email)
    };

    const subject = "Private Group Invite";
    const template = "invite_group";

    await sendEmail(knex, template, params, subject, email);
}

const invitePrivateGroupReport = async(knex, email, group_name, successes = [], failures = []) => {
    const success = successes.length === 0 ? "None" : successes.join("<br>");
    const fail = failures.length === 0 ? "None" : failures.join("<br>");

    const params = {
        group_name,
        success,
        fail
    }

    const subject = "Private Group Invite Report";
    const template = "invite_group_report";

    await sendEmail(knex, template, params, subject, email);
}

module.exports = {
    suggestionEmail,
    resetPasswordEmail,
    invitePrivateGroup,
    invitePrivateGroupReport
};