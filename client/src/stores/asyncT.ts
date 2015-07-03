

module rpgcards {

    // Enumerate the different types contained by an AsyncTType object.
    export const enum AsyncTType { Nothing, Pending, Just }

    // Define a contract to unwrap AsyncTType object using callbacks
    export interface AsyncTPatterns<T,U> {
        just: (t: T) => U;
        pending: () => U;
        nothing: (e: Error) => U;
    }

    // Encapsulates an optional, ansynchronous value.
    // A value of type AsyncT a either:
    // - contains a value of type a (represented as Just a)
    // - is empty (represented as Nothing error)
    // - is pending (represented as Pending).
    export class AsyncT<T> {
        private value: T;
        private error: Error;
        private type: AsyncTType;

        // Build a AsyncT object. For internal use only.
        constructor(type: AsyncTType, value: T, error: Error) {
            this.type = type;
            this.value = value;
            this.error = error;
        }

        // Helper function to build a AsyncT object filled with a Just type.
        static just<T>(t: T) {
            return new AsyncT<T>(AsyncTType.Just, t, null);
        }

        // Helper function to build a AsyncT object filled with a Pending type.
        static pending<T>() {
            return new AsyncT<T>(AsyncTType.Pending, null, null);
        }

        // Helper function to build a AsyncT object filled with a Nothing type.
        static nothing<T>(error: Error) {
            return new AsyncT<T>(AsyncTType.Nothing, null, error);
        }

        // Wrap an object inside a AsyncT.
        unit<U>(u: U) {
            return AsyncT.just<U>(u);
        }

        // Apply the function passed as parameter on the object.
        bind<U>(f: (t: T) => AsyncT<U>) {
            switch(this.type) {
                case AsyncTType.Just: return f(this.value);
                case AsyncTType.Pending: return AsyncT.pending<U>();
                case AsyncTType.Nothing: return AsyncT.nothing<U>(this.error);
            }
        }

        // Alias for unit.
        of = this.unit;

        // Alias for bind.
        chain = this.bind;

        // Apply the function passed as parameter on the object.
        fmap<U>(f: (t: T) => U) {
            return this.bind(v => this.unit<U>(f(v)));
        }

        // Alias for fmap.
        lift = this.fmap;

        // Alias for fmap.
        map = this.fmap;

        // Execute a function depending on the AsyncT content.
        caseOf<U>(patterns: AsyncTPatterns<T, U>) {
            switch(this.type) {
                case AsyncTType.Just: return patterns.just(this.value);
                case AsyncTType.Pending: return patterns.pending();
                case AsyncTType.Nothing: return patterns.nothing(this.error);
            }
        }

        static liftA2<T,U,V>(a:AsyncT<T>, b:AsyncT<U>, f:(a:T,b:U)=>V) {
            if (a.type === AsyncTType.Just && b.type === AsyncTType.Just) {
                return AsyncT.just(f(a.value, b.value));
            } else if (a.type === AsyncTType.Nothing) {
                return AsyncT.nothing<V>(a.error);
            } else if (a.type === AsyncTType.Nothing) {
                return AsyncT.nothing<V>(b.error);
            } else {
                return AsyncT.pending<V>();
            }
        }
    }
}
