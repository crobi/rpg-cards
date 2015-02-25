ace.define("ace/mode/rpgcard_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var RpgCardHighlightRules = function () {

        var keywords = (
            "subtitle|rule|ruler|text|property|description|dndstats|fill|vspace|section|bullet|boxes"
        );

        var builtinConstants = (
            "null"
        );

        var builtinFunctions = (
            ""
        );

        var keywordMapper = this.createKeywordMapper({
            "support.function": builtinFunctions,
            "keyword": keywords,
            "constant.language": builtinConstants
        }, "identifier", true);

        this.$rules = {
            "start": [{
                token: keywordMapper,
                regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token: "keyword.operator",
                regex: "\\|"
            }, {
                token: "paren.lparen",
                regex: "[\\(]"
            }, {
                token: "paren.rparen",
                regex: "[\\)]"
            }, {
                token: "text",
                regex: "\\s+"
            }]
        };
        this.normalizeRules();
    };

    oop.inherits(RpgCardHighlightRules, TextHighlightRules);

    exports.RpgCardHighlightRules = RpgCardHighlightRules;
});

ace.define("ace/mode/rpgcard", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/rpgcard_highlight_rules", "ace/range"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var RpgCardHighlightRules = require("./rpgcard_highlight_rules").RpgCardHighlightRules;
    var Range = require("../range").Range;

    var Mode = function () {
        this.HighlightRules = RpgCardHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function () {

        this.lineCommentStart = "--";

        this.$id = "ace/mode/rpgcard";
    }).call(Mode.prototype);

    exports.Mode = Mode;

});
