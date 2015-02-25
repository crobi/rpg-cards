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
var RpgCardsUI;
(function (RpgCardsUI) {
    RpgCardsUI.css_color_names = [
        "Black",
        "Navy",
        "DarkBlue",
        "MediumBlue",
        "Blue",
        "DarkGreen",
        "Green",
        "Teal",
        "DarkCyan",
        "DeepSkyBlue",
        "DarkTurquoise",
        "MediumSpringGreen",
        "Lime",
        "SpringGreen",
        "Aqua",
        "Cyan",
        "MidnightBlue",
        "DodgerBlue",
        "LightSeaGreen",
        "ForestGreen",
        "SeaGreen",
        "DarkSlateGray",
        "LimeGreen",
        "MediumSeaGreen",
        "Turquoise",
        "RoyalBlue",
        "SteelBlue",
        "DarkSlateBlue",
        "MediumTurquoise",
        "Indigo",
        "DarkOliveGreen",
        "CadetBlue",
        "CornflowerBlue",
        "MediumAquaMarine",
        "DimGray",
        "SlateBlue",
        "OliveDrab",
        "SlateGray",
        "LightSlateGray",
        "MediumSlateBlue",
        "LawnGreen",
        "Chartreuse",
        "Aquamarine",
        "Maroon",
        "Purple",
        "Olive",
        "Gray",
        "SkyBlue",
        "LightSkyBlue",
        "BlueViolet",
        "DarkRed",
        "DarkMagenta",
        "SaddleBrown",
        "DarkSeaGreen",
        "LightGreen",
        "MediumPurple",
        "DarkViolet",
        "PaleGreen",
        "DarkOrchid",
        "YellowGreen",
        "Sienna",
        "Brown",
        "DarkGray",
        "LightBlue",
        "GreenYellow",
        "PaleTurquoise",
        "LightSteelBlue",
        "PowderBlue",
        "FireBrick",
        "DarkGoldenRod",
        "MediumOrchid",
        "RosyBrown",
        "DarkKhaki",
        "Silver",
        "MediumVioletRed",
        "IndianRed",
        "Peru",
        "Chocolate",
        "Tan",
        "LightGray",
        "Thistle",
        "Orchid",
        "GoldenRod",
        "PaleVioletRed",
        "Crimson",
        "Gainsboro",
        "Plum",
        "BurlyWood",
        "LightCyan",
        "Lavender",
        "DarkSalmon",
        "Violet",
        "PaleGoldenRod",
        "LightCoral",
        "Khaki",
        "AliceBlue",
        "HoneyDew",
        "Azure",
        "SandyBrown",
        "Wheat",
        "Beige",
        "WhiteSmoke",
        "MintCream",
        "GhostWhite",
        "Salmon",
        "AntiqueWhite",
        "Linen",
        "LightGoldenRodYellow",
        "OldLace",
        "Red",
        "Fuchsia",
        "Magenta",
        "DeepPink",
        "OrangeRed",
        "Tomato",
        "HotPink",
        "Coral",
        "DarkOrange",
        "LightSalmon",
        "Orange",
        "LightPink",
        "Pink",
        "Gold",
        "PeachPuff",
        "NavajoWhite",
        "Moccasin",
        "Bisque",
        "MistyRose",
        "BlanchedAlmond",
        "PapayaWhip",
        "LavenderBlush",
        "SeaShell",
        "Cornsilk",
        "LemonChiffon",
        "FloralWhite",
        "Snow",
        "Yellow",
        "LightYellow",
        "Ivory",
        "White"
    ];
    RpgCardsUI.card_colors = {
        "": "",
        "dimgray": "dimgray",
        "black": "black",
        "darkgoldenrod": "darkgoldenrod",
        "saddlebrown": "saddlebrown",
        "indianred": "indianred",
        "maroon": "maroon",
        "indigo": "indigo",
        "darkblue": "darkblue",
        "royalblue": "royalblue",
        "darkgreen": "darkgreen",
        "#666633": "#666633",
        "rgb(140, 83, 133)": "rgb(140, 83, 133)",
        "rgb(255, 173, 70)": "rgb(255, 173, 70)",
        "rgb(96, 184, 93)": "rgb(96, 184, 93)",
        "rgb(59, 175, 177)": "rgb(59, 175, 177)",
        "rgb(128, 0, 0)": "rgb(128, 0, 0)",
        "rgb(133, 112, 86)": "rgb(133, 112, 86)",
        "rgb(248, 58, 34)": "rgb(248, 58, 34)"
    };
})(RpgCardsUI || (RpgCardsUI = {}));
var RpgCardsUI;
(function (RpgCardsUI) {
    RpgCardsUI.icon_names = [
        "ace",
        "acid-blob",
        "acid-tube",
        "acid",
        "acorn",
        "aerial-signal",
        "aerosol",
        "afterburn",
        "alien-skull",
        "alien-stare",
        "all-for-one",
        "alligator-clip",
        "ammo-box",
        "ammonite-fossil",
        "ammonite",
        "amphora",
        "anatomy",
        "anchor",
        "andromeda-chain",
        "angel-outfit",
        "angel-wings",
        "angler-fish",
        "angular-spider",
        "animal-hide",
        "animal-skull",
        "ankh",
        "anthem",
        "anvil-impact",
        "anvil",
        "apple-maggot",
        "apple-seeds",
        "aquarius",
        "archery-target",
        "architect-mask",
        "arcing-bolt",
        "arena",
        "aries",
        "armadillo-tail",
        "armoured-shell",
        "arrow-cluster",
        "arrow-flights",
        "arrowed",
        "arrowhead",
        "arrows-shield",
        "arson",
        "artificial-hive",
        "at-sea",
        "atomic-slashes",
        "aubergine",
        "aura",
        "auto-repair",
        "autogun",
        "awareness",
        "axe-in-stump",
        "axe-swing",
        "back-forth",
        "back-pain",
        "backstab",
        "backup",
        "balloons",
        "bandage-roll",
        "bandaged",
        "barbed-arrow",
        "barbed-spear",
        "barbed-wire",
        "barbute",
        "barefoot",
        "bat-blade",
        "bat-wing",
        "battered-axe",
        "batteries",
        "battery-0",
        "battery-100",
        "battery-25",
        "battery-50",
        "battery-75",
        "battery-minus",
        "battery-pack-alt",
        "battery-pack",
        "battery-plus",
        "battle-axe",
        "battle-gear",
        "batwing-emblem",
        "beam-wake",
        "beams-aura",
        "beanstalk",
        "beard",
        "beast-eye",
        "bee",
        "beech",
        "beer-stein",
        "beetle-shell",
        "behold",
        "belt-buckles",
        "bestial-fangs",
        "beveled-star",
        "big-egg",
        "big-wave",
        "biohazard",
        "bird-claw",
        "bird-limb",
        "bird-mask",
        "bird-twitter",
        "black-bar",
        "black-book",
        "black-cat",
        "black-flag",
        "black-hole-bolas",
        "blackball",
        "blackcurrant",
        "blade-bite",
        "blade-fall",
        "blast",
        "blaster",
        "bleeding-eye",
        "bleeding-heart",
        "bloody-stash",
        "blunderbuss",
        "boar-tusks",
        "boiling-bubbles",
        "bolas",
        "bolt-shield",
        "bolter-gun",
        "bombing-run",
        "bone-gnawer",
        "bone-knife",
        "book-aura",
        "book-cover",
        "book-storm",
        "bookmark",
        "bookmarklet",
        "boomerang",
        "boot-prints",
        "boot-stomp",
        "boots",
        "bordered-shield",
        "bottle-vapors",
        "bottled-bolt",
        "bottom-right-3d-arrow",
        "bowie-knife",
        "bowl-spiral",
        "bowling-pin",
        "bowling-propulsion",
        "bowman",
        "boxing-glove-surprise",
        "boxing-glove",
        "brain-freeze",
        "brain-stem",
        "brain",
        "brainstorm",
        "branch-arrow",
        "brandy-bottle",
        "brass-eye",
        "breastplate",
        "brick-pile",
        "bridge",
        "broadhead-arrow",
        "broadsword",
        "broken-bone",
        "broken-bottle",
        "broken-heart",
        "broken-shield",
        "broken-skull",
        "broken-tablet",
        "brutal-helm",
        "bubble-field",
        "bubbling-flask",
        "bud",
        "bugle-call",
        "bulb",
        "bull-horns",
        "bull",
        "bullets",
        "burn",
        "burning-book",
        "burning-dot",
        "burning-embers",
        "burning-eye",
        "burning-meteor",
        "burning-passion",
        "burning-round-shot",
        "burning-tree",
        "burst-blob",
        "butterfly-warning",
        "butterfly",
        "caged-ball",
        "cake-slice",
        "caldera",
        "campfire",
        "cancel",
        "cancer",
        "candle-flame",
        "candle-holder",
        "candle-light",
        "candle-skull",
        "candlebright",
        "cannister",
        "cannon-ball",
        "cannon-shot",
        "cannon",
        "capitol",
        "capricorn",
        "cargo-crane",
        "carillon",
        "carrion",
        "carrot",
        "cartwheel",
        "cash",
        "castle",
        "cauldron",
        "cctv-camera",
        "centipede",
        "chain-lightning",
        "chain-mail",
        "chained-heart",
        "chaingun",
        "chalice-drops",
        "charm",
        "checkbox-tree",
        "checked-shield",
        "cheerful",
        "cheese-wedge",
        "chemical-arrow",
        "chemical-bolt",
        "chemical-drop",
        "chemical-tank",
        "chicken-leg",
        "circuitry",
        "circular-saw",
        "circular-sawblade",
        "claw-hammer",
        "claw",
        "cloak-dagger",
        "clockwork",
        "clout",
        "clover-spiked",
        "clover",
        "cluster-bomb",
        "cobweb",
        "coffee-mug",
        "coffin",
        "cog-lock",
        "cog",
        "cogsplosion",
        "coiling-curl",
        "cold-heart",
        "coma",
        "comb",
        "compass",
        "concentration-orb",
        "condor-emblem",
        "condylura-skull",
        "conversation",
        "cool-spices",
        "corked-tube",
        "cowled",
        "crab-claw",
        "crab",
        "cracked-ball-dunk",
        "cracked-disc",
        "cracked-glass",
        "cracked-helm",
        "cracked-mask",
        "cracked-saber",
        "cracked-shield",
        "crags",
        "crenulated-shield",
        "crescent-blade",
        "crested-helmet",
        "croc-jaws",
        "croc-sword",
        "crossbow",
        "crossed-air-flows",
        "crossed-axes",
        "crossed-bones",
        "crossed-chains",
        "crossed-claws",
        "crossed-pistols",
        "crossed-sabres",
        "crossed-slashes",
        "crossed-swords",
        "crow-dive",
        "crown-coin",
        "crown-of-thorns",
        "crown",
        "crowned-explosion",
        "crowned-heart",
        "crowned-skull",
        "crush",
        "crystal-ball",
        "crystal-bars",
        "crystal-cluster",
        "crystal-eye",
        "crystal-growth",
        "crystal-shine",
        "crystal-wand",
        "crystalize",
        "cubeforce",
        "cubes",
        "cupidon-arrow",
        "curled-leaf",
        "curled-tentacle",
        "curling-vines",
        "curly-wing",
        "curvy-knife",
        "cut-diamond",
        "cut-palm",
        "cycle",
        "cyclops",
        "daggers",
        "daisy",
        "dark-squad",
        "dead-eye",
        "dead-wood",
        "death-note",
        "death-skull",
        "death-zone",
        "deathcab",
        "decapitation",
        "defibrilate",
        "demolish",
        "dervish-swords",
        "desert-skull",
        "desk-lamp",
        "despair",
        "diablo-skull",
        "diamond-hard",
        "dice-six-faces-five",
        "dice-six-faces-four",
        "dice-six-faces-one",
        "dice-six-faces-six",
        "dice-six-faces-three",
        "dice-six-faces-two",
        "dig-dug",
        "dinosaur-bones",
        "dinosaur-egg",
        "dinosaur-rex",
        "disintegrate",
        "distraction",
        "divergence",
        "divert",
        "diving-dagger",
        "dna1",
        "dna2",
        "doctor-face",
        "dodge",
        "dodging",
        "domino-mask",
        "double-dragon",
        "double-quaver",
        "double-shot",
        "doubled",
        "dove",
        "dozen",
        "dragon-balls",
        "dragon-breath",
        "dragon-head",
        "dragon-spiral",
        "dragonfly",
        "drama-masks",
        "drill",
        "drink-me",
        "dripping-blade",
        "dripping-goo",
        "dripping-honey",
        "dripping-knife",
        "dripping-stone",
        "dripping-sword",
        "drop",
        "droplet-splash",
        "droplets",
        "drowning",
        "duality",
        "duel",
        "eagle-emblem",
        "earth-crack",
        "earth-spit",
        "eclipse",
        "edge-crack",
        "edged-shield",
        "egg-clutch",
        "egg-pod",
        "egyptian-pyramids",
        "elderberry",
        "electric-whip",
        "electric",
        "elf-ear",
        "ember-shot",
        "embrassed-energy",
        "embryo",
        "emerald",
        "empty-chessboard",
        "empty-hourglass",
        "energise",
        "energy-arrow",
        "energy-shield",
        "energy-sword",
        "engagement-ring",
        "ent-mouth",
        "envelope",
        "erlenmeyer",
        "eruption",
        "eskimo",
        "evil-book",
        "evil-fork",
        "evil-moon",
        "evil-tree",
        "evil-wings",
        "expander",
        "explosive-materials",
        "extra-lucid",
        "eye-shield",
        "eyeball",
        "eyedropper",
        "eyestalk",
        "fairy-wand",
        "fairy",
        "fall-down",
        "falling-eye",
        "falling-leaf",
        "falling-ovoid",
        "falling",
        "fanged-skull",
        "feather",
        "feathered-wing",
        "fedora",
        "female",
        "fez",
        "field",
        "fire-ace",
        "fire-axe",
        "fire-bomb",
        "fire-bottle",
        "fire-bowl",
        "fire-breath",
        "fire-punch",
        "fire-ring",
        "fire-shield",
        "fire-wave",
        "fire",
        "fireball",
        "fireflake",
        "firework-rocket",
        "fish-corpse",
        "fishbone",
        "fishing-hook",
        "fishing-net",
        "fist",
        "fizzing-flask",
        "flake",
        "flame-spin",
        "flame-tunnel",
        "flame",
        "flamer",
        "flaming-arrow",
        "flaming-claw",
        "flaming-trident",
        "flash-grenade",
        "flat-hammer",
        "fleshy-mass",
        "flexible-star",
        "floating-crystal",
        "flower-pot",
        "flowers",
        "fluffy-cloud",
        "fluffy-swirl",
        "fluffy-wing",
        "flying-dagger",
        "flying-flag",
        "foam",
        "focused-lightning",
        "folded-paper",
        "food-chain",
        "foot-trip",
        "footprint",
        "forward-field",
        "fossil",
        "fountain-pen",
        "fountain",
        "fox-head",
        "fragrance",
        "frankenstein-creature",
        "freedom-dove",
        "frog",
        "front-teeth",
        "frontal-lobe",
        "frostfire",
        "frozen-arrow",
        "frozen-block",
        "frozen-orb",
        "fruiting",
        "fulguro-punch",
        "galleon",
        "gamepad-cross",
        "gas-mask",
        "gavel",
        "gaze",
        "gear-hammer",
        "gears",
        "gecko",
        "gem-chain",
        "gem-necklace",
        "gem-pendant",
        "gemini",
        "gems",
        "ghost",
        "gibbet",
        "gift-of-knowledge",
        "gift-trap",
        "glass-heart",
        "glass-shot",
        "globe",
        "gloop",
        "glowing-hands",
        "gluttonous-smile",
        "gluttony",
        "gold-bar",
        "gold-scarab",
        "goo-explosion",
        "goo-skull",
        "goo-spurt",
        "gooey-daemon",
        "gooey-eyed-sun",
        "gooey-impact",
        "gooey-sword",
        "grab",
        "grapes",
        "grasping-claws",
        "grass",
        "grease-trap",
        "grenade",
        "grim-reaper",
        "groundbreaker",
        "guarded-tower",
        "guillotine",
        "guitar",
        "gunshot",
        "halberd-shuriken",
        "halberd",
        "half-heart",
        "hammer-drop",
        "hammer-nails",
        "hand-of-god",
        "hand-saw",
        "hand",
        "handcuffs",
        "hanging-spider",
        "harpoon-chain",
        "harpoon-trident",
        "harpy",
        "hatchets",
        "haunting",
        "hazard-sign",
        "head-shot",
        "headshot",
        "health-decrease",
        "health-increase",
        "health-normal",
        "heart-bottle",
        "heart-drop",
        "heart-inside",
        "heart-organ",
        "heart-tower",
        "heartburn",
        "heat-haze",
        "heavy-arrow",
        "heavy-helm",
        "heavy-rain",
        "helmet",
        "help",
        "hidden",
        "high-grass",
        "high-shot",
        "hive",
        "hole-ladder",
        "holy-grail",
        "holy-symbol",
        "honeycomb",
        "honeypot",
        "hood",
        "hoof",
        "horn-internal",
        "horned-helm",
        "horned-skull",
        "horse-head",
        "horseshoe",
        "hospital-cross",
        "hot-spices",
        "hot-surface",
        "hound",
        "hourglass",
        "human-ear",
        "hunting-horn",
        "hydra-shot",
        "hydra",
        "hypersonic-bolt",
        "hypodermic-test",
        "ice-bolt",
        "ice-bomb",
        "ice-cube",
        "ice-shield",
        "ice-spear",
        "icebergs",
        "ifrit",
        "imbricated-arrows",
        "imp-laugh",
        "imp",
        "impact-point",
        "implosion",
        "imprisoned",
        "incense",
        "incisors",
        "infested-mass",
        "ink-swirl",
        "inner-self",
        "insect-jaws",
        "interdiction",
        "internal-injury",
        "internal-organ",
        "interstellar-path",
        "invisible-face",
        "invisible",
        "iron-mask",
        "james-bond-aperture",
        "jawbone",
        "jellyfish",
        "jet-pack",
        "jetpack",
        "jeweled-chalice",
        "jigsaw-box",
        "jigsaw-piece",
        "journey",
        "juggler",
        "justice-star",
        "kaleidoscope-pearls",
        "kevlar",
        "key",
        "kindle",
        "king",
        "kitchen-knives",
        "knapsack",
        "knife-fork",
        "knife-thrust",
        "lamellar",
        "lamprey-mouth",
        "land-mine",
        "lantern-flame",
        "lantern",
        "laser-blast",
        "laser-gun",
        "laser-sparks",
        "laser-warning",
        "laserburn",
        "lasso",
        "laurel-crown",
        "laurels",
        "lava",
        "law-star",
        "layered-armor",
        "leaf-skeleton",
        "leaf-swirl",
        "leaky-skull",
        "leather-boot",
        "leather-vest",
        "leeching-worm",
        "leo",
        "letter-bomb",
        "level-four-advanced",
        "level-four",
        "level-three-advanced",
        "level-three",
        "level-two-advanced",
        "level-two",
        "lever",
        "libra",
        "life-in-the-balance",
        "life-support",
        "life-tap",
        "lift",
        "light-bulb",
        "lightning-arc",
        "lightning-bow",
        "lightning-branches",
        "lightning-frequency",
        "lightning-helix",
        "lightning-shield",
        "lightning-shout",
        "lightning-storm",
        "lightning-tear",
        "linked-rings",
        "lion",
        "lips",
        "lit-candelabra",
        "lizard-tongue",
        "lizardman",
        "lob-arrow",
        "locked-chest",
        "locked-fortress",
        "lotus-flower",
        "lotus",
        "love-howl",
        "love-song",
        "lucifer-cannon",
        "lyre",
        "mace-head",
        "machete",
        "mad-scientist",
        "maggot",
        "magic-gate",
        "magic-lamp",
        "magic-palm",
        "magic-portal",
        "magic-shield",
        "magic-swirl",
        "magnet-blast",
        "magnet",
        "magnifying-glass",
        "mail-shirt",
        "mailed-fist",
        "male",
        "manacles",
        "mantrap",
        "maple-leaf",
        "marrow-drain",
        "martini",
        "masked-spider",
        "mass-driver",
        "match-head",
        "materials-science",
        "maze",
        "meat-cleaver",
        "meat-hook",
        "meat",
        "mechanical-arm",
        "medal-skull",
        "medal",
        "medical-pack-alt",
        "medical-pack",
        "meditation",
        "mesh-ball",
        "metal-bar",
        "metal-disc",
        "metal-hand",
        "meteor-impact",
        "microchip",
        "microscope-lens",
        "mighty-boosh",
        "mine-wagon",
        "mineral-heart",
        "minigun",
        "mining",
        "minions",
        "minotaur",
        "miracle-medecine",
        "mirror-mirror",
        "missile-mech",
        "missile-pod",
        "missile-swarm",
        "mite-alt",
        "mite",
        "mixed-swords",
        "moebius-star",
        "moebius-triangle",
        "molecule",
        "molotov",
        "monkey",
        "moon",
        "morbid-humour",
        "mountain-cave",
        "mountains",
        "mountaintop",
        "mouse",
        "mouth-watering",
        "movement-sensor",
        "mucous-pillar",
        "muscle-fat",
        "muscle-up",
        "mushroom-cloud",
        "mushroom-gills",
        "mushroom",
        "nailed-foot",
        "nailed-head",
        "nails",
        "needle-drill",
        "needle-jaws",
        "night-sky",
        "ninja-mask",
        "nodular",
        "nothing-to-say",
        "nuclear",
        "oak",
        "ocarina",
        "octopus",
        "omega",
        "on-target",
        "one-eyed",
        "open-book",
        "open-wound",
        "ophiuchus",
        "oppression",
        "orb-direction",
        "orb-wand",
        "orbital",
        "ouroboros",
        "over-infinity",
        "overdose",
        "overdrive",
        "overhead",
        "overkill",
        "overmind",
        "owl",
        "padlock",
        "palm-tree",
        "palm",
        "paper-bomb",
        "paper-lantern",
        "paper",
        "papers",
        "parachute",
        "paranoia",
        "parmecia",
        "parrot-head",
        "paw-front",
        "paw-heart",
        "paw",
        "pawn",
        "pawprint",
        "perfume-bottle",
        "perspective-dice-six-faces-five",
        "perspective-dice-six-faces-four",
        "perspective-dice-six-faces-one",
        "perspective-dice-six-faces-random",
        "perspective-dice-six-faces-six",
        "perspective-dice-six-faces-three",
        "perspective-dice-six-faces-two",
        "pie-slice",
        "pierced-body",
        "pierced-heart",
        "pill-drop",
        "pill",
        "pincers",
        "pine-tree",
        "ping-pong-bat",
        "pirate-grave",
        "pirate-skull",
        "pisces",
        "pistol-gun",
        "pizza-cutter",
        "plain-dagger",
        "planks",
        "plasma-bolt",
        "plastron",
        "pocket-bow",
        "podium",
        "pointing",
        "pointy-hat",
        "poison-bottle",
        "poison-cloud",
        "poison-gas",
        "poison",
        "poker-hand",
        "pollen-dust",
        "portculis",
        "potion-ball",
        "pounce",
        "pouring-chalice",
        "powder",
        "prayer",
        "pretty-fangs",
        "profit",
        "psychic-waves",
        "pulse",
        "pummeled",
        "pumpkin-lantern",
        "pumpkin-mask",
        "punch",
        "puppet",
        "pyromaniac",
        "quake-stomp",
        "queen-crown",
        "quick-slash",
        "quicksand",
        "quill-ink",
        "quill",
        "rabbit",
        "radar-dish",
        "radar-sweep",
        "radial-balance",
        "radioactive",
        "ragged-wound",
        "rainbow-star",
        "raining",
        "rally-the-troops",
        "ram",
        "rapidshare-arrow",
        "raven",
        "ray-gun",
        "razor-blade",
        "reactor",
        "reaper-scythe",
        "recycle",
        "regeneration",
        "relic-blade",
        "reticule",
        "revolt",
        "ribbon",
        "ribcage",
        "rifle",
        "ringed-planet",
        "ringing-bell",
        "riot-shield",
        "roast-chicken",
        "robe",
        "robot-golem",
        "rock",
        "rocket-flight",
        "rocket",
        "rogue",
        "rolling-bomb",
        "rose",
        "round-bottom-flask",
        "round-shield",
        "rss",
        "run",
        "rune-stone",
        "rune-sword",
        "saber-slash",
        "saber-tooth",
        "sacrificial-dagger",
        "sad-crab",
        "sagittarius",
        "salamander",
        "salt-shaker",
        "sands-of-time",
        "saphir",
        "sattelite",
        "saw-claw",
        "scale-mail",
        "scales",
        "scallop",
        "scalpel-strike",
        "scalpel",
        "scarab-beetle",
        "scarecrow",
        "scissors",
        "scorpio",
        "scorpion-tail",
        "scorpion",
        "screaming",
        "screwdriver",
        "scroll-unfurled",
        "scythe",
        "sea-dragon",
        "sea-serpent",
        "seated-mouse",
        "select",
        "semi-closed-eye",
        "sentry-gun",
        "serrated-slash",
        "sewing-needle",
        "shard-sword",
        "shark-jaws",
        "sharp-crown",
        "sharp-smile",
        "shatter",
        "shattered-glass",
        "shattered-sword",
        "sheikah-eye",
        "shield-echoes",
        "shield-reflect",
        "shield",
        "shieldcomb",
        "shining-claw",
        "shining-heart",
        "shining-sword",
        "shiny-apple",
        "shiny-iris",
        "shiny-purse",
        "shotgun",
        "shoulder-scales",
        "shouting",
        "shuriken",
        "sickle",
        "sideswipe",
        "silence",
        "sing",
        "six-eyes",
        "skeleton-inside",
        "skeleton-key",
        "skid-mark",
        "skull-bolt",
        "skull-crack",
        "skull-crossed-bones",
        "skull-in-jar",
        "skull-mask",
        "skull-ring",
        "skull-shield",
        "skull-signet",
        "slap",
        "slashed-shield",
        "slavery-whip",
        "sleepy",
        "sliced-bread",
        "slow-blob",
        "sly",
        "small-fire",
        "smitten",
        "smoking-finger",
        "snail",
        "snake-bite",
        "snake-totem",
        "snake",
        "snatch",
        "snorkel",
        "snow-bottle",
        "snowflake-1",
        "snowflake-2",
        "snowing",
        "snowman",
        "soccer-ball",
        "sonic-boom",
        "sonic-screech",
        "sonic-shout",
        "space-suit",
        "spade-skull",
        "spade",
        "spanner",
        "sparkling-sabre",
        "sparky-bomb",
        "sparrow",
        "spartan",
        "spatter",
        "spawn-node",
        "spears",
        "spectacle-lenses",
        "spectacles",
        "spectre",
        "spider-alt",
        "spider-face",
        "spikeball",
        "spiked-armor",
        "spiked-collar",
        "spiked-fence",
        "spiked-mace",
        "spiked-shell",
        "spiked-snail",
        "spiked-tentacle",
        "spikes-full",
        "spikes-half",
        "spikes-init",
        "spikes",
        "spill",
        "spinal-coil",
        "spine-arrow",
        "spinning-blades",
        "spinning-sword",
        "spiral-arrow",
        "spiral-bloom",
        "spiral-bottle",
        "spiral-shell",
        "spiral-thrust",
        "splash",
        "split-body",
        "split-cross",
        "splurt",
        "spoon",
        "spoted-flower",
        "spotted-mushroom",
        "spotted-wound",
        "spoutnik",
        "spray",
        "sprint",
        "sprout-disc",
        "sprout",
        "spyglass",
        "square-bottle",
        "squid-head",
        "squid",
        "stag-head",
        "stalagtite",
        "star-prominences",
        "star-pupil",
        "star-sattelites",
        "star-swirl",
        "staryu",
        "static",
        "steel-claws",
        "steeltoe-boots",
        "steelwing-emblem",
        "stick-splitting",
        "sticking-plaster",
        "stigmata",
        "stiletto",
        "stitched-wound",
        "stomp",
        "stone-axe",
        "stone-block",
        "stone-crafting",
        "stone-pile",
        "stone-spear",
        "stone-sphere",
        "stone-tablet",
        "stone-throne",
        "stone-tower",
        "stopwatch",
        "strafe",
        "striking-balls",
        "striking-diamonds",
        "strong",
        "suckered-tentacle",
        "suicide",
        "suits",
        "sun",
        "sunbeams",
        "sundial",
        "sunken-eye",
        "sunrise",
        "super-mushroom",
        "supersonic-arrow",
        "supersonic-bullet",
        "surprised-skull",
        "surprised",
        "suspicious",
        "swallow",
        "swamp",
        "swan",
        "swap-bag",
        "sword-array",
        "sword-break",
        "sword-clash",
        "sword-hilt",
        "sword-in-stone",
        "sword-slice",
        "sword-smithing",
        "sword-spade",
        "sword-spin",
        "syringe",
        "tank",
        "target-arrows",
        "target-dummy",
        "target-laser",
        "target-shot",
        "targeted",
        "targeting",
        "tattered-banner",
        "taurus",
        "teapot",
        "tear-tracks",
        "techno-heart",
        "telefrag",
        "telepathy",
        "teleport",
        "templar-heart",
        "temptation",
        "tennis-ball",
        "tentacle-strike",
        "tentacurl",
        "terror",
        "tesla-coil",
        "tesla-turret",
        "tesla",
        "test-tubes",
        "thermometer-scale",
        "third-eye",
        "thor-fist",
        "thorn-helix",
        "thorned-arrow",
        "thorny-vine",
        "three-keys",
        "three-leaves",
        "thrown-charcoal",
        "thrown-daggers",
        "thrown-knife",
        "thrown-spear",
        "thrust",
        "thunder-skull",
        "thunder-struck",
        "thunderball",
        "tic-tac-toe",
        "tick",
        "tied-scroll",
        "time-bomb",
        "time-trap",
        "tinker",
        "toad-teeth",
        "tombstone",
        "tooth",
        "top-hat",
        "top-paw",
        "torch",
        "tornado",
        "totem-head",
        "tower-fall",
        "trade",
        "trample",
        "transfuse",
        "transportation-rings",
        "tread",
        "treasure-map",
        "tree-branch",
        "trefoil-lily",
        "trefoil-shuriken",
        "tribal-mask",
        "trident",
        "trigger-hurt",
        "trilobite",
        "triorb",
        "triple-claws",
        "triple-corn",
        "triple-lock",
        "triple-needle",
        "triple-skulls",
        "tripwire",
        "tron-arrow",
        "trophy",
        "trousers",
        "tune-pitch",
        "turd",
        "turret",
        "turtle-shell",
        "turtle",
        "twirly-flower",
        "twister",
        "two-feathers",
        "two-shadows",
        "tyre",
        "ubisoft-sun",
        "udder",
        "ultrasound",
        "umbrella",
        "uncertainty",
        "underhand",
        "unfriendly-fire",
        "unlit-bomb",
        "unlit-candelabra",
        "unplugged",
        "unstable-projectile",
        "usable",
        "valley",
        "vanilla-flower",
        "vial",
        "vile-fluid",
        "vine-flower",
        "vine-leaf",
        "vine-whip",
        "vintage-robot",
        "viola",
        "virgo",
        "virus",
        "visored-helm",
        "volcano",
        "vomiting",
        "voodoo-doll",
        "vortex",
        "vulture",
        "walking-boot",
        "wasp-sting",
        "water-bolt",
        "water-drop",
        "water-splash",
        "wave-crest",
        "wave-strike",
        "wavy-chains",
        "wavy-itinerary",
        "wax-seal",
        "web-spit",
        "weight-crush",
        "wheat",
        "whip",
        "whiplash",
        "whirlwind",
        "white-book",
        "white-cat",
        "white-tower",
        "wildfires",
        "william-tell",
        "windmill",
        "wine-glass",
        "wing-cloak",
        "winged-arrow",
        "winged-emblem",
        "winged-shield",
        "winged-sword",
        "wingfoot",
        "witch-flight",
        "wizard-staff",
        "wolf-head",
        "wolf-howl",
        "wolf-trap",
        "wolverine-claws",
        "wood-axe",
        "wood-pile",
        "wooden-door",
        "wooden-sign",
        "world",
        "worm-mouth",
        "worried-eyes",
        "wrapped-heart",
        "wrapped-sweet",
        "wrecking-ball",
        "wrench",
        "wyvern",
        "zebra-shield",
        "zeus-sword",
        "zigzag-leaf",
        "zigzag-tune"
    ];
    var class_icon_names = [
        "dnd5eclass-barbarian",
        "dnd5eclass-bard",
        "dnd5eclass-cleric",
        "dnd5eclass-druid",
        "dnd5eclass-fighter",
        "dnd5eclass-monk",
        "dnd5eclass-paladin",
        "dnd5eclass-ranger",
        "dnd5eclass-rogue",
        "dnd5eclass-sorcerer",
        "dnd5eclass-warlock",
        "dnd5eclass-wizard"
    ];
    RpgCardsUI.icon_names = RpgCardsUI.icon_names.concat(class_icon_names);
})(RpgCardsUI || (RpgCardsUI = {}));
var RpgCardsUI;
(function (RpgCardsUI) {
    RpgCardsUI.card_data_example = [
        {
            "count": 1,
            "color": "maroon",
            "title": "Burning Hands",
            "icon": "book-cover",
            "icon_back": "robe",
            "contents": [
                "subtitle | 1st level evocation",
                "rule",
                "property | Casting time | 1 action",
                "property | Range | Self (15ft cone)",
                "property | Components | V,S",
                "rule",
                "fill | 2",
                "text | Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes <b>3d6 fire damage</b> on a failed save, or half as much damage on a successful one.",
                "text | The fire ignites any flammable objects in the area that aren't being worn or carried.",
                "fill | 3",
                "section | At higher levels",
                "text | +1d6 damage for each slot above 1st"
            ],
            "tags": ["spell", "mage"]
        },
        {
            "count": 1,
            "color": "indigo",
            "title": "Cunning Action",
            "icon": "white-book",
            "icon_back": "cloak-dagger",
            "contents": [
                "subtitle | Rogue feature",
                "rule",
                "fill | 2",
                "text | You can take a <b>bonus action on each of your turns</b> in combat. This action can be used only to take the <b>Dash, Disengage, or Hide</b> action.",
                "fill | 2",
                "section | Fast hands (Thief 3rd)",
                "text | You can also use the bonus action to make a Dexterity (<b>Sleight of Hand</b>) check, use your thieves' tools to <b>disarm a trap</b> or <b>open a lock</b>, or take the <b>Use an Object</b> action."
            ],
            "tags": ["feature", "rogue"]
        },
        {
            "count": 1,
            "color": "dimgray",
            "title": "Full Plate",
            "icon": "breastplate",
            "contents": [
                "subtitle | Heavy armor (1500gp)",
                "rule",
                "property | AC | 18",
                "property | Strength required | 15",
                "property | Stealth | Disadvantage",
                "rule",
                "fill | 2",
                "description | Heavy | Unless you have the required strength, your speed is reduced by 10 feet.",
                "description | Stealth | You have disadvantage on Dexterity (Stealth) checks.",
                "fill | 3"
            ],
            "tags": ["item", "armor"]
        },
        {
            "count": 1,
            "color": "dimgray",
            "title": "Dagger",
            "icon": "mixed-swords",
            "contents": [
                "subtitle | Simple melee weapon (2gp)",
                "rule",
                "property | Damage | 1d4 piercing",
                "property | Modifier | Strength or Dexterity",
                "property | Properties | Light, Finesse, Thrown (20/60)",
                "rule",
                "fill | 2",
                "description | Finesse | Use your choice of Strength or Dexterity modifier for attack and damage.",
                "description | Light | When you attack while dual wielding light weapons, you may use a bonus action to attack with your off hand.",
                "description | Thrown | You can throw the weapon to make a ranged attack with the given range.",
                "fill | 3"
            ],
            "tags": ["item", "weapon"]
        },
        {
            "count": 1,
            "color": "dimgray",
            "title": "Shortsword of Very Long Names",
            "title_size": "10",
            "icon": "crossed-swords",
            "contents": [
                "subtitle | Simple melee weapon (10gp)",
                "rule",
                "property | Damage | 1d6 piercing",
                "property | Modifier | Strength or Dexterity",
                "property | Properties | Light, Finesse",
                "rule",
                "fill | 2",
                "description | Finesse | Use your choice of Strength or Dexterity modifier for attack and damage.",
                "description | Light | When you attack while dual wielding light weapons, you may use a bonus action to attack with your off hand.",
                "fill | 3"
            ],
            "tags": ["item", "weapon", "magic"]
        },
        {
            "count": 1,
            "color": "dimgray",
            "title": "Wand of Magic Missiles",
            "icon": "crystal-wand",
            "contents": [
                "subtitle | Wondrous item",
                "rule",
                "property | Maximum charges | 7",
                "property | Recharge | 1d6+1 each day",
                "property | Depletion | If you expend the last charge, roll a d20. On a 1, the item is destroyed.",
                "rule",
                "fill | 2",
                "description | Spells | You can use your action to cast the following spells:",
                "bullet | magic missile, 1st level (1 charge)",
                "bullet | magic missile, 2nd level (2 charges)",
                "bullet | magic missile, 3rd level (3 charges)",
                "fill | 3",
                "boxes | 7 | 2.5"
            ],
            "tags": ["item", "wondrous-item", "magic"]
        },
        {
            "count": 2,
            "color": "dimgray",
            "title": "Potion of Healing",
            "icon": "drink-me",
            "contents": [
                "subtitle | Potion (50gp)",
                "rule",
                "property | Use time | 1 action",
                "property | Hit points restored | 2d4+2",
                "rule",
                "fill | 2",
                "text | When you drink this potion, you regain 2d4+2 hitpoints.",
                "text | Drinking or administering a potion takes 1 action.",
                "fill | 3"
            ],
            "tags": ["item", "consumable"]
        },
        {
            "count": 1,
            "color": "black",
            "title": "Goblin",
            "icon": "imp-laugh",
            "contents": [
                "subtitle | Small humanoid (goblinoid)",
                "rule",
                "property | Armor class | 15 (leather armor, shield)",
                "property | Hit points | 7 (2d6)",
                "rule",
                "dndstats | 8 | 14 | 10 | 10 | 8 | 8",
                "rule",
                "property | Skills | Stealth +6",
                "property | Challenge | 1/4 (50 XP)",
                "rule",
                "description | Nimble escape | Disengage or Hide as bonus action",
                "fill | 2",
                "section | Actions",
                "description | Scimitar | Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage"
            ],
            "tags": ["creature", "humanoid"]
        }
    ];
})(RpgCardsUI || (RpgCardsUI = {}));
/// <reference path="./card.ts" />
/// <reference path="./colors.ts" />
/// <reference path="./icons.ts" />
/// <reference path="./example_data.ts" />
/// <reference path="./jquery.d.ts" />
/// <reference path="./ace.d.ts" />
/// <reference path="./shortcut.d.ts" />
var RpgCardsUI;
(function (RpgCardsUI) {
    var deck = null;
    var options = null;
    var cardGenerator = null;
    var pageGenerator = null;
    var editor;
    var editorFilter;
    var editorSort;
    var update_in_progress = false;
    // ============================================================================
    // Seleted card
    // ============================================================================
    function selected_card_index() {
        return parseInt($("#selected-card").val(), 10);
    }
    function selected_card() {
        var index = selected_card_index();
        if (deck.cards.length > index) {
            return deck.cards[index];
        }
        else {
            return null;
        }
    }
    function select_card_by_index(index) {
        var size = deck.cards.length;
        if (size === 0) {
            $("#selected-card").val("");
            update_selected_card();
        }
        else {
            index = Math.min(size - 1, index);
            index = Math.max(0, index);
            if (index != selected_card_index()) {
                $("#selected-card").val("" + index);
                update_selected_card();
            }
        }
    }
    function select_first_card() {
        select_card_by_index(0);
    }
    function select_last_card() {
        select_card_by_index(deck.cards.length - 1);
    }
    function select_next_card() {
        select_card_by_index(selected_card_index() + 1);
    }
    function select_prev_card() {
        select_card_by_index(selected_card_index() - 1);
    }
    function select_card_by_card(card) {
        var index = deck.cards.indexOf(card);
        select_card_by_index(index);
    }
    // ============================================================================
    // Rendering
    // ============================================================================
    function render_selected_card() {
        if (update_in_progress) {
            return;
        }
        var card = selected_card();
        $('#preview-container').empty();
        if (card) {
            var front = cardGenerator.card_front(card, options, "  ");
            var back = cardGenerator.card_back(card, options, "  ");
            $('#preview-container').html(front + "\n" + back);
        }
    }
    function update_selected_card() {
        update_in_progress = true;
        var card = selected_card();
        if (card) {
            $("#card-title").val(card.title);
            $("#card-title-size").val(card.title_size);
            $("#card-title-icon-text").val(card.title_icon_text);
            $("#card-count").val("" + card.count);
            $("#card-icon").val(card.icon);
            $("#card-icon-back").val(card.icon_back);
            //$("#card-contents").val(card.contents.join("\n"));
            editor.setValue(card.contents.join("\n"), -1);
            $("#card-tags").val(card.tags.join(", "));
            $("#card-color").val(card.color).change();
        }
        else {
            $("#card-title").val("");
            $("#card-title-size").val("");
            $("#card-title-icon-text").val("");
            $("#card-count").val("1");
            $("#card-icon").val("");
            $("#card-icon-back").val("");
            //$("#card-contents").val("");
            editor.setValue("");
            $("#card-tags").val("");
            $("#card-color").val("").change();
        }
        update_in_progress = false;
        render_selected_card();
    }
    function update_card_list() {
        deck.commit();
        $("#total_card_count").text("This deck contains " + deck.cards.length + " unique cards.");
        $('#selected-card').empty();
        for (var i = 0; i < deck.cards.length; ++i) {
            var card = deck.cards[i];
            $('#selected-card').append($("<option></option>").attr("value", i).text(card.title));
        }
        update_selected_card();
    }
    // ============================================================================
    // Color picker
    // ============================================================================
    function setup_color_selector() {
        // Insert colors
        $.each(RpgCardsUI.card_colors, function (name, val) {
            $(".colorselector-data").append($("<option></option>").attr("value", name).attr("data-color", val).text(name));
        });
        // Callbacks for when the user picks a color
        $('#default_color_selector').colorselector({
            callback: function (value, color, title) {
                $("#default-color").val(title);
                set_default_color(title);
            }
        });
        $('#card_color_selector').colorselector({
            callback: function (value, color, title) {
                $("#card-color").val(title);
                set_card_color(value);
            }
        });
        $('#foreground_color_selector').colorselector({
            callback: function (value, color, title) {
                $("#foreground-color").val(title);
                set_foreground_color(value);
            }
        });
        $('#background_color_selector').colorselector({
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
            $(selector).colorselector("setValue", color);
        }
        else {
            // Unknown color - select a neutral color and reset the text value
            $(selector).colorselector("setValue", "");
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
        var value = editor.getValue();
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
            }
            else {
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
        deck.cards.forEach(function (card) {
            card.color = options.default_color;
        });
        render_selected_card();
    }
    function apply_default_icon() {
        deck.cards.forEach(function (card) {
            card.icon = options.default_icon;
        });
        render_selected_card();
    }
    function apply_default_icon_back() {
        deck.cards.forEach(function (card) {
            card.icon_back = options.default_icon;
        });
        render_selected_card();
    }
    function sort() {
        showModal("#sort-modal");
    }
    function sort_execute() {
        hideModal("#sort-modal");
        var fn_code = editorSort.getValue();
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
        var fn_code = editorFilter.getValue();
        var fn = new Function("card", "deck", fn_code);
        deck.cards.forEach(function (card) {
            fn(card, deck);
        });
        deck.commit();
        update_card_list();
    }
    // ============================================================================
    // Modals
    // ============================================================================
    function showModal(id) {
        $(id).modal('show');
    }
    function hideModal(id) {
        $(id).modal('hide');
    }
    // ============================================================================
    // I/O
    // ============================================================================
    function save_file() {
        var str = JSON.stringify(deck.toJSON(), null, "  ");
        var parts = [str];
        var blob = new Blob(parts, { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = $("#file-save-link")[0];
        a.href = url;
        a.download = "rpg_cards.json";
        a.click();
        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 1000);
    }
    function load_sample() {
        deck = RpgCards.CardDeck.fromJSON(RpgCardsUI.card_data_example);
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
        $("#file-load-form")[0].reset();
    }
    function add_cards(cards) {
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
        }
        else {
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
        setTimeout(function () {
            tab.postMessage(card_html, '*');
        }, 500);
    }
    function collapse_menu() {
        $("#menu-column").hide();
        $("#card-column").removeClass("col-lg-5");
        $("#card-column").addClass("col-lg-8");
        editor.resize();
    }
    function uncollapse_menu() {
        $("#menu-column").show();
        $("#card-column").removeClass("col-lg-8");
        $("#card-column").addClass("col-lg-5");
        editor.resize();
    }
    function toggle_menu() {
        if ($("#menu-column").is(":visible")) {
            collapse_menu();
        }
        else {
            uncollapse_menu();
        }
    }
    RpgCardsUI.toggle_menu = toggle_menu;
    // ============================================================================
    // Initialization
    // ============================================================================
    function init() {
        deck = new RpgCards.CardDeck();
        options = new RpgCards.Options();
        cardGenerator = new RpgCards.CardHtmlGenerator;
        pageGenerator = new RpgCards.PageHtmlGenerator;
        editor = ace.edit("card-contents");
        editor.setShowInvisibles(true);
        editor.renderer.setShowGutter(false);
        editor.setOption("wrap", "free");
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode("ace/mode/rpgcard");
        editor.$blockScrolling = Infinity;
        editorFilter = ace.edit("filter-function");
        editorFilter.setShowInvisibles(true);
        editorFilter.setTheme("ace/theme/chrome");
        editorFilter.getSession().setMode("ace/mode/javascript");
        editorSort = ace.edit("sort-function");
        editorSort.setShowInvisibles(true);
        editorSort.setTheme("ace/theme/chrome");
        editorSort.getSession().setMode("ace/mode/javascript");
        setup_color_selector();
        $('.icon-list').typeahead({ source: RpgCardsUI.icon_names });
        // Menu
        $("#sort-execute").click(sort_execute);
        $("#filter-execute").click(filter_execute);
        $("#button-generate").click(generate);
        $("#button-load").click(function () {
            $("#file-load").click();
        });
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
        editor.getSession().on('change', on_change_card_contents);
        //$("#card-contents").change(on_change_card_contents);
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
        // Shortcuts
        var shortcut_options = { disable_in_input: true };
        shortcut.add("ctrl+m", toggle_menu, shortcut_options);
        shortcut.add("ctrl+n", add_new_card, shortcut_options);
        shortcut.add("ctrl+d", duplicate_card, shortcut_options);
        shortcut.add("delete", delete_card, shortcut_options);
        shortcut.add("down", select_next_card, shortcut_options);
        shortcut.add("page_down", select_next_card, shortcut_options);
        shortcut.add("up", select_prev_card, shortcut_options);
        shortcut.add("page_up", select_prev_card, shortcut_options);
        shortcut.add("home", select_first_card, shortcut_options);
        shortcut.add("end", select_last_card, shortcut_options);
        update_card_list();
    }
    $(document).ready(function () {
        init();
    });
})(RpgCardsUI || (RpgCardsUI = {}));
//# sourceMappingURL=ui.js.map