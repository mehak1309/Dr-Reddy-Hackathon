from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, Security, SQLAlchemyUserDatastore

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    name = db.Column(db.String, nullable = False)
    email = db.Column(db.String, nullable = False, unique = True)
    password = db.Column(db.String, nullable = False)
    dob = db.Column(db.String, nullable = False)
    gender = db.Column(db.Integer, nullable = False) # 0: male, 1: female, 2: other
    location = db.Column(db.Integer, nullable = False)
    profile_pic = db.Column(db.String)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), nullable = False, unique = True)

user_datastore = SQLAlchemyUserDatastore(db, User, None)