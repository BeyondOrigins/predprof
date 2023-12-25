function onLogup() {
    let email = document.getElementById("email").value;
    let pwrd  = document.getElementById("pwrd").value;
    alert(email);
    let xhr = new XMLHttpRequest();
    xhr.open("/POST", "/logup", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.status != 200) {
            
        }
        else if (xhr.status == 200 && xhr.readyState == 4) {
            
        }
    };
}