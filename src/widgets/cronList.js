import CronList from 'components/cronList';
import AuthenticatedWidget from 'lib/authenticatedWidget';

export default class CronListWidget extends AuthenticatedWidget {
    constructor(options) {
        super(CronList, options);
    }
}