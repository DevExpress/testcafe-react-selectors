import { Selector } from 'testcafe';

interface Dictionary {
    [name: string]: any;
}

type Props = Dictionary;
type State = object | Dictionary;
type Key = string;

export type ReactComponent<
    P extends Props,
    S extends State = {},
    K extends Key = Key
    > = {
        props: P;
        state?: S,
        key?: K;
    };

type DefaultReactComponent = ReactComponent<Props>;

declare global {
    type ReactComponent<
        P extends Props,
        S extends State = {},
        K extends Key = Key
        > = {
            props: P;
            state?: S,
            key?: K;
        };

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
