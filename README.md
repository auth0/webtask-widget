# Auth0 Webtask Widget

## Run example

```shell
git clone git@github.com:auth0/auth0-webtask-widget.git
cd auth0-webtask-widget
npm install
npm start
```

You can now open the running example in your browser at http://localhost:8080

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


Option | Default | Description
--- | --- | ---
url | `CLUSTER_URL` | The url of the webtask cluster
token |  | The current user's webtask token.
container |   | The current user's container.
readProfile |  | A function that is expected to return a [profile](#profile) or a Promise that will resolve to a profile.
writeProfile |   | A function that will be called after the user completes login. If the save is asynchronous, it should return a Promise.
storeProfile | `false` | In the absense of `readProfile` and `writeProfile`, if this is `true`, the user's [Profile](#profile) will be stored at `storageKey` using localForage.
storageKey | `'webtask.profile'` | The key at which the user's profile is stored if `storeProfile` is `true`.
showWebtaskUrl | true | Toggle whether the box with the saved webtask's url should be shown when it is saved.
showTryWebtaskUrl | true | Toggle whether the temporary testing webtask's url should be shown.
code | `'module.exports = ...'` | Overwrite the code that will be displayed in the editor.
tryParams | `{ ... }` | Overwrite the params that will be shown in the 'try' dialog.
onSave | `null` | Callback that will be invoked every time the webtask is saved. The callback will be passed an instance of the saved [Webtask](#webtask).


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
Webtask objects [expose several properties and methods](/auth0/sandboxjs).