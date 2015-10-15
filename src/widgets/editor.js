import Bluebird from 'bluebird';
import LocalForage from 'localforage';

import {showLogin} from '../widgets/login';

import Editor from '../components/editor';

import ComponentStack from '../lib/componentStack';
import dedent from '../lib/dedent';

export function showEditor ({
    mount = null,
    componentStack = null,
    url = 'https://webtask.it.auth0.com',
    token = null,
    container = null,
    name = '',
    showIntro = false,
    mergeBody = true,
    parseBody = true,
    autoSaveOnLoad = false,
    autoSaveOnChange = false,
    autoSaveInterval = 1000,
    readProfile = null,
    writeProfile = null,
    storeProfile = false,
    storageKey = 'webtask.profile',
    showWebtaskUrl = true,
    showTryWebtaskUrl = true,
    secrets = {},
    code = dedent`
        module.exports = function (ctx, cb) {
            cb(null, 'Hello ' + ctx.query.hello);
        };
    `.trim(),
    tryParams = {
        path: '',
        headers: {
            'Content-Type': 'application/json',
        },
        query: {
            hello: 'world',
        },
        body: {
            hint: 'Only sent for PUT, POST and PATCH requests',
        },
    },
    onSave = (webtask) => webtask,
} = {}) {
    
    if (!componentStack) componentStack = new ComponentStack(mount);

    // If we bootstrap the widget with a token, we need to be sure that we have
    // all the necessary information to constitute a valid Profile.
    if (token) {
        if (!container) throw new Error(`When passing a 'token' to
            webtaskWidget.open, you must also pass in a 'container' option.`);

        if (readProfile) throw new Error(`The 'readProfile' option
            cannot be present when specifying a 'token'.`);

        readProfile = () => Bluebird.resolve({
            container: container,
            token: token,
            url: url,
        });
    } else if (storeProfile) {
        readProfile = (options) => LocalForage.getItem(storageKey)
            .then((profile) => {
                if (!profile) return showLogin(options);

                try {
                    return validateProfile(profile);
                } catch (__) {
                    return writeProfile(null);
                }
            });

        // When the 'storeProfile' options is provided, we set a default
        // 'writeProfile' handler to save the profile to the indicated (or default)
        // 'storageKey'.
        if (!writeProfile) {
            writeProfile = (profile) => LocalForage.setItem(storageKey, {
                url: profile.url,
                container: profile.container,
                token: profile.token,
            });
        }
    } else {
        readProfile = (options) => showLogin(options);
    }

    // By default, a noop.
    if (!writeProfile) writeProfile = (profile) => Bluebird.resolve(profile);

    const options = {
        mount,
        componentStack,
        url,
        token,
        container,
        name,
        mergeBody,
        parseBody,
        showIntro,
        autoSaveOnLoad,
        autoSaveOnChange,
        autoSaveInterval,
        readProfile,
        writeProfile,
        storeProfile,
        storageKey,
        showWebtaskUrl,
        showTryWebtaskUrl,
        secrets,
        code,
        tryParams,
        onSave,
    };

    return readProfile(options)
        .then(writeProfile)
        .then((profile) => componentStack.push(Editor, Object.assign({}, options, {profile})));

    function validateProfile (profile) {
        if (!profile.container) throw new Error('Invalid profile: missing container');
        if (!profile.token) throw new Error('Invalid profile: missing token');
        if (!profile.url) throw new Error('Invalid profile: missing url');

        return profile;
    }
}