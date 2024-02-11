let prizes = { "promo1000": 1000, "promo2000": 2000, "promo3000": 3000 };
let modes = ["normal", "add-ship", "select-ship", "ship-ready", "add-prize"];
let elems = [];
let selected;

window.onload = () => {
    localStorage.setItem("data-mode", "normal");
    localStorage.setItem("cells", JSON.stringify([]));
    localStorage.setItem("prizes", JSON.stringify([]));
    localStorage.setItem("users", JSON.stringify({}));
    localStorage.setItem("x", "");
    localStorage.setItem("y", "");

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_info/" + document.querySelector(".field").getAttribute("data-id"), true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => { // to mark ships already placed
        if (xhr.readyState == 4 && xhr.status == 200) {
            let resp = JSON.parse(xhr.responseText);
            let ships = [];
            let prizes = resp["prizes"];
            let prizes_info = [];
            localStorage.setItem("cells", JSON.stringify(resp["cells"]));
            resp["cells"].forEach((e) => {
                let ship = [];
                e.forEach((cell) => {
                    let new_cell = getCellByCoord(cell["x"], cell["y"]);
                    new_cell.style = "background-color: var(--cell-ship)";
                    ship.push(new_cell);
                });
                ships.push(ship);
            });
            for (let i = 0; i < ships.length; ++i) {
                markCells(ships[i], false, true);
                let img = new Image(39, 39);
                img.src = prizes[i]["image"];
                ships[i][0].appendChild(img);
            }
            prizes.forEach((e) =>{
                prizes_info.push(e["type"]);
            });
            localStorage.setItem("prizes", JSON.stringify(prizes_info));
            localStorage.setItem("users", JSON.stringify(resp["users"]));
        }
    };
    xhr.send();

    Array.prototype.forEach.call(document.getElementsByClassName("cell"), (elem) => {
        elem.addEventListener("click", () => { // on cell click
            let mode = getMode();
            if (mode == "add-ship" && elem.getAttribute("occupied") != "true") { // select a start ship cell
                elem.style = "background-color: var(--cell-ship)";
                let button = document.querySelector("#add-ship");
                button.classList.add("disabled");
                button.disabled = true;
                localStorage.setItem("x", elem.getAttribute("x")); // x of selected cell
                localStorage.setItem("y", elem.getAttribute("y")); // y of selected cell
                setMode("select-ship");
                selected = elem;
            }
            else if (mode == "select-ship" && elem.getAttribute("occupied") != "true") { // confirm ship
                let cells_arr = JSON.parse(localStorage.getItem("cells"));
                let cells = [];
                elems.push(selected);
                elems.forEach((e) => {
                    cells.push({
                        "x": e.getAttribute("x"),
                        "y": e.getAttribute("y")
                    });
                });
                markCells(elems, false, true);
                cells_arr.push(cells);
                localStorage.setItem("cells", JSON.stringify(cells_arr));
                document.querySelector("#prize-select").disabled = false;
                setMode("add-prize");
            }
            else if (mode == "normal" && elem.getAttribute("occupied") == "true") { // delete ship
                let cells_arr = JSON.parse(localStorage.getItem("cells"));
                let cells = [], index;
                let cells_obj = [];
                find:
                for (let i = 0; i < cells_arr.length; ++i) {
                    for (let j = 0; j < cells_arr[i].length; ++j) {
                        if (cells_arr[i][j]["x"] == elem.getAttribute("x") && cells_arr[i][j]["y"] == elem.getAttribute("y")) {
                            cells = cells_arr[i];
                            index = i;
                            break find;
                        }
                    }
                }
                cells_arr.splice(index, 1);
                let new_prizes = JSON.parse(localStorage.getItem("prizes"));
                new_prizes.splice(index, 1);
                localStorage.setItem("prizes", JSON.stringify(new_prizes));
                localStorage.setItem("cells", JSON.stringify(cells_arr));
                cells.forEach((e) => {
                    let obj = getCellByCoord(e["x"], e["y"]);
                    cells_obj.push(obj);
                    obj.innerHTML = "";
                    obj.style = "background-color: var(--cell-empty)";
                });
                markCells(cells_obj, false, false);
            }
        });
        elem.addEventListener("mouseover", () => {
            let selectedX = Number(localStorage.getItem("x"));
            let hoverX = Number(elem.getAttribute("x"));
            let selectedY = Number(localStorage.getItem("y"));
            let hoverY = Number(elem.getAttribute("y"));
            if (getMode() == "select-ship" && elem.getAttribute("occupied") != "true") { // if a cell was selected
                elems.forEach((e) => {
                    if ((e.getAttribute("x") != selectedX || e.getAttribute("y") != selectedY) && e.getAttribute("occupied") != "true") {
                        e.style = "background-color: var(--cell-empty)";
                        e.setAttribute("selected", false);
                    }
                });
                elems = [];
                if (hoverY == selectedY) {
                    let children = elem.parentElement.children;
                    for (let i = 0; i < children.length; ++i) {
                        let e = children[i];
                        let thisX = Number(e.getAttribute("x"));
                        if ((thisX > hoverX && thisX < selectedX || thisX < hoverX && thisX > selectedX) && Math.abs(selectedX - thisX) <= 3) {
                            elems.push(e);
                            if (e.getAttribute("occupied") == "true") {
                                elems = [];
                                break;
                            }
                        }
                    }
                    if (Math.abs(selectedX - hoverX) <= 3) {
                        elems.push(elem);
                    }
                }
                else if (hoverX == selectedX) {
                    let children = document.getElementsByClassName("cell");
                    for (let i = 0; i < children.length; ++i) {
                        let e = children[i];
                        let thisX = Number(e.getAttribute("x"));
                        let thisY = Number(e.getAttribute("y"));
                        if (thisX == hoverX && (thisY > hoverY && thisY < selectedY || thisY < hoverY && thisY > selectedY) && Math.abs(selectedY - thisY) <= 3) {
                            elems.push(e);
                            if (e.getAttribute("occupied") == "true") {
                                elems = [];
                                break;
                            }
                        }
                    }
                    if (Math.abs(selectedY - hoverY) <= 3) {
                        elems.push(elem);
                    }
                }
                elems.forEach((el) => {
                    el.setAttribute("selected", true);
                    el.style = "background-color: var(--cell-ship)";
                });
            }
        });   
    });
};

function setMode(mode) { // change edition mode
    if (modes.includes(mode)) {
        localStorage.setItem("data-mode", mode);
        document.documentElement.setAttribute("data-mode", mode);
        document.querySelector(".button-cancel").disabled = mode != "add-prize";
        document.querySelector("#add-ship").disabled = mode != "normal";
        document.querySelector("#prize-select").disabled = mode != "add-prize";
        document.querySelector("#confirm").disabled = mode != "normal";
    }
    if (mode == "add-prize") {
        document.querySelector(".button-cancel").classList.remove("disabled");
        document.querySelector("#prize-select").classList.remove("disabled");
    }
    else {
        document.querySelector(".button-cancel").classList.add("disabled");
        document.querySelector("#prize-select").classList.remove("disabled");
    }
    if (mode != "normal") {
        document.querySelector("#add-ship").classList.add("disabled");
        document.querySelector("#confirm").classList.add("disabled");
    }
    else {
        document.querySelector("#add-ship").classList.remove("disabled");
        document.querySelector("#confirm").classList.remove("disabled");
    }
}

function onFieldCreation() {
    let cells = JSON.parse(localStorage.getItem("cells"));
    let prizes = JSON.parse(localStorage.getItem("prizes"));
    let users = JSON.parse(localStorage.getItem("users"));
    if (cells.length && prizes.length) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/edit_field", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        let body = JSON.stringify({
            "id" : Number(document.querySelector(".field").getAttribute("data-id")),
            "cells": cells,
            "prizes": prizes,
            "users" : users
        });
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4 && xhr.status != 200) { // if there is an error

            }
            else if (xhr.readyState == 4 && xhr.status == 200) { // if everything is fine
                window.location.reload();
            }
        };
        xhr.send(body);
    }
    else {
        alert("Добавьте хотя бы один корабль!");
    }
}

function onAddUserButtonClick() {
    let window = document.querySelector("#exampleModalToggle");
    window.classList.add("show");
    window.style = "display: block; padding-right: 15px;";
    window.ariaModal = true;
    window.role = "dialog";
    let background = document.createElement("div");
    background.id = "bkg-fade";
    background.classList.add("modal-backdrop", "fade", "show");
    document.body.appendChild(background);
    document.body.style = "background-color: rgb(39, 42, 49); overflow: hidden;"
    document.querySelector(".btn-close").onclick = function () {
        window.classList.remove("show");
        window.style = "display: none;";
        window.style.paddingRight = "";
        window.ariaModal = false;
        window.role = "";
        document.getElementById("bkg-fade").remove();
        document.body.style = "background-color:#272A31";
    }
}

function showPrizes() {
    let prizes = JSON.parse(localStorage.getItem("prizes"));
    
}

function addUser() {
    let id = document.getElementsByName("user-id")[0].value;
    let shots = document.getElementsByName("shots")[0].value;
    if (isNaN(id) || isNaN(shots)) {
        document.querySelector("#error").innerHTML = "ID и количество выстрелов должны быть целыми числами";
    }
    else {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/check_user", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        let body = JSON.stringify({ "id": Number(id) });
        let error = document.querySelector("#error");
        xhr.onreadystatechange = () => {
            if (xhr.status != 200 && xhr.readyState != 4) {
                error.innerHTML = JSON.parse(xhr.responseText)["message"];
                error.style.color = "var(--text-error-color)";
            }
            else if (xhr.status == 200 && xhr.readyState == 4) {
                document.getElementsByName("user-id")[0].value = "";
                document.getElementsByName("shots")[0].value = "";
                if (!JSON.parse(xhr.responseText)["status"]) {
                    let users = JSON.parse(localStorage.getItem("users"));
                    users[id] = Number(shots);
                    localStorage.setItem("users", JSON.stringify(users));
                    error.style.color = "var(--text-success-color)";
                    error.innerHTML = "Пользоваель успешно добавлен";
                    console.log(JSON.parse(localStorage.getItem("users")));
                }
                else {
                    error.style.color = "var(--text-error-color)";
                    error.innerHTML = "Вы не можете добавлять администратора на поле";
                }
            }
        };
        xhr.send(body);
    }
}

function selectPrize(el) { // assign prize to ship
    let value = el.value;
    if (getMode() == "add-prize" && value != "0") {
        let prize = document.createElement("div");
        let image_path = "/static/styles/images/" + value + ".png";
        let img = new Image(39, 39);
        img.src = image_path;
        prize.appendChild(img);
        prize.setAttribute("type", value);
        selected.appendChild(prize);
        let prizes_arr = JSON.parse(localStorage.getItem("prizes"));
        prizes_arr.push(value);
        localStorage.setItem("prizes", JSON.stringify(prizes_arr));
        setMode("normal");
        el.value = "0";
        elems = [];
    }
}

function cancelAddition() {
    elems.forEach((e) => {
        e.style = "background-color: var(--cell-empty)";
    });
    markCells(elems, false, false);
    let cells = JSON.parse(localStorage.getItem("cells"));
    cells.pop();
    localStorage.setItem("cells", JSON.stringify(cells));
    setMode("normal");
}

function markCells(cells, selected, occupied) {
    let maxX = -1;
    let minX = 100;
    let maxY = -1;
    let minY = 100;
    cells.forEach((e) => {
        let thisX = Number(e.getAttribute("x"));
        let thisY = Number(e.getAttribute("y"));
        if (thisX > maxX) maxX = thisX;
        if (thisX < minX) minX = thisX;
        if (thisY > maxY) maxY = thisY;
        if (thisY < minY) minY = thisY;
    });
    Array.prototype.forEach.call(document.getElementsByClassName("cell"), (e) => {
        let thisX = Number(e.getAttribute("x"));
        let thisY = Number(e.getAttribute("y"));
        if (thisX >= minX - 1 && thisX <= maxX + 1 && thisY >= minY - 1 && thisY <= maxY + 1) {
            e.setAttribute("selected", selected);
            if (occupied) {
                e.setAttribute("owned", Number(e.getAttribute("owned")) + 1);
                e.setAttribute("occupied", true);
            }
            else {
                if (Number(e.getAttribute("owned")) > 1) {
                    e.setAttribute("owned", Number(e.getAttribute("owned")) - 1);
                }
                else {
                    e.setAttribute("occupied", false);
                    e.setAttribute("owned", 0);
                }
            }
        }
    });
}

function getCellByCoord(x, y) {
    let res;
    Array.prototype.every.call(document.getElementsByClassName("cell"), (e) => {
        if (Number(e.getAttribute("x")) == Number(x) && Number(e.getAttribute("y")) == Number(y)) {
            res = e;
            return false;
        }
        return true;
    });
    return res;
}

function getMode() { // get edition mode
    let mode = localStorage.getItem("data-mode");
    if (document.documentElement.getAttribute("data-mode") != mode) {
        document.documentElement.setAttribute("data-mode", mode);
    }
    return mode;
}

function onCreateButtonClick() {
    setMode("add-ship");
}
