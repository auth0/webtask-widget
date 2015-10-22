import Bluebird from 'bluebird';
import Sandbox from 'sandboxjs';

import merge from 'lodash.merge';

import {createLogin} from '../widgets/login';

import Editor from '../components/editor';

import ComponentStack from '../lib/componentStack';
import Widget from '../lib/widget';
import dedent from '../lib/dedent';

class A0EditorWidget extends Widget {
    constructor(options) {
        super(Editor, options);
    }

    save(cb) {
        return Bluebird.resolve(this.onSave())
            .then(function (result) {
                if(cb)
                    cb(result);

                this.emit('save', result);

                return result;
            });
    }
}

export function createEditor(options = {}) {
    options = merge({
        mount: null,
        componentStack: null,
        profile: null,
        name: '',
        showIntro: false,
        mergeBody: true,
        parseBody: true,
        autoSaveOnLoad: false,
        autoSaveOnChange: false,
        autoSaveInterval: 1000,
        showWebtaskUrl: true,
        showTryWebtaskUrl: true,
        secrets: {},
        code: dedent`
            module.exports = function (ctx, cb) {
                cb(null, 'Hello ' + ctx.query.hello);
            };
        `.trim(),
        tryParams: {
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
        onSave: (webtask) => webtask,
    }, options);
    
    if (!(options.profile instanceof Sandbox)) throw new Error('This widget requires an instance of a Sandboxjs Profile.');
    if (!options.componentStack) options.componentStack = new ComponentStack(options.mount);
    
    return new A0EditorWidget(options);
}
