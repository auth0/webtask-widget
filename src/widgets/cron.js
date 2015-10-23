import CronListComponent from '../components/cronList';

import Widget from '../lib/widget';

export class A0CronListWidget extends Widget {
    constructor(props) {
        super(CronListComponent, props, {
            requireLogin: true,
        });
    }
    
    refresh(cb) {
        return this._enqueue('refreshJobs', [], cb);
    }
}
