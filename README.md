# MeetSphere

This is a 1-on-1 meeting scheduling app. Designed using React + Django, with full functionality and mobile viewport reactivity.

It's made for the course project of CSC309. Try poking around on https://meet.hydev.org! (You can add some dummy data to play with on https://meet.hydev.org/debug)

## Screenshots

<img width="1242" alt="image" src="https://github.com/user-attachments/assets/7d99a294-f0fb-4d11-83d6-ad48d44f18a1" />

<img width="1231" alt="image" src="https://github.com/user-attachments/assets/f051b85b-a2c2-4a3f-9b1a-4ff426ea7451" />

<img width="1128" alt="image" src="https://github.com/user-attachments/assets/624aebab-7d3f-4396-a190-a7f37a102317" />




## Development Instructions

To setup, please install python 3.12 and nodejs first.

Then, setup the environment by running the following commands:

```bash
npm i -g yarn
yarn install

python3 -m venv venv
source venv/bin/activate
pip install poetry
poetry install
poetry run python manage.py migrate
```

To run the frontend, run `yarn dev`
To run the backend, run `poetry run python manage.py runserver`

#### Changing Database

After a database model is changed, run the following

```shell
poetry run python manage.py makemigrations
poetry run python manage.py migrate
```
