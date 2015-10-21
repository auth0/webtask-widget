import Bluebird from 'bluebird';
import LocalForage from 'localforage';
import Sandbox from 'sandboxjs';

export default function decorateWithLogin(decoratedWidget, createLogin) {
    return function({
        mount = null,
        url = 'https://webtask.it.auth0.com',
        token = null,
        container = null,
        readProfile = null,
        writeProfile = null,
        storeProfile = false,
        storageKey = 'webtask.profile',
    } = {}) {
        const args = Array.prototype.slice.call(arguments);
        
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
            readProfile = (options) => LocalForage.getItem(storageKey)
                .then((profile) => {
                    return profile
                        ?   profile
                        :   createLogin.apply(null, args);
                });
    
            // When the 'storeProfile' options is provided, we set a default
            // 'writeProfile' handler to save the profile to the indicated (or default)
            // 'storageKey'.
            if (!writeProfile) {
                writeProfile = (profile) => LocalForage.setItem(storageKey, {
                    url: profile.url,
                    container: profile.container,
                    token: profile.token,
                });
            }
        } else {
            readProfile = (options) => createLogin.apply(null, args);
        }
    
        // By default, a noop.
        if (!writeProfile) writeProfile = (profile) => Bluebird.resolve(profile);
        
        const options = {
            mount,
            url,
            token,
            container,
            readProfile,
            writeProfile,
            storeProfile,
            storageKey,
        };
        
        const profile = Bluebird.resolve(readProfile(options))
            .then(validateProfile)
            .tap(writeProfile);

        return decoratedWidget(Object.assign({}, options, {profile}));
    
        function validateProfile (profile) {
            if (!profile.container) throw new Error('Invalid profile: missing container');
            if (!profile.token) throw new Error('Invalid profile: missing token');
            if (!profile.url) throw new Error('Invalid profile: missing url');
    
            return Sandbox.init(profile);
        }
    };
}