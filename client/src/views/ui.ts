/// <reference path="./view.ts"/>
/// <reference path="./decks.ts"/>

module rpgcards {
	
	export function renderUI(store: Store): React.ReactElement<any> {
		switch(store.getViewState()) {
			case ViewState.MainMenu: return renderDecks(store);
			case ViewState.DeckEdit: return renderDecks(store);
		}
	}
}