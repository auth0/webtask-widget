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
 * @param {Function} [options.readProfile] - A function that should return a `Object` or a `Promise` for an object with `url`, `token` and `container` properties.
 * @param {Function} [options.writeProfile] - A function that will be called with the resolved `Profile` that should return a `Promise` that resolves once the profile has been written.
 * @param {Function} [options.storageKey] - A key that will be used by localStorage to read/write the resolved Profile when you *do not* use pass in custom {@see options.readProfile} and {@see options.writeProfile} functions.
 */
export function showCronListing(options = {}) {
    return new CronListWidget(options);
}

export { showCronListing as createCronListing };


/**
 * Create a widget that lets users create or edit Webtasks and Cron Jobs
 * 
 * @param {Object} [options] - Customize the behaviour and appearance of the widget
 * @param {HTMLElement} [options.mount] - Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog.
 * @param {String} [options.url] - The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com.
 * @param {String} [options.token] - The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered.
 * @param {String} [options.container] - The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow.
 * @param {String} [options.code] - Initial code to be shown in the code editor of the widget. This will be ignored when the `edit` option is used.
 * @param {Boolean} [options.cron] - Flag indicating whether the widget should be in cron or normal webtask mode. If cron is true and edit is a String then the value of edit will be taken as the name of a cron job instead of a simple webtask.
 * @param {String} [options.edit] - The name of the webtask or cron job that you would like to edit. Can also be a `sandboxjs` `CronJob` or `Webtask` instance.
 * @param {String} [options.name] - The default name for a new webtask or cron job. This will be ignored when the `edit` option is used.
 * @param {String} [options.pane] - The name of the sidebar pane to show by default. Can be any of: `code`, `history`, `logs`, `schedule`, `secrets`, `settings`
 * @param {Object} [options.secrets] - Object mapping secret keys to secret values that will be exposed via the webtask token secrets mechanism. This will be ignored when the `edit` option is used.
 * @param {Function} [options.readProfile] - A function that should return a `Object` or a `Promise` for an object with `url`, `token` and `container` properties.
 * @param {Function} [options.writeProfile] - A function that will be called with the resolved `Profile` that should return a `Promise` that resolves once the profile has been written.
 * @param {Function} [options.storageKey] - A key that will be used by localStorage to read/write the resolved Profile when you *do not* use pass in custom {@see options.readProfile} and {@see options.writeProfile} functions.
 */
export function showEditor(options = {}) {
    return new EditorWidget(options);
}

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

export { showLogin as createLogin };

/**
 * Create a widget that streams logs for a container
 * 
 * @param {Object} [options] - Customize the behaviour and appearance of the widget
 * @param {HTMLElement} [options.mount] - Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog.
 * @param {String} [options.url] - The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com.
 * @param {String} [options.token] - The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered.
 * @param {String} [options.container] - The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow.
 * @param {Function} [options.readProfile] - A function that should return a `Object` or a `Promise` for an object with `url`, `token` and `container` properties.
 * @param {Function} [options.writeProfile] - A function that will be called with the resolved `Profile` that should return a `Promise` that resolves once the profile has been written.
 * @param {Function} [options.storageKey] - A key that will be used by localStorage to read/write the resolved Profile when you *do not* use pass in custom {@see options.readProfile} and {@see options.writeProfile} functions.
 */
export function showLogs(options = {}) {
    return new LogsWidget(options);
}

export { showLogs as createLogs };
