import Bluebird from 'bluebird';
import LocalForage from 'localforage';
import React from 'react';
import Style from './styles/style.less';

import {editor} from './components/editor';
import {login} from './components/login';




export default function open (target, {
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
    
    target.classList.add('a0-webtask-widget');

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
                if (!profile) return login(target, options);

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
        readProfile = (options) => login(target, options);
    }

    // By default, a noop.
    if (!writeProfile) writeProfile = (profile) => Bluebird.resolve(profile);

    const options = {
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
        code,
        tryParams,
        onSave,
    };

    return readProfile(options)
        .then(writeProfile)
        .then((profile) => editor(target, Object.assign({}, options, {profile})));

    function validateProfile (profile) {
        if (!profile.container) throw new Error('Invalid profile: missing container');
        if (!profile.token) throw new Error('Invalid profile: missing token');
        if (!profile.url) throw new Error('Invalid profile: missing url');

        return profile;
    }
}

function dedent (callSite, ...args) {

    function format(str) {

        let size = -1;

        return str.replace(/\n(\s+)/g, (m, m1) => {

            if (size < 0)
                size = m1.replace(/\t/g, "    ").length;

            return "\n" + m1.slice(Math.min(m1.length, size));
        });
    }

    if (typeof callSite === "string")
        return format(callSite);

    if (typeof callSite === "function")
        return (...args) => format(callSite(...args));

    let output = callSite
        .slice(0, args.length + 1)
        .map((text, i) => (i === 0 ? "" : args[i - 1]) + text)
        .join("");

    return format(output);
}