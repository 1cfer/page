# AgeVital

App to monitor different sensors.

## Getting Started

### Tools

This project use a PostgreSQL database. You can run Docker to run the database. Run the following command to run the database:

  * Run `npm run docker:start` to run the database in a Docker container. This command will execute the migrations in the `backend/repository/migrations/` folder.
  * To stop the database, run `npm run docker:stop`.

Each time the docker conatainer is started, the database will be reset. This will allow you to run again the migrations.

### Backend

The backend is a Flask app on Python 3.

#### Install dependencies

All the repo can be handled from the [`package.json`](./package.json) using npm. Follow the instructions below to install the dependencies.

  * Create a `.env` file in the `backend` folder. Use `.env.example` as a template.
  * Run `npm run backend:start` to install set a virtual environment, install the dependencies, and run the server (in development and debug mode).
  * If you need to access the Python virtual environment, go to the `backend` folder and run `source venv/bin/activate` (Linux) or `venv\Scripts\activate` (Windows). To deactivate the virtual environment, run `deactivate`.

#### Access the API

The API is available at `http://localhost:5000/api/v1/`. You can use Postman or any other API client to test the endpoints.

### Frontend

The frontend is a React app.
