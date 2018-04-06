import { Selector } from 'testcafe';

declare global {
    interface Selector {
        getReact(filter?: Function): any;

        withProps(propName: string, propValue?: any): any;

        withProps(props: object): any;

        findReact(selector: string): any;
    }
}

export function ReactSelector(selector: string): Selector
