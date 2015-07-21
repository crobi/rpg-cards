
/// <reference path="./views/view.ts"/>
/// <reference path="./external/page/page.d.ts"/>

module rpgcards {
    
    export function setupRoutes(actions: Actions) {
        page('/', (ctx) => {
            actions.setView(ViewState.MainMenu, []);
        });
        page('/decks/:deckid', (ctx) => {
            actions.setView(ViewState.DeckEdit, [ctx.params.deckid]);
        });
        page('/decks', (ctx) => {
            actions.setView(ViewState.DeckList, []);
        });
        page('*', (ctx) => {
            actions.setView(ViewState.Unknown, []);
        });
        
        page();
    }
}