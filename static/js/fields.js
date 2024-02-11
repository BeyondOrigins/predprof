function redirectToField(el) {
	console.log("gg");
	location.href = "/game/" + el.getAttribute("data-id");
}

function deleteField(el) {
	let id = el.parentElement.children[0].getAttribute("data-id");
	let xhr = new XMLHttpRequest();
	xhr.open("DELETE", "/delete_field", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	let body = JSON.stringify({"id" : id});
	xhr.onreadystatechange = () => {
		if (xhr.status != 200 && xhr.readyState != 4) {
			alert(JSON.parse(xhr.responseText)["message"]);
        }
        else if (xhr.status == 200 && xhr.readyState == 4) {
        	location.reload();
        	alert("Поле успешно удалено");
        }
	};
	xhr.send(body);
}

function editField(id) {
	location.href = "/edit_field/" + id;
}
