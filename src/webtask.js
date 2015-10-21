import decorateWithLogin from './lib/decorateWithLogin';

import {createCronJobs} from './widgets/cron';
import {createEditor} from './widgets/editor';
import {createLogin} from './widgets/login';
import {createLogs} from './widgets/logs';

module.exports = {
    createCronJobs: decorateWithLogin(createCronJobs, createLogin),
    createEditor: decorateWithLogin(createEditor, createLogin),
    createLogs: decorateWithLogin(createLogs, createLogin),
    createLogin,
};
