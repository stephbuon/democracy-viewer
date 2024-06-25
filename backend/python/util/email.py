from email.mime.text import MIMEText
from smtplib import SMTP

from_email = "rschaefer1@me.com"

def send_email(template: str, params: dict, subject: str, to: list[str]):
    with open("util/emails/{}.txt".format(template), "r") as file:
        text = file.read()
        for key, val in params.items():
            text = text.replace("[[{}]]".format(key), str(val))
        message = MIMEText(text)

    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to
    
    s = SMTP('localhost', 1025)
    s.sendmail(from_email, to, message.as_string())
    s.quit()