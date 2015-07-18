/// <reference path="./dispatcher/dispatcher.ts"/>
/// <reference path="./stores/store.ts"/>
/// <reference path="./actions/actions.ts"/>
/// <reference path="./views/header.ts"/>

module rpgcards {

    // Global objects, only accessible within this file
    var appDispatcher: Dispatcher = null;
    var appActions: Actions = null;
    var appStore: Store = null;

    // Access to the global objects, to be used from the browser debug window
    export function debug() {
        return {
            dispatcher: appDispatcher,
            actions: appActions,
            store: appStore,
            refresh: refresh,
            testState: setupTestState
        }
    }

    // Initializes the application
    // Creates and links the global objects
    export function bootstrap() {
        appDispatcher = new Dispatcher();
        appActions = new Actions(appDispatcher);
        appStore = new Store(appDispatcher);

        // Set up some initial state for debugging
        // Remove this line once development is finished
        setupTestState();

        // Start react rendering
        appStore.addChangeListener(refresh);
        refresh();
    }

    // Renders the whole application
    // In this project, render*() functions are pure functions that map
    // the application state (Store) to React elements
    function renderApp(store: Store) {
        return React.DOM.div(
            {},
            renderHeader(store),
            renderDecks(store)
            );
    }

    function refresh() {
        React.render(renderApp(appStore), document.body);
    }

    function setupTestState() {
        console.log(
            "This function resets the current application state"
            + " and then triggers a series of hardcoded user actions,"
            + " in order to set up some application state that can be used"
            + " for testing");
        var withDeckId = (i: number, fn: (deckId: string)=>void) => {
            appStore.getDeckList().lift(ids => fn(ids[i]));
        }
        var withDatasetId = (i: number, fn: (datasetId: string)=>void) => {
            appStore.getDatasetList().lift(ids => fn(ids[i]));
        }
        var withTemplateId = (i: number, fn: (datasetId: string)=>void) => {
            appStore.getTemplateList().lift(ids => fn(ids[i]));
        }
        appActions.reset();
        
        // Dataset 1
        appActions.newDataset();
        withDatasetId(0, id=> {
            appActions.setDatasetName(id, "Player's Basic Rules spells");
            appActions.newRecord(id);
            appActions.newRecord(id);
            appActions.newRecord(id);
        });

        // Dataset 2
        appActions.newDataset();
        withDatasetId(1, id=> {
            appActions.setDatasetName(id, "Elemental Evil spells");
            appActions.newRecord(id);
            appActions.newRecord(id);
            appActions.newRecord(id);
        });
        
        // Dataset 3
        appActions.newDataset();
        withDatasetId(2, id=> {
            appActions.setDatasetName(id, "DM's Basic Rules creatures");
            appActions.newRecord(id);
            appActions.newRecord(id);
            appActions.newRecord(id);
        });
        
        // Template 1
        appActions.newTemplate();
        
        // Template 2
        appActions.newTemplate();

        // Deck 1
        appActions.newDeck();
        withDeckId(0, id=>{
            appActions.setDeckName(id, "Wizard spells");
            appActions.setDeckDesc(id, "This deck contains wizard and sorcerer spells.");
            withTemplateId(0, id2=>appActions.setDeckTemplate(id, id2));
            withDatasetId(0, id2=>appActions.addDeckDataset(id, id2));
            withDatasetId(1, id2=>appActions.addDeckDataset(id, id2));
        });

        // Deck 2
        appActions.newDeck();
        withDeckId(1, id=>{
            appActions.setDeckName(id, "Cleric spells");
            appActions.setDeckDesc(id, "This deck contains cleric spells.");
            withTemplateId(0, id2=>appActions.setDeckTemplate(id, id2));
            withDatasetId(0, id2=>appActions.addDeckDataset(id, id2));
            withDatasetId(1, id2=>appActions.addDeckDataset(id, id2));
        });

        // Deck 3
        appActions.newDeck();
        withDeckId(2, id=>{
            appActions.setDeckName(id, "Creatures");
            appActions.setDeckDesc(id, "This deck contains creatures.");
            withTemplateId(1, id2=>appActions.setDeckTemplate(id, id2));
            withDatasetId(2, id2=>appActions.addDeckDataset(id, id2));
        });
    }

}
