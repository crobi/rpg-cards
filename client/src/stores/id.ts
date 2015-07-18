module rpgcards {
    const s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const N = 16;
    
    export type EntityId = string;

    export function randomID(): string {
        var id = "";
        for(var i=0; i<N; ++i) {
            id += s.charAt(Math.floor(Math.random() * s.length));
        }
        return id;
    }

}
