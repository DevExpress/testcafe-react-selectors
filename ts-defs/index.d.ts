import { Selector } from 'testcafe';

declare global {
    interface Selector {
        getReact(filter?: Function): any;

        withProps(propName: string, propValue?: any, options?: object): any;

        withProps(props: object, options?: object): any;

        findReact(selector: string): any;
    }
}

export function ReactSelector(selector: string): Selector

export function waitForReact(timeout?: number): void
