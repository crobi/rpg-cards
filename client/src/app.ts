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
        appActions.reset();

        // Deck 1
        appActions.newDeck();
        withDeckId(0, id=>appActions.setDeckName(id, "Spells"));
        withDeckId(0, id=>appActions.setDeckDesc(id, "This deck contains"
            + " basic spells."));
        withDeckId(0, id=>appActions.newCard(id));
        withDeckId(0, id=>appActions.newCard(id));
        withDeckId(0, id=>appActions.newCard(id));

        // Deck 2
        appActions.newDeck();
        withDeckId(1, id=>appActions.setDeckName(id, "Items"));
        withDeckId(1, id=>appActions.setDeckDesc(id, "This deck contains"
            + " mundane and magic items."));
        appStore.getDeckList().lift(deckIds => appActions.newCard(deckIds[1]));

        // Deck 3
        appActions.newDeck();
        withDeckId(2, id=>appActions.setDeckName(id, "Creatures"));
        withDeckId(2, id=>appActions.setDeckDesc(id, "This deck contains"
            + " creatures."));
    }

}
