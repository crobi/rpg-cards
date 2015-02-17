// ============================================================================
// Card definition related functions
// ============================================================================
function card_default_options() {
    return {
        foreground_color: "white",
        background_color: "white",
        default_color: "black",
        default_icon: "ace",
        default_title_size: "13",
        page_size: "A4",
        page_rows: 3,
        page_columns: 3,
        card_arrangement: "doublesided",
        card_size: "25x35",
        card_count: null,
        icon_inline: true
    }
}

function card_default_data() {
    return {
        count: 1,
        title: "New card",
        contents: [],
        tags: []
    }
}

function card_init(card) {
    card.title = card.title || "";
    card.contents = card.contents || [];
    card.tags = card.tags || [];
}

function card_has_tag(card, tag) {
    tag = tag.trim().toLowerCase();
    var index = card.tags.indexOf(tag);
    return index > -1;
}

function card_add_tag(card, tag) {
    tag = tag.trim().toLowerCase();
    var index = card.tags.indexOf(tag);
    if (index == -1) {
        card.tags.push(tag);
    }
}

function card_remove_tag(card, tag) {
    tag = tag.trim().toLowerCase();
    card.tags = card.tags.filter(function (t) {
        return tag != t;
    });
}

// ============================================================================
// Card definition related functions
// ============================================================================

function card_data_color_front(card_data, options) {
    return card_data.color_front || card_data.color || options.default_color || "black";
}

function card_data_color_back(card_data, options) {
    return card_data.color_back || card_data.color || options.default_color || "black";
}

function card_data_icon_front(card_data, options) {
    return card_data.icon_front || card_data.icon || options.default_icon || "ace";
}

function card_data_icon_back(card_data, options) {
    return card_data.icon_back || card_data.icon || options.default_icon || "ace";
}

function card_data_split_params(value) {
    return value.split("|").map(function (str) { return str.trim(); });
}

// ============================================================================
// Card element generating functions
// ============================================================================

function card_element_title(card_data, options) {
    var title = card_data.title || "";
    var title_size = card_data.title_size || options.default_title_size || '13';
    var icon = card_data_icon_front(card_data, options) + ".svg";

    var result = "";
    result += '<card-title size="' + title_size + '">';
    result += '   <h1>' + title + '</h1>';
    result += '   <h2>' + "" + '</h2>';
    result += '   <card-icon src="/icons/' + icon + '"></card-icon>';
    result += '</card-title>';
    return result;

    return '<div class="card-title card-title-' + title_size + '">' + title + '</div>';
}

function card_element_subtitle(params, card_data, options) {
    var text = params[0] || "";
    return '<card-subtitle>' + text + '</card-subtitle>';
}

function card_element_ruler(params, card_data, options) {
    return '<card-rule></card-rule>';
}

function card_element_boxes(params, card_data, options) {
    var count = params[0] || 1;
    var size = params[1] || 3;
    return '<card-boxes size="' + size + '" count="' + count + '"></card-boxes>';
}

function card_element_property(params, card_data, options) {
    var header = params[0] || "";
    var text = params[1] || "";
    var result = "";
    result += '<card-property>';
    result += '   <h4>' + header + '</h4>';
    result += '   <p>' + text + '</p>';
    result += '</card-property>';
    return result;
}

function card_element_description(params, card_data, options) {
    var header = params[0] || "";
    var text = params[1] || "";
    var result = "";
    result += '<card-description>';
    result += '   <h4>' + header + '</h4>';
    result += '   <p>' + text + '</p>';
    result += '</card-description>';
    return result;
}

function card_element_text(params, card_data, options) {
    var text = params[0] || "";
    var result = "";
    result += '<card-description>';
    result += '   <p>' + text + '</p>';
    result += '</card-description>';
    return result;
}

function card_element_dndstats(params, card_data, options) {
    var result = "";
    result += '<card-dndstats';
    result += ' str="' + (parseInt(params[0], 10) || "") + '"';
    result += ' dex="' + (parseInt(params[1], 10) || "") + '"';
    result += ' con="' + (parseInt(params[2], 10) || "") + '"';
    result += ' int="' + (parseInt(params[3], 10) || "") + '"';
    result += ' wis="' + (parseInt(params[4], 10) || "") + '"';
    result += ' cha="' + (parseInt(params[5], 10) || "") + '"';
    result += '><card-dndstats>';
    return result;
}

function card_element_bullet(params, card_data, options) {
    var text = params[0] || "";
    return '<card-bullet>' + text + '</card-bullet>';
}

function card_element_section(params, card_data, options) {
    var text = params[0] || "";
    return '<card-section>' + text + '</card-section>';
}

function card_element_fill(params, card_data, options) {
    var size = params[0] || "1";
    return '<card-fill size="' + size + '"></card-fill>';
}

function card_element_unknown(params, card_data, options) {
    var text = params.join('|');
    return '<card-description><p>' + text + '</p></card-description>';
}

function card_element_empty(params, card_data, options) {
    return '';
}

var card_element_generators = {
    subtitle: card_element_subtitle,
    property: card_element_property,
    rule: card_element_ruler,
    ruler: card_element_ruler,
    boxes: card_element_boxes,
    description: card_element_description,
    dndstats: card_element_dndstats,
    text: card_element_text,
    bullet: card_element_bullet,
    fill: card_element_fill,
    section: card_element_section,
    disabled: card_element_empty
};

// ============================================================================
// Card generating functions
// ============================================================================

function card_generate_contents(contents, card_data, options) {
    var result = "";
    result += '<card-contents>';
    result += contents.map(function (value) {
        var parts = card_data_split_params(value);
        var element_name = parts[0];
        var element_params = parts.splice(1);
        var element_generator = card_element_generators[element_name];
        if (element_generator) {
            return element_generator(element_params, card_data, options);
        } else if (element_name.length > 0) {
            return card_element_unknown(element_params, card_data, options);
        }
    }).join("\n");
    result += '</card-contents>';
    return result;
}

function card_repeat(card, count) {
    var result = [];
    for (var i = 0; i < count; ++i) {
        result.push(card);
    }
    return result;
}

function card_generate_front(data, options) {
    var color = card_data_color_front(data, options);

    var result = "";
    result += '<rpg-card color="' + color + '" class="card-size-' + options.card_size + '">';
    result += card_element_title(data, options);
    result += card_generate_contents(data.contents, data, options);
    result += '</rpg-card>';
    return result;
}

function card_generate_back(data, options) {
    var color = card_data_color_back(data, options)
    var icon = card_data_icon_back(data, options) + ".svg";

    var result = "";
    result += '<rpg-card color="' + color + '">';
    result += '   <card-back>';
    result += '       <card-icon src="/icons/' + icon + '"></card-icon>';
    result += '   </card-back>';
    result += '</rpg-card>';
    return result;
}

function card_generate_empty(count, options) {
    var style_color = card_generate_color_style("white");

    var result = "";
    result += '<rpg-card color="' + color + '">';
    result += '</rpg-card>';
    return card_repeat(result, count);
}

// ============================================================================
// Functions that generate pages of cards
// ============================================================================

function card_pages_split(data, rows, cols) {
    var cards_per_page = rows * cols;
    var result = [];
    for (var i = 0; i < data.length; i += cards_per_page) {
        var page = data.slice(i, i + cards_per_page);
        result.push(page);
    }
    return result;
}

function card_pages_merge(front_pages, back_pages) {
    var result = [];
    for (var i = 0; i < front_pages.length; ++i) {
        result.push(front_pages[i]);
        result.push(back_pages[i]);
    }
    return result;
}

function cards_pages_flip_left_right(cards, rows, cols) {
    var result = [];
    for (var r = 0; r < rows; ++r) {
        for (var c = 0; c < cols; ++c) {
            var i = r*cols + (cols-1-c);
            result.push(cards[i]);
        }
    }
    return result;
}

function card_pages_add_padding(cards, options) {
    var cards_per_page = options.page_rows * options.page_columns;
    var last_page_cards = cards.length % cards_per_page;
    if (last_page_cards !== 0) {
        return cards.concat(card_generate_empty(cards_per_page - last_page_cards, options));
    } else {
        return cards;
    }
}

function card_pages_interleave_cards(front_cards, back_cards, options) {
    var result = [];
    var i = 0;
    while (i < front_cards.length) {
        result.push(front_cards[i]);
        result.push(back_cards[i]);
        if (options.page_columns > 2) {
            result.push(card_generate_empty(options.page_columns - 2, options));
        }
        ++i;
    }
    return result;
}

function card_pages_wrap(pages, options) {
    var size = options.page_size || "A4";

    var result = "";
    for (var i = 0; i < pages.length; ++i) {
        var style = "";
        if ((options.card_arrangement == "doublesided") &&  (i % 2 == 1)) {
            style += 'style="background-color:' + options.background_color + '"';
        } else {
            style += 'style="background-color:' + options.foreground_color + '"';
        }
        result += '<page class="page page-preview" size="' + size + '" ' + style + '>\n';
        result += pages[i].join("\n");
        result += '</page>\n';
    }
    return result;
}

function card_pages_generate_style(options) {
    var size = "a4";
    switch (options.page_size) {
        case "A3": size = "A3 portrait"; break;
        case "A4": size = "210mm 297mm"; break;
        case "A5": size = "A5 portrait"; break;
        case "Letter": size = "letter portrait"; break;
        case "25x35": size = "2.5in 3.5in"; break;
        default: size = "auto";
    }

    var result = "";
    result += "<style>\n";
    result += "@page {\n";
    result += "    margin: 0;\n";
    result += "    size:" + size + ";\n";
    result += "    -webkit-print-color-adjust: exact;\n";
    result += "}\n";
    result += "</style>\n";
    return result;
}

function card_pages_generate_html(card_data, options) {
    options = options || card_default_options();
    var rows = options.page_rows || 3;
    var cols = options.page_columns || 3;

    // Generate the HTML for each card
    var front_cards = [];
    var back_cards = [];
    card_data.forEach(function (data) {
        var count = options.card_count || data.count || 1;
        var front = card_generate_front(data, options);
        var back = card_generate_back(data, options);
        front_cards = front_cards.concat(card_repeat(front, count));
        back_cards = back_cards.concat(card_repeat(back, count));
    });

    var pages = [];
    if (options.card_arrangement == "doublesided") {
        // Add padding cards so that the last page is full of cards
        front_cards = card_pages_add_padding(front_cards, options);
        back_cards = card_pages_add_padding(back_cards, options);

        // Split cards to pages
        var front_pages = card_pages_split(front_cards, rows, cols);
        var back_pages = card_pages_split(back_cards, rows, cols);

        // Shuffle back cards so that they line up with their corresponding front cards
        back_pages = back_pages.map(function (page) {
            return cards_pages_flip_left_right(page, rows, cols);
        });

        // Interleave front and back pages so that we can print double-sided
        pages = card_pages_merge(front_pages, back_pages);
    } else if (options.card_arrangement == "front_only") {
        var cards = card_pages_add_padding(front_cards, options);
        pages = card_pages_split(cards, rows, cols);
    } else if (options.card_arrangement == "side_by_side") {
        var cards = card_pages_interleave_cards(front_cards, back_cards, options);
        cards = card_pages_add_padding(cards, options);
        pages = card_pages_split(cards, rows, cols);
    }

    // Wrap all pages in a <page> element and add CSS for the page size
    var result = "";
    result += card_pages_generate_style(options);
    result += card_pages_wrap(pages, options);

    return result;
}

function card_pages_insert_into(card_data, container) {

    // Clear the previous content of the document
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }

    // Insert the HTML
    var html = card_pages_generate_html(card_data);
    container.innerHTML = html;
}
