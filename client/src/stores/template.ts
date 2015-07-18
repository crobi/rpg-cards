/// <reference path="./entity.ts"/>

module rpgcards {
    
    export class CardTemplate extends Entity{
        public description: string;
        public width: number;
        public height: number;
        public script: string;

        constructor(id:EntityId) {
            super(id);
            this.description = "";
            this.width = 0;
            this.height = 0;
        }

    }
}
