/// <reference path="jquery.d.ts" />
/// <reference path="ace.d.ts" />
/// <reference path="shortcut.d.ts" />
declare module RpgCards {
    class Options {
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
        constructor();
    }
    class Card {
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
        constructor();
        static fromJSON(json: any): Card;
        toJSON(): any;
        duplicate(): Card;
        hasTag(tag: string): boolean;
        addTag(tag: string): void;
        removeTag(tag: string): void;
        findTag(pattern: string, flags?: string): string[];
        replaceTag(pattern: string, substitution: string, flags?: string): void;
        findContent(pattern: string, flags?: string): string[];
        replaceContent(pattern: string, substitution: string, flags?: string): void;
        findTitle(pattern: string, flags?: string): string[];
        findTitleAny(patterns: string[], flags?: string): string[];
        getTitle(options: Options): string;
        getTitleSize(options: Options): string;
        getTitleIconText(options: Options): string;
        getColorFront(options: Options): string;
        getColorBack(options: Options): string;
        getIconFront(options: Options): string;
        getIconBack(options: Options): string;
    }
    class CardDeck {
        cards: Card[];
        private _actions;
        constructor();
        toJSON(): any;
        static fromJSON(data: any): CardDeck;
        addCards(cards: Card[]): void;
        addNewCard(): Card;
        duplicateCard(card: Card): Card;
        deleteCard(card: Card): void;
        commit(): void;
    }
    class CardHtmlGenerator {
        constructor();
        private _icon(src, ind, ind0);
        private _subtitle(params, card, options, ind, ind0);
        private _ruler(params, card, options, ind, ind0);
        private _boxes(params, card, options, ind, ind0);
        private _property(params, card, options, ind, ind0);
        private _description(params, card, options, ind, ind0);
        private _text(params, card, options, ind, ind0);
        private _dndstats(params, card, options, ind, ind0);
        private _bullet(params, card, options, ind, ind0);
        private _section(params, card, options, ind, ind0);
        private _fill(params, card, options, ind, ind0);
        private _vspace(params, card, options, ind, ind0);
        private _unknown(params, card, options, ind, ind0);
        private _empty(params, card, options, ind, ind0);
        private _contents(contents, card, options, ind, ind0);
        private _title(card, options, ind, ind0);
        private _card_front(card, options, ind, ind0);
        private _card_back(card, options, ind, ind0);
        private _card_empty(options, ind, ind0);
        private _card(options, ind, ind0, content, color);
        /** Generates HTML for the front side of the given card */
        card_front(card: Card, options: Options, indent: string): string;
        /** Generates HTML for the back side of the given card */
        card_back(card: Card, options: Options, indent: string): string;
        /** Generates HTML for an empty given card */
        card_empty(options: Options, indent: string): string;
    }
    class PageHtmlGenerator {
        indent: string;
        constructor();
        private _pageColor(page, options);
        private _wrap(pageSet, options);
        private _generatePagesDoublesided(cards, options, rows, cols, generator);
        private _generatePagesFrontOnly(cards, options, rows, cols, generator);
        private _generatePagesSideBySide(cards, options, rows, cols, generator);
        private _generatePages(cards, options, rows, cols, generator);
        private _generateStyle(options);
        generateHtml(cards: Card[], options: Options): string;
        insertInto(cards: Card[], options: Options, container: HTMLElement): void;
    }
}
declare module RpgCardsUI {
    var css_color_names: string[];
    var card_colors: {
        "": string;
        "dimgray": string;
        "black": string;
        "darkgoldenrod": string;
        "saddlebrown": string;
        "indianred": string;
        "maroon": string;
        "indigo": string;
        "darkblue": string;
        "royalblue": string;
        "darkgreen": string;
        "#666633": string;
        "rgb(140, 83, 133)": string;
        "rgb(255, 173, 70)": string;
        "rgb(96, 184, 93)": string;
        "rgb(59, 175, 177)": string;
        "rgb(128, 0, 0)": string;
        "rgb(133, 112, 86)": string;
        "rgb(248, 58, 34)": string;
    };
}
declare module RpgCardsUI {
    var icon_names: string[];
}
declare module RpgCardsUI {
    var card_data_example: {
        "count": number;
        "color": string;
        "title": string;
        "icon": string;
        "contents": string[];
        "tags": string[];
    }[];
}
declare module RpgCardsUI {
    function toggle_menu(): void;
}
