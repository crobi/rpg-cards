/// <reference path="./entity.ts"/>

module rpgcards {

    export class Card extends Entity {
        public data: {[name:string]:any};
        public deckId: string;

        constructor(id:string) {
            super(id);
            this.data = {};
        }
    }

    export type CardList = Card[];
}
