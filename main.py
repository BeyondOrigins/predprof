from flask import Flask, render_template, request, render_template, jsonify, redirect, session, Response
from flask_login import LoginManager, login_required
from flask_login import logout_user, login_user, current_user
from models import *
from db import db_init
from UserLogin import UserLogin
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from functools import wraps
import json
from config import *

app = Flask(__name__)
login_manager = LoginManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
app.config["SECRET_KEY"] = "qlzhboqngoqk"

db_init(app)

def is_admin():
    if User.query.get(current_user.get_id()).is_admin:
        return True
    return False

def admin_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if is_admin(): 
            return f(*args, *kwargs)
        return redirect("/")
    return decorated_function

def user_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_admin(): 
            return f(*args, *kwargs)
        return redirect("/")
    return decorated_function

@login_manager.user_loader
def load_user(user_id : int):
    return UserLogin().fromDB(user_id, User)

@app.route("/", methods=["GET"]) # main page
def main_page():
    return render_template("index.html")

@app.route("/logup", methods=["POST"]) # create new account
def logup():
    data = request.get_json()
    password = data.get("password")
    login = data.get("login")
    is_admin = data.get("is_admin")
    code = data.get("code")
    if len(User.query.filter_by(login=login).all()) != 0:
        return jsonify({"message" : "Этот логин уже используется"}), 401
    if is_admin and code != CODE:
        return jsonify({"message" : "Неверный код администратора"}), 401
    if len(password) >= 8:
        user = User(login=login, password=generate_password_hash(data.get("password")), is_admin=is_admin)
        db.session.add(user)
        db.session.commit()
        return jsonify({"message" : "Успешная регистрация"}), 200
    else:
        return jsonify({"message" : "Пароль должен быть длиной от 8 символов"}), 401

@app.route("/auth", methods=["POST"]) # authenticate
def auth():
    data = request.get_json()
    login = data.get("login")
    password = data.get("password")
    try:
        user = User.query.filter_by(login=login).first()
        if check_password_hash(user.password, password):
            user_login = UserLogin().create(user)
            login_user(user_login)
            return jsonify({"message" : "Вход выполнен успешно"}), 200
        return jsonify({"message" : "Неверный логин или пароль"}), 401
    except:
        return jsonify({"message" : "Неверный логин или пароль"}), 401

@app.route("/game/<int:field_id>", methods=["GET"]) # game page
@login_required
def game_page(field_id):
    field = Field.query.get(field_id)
    user_id = current_user.get_id()
    if field is None or user_id not in json.loads(field.users) and not is_admin():
        return redirect("/fields")
    cells = Cell.query.filter_by(field_id=field_id)
    rows = []
    size = field.size

    for i in range(size):
        row = []
        for j in range(size):
            row.append(cells[size*i+j].__dict__)
        rows.append(row)
    return render_template("game.html", rows=rows, cells=cells)

@app.route("/game", methods=["POST"]) # post request handler for /game
@login_required
def game_post():
    data = request.get_json() # get data from request
    cell_id = data.get("cell_id") # get cell_id
    cell = Cell.query.get(cell_id)
    user_id = current_user.get_id()
    field = Field.query.get(cell.field_id)
    users_data = json.loads(field.users)
    if is_admin(): 
        return jsonify({"message" : "Администратор не может участвовать в игре!"}), 406
    if users_data.get(user_id) == 0:
        return jsonify({"message" : "У вас нет выстрелов!"}), 406
    if cell.shot_by != 0:
        return jsonify({"message" : "Эта клетка уже прострелена"}), 406
    users_data[user_id] -= 1
    cell.shot_by = current_user.get_id()
    field.users = json.dumps(users_data)
    db.session.commit()
    status = cell.ship_id != 0
    body = {"cell_id" : cell_id, "status" : status}
    if status:
        ship_cells = Cell.query.filter_by(ship_id=cell.ship_id)
        if all(x.shot_by != 0 for x in ship_cells):
            prize = Prize.query.get(Ship.query.get(cell.ship_id).prize_id)
            prize.got_by = current_user.get_id()
            db.session.commit()
            prize_info = prize.__dict__
            del prize_info["_sa_instance_state"]
            body["prize"] = prize_info
    return jsonify(body), 200

@app.route("/create_field", methods=["GET"]) # create field page
@login_required
@admin_only
def create_field_page():
    return render_template("game_add.html")

@app.route("/create_field", methods=["POST"]) # post request handler for /create_field
@login_required
@admin_only
def create_field():
    try:
        data = request.get_json()
        ships_data = data.get("cells")
        prizes_data = data.get("prizes")
        size = int(data.get("size"))
        cells = []
        field = Field( # create field
            size=size,
            users=json.dumps({})
        )
        db.session.add(field)
        db.session.commit()
        for y in range(size): # create cells
            row = []
            for x in range(size):
                row.append(Cell(
                    field_id=field.id,
                    x=x,
                    y=y,
                    ship_id=0,
                    shot_by=0
                ))
                db.session.add(row[-1])
            cells.append(row)
        ships = []
        for i in range(len(ships_data)): # create ships and prizes
            prize = Prize(
                name=PRIZES_INFO[prizes_data[i]]["name"],
                desc=PRIZES_INFO[prizes_data[i]]["desc"],
                type=prizes_data[i],
                got_by=0
            )
            db.session.add(prize)
            db.session.commit()
            ship = Ship(
                field_id=field.id,
                prize_id=prize.id
            )
            ships.append(ship)
            db.session.add(ship)
            db.session.commit()
        for ship in ships_data: # set ship_id for cells
            for cell in ship:
                cells[int(cell.get("y"))][int(cell.get("x"))].ship_id = ships[ships_data.index(ship)].id
        field.users = json.dumps(data.get("users"))
        db.session.commit()
        return jsonify({"message" : "ok"}), 200
    except:
        return jsonify({"message" : "error"}), 400

@app.route("/edit_field/<int:field_id>", methods=["GET"]) # get field edition page
@login_required
def edit_field_page(field_id):
    field = Field.query.get(int(field_id))
    if not User.query.get(current_user.get_id()).is_admin or not field:
        return redirect("/fields")
    cells = []
    for y in range(field.size):
        row = []
        for x in range(field.size):
            row.append({"x" : x, "y" : y})
        cells.append(row)
    return render_template("edit_field.html", field=cells, id=field.id)

@app.route("/get_info/<int:field_id>", methods=["GET"]) # get field info
@login_required
def get_field_info(field_id):
    field = Field.query.get(int(field_id))
    if not User.query.get(current_user.get_id()).is_admin or not field:
        return jsonify({"message" : "error"}), 406
    ships = Ship.query.filter_by(field_id=field_id)
    ships_info = []
    prizes_info = []
    for ship in ships:
        cells = Cell.query.filter_by(ship_id=ship.id)
        info = [{"x" : cell.x, "y" : cell.y} for cell in cells]
        prize_type = Prize.query.get(ship.prize_id).type
        prize = {"image" : PRIZES_INFO[prize_type]["image"], "type" : prize_type}
        prizes_info.append(prize)
        ships_info.append(info)
    info = {
        "cells" : ships_info,
        "prizes" : prizes_info
    }
    return jsonify(info), 200

@app.route("/edit_field", methods=["POST"])
@login_required
@admin_only
def edit_field():
    # try:
        data = request.get_json()
        ships_data = data.get("cells")
        prizes_data = data.get("prizes")
        field = Field.query.get(data.get("id"))
        size = field.size
        cells = Cell.query.filter_by(field_id=field.id)
        ships = Ship.query.filter_by(field_id=field.id)
        prizes = [Prize.query.get(ship.prize_id) for ship in ships]
        for ship in ships:
            db.session.delete(ship)
        for prize in prizes:
            db.session.delete(prize)
        for cell in cells:
            db.session.delete(cell)
        db.session.commit()
        ships = []
        prizes = []
        cells = []
        for y in range(size): # create cells
            row = []
            for x in range(size):
                row.append(Cell(
                    field_id=field.id,
                    x=x,
                    y=y,
                    ship_id=0,
                    shot_by=0
                ))
                db.session.add(row[-1])
            cells.append(row)
        for i in range(len(ships_data)): # create ships and prizes
            prize = Prize(
                name=PRIZES_INFO[prizes_data[i]]["name"],
                desc=PRIZES_INFO[prizes_data[i]]["desc"],
                type=prizes_data[i],
                got_by=0
            )
            db.session.add(prize)
            db.session.commit()
            ship = Ship(
                field_id=field.id,
                prize_id=prize.id
            )
            ships.append(ship)
            db.session.add(ship)
            db.session.commit()
        for ship in ships_data: # set ship_id for cells
            for cell in ship:
                cells[int(cell.get("y"))][int(cell.get("x"))].ship_id = ships[ships_data.index(ship)].id
        field.users = json.dumps(data.get("users"))
        db.session.commit()
        return jsonify({"message" : "ok"}), 200
    # except:
    #     return jsonify({"message" : "error"}), 400

@app.route("/delete_field", methods=["DELETE"])
@login_required
@admin_only
def delete_field():
    field = Field.query.get(request.get_json().get("id"))
    cells = Cell.query.filter_by(field_id=field.id)
    ships = Ship.query.filter_by(field_id=field.id)
    if not any(not cell.shot_by for cell in cells):
        return jsonify({"message" : "Редактирование поля запрещено."}), 406
    else:
        for cell in cells: db.session.delete(cell)
        for ship in ships: db.session.delete(ship)
        db.session.delete(field)
        db.session.commit()
        return jsonify({"message" : "ok"}), 200

@app.route("/check_user", methods=["POST"])
@login_required
@admin_only
def check_user():
    data = request.get_json()
    user_id = data.get("id")
    try:
        user = User.query.get(int(user_id))
        return jsonify({"status" : user.is_admin}), 200
    except:
        return jsonify({"message" : "Пользователя с таким id не существует!"}), 406

@app.route("/fields", methods=["GET"])
@login_required
def fields_page():
    fields_all = Field.query.all()
    fields = []
    if User.query.get(current_user.get_id()).is_admin:
        fields = fields_all
    else:
        for field in fields_all:
            if current_user.get_id() in json.loads(field.users):
                fields.append(field.__dict__)
    return render_template("fields.html", fields=fields, is_admin=User.query.get(current_user.get_id()).is_admin)

@app.route("/prizes", methods=["GET"])
@login_required
@user_only
def prizes():
    prizes_all = Prize.query.filter_by(got_by=current_user.get_id())
    prizes = []
    for prize in prizes_all:
        data = prize.__dict__
        data["path"] = PRIZES_INFO[prize.type]["image"]
        prizes.append(data)
    return render_template("prizes.html", prizes=prizes)

@app.errorhandler(401)
def auth_error(error):
    return redirect("/")

@app.errorhandler(500)
def server_error(error):
    return redirect("/")

app.run("0.0.0.0", debug=True)
