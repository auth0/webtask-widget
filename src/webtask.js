import Sandbox from 'sandboxjs';


import CronListWidget from './widgets/cronList';
import EditorWidget from './widgets/editor';
import LoginWidget from './widgets/login';
import LogsWidget from './widgets/logs';


/**
 * Export the Sandbox constructor
 */
export { Sandbox };

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
export function showCronListing(options = {}) {
    return new CronListWidget(options);
}

/**
 * @alias showCronListing
 */
export { showCronListing as createCronListing };


/**
 * Create a widget that lets users create or edit Webtasks and Cron Jobs
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
export function showEditor(options = {}) {
    return new EditorWidget(options);
}

/**
 * @alias showEditor
 */
export { showEditor as createEditor };

/**
 * Create a widget that allows users to obtain Sandbox credentials
 * 
 * @param {Object} [options] - Customize the behaviour and appearance of the widget
 * @param {HTMLElement} [options.mount] - Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog.
 * @param {String} [options.url] - The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com.
 * @param {String} [options.token] - The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered.
 * @param {String} [options.container] - The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow.
 */
export function showLogin(options = {}) {
    return new LoginWidget(options);
}

/**
 * @alias showLogin
 */
export { showLogin as createLogin };

/**
 * Create a widget that streams logs for a container
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
export function showLogs(options = {}) {
    return new LogsWidget(options);
}

/**
 * @alias showLogs
 */
export { showLogs as createLogs };
