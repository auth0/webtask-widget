import Bluebird from 'bluebird';

import RequestVerification from '../components/requestVerification';

import ComponentStack from '../lib/componentStack';


export function createLogin ({
    mount = null,
    componentStack = null,
} = {}) {
    
    if (!componentStack) componentStack = new ComponentStack(mount);

    const options = {
        mount,
        componentStack,
    };

    return componentStack.push(RequestVerification, options);
}