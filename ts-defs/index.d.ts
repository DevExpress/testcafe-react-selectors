import { Selector } from 'testcafe';

declare global {
    interface Selector {
        getReact(filter?:Function):any;
    }
}

export function ReactSelector(selector:string):Selector

interface waitForReactOptions {
    waitTimeout?:number;
    selectReactRoot?: () => any;
}

export function waitForReact(options: waitForReactOptions): any;
