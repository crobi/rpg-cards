/// <reference path="../external/react/react.d.ts"/>

module rpgcards {


    var homeItem = React.DOM.div
        ( { className: 'navbar-item', onClick: null }
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

    function accountIdItem() {
        return React.DOM.div
            ( { className: 'navbar-item account-id' }
            , React.DOM.span({ className: 'heading' }, 'Account identifier')
            , React.DOM.span({ className: 'value' }, 'local')
            );
    }

    export function renderHeader(store: Store): React.ReactElement<any> {
        return React.DOM.div({ className: 'navbar' },
            homeItem,
            flexItem,
            accountIdItem(),
            signOutItem
        );
    }
}
