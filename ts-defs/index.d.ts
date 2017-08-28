import { Selector } from 'testcafe';

declare global {
    interface Selector {
        getReact(filter?:Function):any;
    }
}

declare function ReactSelector(selector:string):Selector

export default ReactSelector;

