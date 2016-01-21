# Auth0 Webtask Widget

## Build

### Development workflow

```shell
git clone git@github.com:auth0/auth0-webtask-widget.git
cd auth0-webtask-widget
npm install
npm run develop
```

This starts `webpack-dev-server` at [http://localhost:8080](http://localhost:8080).
The script will watch all dependencies and recompile on changes. Everything is
served from memory with source-maps.

### Production build

```shell
npm run build
```

This creates builds in the `./dist` folder.

Two builds are created:

1. `webtask-bootstrap.min.js` - This is a version with Bootstrap styles built-in.
2. `webtask.min.js` - This is a version for use in contexts that already have Bootstrap available.

## Usage

```js
// Get a reference to an existing HTMLElement instance
var containerEl = document.getElementById('container');

// Create a webtask widget in the element with id `container`.
// The webtask widget will prompt the user for their phone # or email address
// the first time they visit the page. Because `storeProfile` is enabled,
// the user's credentials will be saved locally for the next time they visit.
var editor = webtaskWidget.createEditor({
    mount: containerEl,
    storeProfile: true,
});

// The returned editor object is an instance of an A0EditorWidget class that 
// emits certain events and gives programmatic access to some of the underlying
// functionality of the widget.
editor.on('save', function (webtask) {
    console.log('I just saved a webtask that can be accessed at', webtask.url);
});
```

## API

## Functions

<dl>
<dt><a href="#showCronListing">showCronListing([options])</a></dt>
<dd><p>Create a widget that lists cron jobs associated with the active profile</p>
</dd>
<dt><a href="#showEditor">showEditor([options])</a></dt>
<dd><p>Create a widget that lets users create or edit Webtasks and Cron Jobs</p>
</dd>
<dt><a href="#showLogin">showLogin([options])</a></dt>
<dd><p>Create a widget that allows users to obtain Sandbox credentials</p>
</dd>
<dt><a href="#showLogs">showLogs([options])</a></dt>
<dd><p>Create a widget that streams logs for a container</p>
</dd>
</dl>

<a name="showCronListing"></a>
## showCronListing([options])
Create a widget that lists cron jobs associated with the active profile

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Customize the behaviour and appearance of the widget |
| [options.mount] | <code>HTMLElement</code> | Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog. |
| [options.url] | <code>String</code> | The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com. |
| [options.token] | <code>String</code> | The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered. |
| [options.container] | <code>String</code> | The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow. |
| [options.readProfile] | <code>function</code> | A function that should return a `Object` or a `Promise` for an object with `url`, `token` and `container` properties. |
| [options.writeProfile] | <code>function</code> | A function that will be called with the resolved `Profile` that should return a `Promise` that resolves once the profile has been written. |
| [options.storageKey] | <code>function</code> | A key that will be used by localStorage to read/write the resolved Profile when you *do not* use pass in custom {@see options.readProfile} and {@see options.writeProfile} functions. |

<a name="showEditor"></a>
## showEditor([options])
Create a widget that lets users create or edit Webtasks and Cron Jobs

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Customize the behaviour and appearance of the widget |
| [options.mount] | <code>HTMLElement</code> | Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog. |
| [options.url] | <code>String</code> | The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com. |
| [options.token] | <code>String</code> | The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered. |
| [options.container] | <code>String</code> | The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow. |
| [options.readProfile] | <code>function</code> | A function that should return a `Object` or a `Promise` for an object with `url`, `token` and `container` properties. |
| [options.writeProfile] | <code>function</code> | A function that will be called with the resolved `Profile` that should return a `Promise` that resolves once the profile has been written. |
| [options.storageKey] | <code>function</code> | A key that will be used by localStorage to read/write the resolved Profile when you *do not* use pass in custom {@see options.readProfile} and {@see options.writeProfile} functions. |

<a name="showLogin"></a>
## showLogin([options])
Create a widget that allows users to obtain Sandbox credentials

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Customize the behaviour and appearance of the widget |
| [options.mount] | <code>HTMLElement</code> | Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog. |
| [options.url] | <code>String</code> | The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com. |
| [options.token] | <code>String</code> | The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered. |
| [options.container] | <code>String</code> | The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow. |

<a name="showLogs"></a>
## showLogs([options])
Create a widget that streams logs for a container

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Customize the behaviour and appearance of the widget |
| [options.mount] | <code>HTMLElement</code> | Indicate where the widget should be mounted. If not specified the widget will be shown as a modal dialog. |
| [options.url] | <code>String</code> | The url of the Webtask cluster to be used. Defaults to https://webtask.it.auth0.com. |
| [options.token] | <code>String</code> | The webtask token of the current user. If missing, and no {@see options.readProfile} profided, the SMS/email login flow will be triggered. |
| [options.container] | <code>String</code> | The webtask container of the current user. If missing, will be derived from {@see options.token}, from the result of {@see options.readProfile}, or finally from the result of the SMS/email login flow. |
| [options.readProfile] | <code>function</code> | A function that should return a `Object` or a `Promise` for an object with `url`, `token` and `container` properties. |
| [options.writeProfile] | <code>function</code> | A function that will be called with the resolved `Profile` that should return a `Promise` that resolves once the profile has been written. |
| [options.storageKey] | <code>function</code> | A key that will be used by localStorage to read/write the resolved Profile when you *do not* use pass in custom {@see options.readProfile} and {@see options.writeProfile} functions. |



## Concepts

### Profile

A profile represents a user's claim to create and run webtasks on a webtask cluster as defined by [sandboxjs](https://github.com/auth0/sandboxjs#Profile):

Profiles are the combination of:

1. `url` - The url of the webtask cluster
2. `container` - The container in which the webtask will be run
3. `token` - The user's webtask [Token](#token)


### Token

A webtask token is a JSON Web Token that encodes a user's claims to perform actions on a webtask cluster. See: [the webtask documentation](https://webtask.io/docs/how) for details on how this works.

### Webtask

A webtask is a claim to run code at a url where that code will have access to any secrets embedded in the webtask.
Webtask objects [expose several properties and methods](https://github.com/auth0/sandboxjs).

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.