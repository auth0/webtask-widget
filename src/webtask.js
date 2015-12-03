import { A0CronListWidget } from './widgets/cron';
import { A0EditorWidget } from './widgets/editor';
import { A0LogsWidget } from './widgets/logs';

/**
 * Exposes a suite of widgets to interact with the Webtask (https://webtask.io) platform
 * 
 * @module webtaskWidget
 */
module.exports = {
    /**
     * Create a widget that lists cron jobs associated with the active profile
     * 
     * @param {Object} [options] - Customize the behaviour and appearance of the widget
     * @param {HTMLElement} [options.mount] - Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog.
     * @param {String} [options.url] - The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com.
     * @param {String} [options.token] - The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered.
     * @param {String} [options.container] - The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow.
     * @param {function} [options.readProfile] - A function that should return a `Object` or a `Promise` for an object with `url`, `token` and `container` properties.
     * @param {function} [options.writeProfile] - A function that will be called with the resolved `Profile` that should return a `Promise` that resolves once the profile has been written.
     * @param {function} [options.storageKey] - A key that will be used by localStorage to read/write the resolved Profile when you *do not* use pass in custom {@see options.readProfile} and {@see options.writeProfile} functions.
     */
    createCronListing: createWidget(A0CronListWidget),
    createEditor: createWidget(A0EditorWidget),
    createLogger: createWidget(A0LogsWidget),
};


function createWidget (Ctor) {
    return function (props = {}) {
        
        return new Ctor(props);
    };
}