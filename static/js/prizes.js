let prizes = { "promo1000": 1000, "promo2000": 2000, "promo3000": 3000 };
let modes = ["normal", "add-ship", "select-ship", "ship-ready", "add-prize"];

window.onload = () => {
    Array.prototype.forEach.call(document.getElementsByClassName("prize-container"), (e) => {
        e.onclick = showPrize;
    });
}

function showPrize(e) {
    let el = e.target.parentElement;
	let window = document.querySelector("#exampleModalToggle");
    window.classList.add("show");
    window.style = "display: block; padding-right: 15px;";
    window.ariaModal = true;
    window.role = "dialog";
    let background = document.createElement("div");
    background.id = "bkg-fade";
    background.classList.add("modal-backdrop", "fade", "show");
    console.log(el);
    document.body.appendChild(background);
    document.getElementsByName("prize-name")[0].innerHTML = el.getAttribute("name");
    document.querySelector(".prize-show-image").src = el.children[0].getAttribute("src");
    document.getElementsByName("prize-desc")[0].innerHTML = el.getAttribute("desc");
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

function filterPrizes(el) {
    let option = el.value;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/prizes", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    let body = JSON.stringify({"param" : option});
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let resp = JSON.parse(xhr.responseText);
            let mainContainer = document.querySelector(".container");
            mainContainer.innerHTML = "";
            for (const [key, prizes] of Object.entries(resp)) {
                let label = document.createElement("div");
                label.classList.add("filter-label");
                label.innerHTML = key;
                mainContainer.appendChild(label);
                let container = document.createElement("div");
                container.classList.add("prizes-container");
                prizes.forEach((e) => {
                    let prize_container = document.createElement("div");
                    prize_container.classList.add("prize-container");
                    prize_container.onclick = showPrize;
                    prize_container.setAttribute("name", e["name"]);
                    prize_container.setAttribute("desc", e["desc"]);
                    let img = new Image();
                    img.classList.add("prize-image");
                    img.src = e["path"];
                    prize_container.appendChild(img);
                    container.appendChild(prize_container);
                });
                mainContainer.appendChild(container);
            }
        }
    };
    xhr.send(body);
}
