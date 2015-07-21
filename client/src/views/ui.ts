/// <reference path="./view.ts"/>
/// <reference path="./decks.ts"/>
/// <reference path="./notfound.ts"/>

module rpgcards {
	
	export function renderUI(store: Store): React.ReactElement<any> {
		switch(store.getViewState()) {
			case ViewState.MainMenu: return renderDecks(store);
			case ViewState.DeckList: return renderDecks(store);
			case ViewState.DeckEdit: return renderNotFound(store);
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