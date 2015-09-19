import Decode from 'jwt-decode';
import RandExp from 'randexp';


export default function deriveProfileFromToken (token, defaults = {}) {
    let tenant;

    if (!token) {
        throw new Error('You must enter a webtask token.');
    }

    try {
        const claims = Decode(token);

        tenant = claims.ten;

        if (!tenant) {
            throw new Error(`Invalid token, missing 'ten' claim '${token}' (https://jwt.io/#id_token=${token}).`);
        }

        if (Array.isArray(tenant)) {
            tenant = tenant[0];
        } else {
            // Check if the `ten` claim is a RegExp
            const matches = tenant.match(/\/(.+)\//);

            if (matches) {
                try {
                    const regex = new RegExp(matches[1]);
                    const gen = new RandExp(regex);

                    // Monkey-patch RandExp to be deterministic
                    gen.randInt = function (l, h) { return l; };

                    tenant = gen.gen();
                } catch (err) {
                    return this.setState({
                        error: new Error(`Unable to derive container name from 'ten' claim '${claims.ten}': ${err.message}.`),
                    });
                }
            }
        }

        if (typeof ten !== 'string' || !tenant) {
            throw new Error(`Expecting 'ten' claim to be a non-blank string, got '${typeof tenant}', with value '${tenant}'.`);
        }
    } catch (__) {
        throw new Error('Invalid JSON Web Token.');
    }
    
    return Object.assign({tenant}, defaults);
}