/// <reference path="./dispatcher/dispatcher.ts"/>
/// <reference path="./stores/store.ts"/>
/// <reference path="./actions/actions.ts"/>
/// <reference path="./views/header.ts"/>

module rpgcards {

    var appDispatcher: Dispatcher = null;
    var appActions: Actions = null;
    var appStore: Store = null;

    export function bootstrap() {
        appDispatcher = new Dispatcher();
        appActions = new Actions(appDispatcher);
        appStore = new Store(appDispatcher);
        appStore.addChangeListener(refresh);

        refresh();
    }

    function renderApp(store: Store) {
        return React.DOM.div(
            {},
            renderHeader(store),
            renderDecks(store)
            );
    }

    export function refresh() {
        React.render(renderApp(appStore), document.body);
    }

}
