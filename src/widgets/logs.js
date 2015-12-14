import Logs from 'components/logs';
import AuthenticatedWidget from 'lib/authenticatedWidget';

export default class LogsWidget extends AuthenticatedWidget {
    constructor(options) {
        super(Logs, options);
    }
}