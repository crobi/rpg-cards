/// <reference path="./entity.ts"/>

module rpgcards {
    export class Deck extends Entity{
        public cards: string[];
        public description: string;

        constructor(id:string) {
            super(id);
            this.cards = [];
            this.description = "";
        }

    }

    export type DeckList = Deck[];
}
