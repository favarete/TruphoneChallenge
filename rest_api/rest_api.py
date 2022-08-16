from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text

db_name = "postgres"
db_user = "postgres"
db_pass = "postgres"
db_host = "postgres"
db_port = "5432"

db_string = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'
db = create_engine(db_string)


def total_usage_given_organisation(data):
    """
    Data Format:
    granularity = hour OR day
    {
        "granularity": "hour",
        "org_id": "a01b7",
        "start_date": "2020-02-02 03:35:00",
        "end_date": "2020-02-02 04:40:00"
    }
    """
    statement = text("""
        SELECT DATE_TRUNC(:granularity, date_time) AS reference_date, SUM(bytes_used) AS bytes_used_total FROM events 
        WHERE sim_card_id IN (SELECT sim_card_id FROM inventory WHERE org_id = :org_id) 
        AND date_time BETWEEN :start_date AND :end_date GROUP BY 1 ORDER BY 1;
    """)
    res = db.execute(statement, **data).fetchall()
    return res


def total_usage_given_single_sim(data):
    """
    Data Format:
    granularity = hour OR day
    {
        "granularity": "hour",
        "sim_card_id": "89440005",
        "start_date": "2020-02-02 03:35:00",
        "end_date": "2020-02-02 04:40:00"
    }
    """
    statement = text("""
        SELECT DATE_TRUNC(:granularity, date_time)AS reference_date, SUM(bytes_used) AS bytes_used_total FROM events 
        WHERE sim_card_id = :sim_card_id 
        AND date_time BETWEEN :start_date AND :end_date GROUP BY 1 ORDER BY 1;
    """)
    res = db.execute(statement, **data).fetchall()
    return res


def all_available_sim_cards():
    statement = text("""
        SELECT DISTINCT sim_card_id from inventory ORDER BY sim_card_id ASC;
    """)
    res = db.execute(statement).fetchall()
    return res


def all_available_orgs():
    statement = text("""
        SELECT DISTINCT org_id from inventory ORDER BY org_id ASC;
    """)
    res = db.execute(statement).fetchall()
    return res


app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/organisation-usage")
async def organisation_usage(info: Request):
    req_info = await info.json()
    resp = total_usage_given_organisation(req_info)
    return {
        "status": "SUCCESS",
        "data": resp
    }


@app.post("/sim-usage")
async def sim_usage(info: Request):
    req_info = await info.json()
    resp = total_usage_given_single_sim(req_info)
    return {
        "status": "SUCCESS",
        "data": resp
    }


@app.get("/all-sim")
async def sim_usage():
    resp = all_available_sim_cards()
    return {
        "status": "SUCCESS",
        "data": resp
    }


@app.get("/all-org")
async def sim_usage():
    resp = all_available_orgs()
    return {
        "status": "SUCCESS",
        "data": resp
    }
