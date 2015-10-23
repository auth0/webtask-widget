import LogsComponent from '../components/logs';

import Widget from '../lib/widget';

export class A0LogsWidget extends Widget {
    constructor(props) {
        super(LogsComponent, props, {
            requireLogin: true,
            events: {
                onError: 'error',
                onEvent: 'event',
                onMessage: 'message',
            }
        });
    }
    
    clear(cb) {
        return this._enqueue('clear', [], cb);
    }
}
