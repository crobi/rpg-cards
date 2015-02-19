function receiveMessage(event) {
    var html = event.data;
    insertCards(html);
}

function insertCards(html) {
    document.body.innerHTML = html;
}

window.addEventListener("message", receiveMessage, false);