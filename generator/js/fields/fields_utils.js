function ui_fields_init_colorfield(field) {
    const $selector = $(`#${field.id}-selector`);
    let options = '';
    for (const [name, val] of Object.entries(card_colors)) {
        options += `<option value="${name}" data-color="${val}">${name}</option>`;
    }
    $selector.append(options);
    $selector.colorselector({
        callback: function (value, color, title) {
            // cannot trigger `onChange` here because it would create an infinite loop with the onChange listener below.
            field.update(color);
            // so i call manually the Field.events type 'change'
            field.events?.forEach(([eventType, eventCallback]) => {
                if (eventType === 'change') eventCallback();
            });
        }
    });
    $selector.next('.dropdown-colorselector').addClass("input-group-addon color-input-addon");
    $selector.colorselector('setColor', field.getData());
    // onChange listener, triggered by ui_update_selected_card()
    // field.changeValue(field.getData(), { updateData: false });
    field.el.addEventListener('change', () => $selector.colorselector('setColor', field.getData()));
}
