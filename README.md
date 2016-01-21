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

#### `webtaskWidget.createEditor ([options])`

Creates an instance of the Webtask Editor widget that allows users to easily create, edit and test webtasks.

Returns an instance of [EditorWidget](#EditorWidget).

Option | Type | Default | Description
--- | --- | --- | ---
mount | `HTMLElement` | `null` | The element into which the widget will be added. If set to `null`, the widget will be shown in a Modal.
name | `String` | `''` | The default name of the webtask.
mergeBody | `Boolean` | `true` | Set the initial value of the merge body setting.
parseBody | `Boolean` | `true` | Set the initial value of the parse body setting.
autoSaveOnLoad | `Boolean` | `false` | Automatically trigger a save when the widget loads.
autoSaveOnChange | `Boolean` | `false` | Automatically trigger a save when the code changes.
autoSaveInterval | `Number` | `1000` | Adjust how frequently a save will be triggered if `autoSaveOnChange` is `true`.
showWebtaskUrl | `Boolean` | true | Toggle whether the box with the saved webtask's url should be shown when it is saved.
showTryWebtaskUrl | `Boolean` | true | Toggle whether the temporary testing webtask's url should be shown.
secrets | `Object` |  `{}` | Set default secrets for the editor.
code | `String` |   | Overwrite the default code that will be displayed in the editor.
tryParams | `Object` |   | Overwrite the default params that will be shown in the 'try' dialog.
onSave | `Function` |  | Callback that will be invoked every time the webtask is saved. The callback will be passed an instance of the saved [Webtask](#webtask).

The following options can be used to modify how the widget is bootstrapped with a valid [Profile](#profile):

Option | Type | Default | Description
--- | --- | --- | ---
url | `String` | `CLUSTER_URL` | The url of the webtask cluster
token | `String` |  | The current user's webtask token.
container | `String` |   | The current user's container.
readProfile | `Function` |  | A function that is expected to return a [Profile](#profile) or a Promise that will resolve to a profile.
writeProfile | `Function` |   | A function that will be called after the user completes login. If the save is asynchronous, it should return a Promise.
storeProfile | `Boolean` | `false` | In the absense of `readProfile` and `writeProfile`, if this is `true`, the user's [Profile](#profile) will be stored at `storageKey` using localForage.
storageKey | `String` | `'webtask.profile'` | The key at which the user's profile is stored if `storeProfile` is `true`.


#### `webtaskWidget.createLogger ([options])`

Creates an instance of the real-time logs widget that lets users stream logs directly from their webtask container to the browser.

Option | Type | Default | Description
--- | --- | --- | ---
mount | `HTMLElement` | `null` | The element into which the widget will be added. If set to `null`, the widget will be shown in a Modal.

The following options can be used to modify how the widget is bootstrapped with a valid [Profile](#profile)

Option | Type | Default | Description
--- | --- | --- | ---
url | `String` | `CLUSTER_URL` | The url of the webtask cluster
token | `String` |  | The current user's webtask token.
container | `String` |   | The current user's container.
readProfile | `Function` |  | A function that is expected to return a [Profile](#profile) or a Promise that will resolve to a profile.
writeProfile | `Function` |   | A function that will be called after the user completes login. If the save is asynchronous, it should return a Promise.
storeProfile | `Boolean` | `false` | In the absense of `readProfile` and `writeProfile`, if this is `true`, the user's [Profile](#profile) will be stored at `storageKey` using localForage.
storageKey | `String` | `'webtask.profile'` | The key at which the user's profile is stored if `storeProfile` is `true`.


#### `webtaskWidget.createLogger ([options])`

Creates an instance of the real-time logs widget that lets users stream logs directly from their webtask container to the browser.

Option | Type | Default | Description
--- | --- | --- | ---
mount | `HTMLElement` | `null` | The element into which the widget will be added. If set to `null`, the widget will be shown in a Modal.

The following options can be used to modify how the widget is bootstrapped with a valid [Profile](#profile):

Option | Type | Default | Description
--- | --- | --- | ---
url | `String` | `CLUSTER_URL` | The url of the webtask cluster
token | `String` |  | The current user's webtask token.
container | `String` |   | The current user's container.
readProfile | `Function` |  | A function that is expected to return a [Profile](#profile) or a Promise that will resolve to a profile.
writeProfile | `Function` |   | A function that will be called after the user completes login. If the save is asynchronous, it should return a Promise.
storeProfile | `Boolean` | `false` | In the absense of `readProfile` and `writeProfile`, if this is `true`, the user's [Profile](#profile) will be stored at `storageKey` using localForage.
storageKey | `String` | `'webtask.profile'` | The key at which the user's profile is stored if `storeProfile` is `true`.



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