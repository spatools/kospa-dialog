import * as composer from "@kospa/base/composer";
import { Deferred } from "@kospa/base/system";
export interface DialogDefaults {
    id?: string;
    template?: string;
    modal?: boolean;
    container?: string | Node;
    activate?: boolean;
    title?: string;
    create?: (opts: DialogOptions) => Node | PromiseLike<Node>;
    after?: (node: Node, opts: DialogOptions) => void | PromiseLike<void>;
    close?: (opts: DialogOptions) => void | PromiseLike<void>;
}
export interface DialogOptions extends DialogDefaults, composer.CompositionOptions {
    /** SYSTEM ONLY */
    __dfd?: Deferred<any>;
}
export declare const defaults: DialogDefaults;
export declare function open(options: DialogOptions): Promise<any>;
export declare function open<T>(options: DialogOptions): Promise<T>;
export declare function close(id: string, result?: any): Promise<void>;
