/// <reference path="./card.ts" />
/// <reference path="./colors.ts" />
/// <reference path="./icons.ts" />
/// <reference path="./example_data.ts" />
/// <reference path="./jquery.d.ts" />

module RpgCardsUI {

    var deck: RpgCards.CardDeck = null;
    var options: RpgCards.Options = null;
    var cardGenerator: RpgCards.CardHtmlGenerator = null;
    var pageGenerator: RpgCards.PageHtmlGenerator = null;

    // ============================================================================
    // Seleted card
    // ============================================================================

    function selected_card_index(): number {
        return parseInt($("#selected-card").val(), 10);
    }

    function selected_card(): RpgCards.Card {
        var index = selected_card_index();
        if (deck.cards.length > index) {
            return deck.cards[index];
        } else {
            return null;
        }
    }

    function select_card_by_index(index: number) {
        if (index > -1) {
            $("#selected-card").val("" + index);
        } else {
            $("#selected-card").val("" + (deck.cards.length - 1));
        }
        update_selected_card();
    }

    function select_card_by_card(card: RpgCards.Card) {
        var index = deck.cards.indexOf(card);
        select_card_by_index(index);
    }

    // ============================================================================
    // Rendering
    // ============================================================================

    function render_selected_card() {
        var card = selected_card();
        $('#preview-container').empty();
        if (card) {
            var front = cardGenerator.card_front(card, options, "  ");
            var back = cardGenerator.card_back(card, options, "  ");
            $('#preview-container').html(front + "\n" + back);
        }
    }

    function update_selected_card() {
        var card = selected_card();
        if (card) {
            $("#card-title").val(card.title);
            $("#card-title-size").val(card.title_size);
            $("#card-count").val(""+card.count);
            $("#card-icon").val(card.icon);
            $("#card-icon-back").val(card.icon_back);
            $("#card-contents").val(card.contents.join("\n"));
            $("#card-tags").val(card.tags.join(", "));
            $("#card-color").val(card.color).change();
        } else {
            $("#card-title").val("");
            $("#card-title-size").val("");
            $("#card-count").val("1");
            $("#card-icon").val("");
            $("#card-icon-back").val("");
            $("#card-contents").val("");
            $("#card-tags").val("");
            $("#card-color").val("").change();
        }

        render_selected_card();
    }

    function update_card_list() {
        deck.commit();
        $("#total_card_count").text("Deck contains " + deck.cards.length + " unique cards.");

        $('#selected-card').empty();
        for (var i = 0; i < deck.cards.length; ++i) {
            var card = deck.cards[i];
            $('#selected-card')
                .append($("<option></option>")
                .attr("value", i)
                .text(card.title));
        }

        update_selected_card();
    }

    // ============================================================================
    // Color picker
    // ============================================================================

    function setup_color_selector() {
        // Insert colors
        $.each(card_colors, function (name, val) {
            $(".colorselector-data")
                .append($("<option></option>")
                .attr("value", name)
                .attr("data-color", val)
                .text(name));
        });
    
        // Callbacks for when the user picks a color
        (<any>$('#default_color_selector')).colorselector({
            callback: function (value, color, title) {
                $("#default-color").val(title);
                set_default_color(title);
            }
        });
        (<any>$('#card_color_selector')).colorselector({
            callback: function (value, color, title) {
                $("#card-color").val(title);
                set_card_color(value);
            }
        });
        (<any>$('#foreground_color_selector')).colorselector({
            callback: function (value, color, title) {
                $("#foreground-color").val(title);
                set_foreground_color(value);
            }
        });
        (<any>$('#background_color_selector')).colorselector({
            callback: function (value, color, title) {
                $("#background-color").val(title);
                set_background_color(value);
            }
        });

        // Styling
        $(".dropdown-colorselector").addClass("input-group-addon color-input-addon");
    }

    function set_card_color(value) {
        var card = selected_card();
        if (card) {
            card.color = value;
            render_selected_card();
        }
    }

    function set_default_color(color) {
        options.default_color = color;
        render_selected_card();
    }

    function set_foreground_color(color) {
        options.foreground_color = color;
    }

    function set_background_color(color) {
        options.background_color = color;
    }

    function update_card_color_selector(color, input, selector) {
        if ($(selector + " option[value='" + color + "']").length > 0) {
            // Update the color selector to the entered value
            (<any>$(selector)).colorselector("setValue", color);
        } else {
            // Unknown color - select a neutral color and reset the text value
            (<any>$(selector)).colorselector("setValue", "");
            input.val(color);
        }
    }

    // ============================================================================
    // Card values
    // ============================================================================

    function on_change_card_title() {
        var title = $("#card-title").val();
        var card = selected_card();
        if (card) {
            card.title = title;
            $("#selected-card option:selected").text(title);
            render_selected_card();
        }
    }

    function on_change_card_color() {
        var input = $(this);
        var color = input.val();

        update_card_color_selector(color, input, "#card_color_selector");
        set_card_color(color);
    }

    function on_change_card_property() {
        var property = $(this).attr("data-property");
        var value = $(this).val();
        var card = selected_card();
        if (card) {
            card[property] = value;
            render_selected_card();
        }
    }

    function on_change_card_contents() {
        var value = $(this).val();

        var card = selected_card();
        if (card) {
            card.contents = value.split("\n");
            render_selected_card();
        }
    }

    function on_change_card_tags() {
        var value = $(this).val();

        var card = selected_card();
        if (card) {
            if (value.trim().length == 0) {
                card.tags = [];
            } else {
                card.tags = value.split(",").map(function (val) {
                    return val.trim().toLowerCase();
                });
            }
            render_selected_card();
        }
    }

    // ============================================================================
    // Global default values
    // ============================================================================

    function on_change_option() {
        var property = $(this).attr("data-option");
        var value = $(this).val();
        options[property] = value;
        render_selected_card();
    }

    function on_change_default_color() {
        var input = $(this);
        var color = input.val();
        update_card_color_selector(color, input, "#default_color_selector");
        set_default_color(color);
    }

    function on_change_default_icon() {
        var value = $(this).val();
        options.default_icon = value;
        render_selected_card();
    }

    function on_change_default_title_size() {
        options.default_title_size = $(this).val();
        render_selected_card();
    }

    function on_change_default_icon_size() {
        options.icon_inline = $(this).is(':checked');
        render_selected_card();
    }

    // ============================================================================
    // Map/Filter
    // ============================================================================

    function apply_default_color() {
        deck.cards.forEach((card) => {
            card.color = options.default_color;
        });
        render_selected_card();
    }

    function apply_default_icon() {
        deck.cards.forEach((card) => {
            card.icon = options.default_icon;
        });
        render_selected_card();
    }

    function apply_default_icon_back() {
        deck.cards.forEach((card) => {
            card.icon_back = options.default_icon;
        });
        render_selected_card();
    }


    function sort() {
        showModal("#sort-modal");
    }

    function sort_execute() {
        hideModal("#sort-modal");

        var fn_code = $("#sort-function").val();
        var fn = new Function("card_a", "card_b", fn_code);

        deck.cards = deck.cards.sort(function (card_a, card_b) {
            var result = fn(card_a, card_b);
            return result;
        });

        update_card_list();
    }

    function filter() {
        showModal("#filter-modal");
    }

    function filter_execute() {
        hideModal("#filter-modal");

        var fn_code = $("#filter-function").val();
        var fn = new Function("card", fn_code);

        deck.cards = deck.cards.filter(function (card) {
            var result = fn(card);
            if (result === undefined) return true;
            else return result;
        });

        update_card_list();
    }

    // ============================================================================
    // Modals
    // ============================================================================

    function showModal(id: string) {
        (<any>$(id)).modal('show');
    }

    function hideModal(id: string) {
        (<any>$(id)).modal('hide');
    }


    // ============================================================================
    // I/O
    // ============================================================================

    function save_file() {
        var str = JSON.stringify(deck.toJSON(), null, "  ");
        var parts = [str];
        var blob = new Blob(parts, { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        var a = <HTMLLinkElement>$("#file-save-link")[0];
        a.href = url;
        (<any>a).download = "rpg_cards.json";
        a.click();

        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function load_sample() {
        deck = RpgCards.CardDeck.fromJSON(card_data_example);
        update_card_list();
    }

    function clear_all() {
        deck = new RpgCards.CardDeck();
        update_card_list();
    }

    function ui_load_files(evt) {
        // ui_clear_all();

        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();

            reader.onload = function (reader) {
                var data = JSON.parse(this.result);
                var deck = RpgCards.CardDeck.fromJSON(data);
                add_cards(deck.cards);
            };

            reader.readAsText(f);
        }

        // Reset file input
        (<any>$("#file-load-form")[0]).reset();
    }

    function add_cards(cards: RpgCards.Card[]) {
        deck.addCards(cards);
        update_card_list();
    }

    function add_new_card() {
        deck.addNewCard();
        update_card_list();
        select_card_by_index(deck.cards.length - 1);
    }

    function duplicate_card() {
        var newCard = null;
        if (deck.cards.length > 0) {
            var old_card = selected_card();
            newCard = deck.duplicateCard(old_card);
        } else {
            newCard = deck.addNewCard();
        }
        update_card_list();
        select_card_by_card(newCard);
    }

    function delete_card() {
        var index = selected_card_index();
        var card = selected_card();
        deck.deleteCard(card);
        update_card_list();
        select_card_by_index(Math.min(index, deck.cards.length - 1));
    }

    // ============================================================================
    // Menu
    // ============================================================================

    function open_help() {
        showModal("#help-modal");
    }

    function select_icon() {
        window.open("http://game-icons.net/", "_blank");
    }

    var generate_modal_shown = false;
    function generate() {
        if (deck.cards.length === 0) {
            alert("Your deck is empty. Please define some cards first, or load the sample deck.");
            return;
        }

        // Generate output HTML
        var card_html = pageGenerator.generateHtml(deck.cards, options);

        // Open a new window for the output
        // Use a separate window to avoid CSS conflicts
        var tab = window.open("output.html", 'rpg-cards-output');

        if (generate_modal_shown == false) {
            showModal("#print-modal");
            generate_modal_shown = true;
        }

        // Send the generated HTML to the new window
        // Use a delay to give the new window time to set up a message listener
        setTimeout(function () { tab.postMessage(card_html, '*') }, 500);
    }
    
    // ============================================================================
    // Initialization
    // ============================================================================

    function init() {
        deck = new RpgCards.CardDeck();
        options = new RpgCards.Options();
        cardGenerator = new RpgCards.CardHtmlGenerator;
        pageGenerator = new RpgCards.PageHtmlGenerator;

        setup_color_selector();
        (<any>$('.icon-list')).typeahead({ source: icon_names });


        // Menu
        $("#sort-execute").click(sort_execute);
        $("#filter-execute").click(filter_execute);
        $("#button-generate").click(generate);
        $("#button-load").click(function () { $("#file-load").click(); });
        $("#file-load").change(ui_load_files);
        $("#button-clear").click(clear_all);
        $("#button-load-sample").click(load_sample);
        $("#button-save").click(save_file);
        $("#button-sort").click(sort);
        $("#button-filter").click(filter);
        $("#button-add-card").click(add_new_card);
        $("#button-duplicate-card").click(duplicate_card);
        $("#button-delete-card").click(delete_card);
        $("#button-help").click(open_help);
        $("#button-apply-color").click(apply_default_color);
        $("#button-apply-icon").click(apply_default_icon);
        $("#button-apply-icon-back").click(apply_default_icon_back);

        $("#selected-card").change(update_selected_card);

        $("#card-title").change(on_change_card_title);
        $("#card-title-size").change(on_change_card_property);
        $("#card-title-icon-text").change(on_change_card_property);
        $("#card-icon").change(on_change_card_property);
        $("#card-count").change(on_change_card_property);
        $("#card-icon-back").change(on_change_card_property);
        $("#card-color").change(on_change_card_color);
        $("#card-contents").change(on_change_card_contents);
        $("#card-tags").change(on_change_card_tags);

        // Global options
        $("#page-size").change(on_change_option);
        $("#page-rows").change(on_change_option);
        $("#page-columns").change(on_change_option);
        $("#card-arrangement").change(on_change_option);
        $("#card-size").change(on_change_option);
        $("#background-color").change(on_change_option);
        $("#default-color").change(on_change_default_color);
        $("#default-icon").change(on_change_default_icon);
        $("#default-title-size").change(on_change_default_title_size);
        $("#small-icons").change(on_change_default_icon_size);

        $(".icon-select-button").click(select_icon);

        update_card_list();
    }


    $(document).ready(function () {
        init();
    });
}