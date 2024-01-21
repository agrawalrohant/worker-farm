# worker-farm

An worker farm Serivce repsonsible to upload image and create and submit a job for image processing.

# Setup

- clone the repository
- run `npm install` at root level. This will install all npm dependencies.
- Setup a MySQL DB and run the _worker-farm-DDL.sql_ file queries.
- Provide DB connection details under 'DB_URL' in .env file.
- Update 'SECRET_KEY' in .env file with the secret key that you used while genrating the JWT token.
- Run the back-end worker job service (mocked) using `npm run start-mock-job` command.
- Run the back-end worker blob service (mocked) using `npm run start-mock-blob` command.
- Now start the main application using `npm start`. Once done the service is up and running on localhost:3000
- Use file _Worker-Farm-APIs.postman_collection.json_ for PostMan API details.
