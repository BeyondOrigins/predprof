let prizes = { "promo1000": 1000, "promo2000": 2000, "promo3000": 3000 };
let modes = ["normal", "add-ship", "select-ship", "ship-ready", "add-prize"];

function showPrize(el) {
	let window = document.querySelector("#exampleModalToggle");
    window.classList.add("show");
    window.style = "display: block; padding-right: 15px;";
    window.ariaModal = true;
    window.role = "dialog";
    let background = document.createElement("div");
    background.id = "bkg-fade";
    background.classList.add("modal-backdrop", "fade", "show");
    document.body.appendChild(background);
    document.getElementsByName("prize-name")[0].value = el.getAttribute("name");
    document.querySelector(".prize-show-image").src = el.children[0].getAttribute("src");
    document.getElementsByName("prize-desc")[0].value = el.getAttribute("desc");
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
