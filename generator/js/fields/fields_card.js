UI_FIELDS_CONFIGURATION_PREPARE.set('card', () => [
    // Name
    {
        id: 'card-title',
        property: [ui_selected_card, 'title'],
        defaultProperty: [default_card_data, 'title'],
        eventListeners: {
            changeHandler: function (event) {
                ui_render_selected_card();
                const card = ui_selected_card();
                const displayTitleField = getField('card-title-display');
                if (card) {
                    $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
                    displayTitleField.el.placeholder = event.target.value;
                } else {
                    displayTitleField.el.placeholder = displayTitleField.el.getAttribute('data-placeholder');
                }
            }
        },
        events: [
            ['input', 'changeHandler'],
            ['change', 'changeHandler']
        ]
    },
    // Count
    {
        id: 'card-count',
        property: [ui_selected_card, 'count'],
        defaultProperty: [default_card_data, 'card_count'],
        eventListeners: {
            changeHandler: function () {
                var card = ui_selected_card();
                if (card) {
                    $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
                    ui_update_deck_total_count();
                }
            }
        },
        events: [
            ['input', 'changeHandler']
        ]
    },
    // Tags
    // ----------
    // Front color
    {
        id: 'card-color-front',
        property: [ui_selected_card, 'color_front'],
        defaultProperty: [default_card_data, 'color_front'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Header
    {
        id: 'header-show',
        property: [ui_selected_card, 'header_show'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Title
    {
        id: 'card-title-display',
        property: [ui_selected_card, 'title_display'],
        defaultProperty: [default_card_data, 'title'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Title size
    {
        id: 'card-title-size',
        property: [ui_selected_card, 'title_size'],
        defaultProperty: [default_card_data, 'default_title_size'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    // Title color
    {
        id: 'title-color',
        property: [ui_selected_card, 'title_color'],
        defaultProperty: [default_card_data, 'default_title_color'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Card type
    {
        id: 'card-type',
        property: [ui_selected_card, 'card_type'],
        defaultProperty: [default_card_data, 'card_type'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Front icons
    // Front icons color
    {
        id: 'card-icon-front-color',
        property: [ui_selected_card, 'icon_front_color'],
        defaultProperty: [default_card_data, 'icon_front_color'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // ----------
    // Back color
    {
        id: 'card-color-back',
        property: [ui_selected_card, 'color_back'],
        defaultProperty: [default_card_data, 'color_back'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    // Back icon
    // Back icon rotation
    // Back icon container
    // Back image
    // ----------
    // Content front or back
    // Content front
    // Content back
    // Text size
    // Relative to
    {
        id: 'vertical-alignment-reference',
        property: [ui_selected_card, 'vertical_alignment_reference'],
        defaultProperty: [default_card_data, 'vertical_alignment_reference'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    

    // $("#card-color-front").change(function() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#card-color-front-selector");
    //     ui_set_card_color_front(color);
    // });
	// $("#card-color-back").change(function() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#card-color-back-selector");
    //     ui_set_card_color_back(color);
    // });


// function ui_set_card_color_front(value) {
//     var card = ui_selected_card();
//     if (card) {
//         card.color_front = value;
//         ui_render_selected_card();
//     }
// }
// function ui_set_card_color_back(value) {
//     var card = ui_selected_card();
//     if (card) {
//         card.color_front = value;
//         ui_render_selected_card();
//     }
// }


    //     $('#card-color-front-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#card-color-front").val(title);
    //         ui_set_card_color_front(value);
    //     }
    // });
    // $('#card-color-back-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#card-color-back").val(title);
    //         ui_set_card_color_back(value);
    //     }
    // });



]);