import Bluebird from 'bluebird';
import LocalForage from 'localforage';

import {showLogin} from '../widgets/login';

import Editor from '../components/editor';

import ComponentStack from '../lib/componentStack';
import dedent from '../lib/dedent';

export function showEditor ({
    mount = null,
    componentStack = null,
    profile = null,
    name = '',
    showIntro = false,
    mergeBody = true,
    parseBody = true,
    autoSaveOnLoad = false,
    autoSaveOnChange = false,
    autoSaveInterval = 1000,
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
    
    if (!profile) throw new Error('This widget requires an instance of a Sandboxjs Profile.');
    if (!componentStack) componentStack = new ComponentStack(mount);

    const options = {
        mount,
        componentStack,
        profile,
        name,
        mergeBody,
        parseBody,
        showIntro,
        autoSaveOnLoad,
        autoSaveOnChange,
        autoSaveInterval,
        showWebtaskUrl,
        showTryWebtaskUrl,
        secrets,
        code,
        tryParams,
        onSave,
    };

    return componentStack.push(Editor, options);
}
