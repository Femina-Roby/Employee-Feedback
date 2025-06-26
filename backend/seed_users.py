from models import SessionLocal, User
import uuid

db = SessionLocal()

manager_id = str(uuid.uuid4())
users = [
    User(
        id=manager_id,
        name="Manager One",
        email="manager@xyzcompany.com",
        role="manager"
    ),
    User(
        id=str(uuid.uuid4()),
        name="Employee One",
        email="employee1@xyzcompany.com",
        role="employee",
        manager_id=manager_id
    ),
    User(
        id=str(uuid.uuid4()),
        name="Employee Two",
        email="employee2@xyzcompany.com",
        role="employee",
        manager_id=manager_id
    ),
    User(
        id=str(uuid.uuid4()),
        name="Employee Three",
        email="employee3@xyzcompany.com",
        role="employee",
        manager_id=manager_id
    ),
]

db.add_all(users)
db.commit()
db.close()

print("✅ Users seeded successfully.")