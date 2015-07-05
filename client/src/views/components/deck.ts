module rpgcards {

    export interface DeckTileProps extends React.Props<any> {
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

    export function tileHeader(props: DeckTileProps) {
        return React.DOM.div
            ( { className: 'deck-tile-header', onClick: null }
            , React.DOM.div({ className: 'deck-tile-header-name' }, props.name)
            , React.DOM.div({ className: 'deck-tile-header-id' }, props.id)
            );
    }

    export function tileBody(props: DeckTileProps) {
        return React.DOM.div
            ( { className: 'deck-tile-body', onClick: null }
            , props.desc
            );
    }

    export function tileFooter(props: DeckTileProps) {
        let cardsText = props.cards + " cards";
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

            return React.DOM.div
                ( { className: 'deck-tile' }
                , tileHeader(this.props)
                , tileBody(this.props)
                , tileFooter(this.props)
                );
        }
    }

    export var DeckTile: React.Factory<DeckTileProps> = React.createFactory(DeckTileSpec);
}
