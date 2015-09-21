import Bluebird from 'bluebird';
import LocalForage from 'localforage';
import React from 'react';
import Theme from 'common/theme.less';

import {editor} from 'components/editor';
import {login} from 'components/login';


const WEBTASK_CLUSTER_URL = 'https://webtask.it.auth0.com';


export function open (target, options = {url: WEBTASK_CLUSTER_URL}) {
    // If we bootstrap the widget with a token, we need to be sure that we have
    // all the necessary information to constitute a valid Profile.
    if (options.token) {
        if (!options.container) throw new Error(`When passing a 'token' to
            webtaskWidget.open, you must also pass in a 'container' option.`);

        if (options.readProfile) throw new Error(`The 'readProfile' option
            cannot be present when specifying a 'token'.`);

        options.readProfile = () => Bluebird.resolve({
            container: options.container,
            token: options.token,
            url: options.url,
        });
    } else if (options.storeProfile) {
        const storageKey = options.storageKey || 'webtask.profile';

        options.readProfile = (options) => LocalForage.getItem(storageKey)
            .then((profile) => {
                if (!profile) return login(target, options);

                try {
                    return validateProfile(profile);
                } catch (__) {
                    return options.writeProfile(null);
                }
            });

        // When the 'storeProfile' options is provided, we set a default
        // 'writeProfile' handler to save the profile to the indicated (or default)
        // 'storageKey'.
        if (!options.writeProfile) {
            options.writeProfile = (profile) => LocalForage.setItem(storageKey, {
                url: profile.url,
                container: profile.container,
                token: profile.token,
            });
        }
    } else {
        options.readProfile = (options) => login(target, options);
    }

    // By default, a noop.
    if (!options.writeProfile) options.writeProfile = (profile) => Bluebird.resolve(profile);


    return options.readProfile(options)
        .then(options.writeProfile)
        .then((profile) => editor(target, Object.assign({}, options, {profile})));

    function validateProfile (profile) {
        if (!profile.container) throw new Error('Invalid profile: missing container');
        if (!profile.token) throw new Error('Invalid profile: missing token');
        if (!profile.url) throw new Error('Invalid profile: missing url');

        return profile;
    }
}