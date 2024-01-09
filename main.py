from flask import Flask, render_template, request, render_template, jsonify, redirect
from flask_login import LoginManager, login_required
from flask_login import logout_user, login_user
from models import *
from db import db_init
from UserLogin import UserLogin

app = Flask(__name__)
login_manager = LoginManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
app.config["SECRET_KEY"] = "gityihkgoerp"

db_init(app)

@login_manager.user_loader
def load_user(user_id : int):
    return UserLogin().fromDB(user_id, User)

@app.route("/", methods=["GET"])
def main_page():
    return render_template("index.html")

@app.route("/logup", methods=["GET"])
def logup_get():
    return render_template("logup.html")

@app.route("/logup", methods=["POST"])
def logup_post():
    data = request.get_json()

app.run("0.0.0.0", debug=True)