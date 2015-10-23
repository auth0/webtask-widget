import { A0CronListWidget } from './widgets/cron';
import { A0EditorWidget } from './widgets/editor';
import { A0LogsWidget } from './widgets/logs';

module.exports = {
    createCronListing: createWidget(A0CronListWidget),
    createEditor: createWidget(A0EditorWidget),
    createLogger: createWidget(A0LogsWidget),
};


function createWidget (Ctor) {
    return function (props = {}) {
        
        return new Ctor(props);
    };
}