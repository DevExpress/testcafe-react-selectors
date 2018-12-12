import { Selector } from 'testcafe';

export type ReactComponent<
    P extends { [name: string]: any },
    S extends {} | { [name: string]: any } = {},
    K = string
    > = {
        props: P;
        state?: S,
        key?: K;
    };

export type DefaultReactComponent = ReactComponent<Props>;

declare global {
    interface Selector {
        getReact<C extends DefaultReactComponent, T = any>(filter?: (reactInternal: C) => T): Promise<T>;
        getReact<C extends DefaultReactComponent>(): Promise<C>;

        withProps<P extends Props>(propName: keyof P, propValue?: Partial<P[keyof P]>, options?: { exactObjectMatch: boolean }): any;

        withProps<P extends Props>(props: Partial<P>, options?: { exactObjectMatch: boolean }): any;

        findReact(selector: string): Selector;
    }
}

export function ReactSelector(selector: string): Selector

export function waitForReact(timeout?: number): Promise<void>
