# Auth0 Webtask Widget

## Build

### Development workflow

```shell
git clone git@github.com:auth0/auth0-webtask-widget.git
cd auth0-webtask-widget
npm install
npm run develop
```

This creates an unminified build at `./build/build.js`.

You can now open the running example in your browser at [http://localhost:8080](http://localhost:8080).
The script will watch all dependencies and recompile on changes. Everything is
served with source-maps.

### Production build

```shell
npm run build
```

This creates a minified build at `./build/build.min.js`.

## Usage

```js
var containerEl = document.getElementById('container');

// Create a webtask widget in the element with id `container`.
// The webtask widget will prompt the user for their phone # or email address
// the first time they visit the page. Because `storeProfile` is enabled,
// the user's credentials will be saved locally for the next time they visit.
// The widget will invoke the `onSave` callback every time the webtask is saved.
webtaskWidget.open(containerEl, {
    storeProfile: true,
    onSave: function (webtask) {
        console.log('webtask saved with url', webtask.url);
    }
});
```

## API

#### `webtaskWidget.open (containerEl, [options])`


Option | Type | Default | Description
--- | --- | --- | ---
url | `String` | `CLUSTER_URL` | The url of the webtask cluster
token | `String` |  | The current user's webtask token.
container | `String` |   | The current user's container.
name | `String` | `''` | The default name of the webtask.
mergeBody | `Boolean` | `true` | Set the initial value of the merge body setting.
parseBody | `Boolean` | `true` | Set the initial value of the parse body setting.
autoSaveOnLoad | `Boolean` | `false` | Automatically trigger a save when the widget loads.
autoSaveOnChange | `Boolean` | `false` | Automatically trigger a save when the code changes.
autoSaveInterval | `Number` | `1000` | Adjust how frequently a save will be triggered if `autoSaveOnChange` is `true`.
readProfile | `Function` |  | A function that is expected to return a [Profile](#profile) or a Promise that will resolve to a profile.
writeProfile | `Function` |   | A function that will be called after the user completes login. If the save is asynchronous, it should return a Promise.
storeProfile | `Boolean` | `false` | In the absense of `readProfile` and `writeProfile`, if this is `true`, the user's [Profile](#profile) will be stored at `storageKey` using localForage.
storageKey | `String` | `'webtask.profile'` | The key at which the user's profile is stored if `storeProfile` is `true`.
showWebtaskUrl | `Boolean` | true | Toggle whether the box with the saved webtask's url should be shown when it is saved.
showTryWebtaskUrl | `Boolean` | true | Toggle whether the temporary testing webtask's url should be shown.
code | `String` |   | Overwrite the default code that will be displayed in the editor.
tryParams | `Object` |   | Overwrite the default params that will be shown in the 'try' dialog.
onSave | `Function` |  | Callback that will be invoked every time the webtask is saved. The callback will be passed an instance of the saved [Webtask](#webtask).


## Concepts

### Profile

A profile represents a user's claim to create and run webtasks on a webtask cluster.

Profiles are the combination of:

1. `url` - The url of the webtask cluster
2. `container` - The container in which the webtask will be run
3. `token` - The user's webtask [Token](#token)


### Token

A webtask token is a JSON Web Token that encodes a user's claims to perform actions on a webtask cluster. See: [the webtask documentation](https://webtask.io/docs/how) for details on how this works.

### Webtask

A webtask is a claim to run code at a url where that code will have access to any secrets embedded in the webtask.
Webtask objects [expose several properties and methods](https://github.com/auth0/sandboxjs).