/// <reference path="./card.ts"/>
/// <reference path="./deck.ts"/>
/// <reference path="./eventEmitter.ts"/>
/// <reference path="./asyncT.ts"/>
/// <reference path="../dispatcher/dispatcher.ts"/>
/// <reference path="../actions/actions.ts"/>

module rpgcards {
    function findEntity<T extends Entity>(elements: T[], id: string):AsyncT<T> {
        for(var i=0; i<elements.length;++i){
            var element = elements[i];
            if (element.id === id) {
                return AsyncT.just(element);
            }
        }
        return AsyncT.nothing<T>(new Error("Entity " + id + " not found"));
    }

    export class Store extends ChangeEventEmitter {
        private _decks: Deck[];
        private _cards: Card[];
        private _selectedDeck: string;
        private _selectedCard: string;

        constructor(dispatcher: Dispatcher) {
            super();
            this._decks = [];
            this._cards = [];
            this._selectedCard = "";
            this._selectedDeck = "";

            dispatcher.register((action) => {
                if(action instanceof ActionReset) {
                    this._reset()
                } else if(action instanceof ActionNewDeck) {
                    this._newDeck()
                } else if (action instanceof ActionDeleteDeck) {
                    this._deleteDeck(action.id);
                } else if (action instanceof ActionSetDeckName) {
                    this._modifyDeck(action.id, (deck)=>{
                        deck.name = action.name});
                } else if (action instanceof ActionSetDeckDescription) {
                    this._modifyDeck(action.id, (deck)=>{
                        deck.description = action.desc});
                } else if (action instanceof ActionSelectDeck) {
                    this._selectDeck(action.id);
                } else if (action instanceof ActionNewCard) {
                    this._newCard(action.deck_id);
                } else if (action instanceof ActionDeleteCard) {
                    this._deleteCard(action.id);
                } else if (action instanceof ActionSelectCard) {
                    this._selectCard(action.id);
                } else {
                    console.log("Unknown action received");
                }
                this.emitChange();
            });
        }

        // ---------------------------------------------------------------------
        // Accessing data
        // ---------------------------------------------------------------------

        getDeckList(): AsyncT<string[]> {
            return AsyncT.just(
                this._decks.map(deck => deck.id)
                );
        }

        getDeck(id: string): AsyncT<Deck> {
            return findEntity(this._decks, id);
        }

        getCard(id: string): AsyncT<Card> {
            return findEntity(this._cards, id);
        }

        getCardsForDeck(id: string): AsyncT<string[]> {
            return this.getDeck(id).lift(deck => deck.cards);
        }

        getDecksForCard(id: string): AsyncT<string[]> {
            return AsyncT.just(this._decks
                .filter(deck => deck.cards.indexOf(id) !== -1)
                .map(deck => deck.id));
        }

        // ---------------------------------------------------------------------
        // Pseudo-routes
        // ---------------------------------------------------------------------
        get selectedDeck(): string {return this._selectedDeck}
        get selectedCard(): string {return this._selectedCard}

        // ---------------------------------------------------------------------
        // Methods for changing the state
        // ---------------------------------------------------------------------
        private _reset(): void {
            this._decks = [];
            this._cards = [];
            this._selectDeck = null;
            this._selectCard = null;
        }
        private _newDeck(): void {
            this._decks.push(new Deck(randomID()));
        }

        private _deleteDeck(id: string): void {
            this._decks.filter(deck => deck.id !== id);
        }

        private _selectDeck(id: string): void {
            this._selectedDeck = id;
        }

        private _modifyDeck(id: string, fn: (deck: Deck)=>void): void {
            this.getDeck(id).lift(deck => fn(deck));
        }

        private _newCard(deckId: string): void {
            this.getDeck(deckId)
                .lift(deck => {
                    var cardId = randomID();
                    this._cards.push(new Card(cardId));
                    deck.cards.push(cardId);
                });
        }

        private _selectCard(id: string): void {
            this.selectedCard = id;
        }

        private _deleteCard(id: string): void {
            this._cards.filter(card => card.id !== id);
        }
    }
}
