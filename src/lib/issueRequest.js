import Bluebird from 'bluebird';

import createResponseError from '../lib/createResponseError';

export default function issueRequest (request) {
    return Bluebird.resolve(request)
        .catch(function (err) {
            throw new Error('Error communicating with the webtask cluster: '
                + err.message);
        })
        .then(function (res) {
            if (res.error) throw createResponseError(res);

            // Api compatibility
            res.statusCode = res.status;

            return res;
        });
}
