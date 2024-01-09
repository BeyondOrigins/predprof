from db import db
from flask_sqlalchemy import *

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<User {self.id}>"


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<Admin {self.id}>"


class Fields(db.Model):
    __tablename__ = "field"
    size = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Field {self.id}>"


class Prize(db.Model):
    __tablename__ = "prize"
    name = db.Column(db.String, nullable=False)
    desc = db.Column(db.String, nullable=False)
    image = db.relationship("Image", backref="prize", lazy=True)

    def __repr__(self):
        return f"<Prize {self.id}>"


class Image(db.Model):
    __tablename__ = "image"
    name = db.Column(db.String, nullable=False)
    mimetype = db.Column(db.String, nullable=False)
    image = db.Column(db.String, nullable=False)
    prize_id = db.Column(db.Integer, db.Foreignkey("prize.id"), nullable=False)

    def __repr__(self):
        return f"<Image {self.id}>"
