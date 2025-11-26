UI_FIELDS_CONFIGURATION_PREPARE.set('page', () => [
    {
        id: 'page-size',
        property: 'card_options.page_size',
        events: [
            ['change', function () {
                const value = card_options.page_size;
                const [w, h] = value ? value.split(',') : ['', ''];
                if (isLandscape(card_options.page_width, card_options.page_height)) {
                    getField('page-width').changeValue(h);
                    getField('page-height').changeValue(w);
                } else {
                    getField('page-width').changeValue(w);
                    getField('page-height').changeValue(h);
                }
            }]
        ]
    },
    {
        id: 'page-width',
        property: 'card_options.page_width',
        events: [
            ['change', function() {
                const { page_width, page_height } = card_options;
                ui_match_format('page-size', page_width, page_height);
                ui_set_orientation(document.getElementById('page-orientation'), page_width, page_height);
            }]
        ]
    },
    {
        id: 'page-height',
        property: 'card_options.page_height',
        events: [
            ['change', function() {
                const { page_width, page_height } = card_options;
                ui_match_format(getField('page-size').el, page_width, page_height);
                ui_set_orientation(document.getElementById('page-orientation'), page_width, page_height);
            }]
        ]
    },
    {
        id: 'foreground-color',
        property: 'card_options.foreground_color',
        init: ui_fields_colorfield_init
    },
    {
        id: 'background-color',
        property: 'card_options.background_color',
        init: ui_fields_colorfield_init
    },
    {
        id: 'crop-marks',
        property: 'card_options.crop_marks'
    }
]);
