function ui_generate() {
    // Generate output HTML
    var card_html = card_pages_generate_html(card_data);

    // Open a new window for the output
    // Use a separate window to avoid CSS conflicts
    var tab = window.open("output.html", 'rpg-cards-output');

    // Send the generated HTML to the new window
    // Use a delay to give the new window time to set up a message listener
    setTimeout(function () { tab.postMessage(card_html, '*') }, 100);
}

function ui_load_sample() {
    card_data = card_data_example;
}

function ui_clear_all() {
    card_data = [];
}

function ui_load_files(evt) {
    ui_clear_all();

    var files = evt.target.files;

    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        reader.onload = function (reader) {
            var data = JSON.parse(this.result);
            card_data = card_data.concat(data);
        };

        reader.readAsText(f);
    }
}

function ui_save_file() {
    var str = JSON.stringify(card_data, null, "  ");
    var parts = [str];
    var blob = new Blob(parts, { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = $("#file-save-link")[0];
    a.href = url;
    a.download = "rpg_cards.json";
    a.click();

    URL.revokeObjectURL(url);
}

$(document).ready(function () {
    $("#button-generate").click(ui_generate);
    $("#button-load").click(function () { $("#file-load").click(); });
    $("#file-load").change(ui_load_files);
    $("#button-load-sample").click(ui_load_sample);
    $("#button-save").click(ui_save_file);
});


