# Truphone Coding Challenge

## Description of the Solution
  The solution was created with modularization in mind, each step of the solution has its own
  container and code communicating with the provided infrastructure

## Modules
  * ### Database
  A Postgres database with two tables: `inventory` stores the provided organization information 
  `sim_card_id` and `org_id` (both inserted automatically into the table during the build process) and
  `events`, used to store the data collected via Kafka Consumer. The `events` table has incremental
  `id`, `sim_card_id` as text, `bytes_used` as integer and `date_time` as timestamp.
  * ### Consumer
  Adds a Kafka Consumer to listen for data from the Kafka Producer. When there's a new message, 
  it validates the data and insert in the table `events` from the database. In case of some 
  inconsistency in the data, it prints the reason for not inserting into the table (this validation
  is important to avoid errors regarding invalid dates generated by the provided producer).
  * ### Rest API - localhost:8001
  Responsible for receiving paramenters and performing queries on the database. Has four endpoints:
  `all_available_sim_cards`: retrieves all sim cards saved on the `inventory` table
  `all_available_orgs`: retrieves all organisations saved on the `inventory` table
  `total_usage_given_single_sim`: calculates all usage of a single SIM over a period of time
  `total_usage_given_organisation`: calculares all usage from all SIMs belonging to a single organisation
  over period of time
  * ### React App - localhost:3001
  A simple app that has all information from the `inventory` table and lets the user easilly select
  relevant information and perform queries on the database using the Rest API

## How to Run
  Run `docker-compose up` on the project's root this will build all modules and populate the database 
  through the data received from Kafka. To perform a clean build after the first execution run 
  `docker-compose down && docker-compose build --no-cache && docker-compose up`.
  Obs: If you think that the build is taking too much time, you can remove the fron-end app by removing
  the `front` portion of the Docker Compose file. You will still be able to test the API directly from
  terminal with cURL or similar.

## Unit tests 
  You can run the tests by going to the `consumer` module folder and running `docker build -t test_consumer -f TestDockerfile .`
  to build the testing Dockerfile, and then running the tests with `docker run test_consumer`. The `rest_api`
  don't fit the requeriments for relevant unit testing and needs functional testing that can be made
  manually at this time, following the instructions in the next section.

## Testing 

### Via front-end
  To access the playground for testing the API you can go to `localhost:3001` after running the application 
  to find the React application.
  You can also perform direct requests on the `rest_api` using cURL.
  Some example requests:

### Via terminal
 To get DAILY usage for ALL simcards in organisation a01b7 between 2020-02-02 and 2020-02-10
  ```bash
  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{
        "granularity": "day",
        "org_id": "a01b7",
        "start_date": "2020-02-02 00:00:00",
        "end_date": "2020-02-10 23:59:59"
    }' \
  http://localhost:8001/organisation-usage
  ```
  
To get HOURLY usage for SIMCARD 89440006 between 2020-02-10 00:00:00 and 2020-02-10 09:00:00"
 ```bash
 curl --header "Content-Type: application/json" \
  --request POST \
  --data '{
        "granularity": "hour",
        "sim_card_id": "89440006",
        "start_date": "2020-02-10 00:00:00",
        "end_date": "2020-02-10 09:00:00"
    }' \
  http://localhost:8001/sim-usage
 ```

To get the list of organisations on the `inventory` table:
```bash
curl --header "Content-Type: application/json" \
  --request GET \
  http://localhost:8001/all-org
```

To get the list of SIM cards on the `inventory` table:
```bash
curl --header "Content-Type: application/json" \
  --request GET \
  http://localhost:8001/all-sim
```

### To validate the database
You can verify the database by running `docker ps -f "name=postgres"` to get the container ID and then
`docker exec -it <CONTAINER_ID> /bin/bash`. Inside the container, log into the database with `psql -U postgres`
and run `\d` to see the available tables. From this point you can perform whenever query you want.
Obs: To finish the conection run `\q` and then `exit`.

### API Documentation
API documentation can be found by visiting `http://localhost:8001/redoc` on the browser