module rpgcards {

    export interface DeckTileProps extends React.Props<any> {
        key      : string; //< Unique key for react
        id       : string;
        name     : string;
        desc     : string;
    }
    function DeckTilePropsEqual(a:DeckTileProps, b:DeckTileProps) {
        return a.id === b.id &&
            a.name === b.name &&
            a.desc === b.desc;
    }

    interface DeckTileState {
    }

    export function tileHeader(props: DeckTileProps): React.ReactElement<any> {
        return React.DOM.div
            ( { className: 'deck-tile-header', onClick: null }
            , props.name
            );
    }

    export function tileBody(props: DeckTileProps): React.ReactElement<any> {
        return React.DOM.div
            ( { className: 'deck-tile-body', onClick: null }
            , React.DOM.p(null, props.desc)
            );
    }

    export function tileFooter(props: DeckTileProps): React.ReactElement<any> {
        return null;
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

            return React.DOM.div( { className: 'deck-tile' }
                , React.DOM.div( { className: 'deck-tile-content' }
                    , tileHeader(this.props)
                    , tileBody(this.props)
                    , tileFooter(this.props)
                ));
        }
    }

    export var DeckTile: React.Factory<DeckTileProps> = React.createFactory(DeckTileSpec);
}
