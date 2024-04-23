var showCloseButton = true;

function receiveMessage(event) {
    var html = event.data;
    if (typeof html === 'string') {
        showCloseButton = false;
        insertCards(html);
    }
}

function insertCards(html) {
    // Remove all previous content
    (function waitForBody() {
        if (!document.body){
            requestAnimationFrame(waitForBody);
            return;
        }
        while (document.body.hasChildNodes()) {
            document.body.removeChild(document.body.lastChild);
        }
    
        // Create a div that holds all the received HTML
        var div = document.createElement("div");
        div.setAttribute("class", "output-container");
        div.id = "output-container";
        div.innerHTML = html;
    
        // Add the new div to the document
        document.body.appendChild(div);
    })();
}

window.addEventListener("message", receiveMessage, false);
setTimeout(function(){
    if (showCloseButton) {
        const btn = document.getElementById('close-button');
        if (btn) btn.style.display = 'block';
    }
}, 2000);
