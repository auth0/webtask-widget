import LocalForage from 'localforage';
import React from 'react';
import Theme from 'common/theme.less';

import {login} from 'components/login';
// import Widget from 'components/widget';


function openWidget (target, options = { namespace: '' }) {
    const profileKey = options.namespace
        ? `${options.namespace}.webtask.profile`
        : 'webtask.profile';

    if (!target.classList.contains('a0-container'))
        target.classList.add('a0-container');

    LocalForage.getItem(profileKey)
        .then((profile) => profile || login({container: target}))
        .then(onProfileLoad, onProfileError);

    function onProfileLoad (profile) {
        console.log('onProfileLoad', profile);
    }

    function onProfileError (err) {
        console.error('onProfileError', err);
    }
}

openWidget(document.getElementById('content'));