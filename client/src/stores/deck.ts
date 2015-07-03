/// <reference path="./entity.ts"/>

module rpgcards {
    export class Deck extends Entity{
        public cards: string[];

        constructor(id:string) {
            super(id);
            this.cards = [];
        }

    }

    export type DeckList = Deck[];
}
