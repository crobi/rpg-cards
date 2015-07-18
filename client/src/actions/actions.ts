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
    export class ActionDeleteDeck implements Action {
        constructor(private _id: EntityId) {}
        get id(): EntityId {return this._id}
    }
    export class ActionSetDeckName implements Action {
        constructor(private _id: EntityId, private _name:string) {}
        get id(): EntityId {return this._id}
        get name(): string {return this._name}
    }
    export class ActionSetDeckDescription implements Action {
        constructor(private _id: EntityId, private _desc:string) {}
        get id(): EntityId {return this._id}
        get desc(): string {return this._desc}
    }
    export class ActionDeckAddDataset implements Action {
        constructor(private _deck_id: EntityId, private _dataset_id: EntityId) {}   
        get deck_id(): EntityId {return this._deck_id}
        get dataset_id(): EntityId {return this._dataset_id}
    }
    export class ActionDeckRemoveDataset implements Action {
        constructor(private _deck_id: EntityId, private _dataset_id: EntityId) {}   
        get deck_id(): EntityId {return this._deck_id}
        get dataset_id(): EntityId {return this._dataset_id} 
    }
    export class ActionSetDeckTemplate implements Action {
        constructor(private _deck_id: EntityId, private _template_id: EntityId) {}
        get deck_id(): EntityId {return this._deck_id}
        get template_id(): EntityId {return this._template_id}
    }
    
    /* Dataset actions */
    export class ActionNewDataset implements Action {
        constructor() {}
    }
    export class ActionDeleteDataset implements Action {
        constructor(private _id: EntityId) {}
        get id(): EntityId {return this._id}
    }
    export class ActionSetDatasetName implements Action {
        constructor(private _id: EntityId, private _name: string) {}
        get id(): EntityId {return this._id}
        get name(): string {return this._name}
    }

    /* Record actions */
    export class ActionNewRecord implements Action {
        constructor(private _dataset_id: EntityId) {}
        get dataset_id(): EntityId {return this._dataset_id}
    }
    export class ActionDeleteRecord implements Action {
        constructor(private _id: EntityId) {}
        get id(): EntityId {return this._id}
    }
    export class ActionModifyRecord implements Action {
        constructor(private _id: EntityId, private _prop: string, private _val: string) {}
        get id(): EntityId {return this._id}
        get prop(): string {return this._prop}
        get val(): string {return this._val}
    }
    
    /* Template actions */
    export class ActionNewTemplate implements Action {
        constructor() {}
    }
    export class ActionDeleteTemplate implements Action {
        constructor(private _id: EntityId) {}
        get id(): EntityId {return this._id}
    }

    /* Helper class for easy dispatching of actions */
    export class Actions  {
        constructor(private _dispatcher: Dispatcher) {
        }
        public reset(): void {
            this._dispatcher.dispatch(new ActionReset());
        }
        public newDeck(): void {
            this._dispatcher.dispatch(new ActionNewDeck());
        }
        public setDeckName(id:EntityId, name:string): void {
            this._dispatcher.dispatch(new ActionSetDeckName(id, name));
        }
        public setDeckDesc(id:EntityId, desc:string): void {
            this._dispatcher.dispatch(new ActionSetDeckDescription(id, desc));
        }
        public setDeckTemplate(deck_id:EntityId, template_id:EntityId): void {
            this._dispatcher.dispatch(new ActionSetDeckTemplate(deck_id, template_id));
        }
        public addDeckDataset(deck_id:EntityId, dataset_id:EntityId): void {
            this._dispatcher.dispatch(new ActionDeckAddDataset(deck_id, dataset_id));
        }
        public removeDeckDataset(deck_id:EntityId, dataset_id:EntityId): void {
            this._dispatcher.dispatch(new ActionDeckRemoveDataset(deck_id, dataset_id));
        }
        public deleteDeck(id: EntityId): void {
            this._dispatcher.dispatch(new ActionDeleteDeck(id));
        }
        public newDataset(): void {
            this._dispatcher.dispatch(new ActionNewDataset());
        }
        public setDatasetName(id:EntityId, name:string): void {
            this._dispatcher.dispatch(new ActionSetDatasetName(id, name));
        }
        public deleteDataset(id: EntityId): void {
            this._dispatcher.dispatch(new ActionDeleteDataset(id));
        }
        public newTemplate(): void {
            this._dispatcher.dispatch(new ActionNewTemplate());
        }
        public deleteTemplate(id: EntityId): void {
            this._dispatcher.dispatch(new ActionDeleteTemplate(id));
        }
        public newRecord(dataset_id: EntityId): void {
            this._dispatcher.dispatch(new ActionNewRecord(dataset_id));
        }
        public deleteRecord(id: EntityId): void {
            this._dispatcher.dispatch(new ActionDeleteRecord(id));
        }
        public modifyRecord(id: EntityId, prop: string, value: any): void {
            this._dispatcher.dispatch(new ActionModifyRecord(id, prop, value));
        }
    }

}
