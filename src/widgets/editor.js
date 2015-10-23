import EditorComponent from '../components/editor';

import Widget from '../lib/widget';

export class A0EditorWidget extends Widget {
    constructor(props) {
        super(EditorComponent, props, {
            requireLogin: true,
            events: {
                onSave: 'save',
            }
        });
    }
    
    save(fn) {
        return this._enqueue('saveWebtask', [], fn);
    }
}
