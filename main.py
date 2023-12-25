from flask import Flask, render_template, request, render_template, jsonify, redirect
import jwt

app = Flask(__name__)

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