import Bluebird from 'bluebird';
import Login from 'components/login';
import Widget from 'lib/widget';
import Sandbox from 'sandboxjs';

export default class AuthenticatedWidget extends Widget {
    widgetWillMount(Component, {
        url = 'https://webtask.it.auth0.com',
        token = null,
        container = null,
        readProfile = null,
        writeProfile = null,
        storeProfile = false,
        storageKey = 'webtask.profile',
    } = {}) {
        const props = arguments[1];
        const stack = this.stack;
        const showLogin = () => new Bluebird((resolve, reject) => {
            const login = this.stack.push(Login, { onCancel, onLogin, stack });
            
            window.addEventListener('webtask:login', handleLoginEvent);
            window.addEventListener('storage', handleStorageEvent);
            
            function onCancel() {
                login.unmount();
                
                reject(new Error('Login cancelled by user.'));
            }
            
            function onLogin(profile) {
                const sandbox = validateProfile(profile);
                
                login.unmount();
                
                window.removeEventListener('webtask:login', handleLoginEvent);
                window.removeEventListener('storage', handleStorageEvent);
                
                resolve(sandbox);
                
                // StorageEvents are only triggered on _other_ windows by
                // by default, create a custom event to trigger locally to
                // inform other instances of the widget with the same storageKey
                // that a profile is available
                const loginEvent = new window.CustomEvent('webtask:login', {
                    detail: { storageKey, profile },
                });
                
                window.dispatchEvent(loginEvent);
            }
            
            function handleLoginEvent(e) {
                if (e.detail.storageKey === storageKey) {
                    onLogin(e.detail.profile);
                }
            }
            
            function handleStorageEvent(e) {
                console.log('storage event', e);
                if (e.storageArea === storageKey && e.newValue) {
                    try {
                        onLogin(validateProfile(JSON.stringify(e.newValue)));
                    } catch (__) {}
                }
            }
        });

        // If we bootstrap the widget with a token, we need to be sure that we have
        // all the necessary information to constitute a valid Profile.
        if (token) {
            if (!container) throw new Error(`When passing a 'token' to
                webtaskWidget.open, you must also pass in a 'container' option.`);
    
            if (readProfile) throw new Error(`The 'readProfile' option
                cannot be present when specifying a 'token'.`);
    
            readProfile = () => Bluebird.resolve({
                container: container,
                token: token,
                url: url,
            });
        } else if (storeProfile) {
            readProfile = (options) => Bluebird.resolve(localStorage.getItem(storageKey))
                .then(JSON.parse)
                .then(sandbox => sandbox ? sandbox : showLogin());
    
            // When the 'storeProfile' options is provided, we set a default
            // 'writeProfile' handler to save the profile to the indicated (or default)
            // 'storageKey'.
            if (!writeProfile) {
                writeProfile = (sandbox) => Bluebird.resolve({
                    url: sandbox.url,
                    container: sandbox.container,
                    token: sandbox.token,
                })
                    .tap(function (data) {
                        return localStorage.setItem(storageKey, JSON.stringify(data));
                    });
            }
        } else {
            readProfile = showLogin;
        }
    
        // By default, a noop.
        if (!writeProfile) writeProfile = (sandbox) => Bluebird.resolve(sandbox);
        
        const options = {
            url,
            token,
            container,
            readProfile,
            writeProfile,
            storeProfile,
            storageKey,
        };
        
        Bluebird.resolve(readProfile(options))
            .then(validateProfile)
            .tap((sandbox) => {
                this.emit('sandbox', sandbox);
            })
            .tap(writeProfile)
            .then((sandbox) => {
                return this.stack.push(Component, Object.assign({}, props, { sandbox }));
            });
    
        function validateProfile (sandbox) {
            if (!sandbox.container) throw new Error('Invalid profile: missing container');
            if (!sandbox.token) throw new Error('Invalid profile: missing token');
            if (!sandbox.url) throw new Error('Invalid profile: missing url');
    
            return Sandbox.init(sandbox);
        }
    }
}