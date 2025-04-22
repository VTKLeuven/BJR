import psycopg2
from psycopg2 import sql
import os

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Database connection parameters
DATABASE_URL = os.getenv("DATABASE_URL")

# Connect to the PostgreSQL database
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

runners = [
    ("John", "Doe", "r0000001", 1, "2025-02-03T14:26:37.970Z", 1, "1.12", True),
    ("Jane", "Smith", "r0000002", 2, "2025-02-03T14:26:37.970Z", 2, "2.12", False),
    ("Alice", "Johnson", "r0000003", 1, "2025-02-03T14:26:37.970Z", 2, "1.3", True),
]

groups = [
    (1, "Groep 1"),
    (2, "Testgroep 2"),
]

kringen = [
    ("Alfa"),
    ("Apollonia"),
    ("Apolloon"),
    ("Atlas"),
    ("Babyloon"),
    ("Bios"),
    ("Canonica"),
    ("Chemika"),
    ("Cluster"),
    ("Crimen"),
    ("De Kelten"),
    ("Diana"),
    ("Docentica"),
    ("Ekonomika"),
    ("Eoos"),
    ("Eros"),
    ("Farmaceutica"),
    ("Historia"),
    ("Industria"),
    ("Katechetika"),
    ("KLA"),
    ("LBK"),
    ("Mecenas"),
    ("Medica"),
    ("Medisoc"),
    ("Musicologica"),
    ("NFK"),
    ("Pedagogische Kring"),
    ("Politika"),
    ("Psychologische Kring"),
    ("Soca"),
    ("StEIL"),
    ("VRG"),
    ("VTK"),
    ("Wina"),
]

# Insert data into Runner table
for first_name, last_name, identification, faculty_id, registration_time, group_number, test_time, first_year in runners:
    cur.execute(
        sql.SQL('INSERT INTO "Runner" ("firstName", "lastName", "identification", "facultyId", "registrationTime", "groupNumber", "testTime", "firstYear") VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT ("identification") DO NOTHING'),
        [first_name, last_name, identification, faculty_id, registration_time, group_number, test_time, first_year]
    )

# Insert data into Group table
for group_number, group_name in groups:
    cur.execute(
        sql.SQL('INSERT INTO \"Group\" ("groupNumber", "groupName") VALUES (%s, %s) ON CONFLICT ("groupNumber") DO NOTHING'),
        [group_number, group_name]
    )

# Insert data into Faculty table
for name in kringen:
    cur.execute(
        sql.SQL('INSERT INTO "Kring" ("name") VALUES (%s) ON CONFLICT DO NOTHING'),
        [name]
    )

# Insert data into GlobalState table
cur.execute(
    sql.SQL('INSERT INTO "GlobalState" ("id", "raining") VALUES (1, false) ON CONFLICT DO NOTHING')
)

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Dummy data inserted successfully.")