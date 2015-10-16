import Bluebird from 'bluebird';
import LocalForage from 'localforage';
import Sandbox from 'sandboxjs';

function validateProfile (profile) {
    if (!profile.container) throw new Error('Invalid profile: missing container');
    if (!profile.token) throw new Error('Invalid profile: missing token');
    if (!profile.url) throw new Error('Invalid profile: missing url');

    return Sandbox.init(profile);
}

//
// Promises a profile from LocalForage if a valid one exists
//
//
export function getProfile(key) {
    return LocalForage.getItem(key)
        .then((profile) => {
            if (!profile) return Bluebird.resolve(null);

            try {
                return validateProfile(profile);
            } catch (__) {
                return Bluebird.resolve(null);
            }
        });
}

export function writeProfile(key, profile) {
    validateProfile(profile);

    return LocalForage.setItem(key, {
        url: profile.url,
        container: profile.container,
        token: profile.token,
    });
}
