/// <reference path="./entity.ts"/>

module rpgcards {
    export class Deck extends Entity{
        public datasetIds: EntityId[];
        public templateId: EntityId;
        public description: string;

        constructor(id:EntityId) {
            super(id);
            this.datasetIds = [];
            this.templateId = null;
            this.description = "";
        }

    }
}
