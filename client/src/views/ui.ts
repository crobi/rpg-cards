/// <reference path="./view.ts"/>
/// <reference path="./decks.ts"/>
/// <reference path="./deck.ts"/>
/// <reference path="./notfound.ts"/>
/// <reference path="./main.ts"/>

module rpgcards {
	
	export function renderUI(store: Store): React.ReactElement<any> {
		var ids = store.getViewParams();
		switch(store.getViewState()) {
			case ViewState.MainMenu: return renderMain(store);
			case ViewState.DeckList: return renderDecks(store);
			case ViewState.DeckEdit: return renderDeck(ids[0], store);
			case ViewState.DeckAddDataset: return renderNotFound(store);
			case ViewState.TemplateList: return renderNotFound(store);
			case ViewState.TemplateEdit: return renderNotFound(store);
			case ViewState.DatasetList: return renderNotFound(store);
			case ViewState.DatasetEdit: return renderNotFound(store);
			case ViewState.DatasetEditRecord: return renderNotFound(store);
			case ViewState.Unknown: return renderNotFound(store);
			default: throw new Error("Unknown view state");
		}
	}
}