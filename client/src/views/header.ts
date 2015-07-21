/// <reference path="../external/react/react.d.ts"/>

module rpgcards {


    var homeItem = React.DOM.div
        ( { className: 'navbar-item', onClick: (e)=>page("/") }
        , React.DOM.i({ className: 'server icon' })
        , 'Home'
        );

    var signOutItem = React.DOM.div
        ( { className: 'navbar-item', onClick: null }
        , 'Sign out'
        );

    var flexItem = React.DOM.div
        ( { className: 'flex-navbar-item' }
        );
       
    function breadCrumb(name: string, link: string): React.ReactElement<any> {
        return  React.DOM.div( { className: 'flex-item', onClick: ()=>page(link) }
            , name
        );
    }
    
    var breadCrumbSeparator = React.DOM.div
        ( { className: 'navbar-item'}
        , '>'
        );
    
    function breadCrumbs(viewState: ViewState, ids: EntityId[]): React.ReactElement<any>[]{
        switch(viewState) {
            case ViewState.MainMenu: return null;
            case ViewState.DeckList: return null;
            case ViewState.DeckEdit: return [breadCrumb("Decks", "/decks")];
        }
    }

    function accountIdItem() {
        return React.DOM.div
            ( { className: 'navbar-item account-id' }
            , React.DOM.span({ className: 'heading' }, 'Account identifier')
            , React.DOM.span({ className: 'value' }, 'local')
            );
    }

    export function renderHeader(store: Store): React.ReactElement<any> {
        return React.DOM.div({ className: 'navbar' }
            , homeItem
            , breadCrumbs(store.getViewState(), store.getViewParams())
            , flexItem
            , accountIdItem()
            , signOutItem
        );
    }
}
