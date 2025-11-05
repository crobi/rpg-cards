// Ugly global variable holding the current card deck
var card_data = [];
var card_options = default_card_options();
var app_settings = default_app_settings();

function default_app_settings() {
    return {
        defaultFileName: 'rpg_cards',
        currentFileName: 'rpg_cards',
        browserAsksWhereSave: false,
        openSaveDialog: false,
        showDownloadSettings: true,
        page_zoom_keep_ratio: true
    }
}

function mergeSort(arr, compare) {
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);

    return merge(mergeSort(left, compare), mergeSort(right, compare), compare);
}

function merge(left, right, compare) {
    var result = [];

    while (left.length && right.length) {
        if (compare(left[0], right[0]) <= 0) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

function swapInputValues(e1, e2) {
    const $e1 = $(e1);
    const $e2 = $(e2);
    const v1 = $e1.val();
    const v2 = $e2.val();
    $e1.val(v2);
    $e2.val(v1);
    return $([$e1, $e2]);
}

function ui_generate() {
    if (card_data.length === 0) {
        alert("Your deck is empty. Please define some cards first, or load the sample deck.");
        return;
    }

    // Generate output HTML
    var card_html = card_pages_generate_html(card_data, card_options);

    // Open a new window for the output
    // Use a separate window to avoid CSS conflicts
    var tab = window.open("output.html", 'rpg-cards-output');

    if (!tab || tab.closed || typeof tab.closed === 'undefined') {
        alert(`It looks like your browser blocked the popup window. Please allow popups for this site to continue.`)
    }

    // Send the generated HTML to the new window
    // Use a delay to give the new window time to set up a message listener
    setTimeout(function () { tab.postMessage(card_html, '*'); }, 500);
}

function ui_load_sample() {
    // card_data = card_data_example;
    // ui_init_cards(card_data);
    // ui_update_card_list();
    const firstAddedCardIndex = card_data.length;
    ui_add_cards(card_data_example);
    ui_select_card_by_index(firstAddedCardIndex);
}

function ui_clear_all() {
    if (!card_data.length) {
        return true;
    }
    const proceed = document.getElementById('ask-before-delete').checked ? confirm('Delete all cards?') : true;
    if (proceed) {
        card_data = [];
        ui_update_card_list();
        $('#file-name').val(app_settings.defaultFileName).trigger('change');
    }
    return proceed;
}

function ui_load_files(evt) {
    // ui_clear_all();
    const target = evt.target;
    const files = target.files;
    const isOpening = Boolean(Number(evt.target.getAttribute('data-opening')));
    const firstAddedCardIndex = card_data.length;

    for (let i = 0; i < files.length; i++) {
        let f = files[i];
        const reader = new FileReader();

        reader.onload = function () {
            const result = (this.result || '').trim();
            if (!result) {
                showToast(`The file ${f.name} is empty.`);
                return;
            }
            try {
                const data = JSON.parse(result);
                const newData = legacy_card_data(data);
                ui_add_cards(newData);
                if (isOpening) {
                    $('#file-name').val(f.name.replace(/\.[^/.]+$/, '')).change();
                } else {
                    ui_select_card_by_index(firstAddedCardIndex);
                }
            } catch (err) {
                console.error(`Error parsing ${f.name}:`, err);
                showToast(`Error parsing ${f.name}:`, 'danger');
            }
        };

        reader.readAsText(f);
    }

    // Reset file input
    $("#file-load-form")[0].reset();
}

function ui_init_cards(data) {
    return legacy_card_data(data);
}

function ui_add_cards(data) {
    const newData = ui_init_cards(data);
    card_data = card_data.concat(newData);
    ui_update_card_list();
    ui_select_card_by_index(0);
    $("#collapseDeck").collapse('toggle');
}

function ui_add_new_card() {
    card_data.push(legacy_card_data([{
        ...default_card_data(),
        icon_back_container: card_options.default_icon_back_container 
    }])[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_duplicate_card() {
    var old_card = ui_selected_card();
    if (old_card && card_data.length > 0) {
        var new_card = $.extend({}, old_card);
        card_data.push(new_card);
        new_card.title = new_card.title + " (Copy)";
        new_card.uuid = crypto.randomUUID();
    } else {
        card_data.push({
        ...default_card_data(),
        uuid: crypto.randomUUID(),
        icon_back_container: card_options.default_icon_back_container 
    });
    }
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_copy_card() {
    const card = ui_selected_card();
    if (card && card_data.length > 0) {
        navigator.clipboard.writeText(JSON.stringify(card, null, 2)).then(function() {
            showToast('Card "' + card.title + '" was copied to the clipboard');
        }, function() {
            showToast('Failure to copy: Check permissions for clipboard or try with another browser');
        });
    }
}

function ui_copy_all_cards() {
    navigator.clipboard.writeText(JSON.stringify(card_data, null, 2)).then(function() {
        showToast('All cards were copied to the clipboard');
    }, function() {
        showToast('Failure to copy: Check permissions for clipboard or try with another browser');
    });
}

function ui_paste_card() {
    navigator.clipboard.readText().then(function(s) {
        try {
            const prev_data_length = card_data.length;
            const pasted_content = JSON.parse(s);
            const content = Array.isArray(pasted_content) ? pasted_content : [pasted_content];
            content.forEach(c => {
                c.uuid = crypto.randomUUID();
                c.title += " (Pasted)";
                card_data.push(c);
            });
            ui_update_card_list();
            ui_select_card_by_index(prev_data_length);
        } catch (e) {
            alert('Could not paste clipboard as card or list of cards.\n' + e);
        }
    }, function() {
        alert('Failure to paste: Check permissions for clipboard or try with another browser')
    })
}

function ui_select_card_by_index(index) {
    $(`#deck-cards-list .radio:nth-child(${index + 1}) input[type="radio"]`).prop('checked', true);
    ui_update_selected_card();
}

function ui_selected_card_index() {
    const $checkedInput = $('#deck-cards-list input[type="radio"]:checked');
    if (!$checkedInput) return -1;
    return $checkedInput.closest('.radio').index();
}

function ui_selected_card() {
    return card_data[ui_selected_card_index()];
}

function ui_delete_card() {
    var index = ui_selected_card_index();
    if (index === -1) return;
    const proceed = document.getElementById('ask-before-delete').checked ? confirm('Delete ' + card_data[index].title + '?') : true;
    if (!proceed) return;
    card_data.splice(index, 1);
    ui_update_card_list();
    ui_select_card_by_index(Math.min(index, card_data.length - 1));
}

const ui_deck_option_text = (card) => {
    return `${card.count}x ${card.title}`;
}

function ui_update_card_list() {
    $("#total-card-count").text(`Contains ${card_data.length} unique cards, ${card_data.reduce((result, card) => {
        return result + (card?.count || 1) * 1;
    }, 0)} in total.`);

    const $deck = $('#deck-cards-list');

    $deck.children().each(function() {
        const option = this;
        if (!card_data.find(card => card.uuid === option.getAttribute('data-uuid'))) option.remove();
    });

    let i = card_data.length;

    while (i--) {
        var card = card_data[i];
        $option = $deck.find(`[data-uuid="${card.uuid}"]`);
        if (!$option.length) {
            $deck.prepend(`<div class="radio" data-uuid="${card.uuid}"><label><input type="radio" name="deck-option" value="${i}"> <span class="text">${ui_deck_option_text(card)}</span></label></div>`);
        } else if ($option.index() === i) {
            $option.find('.text').text(ui_deck_option_text(card));
        } else {
            $option.find('.text').text(ui_deck_option_text(card));
            $deck.prepend($option.detach());
        }
    }

    ui_update_selected_card();
}

async function ui_save_file() {
    const jsonString = JSON.stringify(card_data, null, "  ");
    let filename = app_settings.currentFileName;
    
    if (window.showSaveFilePicker) {
        if (app_settings.openSaveDialog) {
            if (!app_settings.browserAsksWhereSave) {
                try {
                    const options = {
                        suggestedName: app_settings.currentFileName + '.json',
                        types: [{
                        description: 'File JSON',
                        accept: { 'application/json': ['.json'] }
                        }]
                    };

                    const handle = await showSaveFilePicker(options);
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') {
                        return;
                    }
                    console.error(err);
                }
            }
        }
    }

    const parts = [jsonString];
    const blob = new Blob(parts, { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = $("#file-save-link")[0];
    a.href = url;
    if (filename) {
        a.download = filename 
        ui_save_file_filename = filename;
        a.click();
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

function ui_update_selected_card() {
    var card = ui_selected_card();
    if (card) {
        $("#card-title").val(card.title);
        $("#card-type").val(card.card_type);
        $("#card-title-size").val(card.title_size);
        $("#card-font-size").val(card.card_font_size);
        $("#card-count").val(card.count);
        $("#card-icon-front").val(card.icon_front);
        $("#card-icon-back").val(card.icon_back);
        $("#card-icon-back-container").val(card.icon_back_container);
        $("#card-icon-back-rotation").val(card.icon_back_rotation);
		$("#card-background").val(card.background_image);
        $("#card-contents").val(card.contents?.join("\n"));
        $("#card-tags").val(card.tags.join(", "));
        $("#card-color-front").val(card.color_front).change();
        $("#card-color-back").val(card.color_back).change();
    } else {
        $("#card-title").val("");
        $("#card-type").val("");
        $("#card-title-size").val("");
        $("#card-font-size").val("");
        $("#card-count").val(1);
        $("#card-icon-front").val("");
        $("#card-icon-back").val("");
        $("#card-icon-back-container").val(card_options.default_icon_back_container);
        $("#card-icon-back-rotation").val("");
		$("#card-background").val("");
        $("#card-contents").val("");
        $("#card-tags").val("");
        $("#card-color-front").val("").change();
        $("#card-color-back").val("").change();
    }

    ui_render_selected_card();
    ui_update_card_actions();
}

function ui_filter_selected_card_title() {
    const filterInput = document.querySelector('#deck-cards-list-title-filter');
    const filterValue = filterInput.value;
    const re = new RegExp(filterValue, 'i');
    const clearButton = filterInput.parentElement.querySelector('button');
    const clearButtonLabel = clearButton.querySelector('span');
    clearButton.disabled = !filterValue;
    clearButtonLabel.style.visibility = filterValue ? '' : 'hidden';
    document.querySelectorAll('#deck-cards-list .radio').forEach(option => {
        option.style.display = re.test(option.textContent) ? '' : 'none';
    });
}

function ui_filter_selected_card_title_clear() {
    $('#deck-cards-list-title-filter').focus().val('');
    ui_filter_selected_card_title();
}

function ui_update_card_actions() {
    var action_groups = {};

    // Group actions by category
    for (var function_name in card_action_info) {
        var info = card_action_info[function_name];
        if (!action_groups[info.category]) {
            action_groups[info.category] = [];
        }
        action_groups[info.category].push(function_name);
    }

    var parent = $('#card-actions');
    parent.empty();

    for (var group_name in action_groups) {
        var group_div = $('<div class="action-group"></div>');
        group_div.append($('<h4>' + group_name + '</h4>'));
        var actions = action_groups[group_name];
        for (var i = 0; i < actions.length; ++i) {
            var function_name = actions[i];
            var info = card_action_info[function_name];
            var action_name = info.example.split(" ")[0];

            var button = $('<button type="button" class="btn btn-default btn-sm action-button">' + action_name + '</button>');
            button.attr('title', info.summary);
            button.attr('data-function-name', function_name);
            button.click(function () {
                var contents = $('#card-contents');
                var contentsTextarea = contents[0];
                var function_name = $(this).attr('data-function-name');
                var info = card_action_info[function_name] || {
                    summary: 'Missing summary',
                    example: action_name
                };
                insertTextAtCursor(contentsTextarea, info.example);
                contents.trigger("change");
            });
            group_div.append(button);
        }
        parent.append(group_div);
    }
}

function ui_render_selected_card() {
    var card = ui_selected_card();
    $('#preview-container').empty();
    if (card) {
        var front = card_generate_front(card, card_options);
        var back = card_generate_back(card, card_options);
        $('#preview-container').html(front + "\n" + back);
    }
    local_store_save();
}

function ui_open_help() {
    $("#help-modal").modal('show');
}

function ui_select_icon() {
    window.open("http://game-icons.net/", "_blank");
}

function ui_setup_color_selector() {
    // Insert colors
    $.each(card_colors, function (name, val) {
        $(".colorselector-data")
            .append($("<option></option>")
            .attr("value", name)
            .attr("data-color", val)
            .text(name));
    });
    
    // Callbacks for when the user picks a color
    $('#default-color-front-selector').colorselector({
        callback: function (value, color, title) {
            $("#default-color-front").val(title);
            ui_set_default_color_front(value);
        }
    });
    $('#default-color-back-selector').colorselector({
        callback: function (value, color, title) {
            $("#default-color-back").val(title);
            ui_set_default_color_back(value);
        }
    });
    $('#card-color-front-selector').colorselector({
        callback: function (value, color, title) {
            $("#card-color-front").val(title);
            ui_set_card_color_front(value);
        }
    });
    $('#card-color-back-selector').colorselector({
        callback: function (value, color, title) {
            $("#card-color-back").val(title);
            ui_set_card_color_back(value);
        }
    });
    $('#foreground_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#foreground-color").val(title);
            ui_set_foreground_color(value);
        }
    });
    $('#background_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#background-color").val(title);
            ui_set_background_color(value);
        }
    });

    // Styling
    $(".dropdown-colorselector").addClass("input-group-addon color-input-addon");
}

function ui_set_default_color_front(color) {
    card_options.default_color_front = color;
    ui_render_selected_card();
}

function ui_set_default_color_back(color) {
    card_options.default_color_back = color;
    ui_render_selected_card();
}

function ui_set_foreground_color(color) {
    card_options.foreground_color = color;
    local_store_save();
}

function ui_set_background_color(color) {
    card_options.background_color = color;
    local_store_save();
}

function ui_page_rotate($event) {
    $event.preventDefault();
    swapInputValues('#page-width', '#page-height').each(function(){
        $(this).trigger('input');
    });
}

function ui_card_rotate($event) {
    $event.preventDefault();
    swapInputValues('#card-width', '#card-height').each(function(){
        $(this).trigger('input');
    });
}

function ui_grid_rotate($event) {
    $event.preventDefault();
    swapInputValues('#page-rows', '#page-columns');
}

function ui_zoom_rotate($event) {
    $event.preventDefault();
    swapInputValues('#page-zoom-width', '#page-zoom-height');
    swapInputValues('#card-zoom-width', '#card-zoom-height');
}

function ui_zoom_100($event) {
    const keepRatio = app_settings.page_zoom_keep_ratio;
    if (keepRatio) app_settings.page_zoom_keep_ratio = false;
    $("#page-zoom-width").val(100).trigger('input');
    $("#page-zoom-height").val(100).trigger('input');
    if (keepRatio) app_settings.page_zoom_keep_ratio = true;
}

function ui_back_bleed_rotate($event) {
    $event.preventDefault();
    swapInputValues('#back-bleed-width', '#back-bleed-height');
}

function ui_change_option() {
    var property = $(this).attr("data-option");
    var value;
    if ($(this).attr('type') === 'checkbox') {
        value = $(this).is(':checked');
    } else {
        value = $(this).val();
    }
    switch (property) {
        case 'card_size': {
            card_options[property] = value;
            var size = value ? value.split(',') : ['', ''];
            var w = size[0], h = size[1];
            var width = 0, height = 0;
            var landscape = isLandscape(card_options['card_width'], card_options['card_height']);
            if (landscape) {
                width = h;  height = w;
            } else {
                width = w;  height = h;
            }
            card_options['card_width'] = width;
            card_options['card_height'] = height;
            $('#card-width').val(width).trigger("input");
            $('#card-height').val(height).trigger("input");
            if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                $('#card-zoom-width').val(width);
                $('#card-zoom-height').val(height);
            } else {
                $('#card-zoom-width').trigger('input');
            }
            break;
        }
        case 'page_size': {
            card_options[property] = value;
            var size = value ? value.split(',') : ['', ''];
            var w = size[0], h = size[1];
            var width = 0, height = 0;
            var landscape = isLandscape(card_options['page_width'], card_options['page_height']);
            if (landscape) {
                width = h;  height = w;
            } else {
                width = w;  height = h;
            }
            card_options['page_width'] = width;
            card_options['page_height'] = height;
            $('#page-width').val(width).trigger("input");
            $('#page-height').val(height).trigger("input");            
        break;
        }
        case 'card_width':
        case 'card_height': {
            card_options[property] = value;
            var width = card_options['card_width'];
            var height = card_options['card_height'];
            ui_match_format(document.getElementById('card-size'), width, height);
            ui_set_card_custom_size(width, height);
            ui_set_orientation(document.getElementById('card-orientation'), width, height);
            // ui_zoom_100();
            break;
        }
        case 'page_width':
        case 'page_height': {
            card_options[property] = value;
            var width = card_options['page_width'];
            var height = card_options['page_height'];
            ui_match_format(document.getElementById('page-size'), width, height);
            ui_set_page_custom_size(width, height);
            ui_set_orientation(document.getElementById('page-orientation'), width, height);
            break;
        }
        case 'page_zoom_width':
        case 'page_zoom_height':
        case 'card_zoom_width':
        case 'card_zoom_height': {
            const keepRatio = app_settings.page_zoom_keep_ratio;
            const cardWidth = new UnitValue(card_options['card_width']);
            const cardHeight = new UnitValue(card_options['card_height']);
            const r = cardWidth.value / cardHeight.value;
            let percWidth;
            let percHeight;
            let sizeWidth;
            let sizeHeight;
            const setVal = (k, v) => {
                card_options[k] = v;
                $(`#${k.replace(/_/g, '-')}`).val(v);
            }
            if (property === 'page_zoom_width') {
                percWidth = Number(value);
                percHeight = keepRatio ? percWidth : card_options['page_zoom_height'];
            } else if (property === 'page_zoom_height') {
                percHeight = Number(value);
                percWidth = keepRatio ? percHeight : card_options['page_zoom_width'];
            } else if (property === 'card_zoom_width') {
                sizeWidth = new UnitValue(value);
                sizeHeight = keepRatio ? new UnitValue(sizeWidth.value / r, sizeWidth.mu) : new UnitValue(card_options['card_zoom_height']);
            } else if (property === 'card_zoom_height') {
                sizeHeight = new UnitValue(value);
                sizeWidth = keepRatio ? new UnitValue(sizeHeight.value * r, sizeHeight.mu) : new UnitValue(card_options['card_zoom_width']);
            }
            if (isNil(percWidth)) {
                percWidth = sizeWidth.value / cardWidth.value * 100;
                percHeight = sizeHeight.value / cardHeight.value * 100;
            } else {
                sizeWidth = new UnitValue(cardWidth.value * percWidth / 100, cardWidth.mu);
                sizeHeight = new UnitValue(cardHeight.value * percHeight / 100, cardHeight.mu);
            }
            setVal('page_zoom_width', new BigNumber(percWidth).toFixed(2).replace(/\.?0+$/, ''));
            setVal('page_zoom_height', new BigNumber(percHeight).toFixed(2).replace(/\.?0+$/, ''));
            setVal('card_zoom_width', new UnitValue(percWidth / 100 * cardWidth.value, cardWidth.mu).toString());
            setVal('card_zoom_height', new UnitValue(percHeight / 100 * cardHeight.value, cardHeight.mu).toString());
            break;
        }
        default: {
            card_options[property] = value;
            break;
        }
    }
    ui_render_selected_card();
}

function ui_match_format(selector, width, height) {
    var len = selector.length;
    var portrait = "", landscape = "", format = "", o = null;
    for(var i = 0; i < len; i++) {
        o = selector.options[i];
        portrait = [width, height].join(',');
        if (o.value === portrait) { format = portrait; break; }
        landscape = [height, width].join(',');
        if (o.value === landscape) { format = landscape; break; }
    }
    selector.value = format;
}

function ui_set_orientation(outputElement, cssWidth, cssHeight) {
    var orientation = getOrientation(cssWidth, cssHeight);
    outputElement.textContent = orientation;
    return orientation;
}

function ui_move_top() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.unshift(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(0);
}

function ui_move_bottom() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.push(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_move_up() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx > 0) {
        [card_data[idx], card_data[idx - 1]] = [card_data[idx - 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx - 1);
    }
}

function ui_move_down() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx < card_data.length - 1) {
        [card_data[idx], card_data[idx + 1]] = [card_data[idx + 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx + 1);
    }
}

function ui_change_card_title() {
    var title = $("#card-title").val();
    var card = ui_selected_card();
    if (card) {
        card.title = title;
        $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
        ui_render_selected_card();
    }
}

function ui_change_card_count() {
    var count = $("#card-count").val();
    var idx = ui_selected_card_index();
    var card = card_data[idx];
    if (card) {
        card.count = count;
        $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
        ui_update_card_list();
    }
}

function ui_change_card_property() {
    var property = $(this).attr("data-property");
    var value = $(this).val();
    var card = ui_selected_card();
    if (card) {
        card[property] = value;
        ui_render_selected_card();
    }
}

function ui_set_card_color_front(value) {
    var card = ui_selected_card();
    if (card) {
        card.color_front = value;
        ui_render_selected_card();
    }
}

function ui_set_card_color_back(value) {
    var card = ui_selected_card();
    if (card) {
        card.color_back = value;
        ui_render_selected_card();
    }
}

function ui_set_card_custom_size(width, height) {
    var card = ui_selected_card();
    if (card) {
        card.card_width = width;
        card.card_height = height;
        ui_render_selected_card();
    }
}

function ui_set_page_custom_size(width, height) {
    var card = ui_selected_card();
    if (card) {
        card.page_width = width;
        card.page_height = height;
    }
}

function ui_update_color_selector(color, input, selector) {
    if ($(selector + " option[value='" + color + "']").length > 0) {
        // Update the color selector to the entered value
        $(selector).colorselector("setValue", color);
    } else {
        // Unknown color - select a neutral color and reset the text value
        $(selector).colorselector("setValue", "");
        input.val(color);
    }
}

function ui_change_card_color_front() {
    var input = $(this);
    var color = input.val();

    ui_update_color_selector(color, input, "#card-color-front-selector");
    ui_set_card_color_front(color);
}

function ui_change_card_color_back() {
    var input = $(this);
    var color = input.val();

    ui_update_color_selector(color, input, "#card-color-back-selector");
    ui_set_card_color_back(color);
}

function ui_change_default_color_front() {
    var input = $(this);
    var color = input.val();

    ui_update_color_selector(color, input, "#default-color-front-selector");
    ui_set_default_color_front(color);
}

function ui_change_default_icon_front() {
    var value = $(this).val();
    card_options.default_icon_front = value;
    ui_render_selected_card();
}

function ui_change_default_color_back() {
    var input = $(this);
    var color = input.val();

    ui_update_color_selector(color, input, "#default-color-back-selector");
    ui_set_default_color_back(color);
}

function ui_change_default_icon_back() {
    var value = $(this).val();
    card_options.default_icon_back = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back_rotation() {
    var value = $(this).val();
    card_options.default_icon_back_rotation = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back_container() {
    var value = $(this).val();
    card_options.default_icon_back_container = value;
    ui_render_selected_card();
}

function ui_change_card_contents() {
    var html = $(this).val();
    var card = ui_selected_card();
    if (card) {
        card.contents = html.split("\n");
        ui_render_selected_card();
    }
}

function ui_change_card_contents_keyup () {
    clearTimeout(ui_change_card_contents_keyup.timeout);
    ui_change_card_contents_keyup.timeout = setTimeout(function () {
        $('#card-contents').trigger('change');
    }, 200);
}
ui_change_card_contents_keyup.timeout = null;

function ui_change_card_tags() {
    var value = $(this).val();

    var card = ui_selected_card();
    if (card) {
        if (value.trim().length === 0) {
            card.tags = [];
        } else {
            card.tags = value.split(",").map(function (val) {
                return val.trim().toLowerCase();
            });
        }
        ui_render_selected_card();
    }
}

function ui_change_default_title_size() {
    card_options.default_title_size = $(this).val();
    ui_render_selected_card();
}

function ui_change_default_icon_size() {
    card_options.icon_inline = $(this).is(':checked');
    ui_render_selected_card();
}

function ui_change_default_card_font_size() {
    card_options.default_card_font_size = $(this).val();
    ui_render_selected_card();
}

function ui_change_default_card_background() {
    card_options.default_background_image = $(this).val();
    ui_render_selected_card();
}

function ui_sort() {
    $("#sort-modal").modal('show');
}

function ui_sort_execute() {
    $("#sort-modal").modal('hide');

    var fn_code = $("#sort-function").val();
    var fn = new Function("card_a", "card_b", fn_code);

    card_data = card_data.sort(function (card_a, card_b) {
        var result = fn(card_a, card_b);
        return result;
    });

    ui_update_card_list();
}

function ui_filter() {
    $("#filter-modal").modal('show');
}

function ui_filter_execute() {
    $("#filter-modal").modal('hide');

    var fn_code = $("#filter-function").val();
    var fn = new Function("card", fn_code);

    card_data = card_data.filter(function (card) {
        var result = fn(card);
        if (result === undefined) return true;
        else return result;
    });

    ui_update_card_list();
}

function ui_apply_default_color_front() {
    const k = 'color_front';
    const v = card_options.default_color_front;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_color_back() {
    const k = 'color_back';
    const v = card_options.default_color_back;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_font_title() {
    const k = 'title_size';
    const v = card_options.default_title_size;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_font_card() {
    const k = 'card_font_size';
    const v = card_options.default_card_font_size;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_front() {
    const k = 'icon_front';
    const v = card_options.default_icon_front;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_back() {
    const k = 'icon_back';
    const v = card_options.default_icon_back;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_back_container() {
    const k = 'icon_back_container';
    const v = card_options.default_icon_back_container;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_icon_back_rotation() {
    const k = 'icon_back_rotation';
    const v = card_options.default_icon_back_rotation;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

function ui_apply_default_card_background() {
    const k = 'background_image';
    const v = card_options.default_background_image;
    card_data.forEach(card => { card[k] = v; }); 
    ui_update_selected_card();
}

//Adding support for local store
function local_store_save() {
    if(window.localStorage){
        const card_data_to_save = card_data.map(c => {
            const card = { ...c };
            delete card.uuid;
            return card;
        });
        try {
            localStorage.setItem("card_data", JSON.stringify(card_data_to_save));
            localStorage.setItem("card_options", JSON.stringify(card_options));
            localStorage.setItem("app_settings", JSON.stringify(app_settings));
        } catch (e){
            //if the local store save failed should we notify the user that the data is not being saved?
            console.log(e);
        }
    }
}

function legacy_card_data(oldData = []) {
    const newData = oldData?.map(oldCard => {
        const card = card_init({ ...oldCard });
        if (!isNil(card.icon)) {
            card.icon_front = card.icon;
            delete card.icon;
        }
        if (!isNil(card.color)) {
            card.color_front = card.color;
            card.color_back = '';
            delete card.color;
        }
        if (isNil(card.icon_back_container)) {
            card.icon_back_container = 'rounded-square';
        }
        if (isNil(card.uuid)) {
            card.uuid = crypto.randomUUID();
        }
        return card;
    });
    return newData;
}

function legacy_card_options(data = {}) {
    const newData = {
        ...default_card_options(),
        ...data
    };
    if (!isNil(newData.page_zoom)) {
        newData.page_zoom_width = newData.page_zoom;
        newData.page_zoom_height = newData.page_zoom;
        delete newData.page_zoom;
    }
    return newData;
}

function legacy_app_settings(data = {}) {
    return {
        ...default_app_settings(),
        ...data
    };
}

function local_store_load() {
    if(window.localStorage){
        try {
            const storedCards = JSON.parse(localStorage.getItem("card_data"));
            if (storedCards) {
                card_data = legacy_card_data(storedCards)
            }
            const storedOptions = JSON.parse(localStorage.getItem("card_options"));
            if (storedOptions) {
                card_options = legacy_card_options(storedOptions);
            }
            const storedSettings = JSON.parse(localStorage.getItem("app_settings"));
            if (storedSettings) {
                app_settings = legacy_app_settings(storedSettings);
            }
        } catch (e){
            //if the local store load failed should we notify the user that the data load failed?
            showToast('Error loading from localStorage', 'danger')
            console.error(e);

        }
    }
}

function showToast(message, type = 'info', duration = 5000) {
  // Create toast element with animation class
  var toastDiv = $('<div class="alert alert-' + type + ' alert-dismissible toast-animate" role="alert" style="min-width: 250px; margin-top: 10px;">' +
                     '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                       '<span aria-hidden="true">&times;</span>' +
                     '</button>' +
                     message +
                   '</div>');

    $('#toast-container').append(toastDiv);

  // Auto-dismiss after duration
  setTimeout(function () {
    toastDiv.alert('close');
  }, duration);
}

function ui_change_current_file_name(event) {
    if (event.target.value) {
        app_settings.currentFileName = event.target.value;
    } else {
        app_settings.currentFileName = app_settings.defaultFileName;
        event.target.value = app_settings.defaultFileName;
    }
    local_store_save();
}

function ui_change_browser_asks_where_save(event) {
    const browserAsks = Boolean(Number(event.target.value));
    app_settings.browserAsksWhereSave = browserAsks;
    if (browserAsks) {
        $('#save-file-dialog-yes').prop('checked', true).change();
    }
    local_store_save();
}

function ui_change_save_file_dialog(event) {
    const openDialog = Boolean(Number(event.target.value));
    app_settings.openSaveDialog = openDialog;
    if (!openDialog) {
        $('#browser-asks-where-save-no').prop('checked', true).change();
    }
    local_store_save();
}

function ui_download_settings_toggle(event) {
    $('#download-settings-opened,#download-settings-closed').toggleClass('hidden');
    app_settings.showDownloadSettings = event.target.id === ('download-settings-show');
    local_store_save();
}

function ui_zoom_keep_ratio(event) {
    app_settings.page_zoom_keep_ratio = event.target.checked;
    local_store_save();
}

$(document).ready(function () {
    parse_card_actions().then(function () {
        local_store_load();
        ui_setup_color_selector();

    // accordion panel collapse fix
    $('#accordion .panel-collapse').on('show.bs.collapse', function(event){
        $('#accordion .panel-collapse').not(event.target).collapse('hide');
    });

    if (!window.showSaveFilePicker) {
        $('#download-settings-available,#download-settings-unavailable').toggleClass('hidden');
    }

    if (app_settings.showDownloadSettings) {
        $('#download-settings-opened').removeClass('hidden');
    } else {
        $('#download-settings-closed').removeClass('hidden');
    }

    $('#download-settings-show,#download-settings-hide').click(ui_download_settings_toggle);

    $('#file-name').val(app_settings.currentFileName).change(ui_change_current_file_name).focus(function(){this.select()});
    $(`input[name="browser-asks-where-save"]`).change(ui_change_browser_asks_where_save).filter(`[value="${Number(app_settings.browserAsksWhereSave)}"]`).prop('checked', true);
    $(`input[name="save-file-dialog"]`).change(ui_change_save_file_dialog).filter(`[value="${Number(app_settings.openSaveDialog)}"]`).prop('checked', true);

    function ui_set_default_tab_values(options) {
        $("#default-color-front").val(options.default_color_front).change();
        $("#default-icon-front").val(options.default_icon_front_container);
        $("#default-color-back").val(options.default_color_back).change();
        $("#default-icon-back").val(options.default_icon_back);
        $("#default-icon-back-container").val(options.default_icon_back_container).trigger("change");
        $("#default-title-size").val(options.default_title_size);
        $("#default-card-font-size").val(options.default_card_font_size);
    	$("#default-card-background").val(options.default_background_image);
    }

    function ui_set_page_tab_values(options) {
       $("#page-size").val(options.page_size).change();
       $("#card-size").val(options.card_size).change();
       $("#card-arrangement").val(options.card_arrangement).change();
       $("#page-rows").val(options.page_rows).change();
       $("#page-columns").val(options.page_columns).change();
       $("#back-bleed-width").val(options.back_bleed_width).change();
       $("#back-bleed-height").val(options.back_bleed_height).change();
       $("#foreground-color").val(options.foreground_color).change();
       $("#background-color").val(options.background_color).change();
       $("#page-zoom-keep-ratio").prop('checked', app_settings.page_zoom_keep_ratio);
       $("#page-zoom-width").val(options.page_zoom_width);
       $("#page-zoom-height").val(options.page_zoom_height);
       $("#card-zoom-width").val(options.card_zoom_width);
       $("#card-zoom-height").val(options.card_zoom_height);
       $("#rounded-corners").prop('checked', options.rounded_corners);
    }

    function ui_reset_default_tab_values(event) {
        if (!confirm('Reset the current tab\'s value?')) return;
        ui_set_default_tab_values(default_card_options());
    }

    function ui_reset_page_tab_values(event) {
        if (!confirm('Reset the current tab\'s value?')) return;
        ui_set_page_tab_values(default_card_options());
    }
    
    ui_set_page_tab_values(card_options);
    ui_set_default_tab_values(card_options);

    $('#default-icon-front').val(card_options.default_icon_front);
    $('#default-icon-back').val(card_options.default_icon_back);
    $('#default-title-size').val(card_options.default_title_size);
    $('#default-card-font-size').val(card_options.default_card_font_size);

    $('.icon-list').typeahead({
        source: icon_names,
        items: 'all',
        render: function (items) {
          var that = this;

          items = $(items).map(function (i, item) {
            i = $(that.options.item).data('value', item);
            i.find('a').html(that.highlighter(item));
            var classname = 'icon-' + item.split(' ').join('-').toLowerCase();
            i.find('a').append('<span class="' + classname + '"></span>');
            return i[0];
          });

          if (this.autoSelect) {
            items.first().addClass('active');
          }
          this.$menu.html(items);
          return this;
        }
    });

    $("#button-generate").click(ui_generate);
    $("#button-load").click(function () {
        $("#file-load").attr('data-opening', '0').click();
    });
    $("#button-open").click(function () {
        if (!ui_clear_all()) return;
        $("#file-load").attr('data-opening', '1').click();
    });
    $("#file-load").change(ui_load_files);
    $("#button-clear").click(ui_clear_all);
    $("#button-load-sample").click(ui_load_sample);
    $("#button-save").click(ui_save_file);
    $("#button-sort").click(ui_sort);
    $("#button-filter").click(ui_filter);
    $("#button-add-card").click(ui_add_new_card);
    $("#button-duplicate-card").click(ui_duplicate_card);
    $("#button-delete-card").click(ui_delete_card);
    $("#button-copy-card").click(ui_copy_card);
    $("#button-copy-all").click(ui_copy_all_cards);
    $("#button-paste-card").click(ui_paste_card);
    $("#button-help").click(ui_open_help);
    $("#button-apply-default-color-front").click(ui_apply_default_color_front);
    $("#button-apply-default-color-back").click(ui_apply_default_color_back);
    $("#button-apply-default-font-title").click(ui_apply_default_font_title);
    $("#button-apply-default-font-card").click(ui_apply_default_font_card);
    $("#button-apply-default-icon-front").click(ui_apply_default_icon_front);
    $("#button-apply-default-icon-back").click(ui_apply_default_icon_back);
    $("#button-apply-default-icon-back-container").click(ui_apply_default_icon_back_container);
    $("#button-apply-default-icon-back-rotation").click(ui_apply_default_icon_back_rotation);
    $("#button-apply-default-card-background").click(ui_apply_default_card_background);

    $("#deck-cards-list").change(ui_update_selected_card);
    $("#deck-cards-list-title-filter").on('input', ui_filter_selected_card_title);
    $("#deck-cards-list-title-filter-clear").click(ui_filter_selected_card_title_clear);

    $("#card-title").change(ui_change_card_title);
    $("#card-type").change(ui_change_card_property);
    $("#card-title-size").change(ui_change_card_property);
    $("#card-font-size").change(ui_change_card_property);
    $("#card-icon-front").change(ui_change_card_property);
    $("#card-count").change(ui_change_card_count);
    $("#card-icon-back").change(ui_change_card_property);
    $("#card-icon-back-container").change(ui_change_card_property);
    $("#card-icon-back-rotation").change(ui_change_card_property);
	$("#card-background").change(ui_change_card_property);
	$("#card-color-front").change(ui_change_card_color_front);
	$("#card-color-back").change(ui_change_card_color_back);
    $("#card-contents").change(ui_change_card_contents);
    $("#card-tags").change(ui_change_card_tags);

    $("#card-contents").keyup(ui_change_card_contents_keyup);

    $("#page-width").on("input", ui_change_option);
    $("#page-height").on("input", ui_change_option);
    $("#page-size").change(ui_change_option).trigger("change");
    $("#page-rotate").click(ui_page_rotate);
    $("#page-rows").change(ui_change_option);
    $("#page-columns").change(ui_change_option);
    $("#page-zoom-width").on("input", ui_change_option);
    $("#page-zoom-height").on("input", ui_change_option);
    $("#page-zoom-rotate").click(ui_zoom_rotate);
    $("#page-zoom-keep-ratio").change(ui_zoom_keep_ratio);
    $('#page-zoom-100').click(ui_zoom_100);
    $("#card-zoom-width").on("input", ui_change_option);
    $("#card-zoom-height").on("input", ui_change_option);
    $("#card-zoom-rotate").click(ui_zoom_rotate);
    $("#grid-rotate").click(ui_grid_rotate);
    $("#card-arrangement").change(ui_change_option);
    $("#card-width").on("input", ui_change_option);
    $("#card-height").on("input", ui_change_option);
    $("#card-size").change(ui_change_option).trigger("change");
    $("#card-rotate").click(ui_card_rotate);
    $("#background-color").change(ui_change_option);
    $("#rounded-corners").change(ui_change_option);
    $("#back-bleed-width").on("input", ui_change_option);
    $("#back-bleed-height").on("input", ui_change_option);
    $("#back-bleed-rotate").click(ui_back_bleed_rotate);

    $("#default-color-front").change(ui_change_default_color_front);
    $("#default-icon-front").change(ui_change_default_icon_front);
    $("#default-color-back").change(ui_change_default_color_back);
    $("#default-icon-back").change(ui_change_default_icon_back)
    $("#default-icon-back-rotation").change(ui_change_default_icon_back_rotation);
    $("#default-icon-back-container").change(ui_change_default_icon_back_container);
    $("#default-title-size").change(ui_change_default_title_size);
    $("#default-card-font-size").change(ui_change_default_card_font_size);
    $("#default-card-background").change(ui_change_default_card_background);

    $("#small-icons").change(ui_change_default_icon_size);
    $("#reset-default-tab-values").click(ui_reset_default_tab_values);
    $("#reset-page-tab-values").click(ui_reset_page_tab_values);

    $(".icon-select-button").click(ui_select_icon);

    $("#sort-execute").click(ui_sort_execute);
    $("#filter-execute").click(ui_filter_execute);

    $("#button-move-top").click(ui_move_top);
    $("#button-move-bottom").click(ui_move_bottom);
    $("#button-move-up").click(ui_move_up);
    $("#button-move-down").click(ui_move_down);

    ui_update_card_list();
    });
});
