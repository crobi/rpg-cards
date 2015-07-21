
/// <reference path="./views/view.ts"/>
/// <reference path="./external/page/page.d.ts"/>

module rpgcards {
    
    export function setupRoutes(actions: Actions) {
        page('/', () => {
            actions.setView(ViewState.MainMenu, []);
        });
        page('/decks', () => {
            actions.setView(ViewState.DeckList, []);
        });
        page('*', () => {
            actions.setView(ViewState.MainMenu, []);
        });
        
        page();
    }
}