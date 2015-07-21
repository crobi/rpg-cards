/// <reference path="./stores/store.ts"/>
/// <reference path="./actions/actions.ts"/>

module rpgcards {

    export function setupTestState(store: Store, actions: Actions) {
        console.log(
            "This function resets the current application state"
            + " and then triggers a series of hardcoded user actions,"
            + " in order to set up some application state that can be used"
            + " for testing");
        
        // Functions for converting entity indices to entity IDs
        var withDeckId = (i: number, fn: (deckId: string)=>void) => {
            store.getDeckList().lift(ids => fn(ids[i]));
        }
        var withDatasetId = (i: number, fn: (datasetId: string)=>void) => {
            store.getDatasetList().lift(ids => fn(ids[i]));
        }
        var withTemplateId = (i: number, fn: (datasetId: string)=>void) => {
            store.getTemplateList().lift(ids => fn(ids[i]));
        }
        
        // Reset the state
        actions.reset();
        
        // Dataset 1
        actions.newDataset();
        withDatasetId(0, id=> {
            actions.setDatasetName(id, "Player's Basic Rules spells");
            actions.newRecord(id);
            actions.newRecord(id);
            actions.newRecord(id);
        });

        // Dataset 2
        actions.newDataset();
        withDatasetId(1, id=> {
            actions.setDatasetName(id, "Elemental Evil spells");
            actions.newRecord(id);
            actions.newRecord(id);
            actions.newRecord(id);
        });
        
        // Dataset 3
        actions.newDataset();
        withDatasetId(2, id=> {
            actions.setDatasetName(id, "DM's Basic Rules creatures");
            actions.newRecord(id);
            actions.newRecord(id);
            actions.newRecord(id);
        });
        
        // Template 1
        actions.newTemplate();
        
        // Template 2
        actions.newTemplate();

        // Deck 1
        actions.newDeck();
        withDeckId(0, id=>{
            actions.setDeckName(id, "Wizard spells");
            actions.setDeckDesc(id, "This deck contains wizard and sorcerer spells.");
            withTemplateId(0, id2=>actions.setDeckTemplate(id, id2));
            withDatasetId(0, id2=>actions.addDeckDataset(id, id2));
            withDatasetId(1, id2=>actions.addDeckDataset(id, id2));
        });

        // Deck 2
        actions.newDeck();
        withDeckId(1, id=>{
            actions.setDeckName(id, "Cleric spells");
            actions.setDeckDesc(id, "This deck contains cleric spells.");
            withTemplateId(0, id2=>actions.setDeckTemplate(id, id2));
            withDatasetId(0, id2=>actions.addDeckDataset(id, id2));
            withDatasetId(1, id2=>actions.addDeckDataset(id, id2));
        });

        // Deck 3
        actions.newDeck();
        withDeckId(2, id=>{
            actions.setDeckName(id, "Creatures");
            actions.setDeckDesc(id, "This deck contains creatures.");
            withTemplateId(1, id2=>actions.setDeckTemplate(id, id2));
            withDatasetId(2, id2=>actions.addDeckDataset(id, id2));
        });
    }

}