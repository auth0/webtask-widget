import {showLogin} from '../widgets/login';

import CronList from '../components/cronList';

import ComponentStack from '../lib/componentStack';
import {getProfile} from '../lib/profileManagement';

export function showCronJobs ({
  mount = null,
  componentStack = null,
  profile = null,
  storeProfile = false,
  storageKey = 'webtask.profile',
  readProfile = null,
  writeProfile = null,
} = {}) {
    if (!componentStack) componentStack = new ComponentStack(mount);

    const options = {
        mount,
        componentStack,
    };

    if (profile) {
        return componentStack.push(CronList, Object.assign({}, options, { profile }));
    }

    return getProfile(storageKey)
        .then((profile) => {
            if(!profile)
                return showLogin(options);

            return componentStack.push(CronList, Object.assign({}, options, { profile }));
        });
}
