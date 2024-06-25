from email.mime.text import MIMEText
from smtplib import SMTP
from os import environ

def send_email(template: str, params: dict, subject: str, to: list[str]):
    with open("util/emails/{}.txt".format(template), "r") as file:
        text = file.read()
        for key, val in params.items():
            text = text.replace("[[{}]]".format(key), str(val))
        message = MIMEText(text)

    from_email = environ.get("FROM_EMAIL")
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to
    
    server = SMTP('smtp.mail.me.com', 587)
    server.starttls()
    server.login(from_email, environ.get("EMAIL_PASSWORD"))
    server.sendmail(from_email, to, message.as_string())
    server.quit()