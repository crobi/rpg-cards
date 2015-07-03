module rpgcards {

    export class ChangeEventEmitter {
        private _callbacks: (() => void)[];
        constructor() {
            this._callbacks = [];
        }

        protected emitChange() {
            this._callbacks.forEach((callback) => callback());
        }

        public addChangeListener(callback: ()=>void) {
            this._callbacks.push(callback);
        }

        public removeChangeListener(callback: ()=>void) {
            this._callbacks = this._callbacks.filter((cb) => cb !== callback);
        }
    }
}
