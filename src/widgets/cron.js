import Bluebird from 'bluebird';

import {showLogin} from '../widgets/login';

import CronList from '../components/cronList';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget'

export function createCronJobs ({
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

    const cronWidget = new Widget(CronList, options);

    Bluebird.resolve(profile)
        .then((profile) => {
            return componentStack.push(CronList, Object.assign({}, options, {profile}));
        })
        .then(() => cronWidget.emit('ready'));

    return cronWidget;
}
