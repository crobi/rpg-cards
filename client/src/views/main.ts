/// <reference path="../external/react/react.d.ts"/>
/// <reference path="../stores/store.ts"/>
/// <reference path="./header.ts"/>
/// <reference path="./components/deck.ts"/>

module rpgcards {

        const deckColor = "#F44336";

        function menuItem(header: string, desc: string) {
            return <React.ReactElement<any>> DeckTile({
                key   : header,
                id    : header,
                name  : header,
                desc  : desc
            });
        }

    export function renderMain(store: Store): React.ReactElement<any> {

        return React.DOM.div({}
            , renderHeader(store)
            , React.DOM.div({ className: 'decks' }
                , menuItem("Card data", "Edit or import card data")
                , menuItem("Templates", "Design the layout of cards")
                , menuItem("Decks", "Edit the layout of cards")
                , menuItem("Help", "Read documentation")
            ));
    }
}
