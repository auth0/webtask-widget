import {showLogin} from '../widgets/login';

import Logs from '../components/logs';

import ComponentStack from '../lib/componentStack';

export function showLogs ({
  mount = null,
  componentStack = null,
  profile = null,
} = {}) {

    if (!profile) throw new Error('This widget requires an instance of a Sandboxjs Profile.');
    if (!componentStack) componentStack = new ComponentStack(mount);

    const options = {
        mount,
        componentStack,
        profile,
    };
    
    return componentStack.push(Logs, options);
}
