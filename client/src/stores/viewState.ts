module rpgcards {
	
	/**
	 * List of states the UI can be in
	 */
	export const enum ViewState {
		Unknown,
		MainMenu,
		DeckList,
		DeckEdit,
		DeckAddDataset,
		TemplateList,
		TemplateEdit,
		DatasetList,
		DatasetEdit,
		DatasetEditRecord
	}
}