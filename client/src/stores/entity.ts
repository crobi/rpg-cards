/// <reference path="./id.ts"/>

module rpgcards {

    export class Entity {
        private _id: EntityId;
        public name: string;

        constructor(id: EntityId) {
            this._id = id;
            this.name = "";
        }

        get id(): EntityId {return this._id;}
    }

}
