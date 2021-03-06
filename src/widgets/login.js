import Login from 'components/login';
import Widget from 'lib/widget';

export default class LoginWidget extends Widget {
    constructor(props) {
        super(Login, {
            events: {
                login: 'onLogin',
                cancel: 'onCancel',
            },
            ...props
        });
    }
}