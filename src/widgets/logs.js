import {createLogin} from '../widgets/login';

import Logs from '../components/logs';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget';

export function createLogs ({
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

    const logsWidget = new Widget(Logs, options);

    componentStack.push(logsWidget.component, options)
        .then(() => logsWidget.emit('ready'));

    return logsWidget;
}
