import Bluebird from 'bluebird';

import {createLogin} from '../widgets/login';

import Editor from '../components/editor';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget';
import dedent from '../lib/dedent';

class EditorWidget extends Widget {
    constructor(options) {
        super(Editor, options);

        this.onSave = options.onSave;

        this.on('save', this.onSave);
    }

    save(cb) {
        return Bluebird.resolve(this.onSave())
            .then(function (result) {
                if(cb)
                    cb(result);

                return result;
            })
    }
}

export function createEditor({
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
        showIntro,
        mergeBody,
        parseBody,
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

    const editorWidget = new EditorWidget(options);

    Bluebird.resolve(profile)
        .then((profile) => {
            return componentStack.push(editorWidget.component, Object.assign({}, options, {profile}))
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
