import Bluebird from 'bluebird';

import {createLogin} from '../widgets/login';

import Editor from '../components/editor';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget';
import dedent from '../lib/dedent';
import {getProfile, saveProfile} from '../lib/profileManagement';

export function createEditor({
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
} = {}, cb) {
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
        })
        .then((profile) => {
            return writeProfile ? saveProfile(storageKey, profile) : profile;
        });
    } else if (storeProfile) {
        readProfile = getProfile;
    } else {
        readProfile = Bluebird.resolve(null);
    }

    const options = {
        mount,
        componentStack,
        url,
        token,
        container,
        name,
        showIntro,
        mergeBody,
        parseBody,
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

    const editorWidget = new Widget(Editor, Object.assign({}, options, {
        methods: ['save']
    }));

    editorWidget.on('save', options.onSave);

    options.readProfile(storageKey)
        .then((profile) => {
            if(!profile)
                return showLogin(options);

            options.componentStack.push(editorWidget.component, Object.assign({}, options, {profile}));
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

    return editorWidget;
}
