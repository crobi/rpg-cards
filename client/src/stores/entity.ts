module rpgcards {

    export class Entity {
        private _id: string;
        public name: string;

        constructor(id: string) {
            this._id = id;
            this.name = "";
        }

        get id(): string {return this._id;}
    }

}
