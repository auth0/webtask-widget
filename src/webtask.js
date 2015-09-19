import LocalForage from 'localforage';
import Promise from 'promise';
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

        options.readProfile = () => Promise.resolve({
            container: options.container,
            token: options.token,
            url: options.url,
        });
    } else if (options.storeProfile) {
        const storageKey = options.storageKey || 'webtask.profile';

        options.readProfile = (options) => LocalForage.getItem(storageKey)
            .then((profile) => profile || login(target, options));

        // When the 'storeProfile' options is provided, we set a default
        // 'writeProfile' handler to save the profile to the indicated (or default)
        // 'storageKey'.
        if (!options.writeProfile) {
            options.writeProfile = (profile) => LocalForage.setItem(storageKey, profile);
        }
    } else {
        options.readProfile = (options) => login(target, options);
    }

    // By default, a noop.
    if (!options.writeProfile) options.writeProfile = (profile) => Promise.resolve(profile);


    return options.readProfile(options)
        .then(options.writeProfile)
        .then((profile) => editor(target, Object.assign({}, options, {profile})));
}