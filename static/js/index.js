function onLogup() {
    let login = document.getElementsByName("logup-login")[0].value;
    let password = document.getElementsByName("logup-password")[0].value;
    let passwordRepeat = document.getElementsByName("logup-password-repeat")[0].value;
    let isAdmin = document.getElementById("admin").checked;
    let adminCode = document.getElementById("Form").value;

    let error = document.getElementById("logup-error");

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/logup", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        let resp = JSON.parse(xhr.responseText)["message"];
        if (xhr.status != 200 && xhr.readyState != 4) { // if logup is failed
            error.innerHTML = resp;
            error.style.color = "var(--text-error-color)";
        }
        else if (xhr.status == 200 && xhr.readyState == 4) { // if everything is ok
            error.innerHTML = resp;
            error.style.color = "var(--text-success-color)";
        }
    };
    let body = JSON.stringify({
        "login": login,
        "password": password,
        "is_admin" : isAdmin,
        "code" : adminCode
    });
    if (password === passwordRepeat && login != "") {
        xhr.send(body);
    }
}

function onLogin() {
    let login = document.getElementsByName("login-login")[0].value;
    let password = document.getElementsByName("login-password")[0].value;
    let error = document.getElementById("login-error");
    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/auth", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.status != 200) {
            error.innerHTML = JSON.parse(xhr.responseText)["message"];
            error.style.color = "var(--text-error-color)";
        }
        else if (xhr.status == 200 && xhr.readyState == 4) {
            error.innerHTML = JSON.parse(xhr.responseText)["message"];
            error.style.color = "var(--text-success-color)";
            location.href = "/fields";
        }
    };

    let body = JSON.stringify({
        "login": login,
        "password": password
    });
    if (login != "" && password != "") {
        xhr.send(body);
    }
}

function handlePassword() {
    let password = document.getElementsByName("logup-password")[0].value;
    let passwordRepeat = document.getElementsByName("logup-password-repeat")[0].value;

    let error = document.getElementById("logup-error");

    if (password !== passwordRepeat && passwordRepeat != "") {
        error.innerHTML = "Пароли должны совпадать";
        error.style.color = "var(--text-error-color)";
    }
    else {
        error.innerHTML = "";
    }
}