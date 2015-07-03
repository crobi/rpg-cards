/// <reference path="../external/react/react.d.ts"/>

module rpgcards {


    export function renderDecks(store: Store): React.ReactElement<any> {
        var decks = store.getDeckList().fmap(deckIds => deckIds.map(id => {
            let deck = store.getDeck(id);
            let cards = store.getCardsForDeck(id);

            return AsyncT.liftA2(deck, cards, (deck, cards) => {
                return React.DOM.div({key:deck.id},
                    "Deck " + deck.id + ": " + cards.length + " cards")
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
