/// <reference path="../external/react/react.d.ts"/>

module rpgcards {

        const deckColor = "#F44336";

        function deckTile(deck: Deck, cards: string[]) {
            return <React.ReactElement<any>> DeckTile({
                key   : deck.id,
                id    : deck.id,
                name  : deck.name,
                desc  : deck.description,
                cards : cards.length,
                icon  : null,
                color : deckColor });
        }

        function loadingTile(id: string) {
            return <React.ReactElement<any>> DeckTile({
                key   : id,
                id    : id,
                name  : "Loading...",
                desc  : "",
                cards : null,
                icon  : null,
                color : deckColor });
        }

        function errorTile(id: string, e: Error) {
            return <React.ReactElement<any>> DeckTile({
                key   : id,
                id    : id,
                name  : "Error",
                desc  : e.message,
                cards : null,
                icon  : null,
                color : deckColor });
        }

        function newDeckTile() {
            return <React.ReactElement<any>> DeckTile({
                key   : "#new",
                id    : null,
                name  : "New deck",
                desc  : null,
                cards : null,
                icon  : "add circle",
                color : deckColor });
        }

    export function renderDecks(store: Store): React.ReactElement<any> {
        var decks = store.getDeckList().fmap(deckIds => deckIds.map(id => {
            let deck = store.getDeck(id);

            return deck.lift(deck => {
                return <React.ReactElement<any>> DeckTile({
                    key : deck.id,
                    id  : deck.id,
                    desc: deck.description,
                    name: deck.name});
            }).caseOf({
                just: (t) => t,
                nothing: (e) => errorTile(id, e),
                pending: () => loadingTile(id)
            });
        })).caseOf({
            just: (t) => t,
            nothing: (e) => [React.DOM.div({}, "error: " + e.message)],
            pending: () => [React.DOM.div({}, "loading...")]
        });

        return React.DOM.div({ className: 'decks' },
            decks,
            newDeckTile()
        );
    }
}
