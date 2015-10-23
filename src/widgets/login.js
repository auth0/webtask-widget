import Bluebird from 'bluebird';

import RequestVerification from '../components/requestVerification';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget';


export class A0LoginWidget extends Widget {
    constructor(props) {
        super(RequestVerification, props);
        this.promise = props.componentStack.pushPromise(RequestVerification, props);
    }
}

export function createLogin ({
    mount = null,
    componentStack = null,
} = {}) {
    
    if (!componentStack) componentStack = new ComponentStack(mount);

    const params = {
        mount,
        componentStack,
    };
    
    return new A0LoginWidget(params);
}