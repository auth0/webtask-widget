import {createLogin} from '../widgets/login';

import Logs from '../components/logs';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget';
import {getProfile} from '../lib/profileManagement';

export function createLogs ({
  mount = null,
  componentStack = null,
  profile = null,
  storeProfile = false,
  storageKey = 'webtask.profile',
  readProfile = null,
  writeProfile = null,
} = {}, cb) {
    if (!componentStack) componentStack = new ComponentStack(mount);

    const options = {
        mount,
        componentStack,
    };

    const logsWidget = new Widget(Logs, options);

    if (profile)
        return componentStack.push(LogsWidget, options)

    getProfile(storageKey)
        .then((profile) => {
            if(!profile)
                return showLogin(options);

            componentStack.push(logsWidget, Object.assign({}, options, {profile}));
        })
        .then((result) => {
            editorWidget.emit('ready');

            if(cb)
                cb(null, result);
        })
        .catch((err) => {
            if(cb)
                cb(err);
        });
}
