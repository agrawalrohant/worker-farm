# worker-farm

An worker farm Serivce repsonsible to upload image and create and submit a job for image processing.

# Setup

- clone the repository
- run `npm install` at root level. This will install all npm dependencies.
- Setup a MySQL DB and run the _worker-farm-DDL.sql_ file queries.
- Provide DB connection details in _.env_ file.
- Run the back-end worker job service (mocked) using `npm run start-mock-job` command.
- Run the back-end worker blob service (mocked) using `npm run start-mock-blob` command.
- Now start the main application using `npm start`
- Use file _Worker-Farm-APIs.postman_collection.json_ for PostMan API details.
