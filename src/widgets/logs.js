import Logs from 'components/logs';
import AuthenticatedWidget from 'lib/authenticatedWidget';

export default class LogsWidget extends AuthenticatedWidget {
    constructor(options) {
        super(Logs,  {
            events: {
                connect: 'onConnect',
                error: 'onError',
                event: 'onEvent',
                message: 'onMessage',
            },
            ...options
        });
    }
    
    push(event) {
        return this._enqueue('push', event);
    }
}