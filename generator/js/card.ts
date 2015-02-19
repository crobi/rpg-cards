module RpgCards {

    function normalizeTag(tag: string): string {
        return tag.trim().toLowerCase();
    }

    function splitParams(value: string): string[] {
        return value.split("|").map(function (str) { return str.trim(); });
    }

    export class Options {
        foreground_color: string;
        background_color: string;
        empty_color: string;
        default_color: string;
        default_icon: string;
        default_title_size: string;
        page_size: string;
        page_rows: number;
        page_columns: number;
        card_arrangement: string;
        card_size: string;
        card_count: number;
        icon_inline: boolean;

        constructor() {
            this.foreground_color = "white";
            this.background_color = "white";
            this.empty_color = "black";
            this.default_color = "black";
            this.default_icon = "ace";
            this.default_title_size = "13";
            this.page_size = "A4";
            this.page_rows = 3;
            this.page_columns = 3;
            this.card_arrangement = "doublesided";
            this.card_size = "25x35";
            this.card_count = null;
            this.icon_inline = true;
        }
    }

    export class Card {
        count: number;
        title: string;
        title_size: string;
        title_icon_text: string;
        color: string;
        color_front: string;
        color_back: string;
        icon: string;
        icon_front: string;
        icon_back: string;
        contents: string[];
        tags: string[];

        userData: any;

        constructor() {
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

        static fromJSON(json: any): Card {
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
        }

        public toJSON(): any {
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
            }
        }

        public duplicate(): Card {
            var result = Card.fromJSON(this.toJSON());
            result.title += " (Copy)";
            return result;
        }

        public hasTag(tag: string): boolean {
            var index = this.tags.indexOf(normalizeTag(tag));
            return index > -1;
        }

        public addTag(tag: string): void {
            if (!this.hasTag(tag)) {
                this.tags.push(normalizeTag(tag));
            }
        }

        public removeTag(tag: string): void {
            var ntag = normalizeTag(tag);
            this.tags = this.tags.filter(function (t) {
                return ntag != t;
            });
        }

        public getTitle(options: Options): string {
            return this.title || "";
        }
        public getTitleSize(options: Options): string {
            return this.title_size || options.default_title_size || "13";
        }
        public getTitleIconText(options: Options): string {
            return this.title_icon_text || "";
        }
        public getColorFront(options: Options): string {
            return this.color_front || this.color || options.default_color || "black";
        }
        public getColorBack(options: Options): string {
            return this.color_back || this.color || options.default_color || "black";
        }
        public getIconFront(options: Options): string {
            return this.icon_front || this.icon || options.default_icon || "ace";
        }
        public getIconBack(options: Options): string {
            return this.icon_back || this.icon || options.default_icon || "ace";
        }
    };

    interface CardAction {
        fn: string;
        card: Card;
        ref: Card;
    }

    export class CardDeck {
        cards: Card[];
        private _actions: CardAction[];

        constructor() {
            this.cards = [];
            this._actions = [];
        }

        public toJSON(): any {
            return this.cards.map((card) => card.toJSON());
        }

        public static fromJSON(data: any): CardDeck {
            if (Array.isArray(data)) {
                var result = new CardDeck;
                for (var i = 0; i < data.length; ++i) {
                    result.cards.push(Card.fromJSON(data[i]));
                }
                return result;
            } else {
                throw new Error("Invalid data");
            }
        }

        public addCards(cards: Card[]): void {
            cards.forEach((card) => {
                this._actions.push({fn:"add", card: card, ref: null});
            });
        }

        public addNewCard(): Card {
            var newCard = new Card();
            this._actions.push({ fn: "add", card: newCard, ref: null });
            return newCard;
        }

        public duplicateCard(card: Card): Card {
            var newCard = card.duplicate();
            this._actions.push({ fn: "add", card: newCard, ref: card });
            return newCard;
        }

        public deleteCard(card: Card): void {
            this._actions.push({ fn: "del", card: card, ref: null });
        }

        public commit() {
            for (var i = 0; i < this._actions.length; ++i) {
                var action = this._actions[i];
                if (action.fn === "add") {
                    var index = this.cards.indexOf(action.ref);
                    if (index > -1) {
                        this.cards.splice(index + 1, 0, action.card);
                    } else {
                        this.cards.push(action.card);
                    }
                } else if (action.fn === "del") {
                    var index = this.cards.indexOf(action.card);
                    if (index > -1) {
                        this.cards.splice(index, 1);
                    }
                }
            }
            this._actions = [];
        }
    }

    type ContentGeneratorFunction = (params: string[], card: Card, options: Options, ind: string, ind0: string) => string;
    type CardGeneratorFunction = (card: Card, options: Options, ind: string, ind0: string) => string;

    export class CardHtmlGenerator {
        constructor() {
        }

        private  _icon(src: string, ind: string, ind0: string): string {
            return ind + '<card-icon src="/icons/' + src + '.svg"></card-icon>\n';
        }

        private  _subtitle(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var text = params[0] || "";
            return ind + '<card-subtitle>' + text + '</card-subtitle>\n';
        }

        private  _ruler(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            return ind + '<card-rule></card-rule>\n';
        }

        private  _boxes(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var count = params[0] || 1;
            var size = params[1] || 3;
            return ind + '<card-boxes size="' + size + '" count="' + count + '"></card-boxes>\n';
        }

        private  _property(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var header = params[0] || "";
            var text = params[1] || "";
            var result = "";
            result += ind + '<card-property>\n';
            result += ind + ind0 + '<h4>' + header + '</h4>\n';
            result += ind + ind0 + '<p>' + text + '</p>\n';
            result += ind + '</card-property>\n';
            return result;
        }

        private  _description(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var header = params[0] || "";
            var text = params[1] || "";
            var result = "";
            result += ind + '<card-description>\n';
            result += ind + ind0 + '<h4>' + header + '</h4>\n';
            result += ind + ind0 + '<p>' + text + '</p>\n';
            result += ind + '</card-description>\n';
            return result;
        }

        private  _text(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var text = params[0] || "";
            var result = "";
            result += ind + '<card-description>\n';
            result += ind + ind0 + '<p>' + text + '</p>\n';
            result += ind + '</card-description>\n';
            return result;
        }

        private  _dndstats(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
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
        }

        private  _bullet(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var text = params[0] || "";
            return ind + '<card-bullet>' + text + '</card-bullet>\n';
        }

        private  _section(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var text = params[0] || "";
            return ind + '<card-section>' + text + '</card-section>\n';
        }

        private  _fill(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var size = params[0] || "1";
            return ind + '<card-fill size="' + size + '"></card-fill>\n';
        }

        private  _unknown(params: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var text = params.join(' | ');
            return ind + '<card-description><p>' + text + '</p></card-description>\n';
        }

        private  _empty(params: string[], card: Card, options: Options, ind: string, ind0: string) {
            return '';
        }

        private  _contents(contents: string[], card: Card, options: Options, ind: string, ind0: string): string {
            var result = "";
            result += ind + '<card-contents>\n';
            result += contents.map((value) => {
                var parts = splitParams(value);
                var name = parts[0];
                var params = parts.splice(1);
                var generator: ContentGeneratorFunction = null;
                switch (name) {
                    case "subtitle": generator = this._subtitle; break;
                    case "property": generator = this._property; break;
                    case "rule": generator = this._ruler; break;
                    case "ruler": generator = this._ruler; break;
                    case "boxes": generator = this._boxes; break;
                    case "description": generator = this._description; break;
                    case "dndstats": generator = this._dndstats; break;
                    case "text": generator = this._text; break;
                    case "bullet": generator = this._bullet; break;
                    case "fill": generator = this._fill; break;
                    case "section": generator = this._section; break;
                    case "disabled": generator = this._empty; break;
                    case "": generator = this._empty; break;
                    default: return this._unknown(parts, card, options, ind, ind0);
                }

                return generator(params, card, options, ind + ind0, ind);
            }).join("\n");
            result += ind + '</card-contents>\n';
            return result;
        }

        private  _title(card: Card, options: Options, ind: string, ind0: string): string {
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
        }

        private  _card_front(card: Card, options: Options, ind: string, ind0: string): string {
            var result = "";
            result += this._title(card, options, ind + ind0, ind0);
            result += this._contents(card.contents, card, options, ind + ind0, ind0);
            return result;
        }

        private  _card_back(card: Card, options: Options, ind: string, ind0: string): string {
            var icon = card.getIconBack(options);
            var result = "";
            result += ind + '<card-back>\n';
            result += this._icon(icon, ind + ind0, ind);
            result += ind + '</card-back>\n';
            return result;
        }

        private  _card_empty(options: Options, ind: string, ind0: string): string {
            var result = "";
            result += ind + '<card-contents>\n';
            result += ind + '</card-contents>\n';
            return result;
        }

        private  _card(options: Options, ind: string, ind0: string, content: string, color: string): string {
            var size = options.card_size || "25x35";
            var result = "";
            result += ind + '<rpg-card color="' + color + '" size="' + size + '">\n';
            result += content;
            result += ind + '</rpg-card>\n';
            return result;
        }

        /** Generates HTML for the front side of the given card */
        public  card_front(card: Card, options: Options, indent: string): string {
            var content = this._card_front(card, options, "", indent);
            return this._card(options, "", indent, content, card.getColorFront(options));
        }

        /** Generates HTML for the back side of the given card */
        public  card_back(card: Card, options: Options, indent: string): string {
            var content = this._card_back(card, options, "", indent);
            return this._card(options, "", indent, content, card.getColorBack(options));
        }

        /** Generates HTML for an empty given card */
        public  card_empty(options: Options, indent: string): string {
            var content = this._card_empty(options, "", indent);
            return this._card(options, "", indent, content, options.empty_color);
        }
    }

    class CardPage<T> {
        rows: number;
        cols: number;
        cards: T[];

        constructor(rows: number, cols: number) {
            this.rows = rows;
            this.cols = cols;
            this.cards = [];
        }

        /** Returns an empty page with the same dimensions */
        public newPage(): CardPage<T> {
            return new CardPage<T>(this.rows, this.cols);
        }

        private _posToIndex(row: number, col: number): number {
            return row * this.cols + col;
        }

        /** Adds one card to the page */
        public addCard(card: T): void {
            if (this.capacity() === 0) {
                throw new Error("This page is full.");
            }
            this.cards.push(card);
        }

        /** 
            Adds several copies of a card to the page.
            Returns the number of copies that did not fit on the page.
        */
        public addCards(card: T, count: number): number {
            while (this.capacity() > 0 && count > 0) {
                this.addCard(card);
                --count;
            }
            return count;
        }

        /** Fills all remaining slots on the current row with the given card */
        public fillRow(card: T): void {
            while (this.capacityRow() > 0) {
                this.addCard(card);
            }
        }

        /** Fills all remaining slots on the page with empty cards */
        public fillPage(card: T): void {
            while (this.capacity() > 0) {
                this.addCard(card);
            }
        }

        /** Empty slots on the page */
        public capacity(): number {
            return this.rows * this.cols - this.cards.length;
        }

        /** Empty slots on the current line */
        public capacityRow(): number {
            return this.capacity() % this.cols;
        }

        /** Flip card slots horizontally */
        public flipH() {
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
        }
    }

    class CardPageSet<T> {
        rows: number;
        cols: number;
        pages: CardPage<T>[];

        constructor(rows: number, cols: number) {
            this.rows = rows;
            this.cols = cols;
            this.pages = [];
        }

        public lastPage(): CardPage<T> {
            if (this.pages.length === 0) {
                return null;
            } else {
                return this.pages[this.pages.length - 1];
            }
        }

        public addPage(): CardPage<T> {
            var newPage = new CardPage<T>(this.rows, this.cols);
            this.pages.push(newPage);
            return newPage;
        }

        /**
            Adds one card to the last page.
            Adds a new pages if necessary.
        */
        public addCard(card: T): void {
            var page = this.lastPage();
            if (page === null || page.capacity() === 0) {
                page = this.addPage();
            }
            page.addCard(card);
        }

        /** 
            Adds several copies of a card to the last page.
            Adds new pages if necessary.
        */
        public addCards(card: T, count: number): void {
            for (var i = 0; i < count; ++i) {
                this.addCard(card);
            }
        }

        public forEach(fn: (page: CardPage<T>)=>void) {
            this.pages.forEach(fn);
        }

        public merge(other: CardPageSet<T>): CardPageSet<T> {
            if (this.pages.length !== other.pages.length) {
                throw new Error("This function is only for merging two equally sized page sets");
            }
            var result = new CardPageSet<T>(this.rows, this.cols);
            for (var i = 0; i < this.pages.length; ++i) {
                result.pages.push(this.pages[i]);
                result.pages.push(other.pages[i]);
            }
            return result;
        }
    }

    class BoxSize {
        page: string;
        width: string;
        height: string;
        width_px: number;
        height_px: number;

        constructor(p: string, w: string, h: string, wpx: number, hpx: number) {
            this.page = p;
            this.width = w;
            this.height = h;
            this.width_px = Math.floor(wpx);
            this.height_px = Math.floor(hpx);
        }
    }

    var boxSizes: { [id: string]: BoxSize } = {};
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
    

    export class PageHtmlGenerator {
        indent: string;

        constructor() {
            this.indent = "  ";
        }

        private  _pageColor(page: number, options: Options): string {
            if ((options.card_arrangement == "doublesided") && (page % 2 == 1)) {
                return options.background_color;
            } else {
                return options.foreground_color;
            }
        }

        private _wrap(pageSet: CardPageSet<string>, options: Options) {
            var result = "";
            for (var i = 0; i < pageSet.pages.length; ++i) {
                var page = pageSet.pages[i];
                var style = ' style="background-color:' + this._pageColor(i, options) + '"';
                result += '<card-page' + style + '>\n';
                result += page.cards.join("");
                result += '</card-page>\n';
            }
            return result;
        }

        private  _generatePagesDoublesided(cards: Card[], options: Options, rows: number, cols: number, generator: CardHtmlGenerator): CardPageSet<string> {
            var front_pages: CardPageSet<string> = new CardPageSet<string>(rows, cols);
            var back_pages: CardPageSet<string> = new CardPageSet<string>(rows, cols);
            var empty = generator.card_empty(options, this.indent);

            // Fill pages with cards
            for (var i = 0; i < cards.length; ++i) {
                var card = cards[i];
                var front = generator.card_front(card, options, this.indent);
                var back = generator.card_back(card, options, this.indent);
                front_pages.addCards(front, card.count);
                back_pages.addCards(back, card.count);
            }

            // Fill empty slots
            front_pages.forEach((page) => page.fillPage(empty));
            back_pages.forEach((page) => page.fillPage(empty));

            // Shuffle back cards so that they line up with their corresponding front cards
            back_pages.forEach((page) => page.flipH());

            // Interleave front and back pages so that we can print double-sided
            return front_pages.merge(back_pages);
        }

        private _generatePagesFrontOnly(cards: Card[], options: Options, rows: number, cols: number, generator: CardHtmlGenerator): CardPageSet<string> {
            var pages: CardPageSet<string> = new CardPageSet<string>(rows, cols);
            var empty = generator.card_empty(options, this.indent);

            // Fill pages with cards
            for (var i = 0; i < cards.length; ++i) {
                var card = cards[i];
                var front = generator.card_front(card, options, this.indent);
                pages.addCards(front, card.count);
            }

            // Fill empty slots
            pages.forEach((page) => page.fillPage(empty));

            return pages;
        }

        private _generatePagesSideBySide(cards: Card[], options: Options, rows: number, cols: number, generator: CardHtmlGenerator): CardPageSet<string> {
            if (cols < 2) {
                throw new Error("Need at least two columns for side-by-side");
            }
            var pages: CardPageSet<string> = new CardPageSet<string>(rows, cols);
            var empty = generator.card_empty(options, this.indent);

            // Fill pages with cards (two at a time)
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
            pages.forEach((page) => page.fillPage(empty));

            return pages;
        }

        private _generatePages(cards: Card[], options: Options, rows: number, cols: number, generator: CardHtmlGenerator): CardPageSet<string> {
            switch (options.card_arrangement) {
                case "doublesided": return this._generatePagesDoublesided(cards, options, rows, cols, generator);
                case "front_only": return this._generatePagesFrontOnly(cards, options, rows, cols, generator);
                case "side_by_side": return this._generatePagesSideBySide(cards, options, rows, cols, generator);
                default: throw new Error("Unknown card arrangement");
            }
        }

        private _generateStyle(options) {
            var page_box = boxSizes[options.page_size] || boxSizes["auto"];

            var result = '';
            result += '<style type="text/css">\n';
            result += 'body {\n';
            result += '    display: block;\n';
            result += '    background: rgb(204, 204, 204);\n';
            result += '}\n';
            result += 'card-page {\n';
            result += '    width: ' + (page_box.width_px - 2) + 'px;\n';
            result += '    height: ' + (page_box.height_px - 2) + 'px;\n';
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
        }

        public generateHtml(cards: Card[], options: Options) {
            options = options || new Options();
            var rows = options.page_rows || 3;
            var cols = options.page_columns || 3;

            // Generate the HTML for each card
            var generator = new CardHtmlGenerator();
            var pages: CardPageSet<string> = this._generatePages(cards, options, rows, cols, generator);

            // Wrap all pages in a <page> element
            var document = this._wrap(pages, options);

            // Generate the HTML for the page layout
            var style = this._generateStyle(options);

            // Wrap all pages in a <page> element and add CSS for the page size
            var result = "";
            result += style
            result += document;
            return result;
        }

        public insertInto(cards: Card[], options: Options, container: HTMLElement) {

            // Clear the previous content of the document
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }

            // Insert the HTML
            var html = this.generateHtml(cards, options);
            container.innerHTML = html;
        }
    }
}