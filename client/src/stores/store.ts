/// <reference path="./card.ts"/>
/// <reference path="./deck.ts"/>
/// <reference path="./eventEmitter.ts"/>
/// <reference path="./asyncT.ts"/>
/// <reference path="../dispatcher/dispatcher.ts"/>
/// <reference path="../actions/actions.ts"/>

module rpgcards {
    function findEntity<T extends Entity>(elements: T[], id: string):AsyncT<T> {
        for(var i=0; i<elements.length;++i){
            var element = elements[i];
            if (element.id === id) {
                return AsyncT.just(element);
            }
        }
        return AsyncT.nothing<T>(new Error("Entity " + id + " not found"));
    }

    export class Store extends ChangeEventEmitter {
        private _decks: Deck[];
        private _datasets: CardDataSet[];
        private _records: CardData[];
        private _templates: CardTemplate[];

        constructor(dispatcher: Dispatcher) {
            super();
            this._decks = [];
            this._datasets = [];
            this._records = [];
            this._templates = [];

            dispatcher.register((action) => {
                /* Generic */
                if(action instanceof ActionReset) {
                    this._reset()
                }
                /* Deck */
                else if(action instanceof ActionNewDeck) {
                    this._newDeck()
                }
                else if (action instanceof ActionDeleteDeck) {
                    this._deleteDeck(action.id);
                }
                else if (action instanceof ActionSetDeckName) {
                    this._modifyDeck(action.id, (deck)=>{
                        deck.name = action.name});
                }
                else if (action instanceof ActionSetDeckDescription) {
                    this._modifyDeck(action.id, deck=>{
                        deck.description = action.desc;
                    });
                }
                else if (action instanceof ActionSetDeckTemplate) {
                    this._modifyDeck(action.deck_id, deck=>{
                        deck.templateId = action.template_id;
                    });
                }
                else if (action instanceof ActionDeckAddDataset) {
                    this._modifyDeck(action.deck_id, deck=>{
                        deck.datasetIds.push(action.dataset_id);
                    });
                }
                else if (action instanceof ActionDeckRemoveDataset) {
                    this._modifyDeck(action.deck_id, deck=>{
                        deck.datasetIds.filter(id=>id!=action.dataset_id);
                    });
                }
                /* Dataset */
                else if (action instanceof ActionNewDataset) {
                    this._newDataset();                
                }
                else if (action instanceof ActionDeleteDataset) {
                    this._deleteDataset(action.id);                
                }
                else if (action instanceof ActionSetDatasetName) {
                    this._modifyDataset(action.id, dataset=>{
                        dataset.name = action.name;
                    });                
                }
                /* Record */
                else if (action instanceof ActionNewRecord) {
                    this._newRecord(action.dataset_id);
                }
                else if (action instanceof ActionDeleteRecord) {
                    this._deleteRecord(action.id);
                }
                /* Template */
                else if (action instanceof ActionNewTemplate) {
                    this._newTemplate();
                }
                else if (action instanceof ActionDeleteTemplate) {
                    this._deleteTemplate(action.id);
                }
                /* Unknown */
                else {
                    throw new Error("Unknown action received");
                }
                this.emitChange();
            });
        }

        // ---------------------------------------------------------------------
        // Accessing data
        // ---------------------------------------------------------------------

        getDatasetList(): AsyncT<string[]> {
            return AsyncT.just(
                this._datasets.map(ds => ds.id)
                );
        }
          
        getDataset(id: EntityId): AsyncT<CardDataSet> {
            return findEntity(this._datasets, id);
        }
              
        getDeckList(): AsyncT<string[]> {
            return AsyncT.just(
                this._decks.map(deck => deck.id)
                );
        }

        getDeck(id: EntityId): AsyncT<Deck> {
            return findEntity(this._decks, id);
        }

        getRecord(id: EntityId): AsyncT<CardData> {
            return findEntity(this._records, id);
        }
        
        getTemplateList(): AsyncT<string[]> {
            return AsyncT.just(
                this._templates.map(ds => ds.id)
                );
        }
        
        getTemplate(id: EntityId): AsyncT<CardTemplate> {
            return findEntity(this._templates, id);
        }

        // ---------------------------------------------------------------------
        // Methods for changing the state
        // ---------------------------------------------------------------------
        private _reset(): void {
            this._decks = [];
            this._datasets = [];
            this._records = [];
            this._templates = [];
        }
        
        private _newDeck(): void {
            this._decks.push(new Deck(randomID()));
        }

        private _deleteDeck(id: string): void {
            this._decks.filter(deck => deck.id !== id);
        }

        private _modifyDeck(id: EntityId, fn: (deck: Deck)=>void): void {
            this.getDeck(id).lift(deck => fn(deck));
        }
        
        private _newDataset(): void {
            this._datasets.push(new CardDataSet(randomID()));
        }

        private _deleteDataset(id: EntityId): void {
            this._datasets.filter(Dataset => Dataset.id !== id);
        }

        private _modifyDataset(id: EntityId, fn: (dataset: CardDataSet)=>void): void {
            this.getDataset(id).lift(Dataset => fn(Dataset));
        }

        private _newRecord(datasetId: EntityId): void {
            this.getDataset(datasetId)
                .lift(ds => {
                    var cardId = randomID();
                    this._records.push(new CardData(cardId));
                    ds.recordIds.push(cardId);
                });
        }

        private _deleteRecord(id: EntityId): void {
            this._records.filter(card => card.id !== id);
        }
        
        private _newTemplate(): void {
            this._templates.push(new CardTemplate(randomID()));
        }
        
        private _deleteTemplate(id: EntityId): void {
            this._templates.filter(t => t.id !== id);
        }
    }
}
