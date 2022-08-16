import json
from datetime import datetime

from kafka import KafkaConsumer
from sqlalchemy import create_engine, text

db_name = "postgres"
db_user = "postgres"
db_pass = "postgres"
db_host = "postgres"
db_port = "5432"

db_string = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'
db = create_engine(db_string)


def get_datetime(date_string):
    return datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%SZ')


def add_new_row(event):
    try:
        # Date Format Example: 2020-02-27T13:57:00Z
        date_time_obj = get_datetime(event['date'])

        data = {
            "sim_card_id": event['sim-card-id'],
            "bytes_used": int(event['bytes-used']),
            "datetime": date_time_obj
        }
        statement = text("""
            INSERT INTO events(sim_card_id, bytes_used, date_time) 
            VALUES(:sim_card_id, :bytes_used, :datetime);
        """)

        db.execute(statement, **data)
    except ValueError as e:
        # Sometimes the provided producer produces invalid dates like 2020-01-00T00:00:00Z
        print('Invalid Date')
        print(e)


if __name__ == '__main__':
    consumer = KafkaConsumer("usage", bootstrap_servers="kafka:9092")
    for message in consumer:
        add_new_row(json.loads(message.value.decode("utf-8")))
