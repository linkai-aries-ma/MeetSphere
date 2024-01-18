### Development Instructions

To setup, please install python 3.12 and [sass](https://sass-lang.com/install/) first.

Then, run the following commands:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

To run the dev server, run the following command:

```bash
python3 serve.py
```

To build the frontend into static html, run the following command:

```bash
python3 serve.py --build-only
```


### Requirements

- [ ] Users should be able to create accounts with basic information (name, email, password).
  - [ ] Ensure that user data is protected and privacy is maintained.
- [ ] Users can create and manage a list of contacts (comprised of names and email addresses)
- [ ] Users can begin the process of scheduling meetings by creating a new calendar
  - [ ] On the new calendar, users should be able to specify their non-busy times which are available for meetings
  - [ ] Users should be able to indicate preference levels for different non-busy times on their schedules (e.g., high preference vs. low preference, or "book meeting at this time only if there is no other possible times that work" vs "definitely try to schedule someone here")
  - [ ] Users can select contacts to invite to get added to this meeting calendar and a deadline for scheduling a regular meeting time
    - [ ] This should autogenerate an email to each contact, inviting them to schedule a regular meeting with the inviter 
    - [ ] Email should contain a link to a Web page which lets a contact specify their schedule (times they are busy) and preferences amongst their non-busy time to meet with the person inviting them to schedule a regular meeting time
    - [ ] Each contact receives a unique link
    - [ ] Each unique link would allow the contact to open a Web page that knows who they are, who is the user that is inviting them to schedule a regular meeting time, and that user's calendar to try to add a meeting slot to
- [ ] Users should be able to log into the system to see how many of their contacts have provided the necessary information needed by the system to schedule the meeting slots
- [ ] Users should be able to remind users who haven't provided the information requested to do so
- [ ] Users should be able to see up to some number of suggested schedules determined by the Web site 
- [ ] Users should be able to select a suggested schedule that they want to use and finalise it.
  - [ ] Upon finalising a schedule, an autogenerate email to each contact should be create to notify them about the time slot when they will meet with the inviting user.
- [ ] All users should be able to change their busy, non-busy time, and preferences until the calendar is finalised.
- [ ] Users should be able to move suggested meeting times with any user on any suggested schedule.
  - [ ] The Webpage should tell the user what times work and which times won't when they try to move a meeting time to a different time.
