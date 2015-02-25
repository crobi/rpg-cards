var RpgCards;
(function (RpgCards) {
    function normalizeTag(tag) {
        return tag.trim().toLowerCase();
    }
    function splitParams(value) {
        return value.split("|").map(function (str) {
            return str.trim();
        });
    }
    var Options = (function () {
        function Options() {
            this.foreground_color = "white";
            this.background_color = "white";
            this.empty_color = "black";
            this.default_color = "black";
            this.default_icon = "";
            this.default_title_size = "13";
            this.page_size = "A4";
            this.page_rows = 3;
            this.page_columns = 3;
            this.card_arrangement = "doublesided";
            this.card_size = "25x35";
            this.card_count = null;
            this.icon_inline = true;
        }
        return Options;
    })();
    RpgCards.Options = Options;
    var Card = (function () {
        function Card() {
            this.count = 1;
            this.title = "New card";
            this.title_size = null;
            this.title_icon_text = null;
            this.color = null;
            this.color_front = null;
            this.color_back = null;
            this.icon = null;
            this.icon_front = null;
            this.icon_back = null;
            this.contents = [];
            this.tags = [];
            this.userData = null;
        }
        Card.fromJSON = function (json) {
            var result = new Card;
            result.count = json.count || 1;
            result.title = json.title || "";
            result.title_size = json.title_size || null;
            result.title_icon_text = json.title_icon_text || null;
            result.color = json.color || null;
            result.color_front = json.color_front || null;
            result.color_back = json.color_back || null;
            result.icon = json.icon || null;
            result.icon_front = json.icon_front || null;
            result.icon_back = json.icon_back || null;
            result.contents = json.contents || [];
            result.tags = json.tags || [];
            return result;
        };
        Card.prototype.toJSON = function () {
            return {
                count: this.count,
                title: this.title,
                title_size: this.title_size,
                title_icon_text: this.title_icon_text,
                color: this.color,
                color_front: this.color_front,
                color_back: this.color_back,
                icon: this.icon,
                icon_front: this.icon_front,
                icon_back: this.icon_back,
                contents: this.contents.slice(),
                tags: this.tags.slice()
            };
        };
        Card.prototype.duplicate = function () {
            var result = Card.fromJSON(this.toJSON());
            result.title += " (Copy)";
            return result;
        };
        Card.prototype.hasTag = function (tag) {
            var index = this.tags.indexOf(normalizeTag(tag));
            return index > -1;
        };
        Card.prototype.addTag = function (tag) {
            if (!this.hasTag(tag)) {
                this.tags.push(normalizeTag(tag));
            }
        };
        Card.prototype.removeTag = function (tag) {
            var ntag = normalizeTag(tag);
            this.tags = this.tags.filter(function (t) {
                return ntag != t;
            });
        };
        Card.prototype.findTag = function (pattern, flags) {
            var f = flags || "g";
            var regexp = new RegExp(pattern, f);
            var s = this.tags.join("\n");
            return regexp.exec(s);
        };
        Card.prototype.replaceTag = function (pattern, substitution, flags) {
            var f = flags || "g";
            var regexp = new RegExp(pattern, f);
            this.tags = this.tags.map(function (s) { return s.replace(regexp, substitution); });
        };
        Card.prototype.findContent = function (pattern, flags) {
            var f = flags || "g";
            var regexp = new RegExp(pattern, f);
            var s = this.contents.join("\n");
            return regexp.exec(s);
        };
        Card.prototype.replaceContent = function (pattern, substitution, flags) {
            var f = flags || "g";
            var regexp = new RegExp(pattern, f);
            this.contents = this.contents.map(function (s) { return s.replace(regexp, substitution); });
        };
        Card.prototype.findTitle = function (pattern, flags) {
            var f = flags || "g";
            var regexp = new RegExp(pattern, f);
            var s = this.title;
            return regexp.exec(s);
        };
        Card.prototype.findTitleAny = function (patterns, flags) {
            for (var i = 0; i < patterns.length; ++i) {
                var f = flags || "g";
                var regexp = new RegExp(patterns[i], f);
                var s = this.title;
                var result = regexp.exec(s);
                if (result) {
                    return result;
                }
            }
            return null;
        };
        Card.prototype.getTitle = function (options) {
            return this.title || "";
        };
        Card.prototype.getTitleSize = function (options) {
            return this.title_size || options.default_title_size || "13";
        };
        Card.prototype.getTitleIconText = function (options) {
            return this.title_icon_text || "";
        };
        Card.prototype.getColorFront = function (options) {
            return this.color_front || this.color || options.default_color || "black";
        };
        Card.prototype.getColorBack = function (options) {
            return this.color_back || this.color || options.default_color || "black";
        };
        Card.prototype.getIconFront = function (options) {
            return this.icon_front || this.icon || options.default_icon || "";
        };
        Card.prototype.getIconBack = function (options) {
            return this.icon_back || this.icon || options.default_icon || "";
        };
        return Card;
    })();
    RpgCards.Card = Card;
    ;
    var CardDeck = (function () {
        function CardDeck() {
            this.cards = [];
            this._actions = [];
        }
        CardDeck.prototype.toJSON = function () {
            return this.cards.map(function (card) { return card.toJSON(); });
        };
        CardDeck.fromJSON = function (data) {
            if (Array.isArray(data)) {
                var result = new CardDeck;
                for (var i = 0; i < data.length; ++i) {
                    result.cards.push(Card.fromJSON(data[i]));
                }
                return result;
            }
            else {
                throw new Error("Invalid data");
            }
        };
        CardDeck.prototype.addCards = function (cards) {
            var _this = this;
            cards.forEach(function (card) {
                _this._actions.push({ fn: "add", card: card, ref: null });
            });
        };
        CardDeck.prototype.addNewCard = function () {
            var newCard = new Card();
            this._actions.push({ fn: "add", card: newCard, ref: null });
            return newCard;
        };
        CardDeck.prototype.duplicateCard = function (card) {
            var newCard = card.duplicate();
            this._actions.push({ fn: "add", card: newCard, ref: card });
            return newCard;
        };
        CardDeck.prototype.deleteCard = function (card) {
            this._actions.push({ fn: "del", card: card, ref: null });
        };
        CardDeck.prototype.commit = function () {
            for (var i = 0; i < this._actions.length; ++i) {
                var action = this._actions[i];
                if (action.fn === "add") {
                    var index = this.cards.indexOf(action.ref);
                    if (index > -1) {
                        this.cards.splice(index + 1, 0, action.card);
                    }
                    else {
                        this.cards.push(action.card);
                    }
                }
                else if (action.fn === "del") {
                    var index = this.cards.indexOf(action.card);
                    if (index > -1) {
                        this.cards.splice(index, 1);
                    }
                }
            }
            this._actions = [];
        };
        return CardDeck;
    })();
    RpgCards.CardDeck = CardDeck;
    var CardHtmlGenerator = (function () {
        function CardHtmlGenerator() {
        }
        CardHtmlGenerator.prototype._icon = function (src, ind, ind0) {
            if (src.length > 0) {
                return ind + '<card-icon src="./icons/' + src + '.svg"></card-icon>\n';
            }
            else {
                return "";
            }
        };
        CardHtmlGenerator.prototype._subtitle = function (params, card, options, ind, ind0) {
            var text = params[0] || "";
            return ind + '<card-subtitle>' + text + '</card-subtitle>\n';
        };
        CardHtmlGenerator.prototype._ruler = function (params, card, options, ind, ind0) {
            return ind + '<card-rule></card-rule>\n';
        };
        CardHtmlGenerator.prototype._boxes = function (params, card, options, ind, ind0) {
            var count = params[0] || 1;
            var size = params[1] || 3;
            return ind + '<card-boxes size="' + size + '" count="' + count + '"></card-boxes>\n';
        };
        CardHtmlGenerator.prototype._property = function (params, card, options, ind, ind0) {
            var header = params[0] || "";
            var text = params[1] || "";
            var result = "";
            result += ind + '<card-property>\n';
            result += ind + ind0 + '<h4>' + header + '</h4>\n';
            result += ind + ind0 + '<p>' + text + '</p>\n';
            result += ind + '</card-property>\n';
            return result;
        };
        CardHtmlGenerator.prototype._description = function (params, card, options, ind, ind0) {
            var header = params[0] || "";
            var text = params[1] || "";
            var result = "";
            result += ind + '<card-description>\n';
            result += ind + ind0 + '<h4>' + header + '</h4>\n';
            result += ind + ind0 + '<p>' + text + '</p>\n';
            result += ind + '</card-description>\n';
            return result;
        };
        CardHtmlGenerator.prototype._text = function (params, card, options, ind, ind0) {
            var text = params[0] || "";
            var result = "";
            result += ind + '<card-description>\n';
            result += ind + ind0 + '<p>' + text + '</p>\n';
            result += ind + '</card-description>\n';
            return result;
        };
        CardHtmlGenerator.prototype._dndstats = function (params, card, options, ind, ind0) {
            var stats = ["str", "dex", "con", "int", "wis", "cha"];
            var result = "";
            result += ind + '<card-dndstats';
            for (var i = 0; i < stats.length; ++i) {
                var value = params[i] || "";
                var stat = stats[i];
                result += ' ' + stat + '="' + value + '"';
            }
            result += '></card-dndstats>\n';
            return result;
        };
        CardHtmlGenerator.prototype._bullet = function (params, card, options, ind, ind0) {
            var text = params[0] || "";
            return ind + '<card-bullet>' + text + '</card-bullet>\n';
        };
        CardHtmlGenerator.prototype._section = function (params, card, options, ind, ind0) {
            var text = params[0] || "";
            return ind + '<card-section>' + text + '</card-section>\n';
        };
        CardHtmlGenerator.prototype._fill = function (params, card, options, ind, ind0) {
            var size = params[0] || "1";
            return ind + '<card-fill size="' + size + '"></card-fill>\n';
        };
        CardHtmlGenerator.prototype._vspace = function (params, card, options, ind, ind0) {
            var size = params[0] || "1em";
            return ind + '<card-vspace size="' + size + '"></card-vspace>\n';
        };
        CardHtmlGenerator.prototype._unknown = function (params, card, options, ind, ind0) {
            var text = params.join(' | ');
            return ind + '<card-description><p>' + text + '</p></card-description>\n';
        };
        CardHtmlGenerator.prototype._empty = function (params, card, options, ind, ind0) {
            return '';
        };
        CardHtmlGenerator.prototype._contents = function (contents, card, options, ind, ind0) {
            var _this = this;
            var result = "";
            result += ind + '<card-contents>\n';
            result += contents.map(function (value) {
                var parts = splitParams(value);
                var name = parts[0];
                var params = parts.splice(1);
                var generator = null;
                switch (name) {
                    case "subtitle":
                        generator = _this._subtitle;
                        break;
                    case "property":
                        generator = _this._property;
                        break;
                    case "rule":
                        generator = _this._ruler;
                        break;
                    case "ruler":
                        generator = _this._ruler;
                        break;
                    case "boxes":
                        generator = _this._boxes;
                        break;
                    case "description":
                        generator = _this._description;
                        break;
                    case "dndstats":
                        generator = _this._dndstats;
                        break;
                    case "text":
                        generator = _this._text;
                        break;
                    case "bullet":
                        generator = _this._bullet;
                        break;
                    case "fill":
                        generator = _this._fill;
                        break;
                    case "vspace":
                        generator = _this._vspace;
                        break;
                    case "section":
                        generator = _this._section;
                        break;
                    case "disabled":
                        generator = _this._empty;
                        break;
                    case "":
                        generator = _this._empty;
                        break;
                    default: return _this._unknown(parts, card, options, ind, ind0);
                }
                return generator(params, card, options, ind + ind0, ind);
            }).join("\n");
            result += ind + '</card-contents>\n';
            return result;
        };
        CardHtmlGenerator.prototype._title = function (card, options, ind, ind0) {
            var title = card.getTitle(options);
            var title_size = card.getTitleSize(options);
            var title_icon_text = card.getTitleIconText(options);
            var icon = card.getIconFront(options);
            var result = "";
            result += ind + '<card-title size="' + title_size + '">\n';
            result += ind + ind0 + '<h1>' + title + '</h1>\n';
            result += ind + ind0 + '<h2>' + title_icon_text + '</h2>\n';
            result += this._icon(icon, ind + ind0, ind0);
            result += ind + '</card-title>\n';
            return result;
        };
        CardHtmlGenerator.prototype._card_front = function (card, options, ind, ind0) {
            var result = "";
            result += this._title(card, options, ind + ind0, ind0);
            result += this._contents(card.contents, card, options, ind + ind0, ind0);
            return result;
        };
        CardHtmlGenerator.prototype._card_back = function (card, options, ind, ind0) {
            var icon = card.getIconBack(options);
            var result = "";
            result += ind + '<card-back>\n';
            result += this._icon(icon, ind + ind0, ind);
            result += ind + '</card-back>\n';
            return result;
        };
        CardHtmlGenerator.prototype._card_empty = function (options, ind, ind0) {
            var result = "";
            result += ind + '<card-contents>\n';
            result += ind + '</card-contents>\n';
            return result;
        };
        CardHtmlGenerator.prototype._card = function (options, ind, ind0, content, color) {
            var size = options.card_size || "25x35";
            var result = "";
            result += ind + '<rpg-card color="' + color + '" size="' + size + '">\n';
            result += content;
            result += ind + '</rpg-card>\n';
            return result;
        };
        /** Generates HTML for the front side of the given card */
        CardHtmlGenerator.prototype.card_front = function (card, options, indent) {
            var content = this._card_front(card, options, "", indent);
            return this._card(options, "", indent, content, card.getColorFront(options));
        };
        /** Generates HTML for the back side of the given card */
        CardHtmlGenerator.prototype.card_back = function (card, options, indent) {
            var content = this._card_back(card, options, "", indent);
            return this._card(options, "", indent, content, card.getColorBack(options));
        };
        /** Generates HTML for an empty given card */
        CardHtmlGenerator.prototype.card_empty = function (options, indent) {
            var content = this._card_empty(options, "", indent);
            return this._card(options, "", indent, content, options.empty_color);
        };
        return CardHtmlGenerator;
    })();
    RpgCards.CardHtmlGenerator = CardHtmlGenerator;
    var CardPage = (function () {
        function CardPage(rows, cols) {
            this.rows = rows;
            this.cols = cols;
            this.cards = [];
        }
        /** Returns an empty page with the same dimensions */
        CardPage.prototype.newPage = function () {
            return new CardPage(this.rows, this.cols);
        };
        CardPage.prototype._posToIndex = function (row, col) {
            return row * this.cols + col;
        };
        /** Adds one card to the page */
        CardPage.prototype.addCard = function (card) {
            if (this.capacity() === 0) {
                throw new Error("This page is full.");
            }
            this.cards.push(card);
        };
        /**
            Adds several copies of a card to the page.
            Returns the number of copies that did not fit on the page.
        */
        CardPage.prototype.addCards = function (card, count) {
            while (this.capacity() > 0 && count > 0) {
                this.addCard(card);
                --count;
            }
            return count;
        };
        /** Fills all remaining slots on the current row with the given card */
        CardPage.prototype.fillRow = function (card) {
            while (this.capacityRow() > 0) {
                this.addCard(card);
            }
        };
        /** Fills all remaining slots on the page with empty cards */
        CardPage.prototype.fillPage = function (card) {
            while (this.capacity() > 0) {
                this.addCard(card);
            }
        };
        /** Empty slots on the page */
        CardPage.prototype.capacity = function () {
            return this.rows * this.cols - this.cards.length;
        };
        /** Empty slots on the current line */
        CardPage.prototype.capacityRow = function () {
            return this.capacity() % this.cols;
        };
        /** Flip card slots horizontally */
        CardPage.prototype.flipH = function () {
            if (this.capacity() > 0) {
                throw new Error("Cannot perform this operation while the page is not full");
            }
            for (var r = 0; r < this.rows; ++r) {
                for (var c = 0; c < Math.floor(this.cols / 2); ++c) {
                    var indexL = this._posToIndex(r, c);
                    var indexR = this._posToIndex(r, this.cols - c - 1);
                    var cardL = this.cards[indexL];
                    var cardR = this.cards[indexR];
                    this.cards[indexL] = cardR;
                    this.cards[indexR] = cardL;
                }
            }
        };
        return CardPage;
    })();
    var CardPageSet = (function () {
        function CardPageSet(rows, cols) {
            this.rows = rows;
            this.cols = cols;
            this.pages = [];
        }
        CardPageSet.prototype.lastPage = function () {
            if (this.pages.length === 0) {
                return null;
            }
            else {
                return this.pages[this.pages.length - 1];
            }
        };
        CardPageSet.prototype.addPage = function () {
            var newPage = new CardPage(this.rows, this.cols);
            this.pages.push(newPage);
            return newPage;
        };
        /**
            Adds one card to the last page.
            Adds a new pages if necessary.
        */
        CardPageSet.prototype.addCard = function (card) {
            var page = this.lastPage();
            if (page === null || page.capacity() === 0) {
                page = this.addPage();
            }
            page.addCard(card);
        };
        /**
            Adds several copies of a card to the last page.
            Adds new pages if necessary.
        */
        CardPageSet.prototype.addCards = function (card, count) {
            for (var i = 0; i < count; ++i) {
                this.addCard(card);
            }
        };
        CardPageSet.prototype.forEach = function (fn) {
            this.pages.forEach(fn);
        };
        CardPageSet.prototype.merge = function (other) {
            if (this.pages.length !== other.pages.length) {
                throw new Error("This function is only for merging two equally sized page sets");
            }
            var result = new CardPageSet(this.rows, this.cols);
            for (var i = 0; i < this.pages.length; ++i) {
                result.pages.push(this.pages[i]);
                result.pages.push(other.pages[i]);
            }
            return result;
        };
        return CardPageSet;
    })();
    var BoxSize = (function () {
        function BoxSize(p, w, h, wpx, hpx) {
            this.page = p;
            this.width = w;
            this.height = h;
            this.width_px = Math.floor(wpx);
            this.height_px = Math.floor(hpx);
        }
        return BoxSize;
    })();
    var boxSizes = {};
    boxSizes["auto"] = new BoxSize("auto", "auto", "auto", Infinity, Infinity);
    boxSizes["A2"] = new BoxSize("A2 portrait", "420mm", "594mm", 1587.401575, 2245.03937);
    boxSizes["A3"] = new BoxSize("A3 portrait", "297mm", "420mm", 1118.740158, 1587.401575);
    boxSizes["A4"] = new BoxSize("A4 portrait", "210mm", "297mm", 793.700787, 1118.740158);
    boxSizes["A5"] = new BoxSize("A5 portrait", "148mm", "210mm", 559.370079, 793.700787);
    boxSizes["Letter"] = new BoxSize("Letter portrait", "8.5in", "11in", 816, 1056);
    boxSizes["225x35"] = new BoxSize("2.25in 3.5in", "2.25in", "3.5in", 216, 336);
    boxSizes["25x35"] = new BoxSize("2.5in 3.5in", "2.5in", "3.5in", 240, 336);
    boxSizes["35x50"] = new BoxSize("3.5in 5.0in", "3.5in", "5.0in", 336, 480);
    boxSizes["50x70"] = new BoxSize("5.0in 7.0in", "5.0in", "7.0in", 480, 672);
    var PageHtmlGenerator = (function () {
        function PageHtmlGenerator() {
            this.indent = "  ";
        }
        PageHtmlGenerator.prototype._pageColor = function (page, options) {
            if ((options.card_arrangement == "doublesided") && (page % 2 == 1)) {
                return options.background_color;
            }
            else {
                return options.foreground_color;
            }
        };
        PageHtmlGenerator.prototype._wrap = function (pageSet, options) {
            var result = "";
            for (var i = 0; i < pageSet.pages.length; ++i) {
                var page = pageSet.pages[i];
                var style = ' style="background-color:' + this._pageColor(i, options) + '"';
                result += '<card-page' + style + '>\n';
                result += page.cards.join("");
                result += '</card-page>\n';
            }
            return result;
        };
        PageHtmlGenerator.prototype._generatePagesDoublesided = function (cards, options, rows, cols, generator) {
            var front_pages = new CardPageSet(rows, cols);
            var back_pages = new CardPageSet(rows, cols);
            var empty = generator.card_empty(options, this.indent);
            for (var i = 0; i < cards.length; ++i) {
                var card = cards[i];
                var front = generator.card_front(card, options, this.indent);
                var back = generator.card_back(card, options, this.indent);
                front_pages.addCards(front, card.count);
                back_pages.addCards(back, card.count);
            }
            // Fill empty slots
            front_pages.forEach(function (page) { return page.fillPage(empty); });
            back_pages.forEach(function (page) { return page.fillPage(empty); });
            // Shuffle back cards so that they line up with their corresponding front cards
            back_pages.forEach(function (page) { return page.flipH(); });
            // Interleave front and back pages so that we can print double-sided
            return front_pages.merge(back_pages);
        };
        PageHtmlGenerator.prototype._generatePagesFrontOnly = function (cards, options, rows, cols, generator) {
            var pages = new CardPageSet(rows, cols);
            var empty = generator.card_empty(options, this.indent);
            for (var i = 0; i < cards.length; ++i) {
                var card = cards[i];
                var front = generator.card_front(card, options, this.indent);
                pages.addCards(front, card.count);
            }
            // Fill empty slots
            pages.forEach(function (page) { return page.fillPage(empty); });
            return pages;
        };
        PageHtmlGenerator.prototype._generatePagesSideBySide = function (cards, options, rows, cols, generator) {
            if (cols < 2) {
                throw new Error("Need at least two columns for side-by-side");
            }
            var pages = new CardPageSet(rows, cols);
            var empty = generator.card_empty(options, this.indent);
            for (var i = 0; i < cards.length; ++i) {
                var card = cards[i];
                var front = generator.card_front(card, options, this.indent);
                var back = generator.card_back(card, options, this.indent);
                for (var j = 0; j < card.count; ++j) {
                    if (pages.pages.length > 0 && pages.lastPage().capacityRow() < 2) {
                        pages.lastPage().fillRow(empty);
                    }
                    pages.addCard(front);
                    pages.addCard(back);
                }
            }
            // Fill empty slots
            pages.forEach(function (page) { return page.fillPage(empty); });
            return pages;
        };
        PageHtmlGenerator.prototype._generatePages = function (cards, options, rows, cols, generator) {
            switch (options.card_arrangement) {
                case "doublesided": return this._generatePagesDoublesided(cards, options, rows, cols, generator);
                case "front_only": return this._generatePagesFrontOnly(cards, options, rows, cols, generator);
                case "side_by_side": return this._generatePagesSideBySide(cards, options, rows, cols, generator);
                default: throw new Error("Unknown card arrangement");
            }
        };
        PageHtmlGenerator.prototype._generateStyle = function (options) {
            var page_box = boxSizes[options.page_size] || boxSizes["auto"];
            var result = '';
            result += '<style type="text/css">\n';
            result += 'body {\n';
            result += '    display: block;\n';
            result += '    background: rgb(204, 204, 204);\n';
            result += '}\n';
            result += 'card-page {\n';
            result += '    width: ' + (page_box.width_px) + 'px;\n';
            result += '    height: ' + (page_box.height_px) + 'px;\n';
            result += '}\n';
            result += '@media print {\n';
            result += '   html, body {\n';
            result += '       width: ' + page_box.width_px + 'px;\n';
            result += '   }\n';
            result += '   body {\n';
            result += '       margin: 0;\n';
            result += '       padding: 0;\n';
            result += '       border: 0;\n';
            result += '    }\n';
            result += '}\n';
            result += '@page {\n';
            result += '    margin: 0;\n';
            result += '    size:' + page_box.width_px + 'px ' + page_box.height_px + 'px;\n';
            result += '    -webkit-print-color-adjust: exact;\n';
            result += '}\n';
            result += '</style>\n';
            return result;
        };
        PageHtmlGenerator.prototype.generateHtml = function (cards, options) {
            options = options || new Options();
            var rows = options.page_rows || 3;
            var cols = options.page_columns || 3;
            // Generate the HTML for each card
            var generator = new CardHtmlGenerator();
            var pages = this._generatePages(cards, options, rows, cols, generator);
            // Wrap all pages in a <page> element
            var document = this._wrap(pages, options);
            // Generate the HTML for the page layout
            var style = this._generateStyle(options);
            // Wrap all pages in a <page> element and add CSS for the page size
            var result = "";
            result += style;
            result += document;
            return result;
        };
        PageHtmlGenerator.prototype.insertInto = function (cards, options, container) {
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }
            // Insert the HTML
            var html = this.generateHtml(cards, options);
            container.innerHTML = html;
        };
        return PageHtmlGenerator;
    })();
    RpgCards.PageHtmlGenerator = PageHtmlGenerator;
})(RpgCards || (RpgCards = {}));
//# sourceMappingURL=card.js.map