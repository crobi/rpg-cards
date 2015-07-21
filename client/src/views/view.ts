/// <reference path="../external/react/react.d.ts"/>
/// <reference path="../stores/store.ts"/>

module rpgcards {
	
	export type View = (store: Store) => React.ReactElement<any>;

}