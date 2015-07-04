/// <reference path="../dispatcher/dispatcher.ts"/>

module rpgcards {
    /* State actions */
    export class ActionReset implements Action {
        constructor() {}
    }

    /* Deck actions */
    export class ActionNewDeck implements Action {
        constructor() {}
    }
    export class ActionSetDeckName implements Action {
        constructor(private _id: string, private _name:string) {}
        get id(): string {return this._id}
        get name(): string {return this._name}
    }
    export class ActionSetDeckDescription implements Action {
        constructor(private _id: string, private _desc:string) {}
        get id(): string {return this._id}
        get desc(): string {return this._desc}
    }
    export class ActionDeleteDeck implements Action {
        constructor(private _id: string) {}
        get id(): string {return this._id}
    }
    export class ActionSelectDeck implements Action {
        constructor(private _id: string) {}
        get id(): string {return this._id}
    }

    /* Card actions */
    export class ActionNewCard implements Action {
        constructor(private _deck_id: string) {}
        get deck_id(): string {return this._deck_id}
    }
    export class ActionDeleteCard implements Action {
        constructor(private _id: string) {}
        get id(): string {return this._id}
    }
    export class ActionSelectCard implements Action {
        constructor(private _id: string) {}
        get id(): string {return this._id}
    }
    export class ActionModifyCard implements Action {
        constructor(private _id: string, private _prop: string, private _val: string) {}
        get id(): string {return this._id}
        get prop(): string {return this._prop}
        get val(): string {return this._val}
    }

    export class Actions  {
        constructor(private _dispatcher: Dispatcher) {
        }
        public reset(): void {
            this._dispatcher.dispatch(new ActionReset());
        }
        public newDeck(): void {
            this._dispatcher.dispatch(new ActionNewDeck());
        }
        public setDeckName(id:string, name:string): void {
            this._dispatcher.dispatch(new ActionSetDeckName(id, name));
        }
        public setDeckDesc(id:string, desc:string): void {
            this._dispatcher.dispatch(new ActionSetDeckDescription(id, desc));
        }
        public deleteDeck(id: string): void {
            this._dispatcher.dispatch(new ActionDeleteDeck(id));
        }
        public selectDeck(id: string): void {
            this._dispatcher.dispatch(new ActionSelectDeck(id));
        }
        public newCard(deck_id: string): void {
            this._dispatcher.dispatch(new ActionNewCard(deck_id));
        }
        public deleteCard(id: string): void {
            this._dispatcher.dispatch(new ActionDeleteCard(id));
        }
        public selectCard(id: string): void {
            this._dispatcher.dispatch(new ActionSelectCard(id));
        }
    }

}
