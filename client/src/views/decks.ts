/// <reference path="../external/react/react.d.ts"/>

module rpgcards {


    export function renderDecks(store: Store): React.ReactElement<any> {
        var decks = store.getDeckList().fmap(deckIds => deckIds.map(id => {
            let deck = store.getDeck(id);
            let cards = store.getCardsForDeck(id);

            return AsyncT.liftA2(deck, cards, (deck, cards) => {
                return <React.ReactElement<any>> DeckTile({
                    key : deck.id,
                    id  : deck.id,
                    desc: deck.description,
                    name: deck.name,
                    cards: cards.length });
            }).caseOf({
                just: (t) => t,
                nothing: (e) => React.DOM.div({}, "error: " + e.message),
                pending: () => React.DOM.div({}, "loading...")
            });
        })).caseOf({
            just: (t) => t,
            nothing: (e) => [React.DOM.div({}, "error: " + e.message)],
            pending: () => [React.DOM.div({}, "loading...")]
        });

        return React.DOM.div({ className: 'decks' },
            decks
        );
    }
}
