/// <reference path="../external/react/react.d.ts"/>
/// <reference path="../stores/store.ts"/>
/// <reference path="./header.ts"/>

module rpgcards {

	function deckInfo(deck: Deck): React.ReactElement<any> {
		return React.DOM.div({}
            , "Name: " + deck.name
			, "Description: " + deck.description
			, "Datasets: " + deck.datasetIds.join(", ")
		);
	}
	
	var loading = React.DOM.div({ className: "error" }
            , "Loading..."
		);
	
	var error = React.DOM.div({ className: "error" }
            , "Could not load deck."
		);
	 
    export function renderDeck(id: EntityId, store: Store): React.ReactElement<any> {
		var deck = store.getDeck(id).caseOf({
			just: (deck) => deckInfo(deck),
			nothing: (e) => error,
			pending: () => loading
		});
		
        return React.DOM.div({}
            , renderHeader(store)
            , React.DOM.div({}
                , deck
            ));
    }
}
