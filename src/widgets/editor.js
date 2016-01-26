import Editor from 'components/editor';
import AuthenticatedWidget from 'lib/authenticatedWidget';

export default class EditorWidget extends AuthenticatedWidget {
    constructor(options) {
        super(Editor, {
            events: {
                save: 'onSave',
                run: 'onRun',
            },
            ...options
        });
    }
    
    run() {
        return this._enqueue('run');
    }
    
    save() {
        return this._enqueue('save');
    }
}