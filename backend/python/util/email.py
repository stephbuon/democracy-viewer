from email.mime.text import MIMEText
from smtplib import SMTP
from os import environ
from util.sql_connect import sql_connect
from util.sql_queries import get_user

engine, meta = sql_connect()

def send_email(template: str, params: dict, subject: str, to: str):
    # Set name based on provided fields
    user = get_user(engine, meta, to)
    name = "{} {}".format(user["first_name"], user["last_name"])
    title = user["title"]
    suffix = user["suffix"]
    if title is not None:
        name = "{} {}".format(title, name)
    if suffix is not None:
        name = "{} {}".format(name, suffix)
    
    # Fill in remaining parameters in email template
    with open("util/emails/{}.txt".format(template), "r") as file:
        text = file.read()
        text = text.replace("[[name]]", name)
        for key, val in params.items():
            text = text.replace("[[{}]]".format(key), str(val))
        message = MIMEText(text)

    # Set headers
    from_email = environ.get("FROM_EMAIL")
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to
    
    # Send email
    server = SMTP(environ.get("EMAIL_SERVER"), 587)
    server.starttls()
    server.login(from_email, environ.get("EMAIL_PASSWORD"))
    server.sendmail(from_email, to, message.as_string())
    server.quit()