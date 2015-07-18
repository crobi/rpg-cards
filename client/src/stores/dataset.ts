/// <reference path="./entity.ts"/>

module rpgcards {

    export class CardDataSet extends Entity {
        public recordIds: EntityId[];
        public properties: string[];

        constructor(id:EntityId) {
            super(id);
            this.recordIds = [];
            this.properties = [];
        }
    }

    export class CardData extends Entity {
        public data: {[name:string]: any};

        constructor(id:EntityId) {
            super(id);
            this.data = {};
        }
    }
}
