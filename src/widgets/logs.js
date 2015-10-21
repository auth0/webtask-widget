import Bluebird from 'bluebird';

import Logs from '../components/logs';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget';

class LogsWidget extends Widget {
    constructor(options) {
        super(Logs, options);
    }
}

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

    const logsWidget = new LogsWidget(options);

    Bluebird.resolve(profile)
        .then((profile) => {
            componentStack.push(logsWidget.component, Object.assign({}, options, {profile, emit: logsWidget.emit.bind(logsWidget)}))

            logsWidget.emit('ready');
        });

    return logsWidget;
}
