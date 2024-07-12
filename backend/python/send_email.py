from util.email import send_email
from sys import argv

email_address = argv[1]
email_type = argv[2]

if email_type == "reset":
    code = argv[3]
    params = {
        "code": code
    }
    subject = "Reset Your Password"
else:
    raise Exception("Unknown email type:", email_type)

send_email("reset_password", params, subject, email_address)