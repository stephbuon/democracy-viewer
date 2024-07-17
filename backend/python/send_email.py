from util.email import send_email
from dotenv import load_dotenv
load_dotenv()
from os import environ
from sys import argv

email_address = argv[1]
email_type = argv[2]

if email_type == "reset_password":
    code = argv[3]
    params = {
        "code": code
    }
    subject = "Reset Your Password"
elif "suggestion" in email_type:
    email2 = argv[3]
    name = argv[4]
    title = argv[5]
    old_text = argv[6]
    new_text = argv[7]
    record_id = argv[8]
    params = {
        "email": email_address,
        "email2": email2,
        "name2": name,
        "title": title,
        "old": old_text,
        "new": new_text,
        "record_id": record_id,
        "url": environ.get("FRONTEND_ENDPOINT")
    }
    if email_type == "suggestion_added":
        subject = "You Have Received a New Suggestion"
    elif email_type == "suggestion_confirmed":
        subject = "Your Suggestion Has Been Confirmed"
else:
    raise Exception("Unknown email type:", email_type)

send_email(email_type, params, subject, email_address)