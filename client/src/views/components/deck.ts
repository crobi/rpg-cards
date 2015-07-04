module rpgcards {

    export interface DeckTileProps {
        key      : string; //< Unique key for react
        id       : string;
        name     : string;
        desc     : string;
        cards    : number;
    }
    function DeckTilePropsEqual(a:DeckTileProps, b:DeckTileProps) {
        return a.id === b.id &&
            a.name === b.name &&
            a.desc === b.desc &&
            a.cards === b.cards;
    }

    interface DeckTileState {
    }

    export function tileHeader(id: string, name: string) {
        return React.DOM.div
            ( { className: 'deck-tile-header', onClick: null }
            , React.DOM.div({ className: 'deck-tile-header-name' }, name)
            , React.DOM.div({ className: 'deck-tile-header-id' }, id.substring(0, 5))
            );
    }

    export function tileBody(description: string) {
        return React.DOM.div
            ( { className: 'deck-tile-body', onClick: null }
            , description
            );
    }

    export function tileFooter(cards: number) {
        let cardsText = "This deck contains " + cards + " cards.";
        return React.DOM.div
            ( { className: 'deck-tile-footer', onClick: null }
            , cardsText
            );
    }

    export class DeckTileSpec extends React.Component<DeckTileProps, DeckTileState> {
        displayName: string;

        initialState(props: DeckTileProps): DeckTileState {
            return {};
        }

        // Use this function to speed up rendering
        /*
        shouldComponentUpdate(nextProps: DeckTileProps, nextState: DeckTileState): boolean {
            return DeckTilePropsEqual(this.props, nextProps);
        }
        */

        constructor(props: DeckTileProps) {
            super(props);
            this.state = this.initialState(props);
            this.displayName = "DeckTile";
        }

        render() {
            let deckId = this.props.id;
            let deckName = this.props.name;
            let deckDesc = this.props.desc;
            let deckCards = this.props.cards;

            return React.DOM.div
                ( { className: 'deck-tile' }
                , tileHeader(deckId, deckName)
                , tileBody(deckDesc)
                , tileFooter(deckCards)
                );
        }
    }

    export var DeckTile: React.Factory<DeckTileProps> = React.createFactory(DeckTileSpec);
}
