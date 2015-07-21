/// <reference path="./view.ts"/>
/// <reference path="./header.ts"/>
/// <reference path="../external/react/react.d.ts"/>

module rpgcards {

	export function renderNotFound(store: Store): React.ReactElement<any> {
        return React.DOM.div({}
            , renderHeader(store)
            , React.DOM.div({ className: 'error' }
                , "Page not found"
            ));
    }
}