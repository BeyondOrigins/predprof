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


class Field(db.Model):
    __tablename__ = "field"
    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.Integer, nullable=False)
    ships = db.relationship("Ship", backref="filed", lazy=True)

    def __repr__(self):
        return f"<Field {self.id}>"


class Ship(db.Model):
    __tablename__ = "ship"
    id = db.Column(db.Integer, primary_key=True)
    pos_x = db.Column(db.Integer, nullable=False)
    pos_y = db.Column(db.Integer, nullable=False)
    size = db.Column(db.Integer, nullable=False)
    orientation = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f"<Ship {self.id}>"


class Prize(db.Model):
    __tablename__ = "prize"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    desc = db.Column(db.String, nullable=False)
    image = db.relationship("Image", backref="prize", uselist=False)

    def __repr__(self):
        return f"<Prize {self.id}>"


class Image(db.Model):
    __tablename__ = "image"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    mimetype = db.Column(db.String, nullable=False)
    image = db.Column(db.String, nullable=False)
    prize_id = db.Column(db.Integer, db.Foreignkey("prize.id"), nullable=False, unique=True)

    def __repr__(self):
        return f"<Image {self.id}>"
