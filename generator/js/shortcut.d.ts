interface ShortcutOptions {
    type?: string;
    propagate?: boolean;
    disable_in_input?: boolean;
    target?: HTMLElement;
    keycode?: boolean;
}


interface ShortcutStatic {
    add(key_combination: string, callback: Function, opt?: ShortcutOptions);
    remove(key_combination: string);
}

declare var shortcut: ShortcutStatic;