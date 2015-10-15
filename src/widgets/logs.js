import Logs from '../components/logs';

import ComponentStack from '../lib/componentStack';

export function showLogs ({
  mount = null,
  componentStack = null,
  webtask = null,
} = {}) {
    if (!componentStack) componentStack = new ComponentStack(mount);

    if (!webtask) {
        /*
         * TODO Get one
         * */
    }

    const options = {
        mount,
        componentStack,
    };

    return componentStack.push(Logs, options)
}
