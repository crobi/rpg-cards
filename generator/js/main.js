var icon_options = "";
var color_options = "";

var icons = ["icon-custom-spell", "icon-custom-armor-light", "icon-custom-armor-medium", "icon-custom-armor-heavy", "icon-custom-shield", "icon-custom-potion", "icon-custom-light", "icon-custom-flask", "icon-custom-vial", "icon-custom-poison", "icon-custom-trap", "icon-custom-swords", "icon-custom-arrows", "icon-custom-swordarrow", "icon-custom-bow", "icon-custom-item", "icon-custom-wand", "icon-custom-spell", "icon-custom-spell-0", "icon-custom-spell-1", "icon-custom-spell-2", "icon-custom-spell-3", "icon-custom-spell-4", "icon-custom-spell-5", "icon-custom-spell-6", "icon-custom-spell-7", "icon-custom-spell-8", "icon-custom-spell-9", "icon-custom-spell-cd", "icon-custom-spell-runes", "icon-custom-class-arcane", "icon-custom-class-cleric", "icon-custom-class-rogue"];

var colors = ["black", "navy", "darkblue", "mediumblue", "blue", "darkgreen", "green", "teal", "darkcyan", "deepskyblue", "darkturquoise", "mediumspringgreen", "lime", "springgreen", "aqua", "cyan", "midnightblue", "dodgerblue", "lightseagreen", "forestgreen", "seagreen", "darkslategray", "limegreen", "mediumseagreen", "turquoise", "royalblue", "steelblue", "darkslateblue", "mediumturquoise", "indigo", "darkolivegreen", "cadetblue", "cornflowerblue", "mediumaquamarine", "dimgray", "slateblue", "olivedrab", "slategray", "lightslategray", "mediumslateblue", "lawngreen", "chartreuse", "aquamarine", "maroon", "purple", "olive", "gray", "skyblue", "lightskyblue", "blueviolet", "darkred", "darkmagenta", "saddlebrown", "darkseagreen", "lightgreen", "mediumpurple", "darkviolet", "palegreen", "darkorchid", "yellowgreen", "sienna", "brown", "darkgray", "lightblue", "greenyellow", "paleturquoise", "lightsteelblue", "powderblue", "firebrick", "darkgoldenrod", "mediumorchid", "rosybrown", "darkkhaki", "silver", "mediumvioletred", "indianred", "peru", "chocolate", "tan", "lightgray", "thistle", "orchid", "goldenrod", "palevioletred", "crimson", "gainsboro", "plum", "burlywood", "lightcyan", "lavender", "darksalmon", "violet", "palegoldenrod", "lightcoral", "khaki", "aliceblue", "honeydew", "azure", "sandybrown", "wheat", "beige", "whitesmoke", "mintcream", "ghostwhite", "salmon", "antiquewhite", "linen", "lightgoldenrodyellow", "oldlace", "red", "fuchsia", "magenta", "deeppink", "orangered", "tomato", "hotpink", "coral", "darkorange", "lightsalmon", "orange", "lightpink", "pink", "gold", "peachpuff", "navajowhite", "moccasin", "bisque", "mistyrose", "blanchedalmond", "papayawhip", "lavenderblush", "seashell", "cornsilk", "lemonchiffon", "floralwhite", "snow", "yellow", "lightyellow", "ivory", "white"];

$(function() {
	generateIconOptions();
	generateCardColors();

	$('#card_icon').append(icon_options);
	$('#card_icon_back').append(icon_options);

	$('#card_color').append(color_options);
	$('#card_back_color').append(color_options);
	$('#card_color, #card_back_color').colorselector({
		callback: function(value, color, title, caller_id) {
			// Set card colors
			color_id = (caller_id == 'card_color') ? '#sample-front' : '#sample-back';
			$(color_id)
				.removeClass(function(index, css) {
					return (css.match(/\bcolor-\S+/g) || []).join(' ');
				})
				.addClass('color-' + color)
			;
		}
	});

	// Set Card Icons
	$('#card_icon, #card_icon_back').on('change', function(e) {
		icon_class = (e.target.id == 'card_icon') ? '.title-icon' : '.back-icon';
		$(icon_class)
			.removeClass(function (index, css) {
				return (css.match(/\bicon-custom-\S+/g) || []).join(' ');
			})
			.addClass($(this).val())
		;
	});

	$('#card_title').on('keyup', function(e) {
		$('#sample-front .title').html($(this).val());
	});

	$('#card_subtitle').on('keyup', function(e) {
		$('#sample-front .subtitle').html($(this).val());
	});
});

function generateIconOptions() {
	for (i in icons) {
		var label = icons[i].toLowerCase().replace(/\b[a-z]/g, function(letter) {
			return letter.toUpperCase();
		});

		label = label.replace(/Icon-/g, '');
		label = label.replace(/-/g, ' ');

		icon_options += '<option value="' + icons[i] + '">' + label + '</option>';
	};
}

function generateCardColors() {
	for (i in colors) {
		color_options += '<option value="' + colors[i] + '" data-color="' + colors[i] + '">' + colors[i] + '</option>';
	}
}
