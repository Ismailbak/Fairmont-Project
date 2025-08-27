import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_task_approval_email(task_title, employee_name, task_id):
    sender_email = "ismail.bakraoui0@gmail.com"  # Replace with your Gmail address
    sender_password = "vybg xxax zikc ffzp"  # Replace with your Gmail App Password
    receiver_email = "ismail.bakraoui@emsi-edu.ma"
    subject = f"Task Completion Approval Needed: {task_title}"
    approve_url = f"http://localhost:8080/api/employee/admin/approve_task/{task_id}"
    decline_url = f"http://localhost:8080/api/employee/admin/decline_task/{task_id}"

    body = f"""
    Hello Admin,<br><br>
    Employee <b>{employee_name}</b> has marked the task <b>{task_title}</b> as done.<br>
    Please <a href='{approve_url}'>Approve</a> or <a href='{decline_url}'>Decline</a> this completion.<br><br>
    Regards,<br>Fairmont System
    """
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_task_confirmation_email(task_title, approved=True):
    sender_email = "ismail.bakraoui0@gmail.com"  # Use your Gmail
    sender_password = "vybg xxax zikc ffzp"  # Use your Gmail App Password
    receiver_email = "ismail.bakraoui@emsi-edu.ma"  # Or whoever should get the confirmation
    subject = f"Task {'Approved' if approved else 'Declined'}: {task_title}"
    body = f"""
    Hello Admin,<br><br>
    You have {'approved' if approved else 'declined'} the task <b>{task_title}</b>.<br><br>
    Regards,<br>Fairmont System
    """
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
    except Exception as e:
        print(f"Failed to send confirmation email: {e}")
