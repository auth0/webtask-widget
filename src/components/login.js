import PromptForToken from 'components/token';
import VerifyConfirmationCode from 'components/verify';
import ComponentStack from 'lib/componentStack';
import issueRequest from 'lib/issueRequest';
import React from 'react';
import Superagent from 'superagent';
import { WEBTASK_CLUSTER_URL, WEBTASK_VERIFICATION_PATH, WEBTASK_SMS_EMAIL_TOKEN } from 'lib/constants';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            error: null,
            phoneOrEmail: '',
            verifyingCode: false,
        };
    }
    
    render() {
        const loading = this.state.verifyingCode
            || this.state.promptingForToken;
        
        const errorMessage = this.state.error
            ?   (
                    <div className="a0-error-message">
                        { this.state.error.message }
                    </div>
                )
            :   null;
        
        return (
            <div className="a0-login-widget">
                { errorMessage }
                <form className="a0-form"
                    onSubmit={ e =>  { e.preventDefault(); if (!loading) this.onSubmit(); }  }
                >
                    <div className="a0-form-group">
                        <label htmlFor="a0-login-phoneOrEmail">Phone number or email address</label>
                        <input className="a0-form-control"
                            disabled={ loading }
                            id="a0-login-phoneOrEmail"
                            placeholder="+15555555555 or name@example.com"
                            onChange={ e => this.setState({ phoneOrEmail: e.target.value }) }
                            ref="phoneOrEmail"
                            type="text"
                            value={ this.state.phoneOrEmail }
                        />
                        <p className="a0-help-block">
                            We will send a verification code to the phone number or email address indicated.
                        </p>
                    </div>

                    <div className="a0-button-list">

                        <button className="a0-inline-button -link"
                            type="button"
                            disabled={ loading }
                            onClick={ e =>  { e.preventDefault(); if (!loading) this.onClickPromptForToken(); }  }
                        >
                            Enter token
                        </button>

                        <button className="a0-inline-button -primary"
                            type="submit"
                            disabled={ loading }
                        >
                            { this.state.verifyingCode
                            ?   'Sending code...'
                            :   'Send code'
                            }
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    onCancel() {
        this.props.onCancel();
    }
    
    onLogin(profile) {
        this.props.onLogin(profile);
    }
    
    onSubmit() {
        let phoneOrEmail = this.refs.phoneOrEmail.value.trim();
        let type;
        let value;

        this.setState({ error: null });

        if (isPhone(phoneOrEmail)) {
            if (phoneOrEmail.indexOf('+') !== 0)
                phoneOrEmail = '+1' + phoneOrEmail; // default to US
            type = 'phone';
            value = phoneOrEmail;
        } else if (isEmail(phoneOrEmail)) {
            type = 'email';
            value = phoneOrEmail;
        } else {
            return this.setState({
                error: new Error('You must specify a valid e-mail address '
                    + 'or a phone number. The phone number must start with + followed '
                    + 'by country code, area code, and local number.'),
            });
        }

        const query = {};

        query[type] = value;

        this.setState({
            verifyingCode: true,
        });

        const request = Superagent
            .post(`${WEBTASK_CLUSTER_URL}${WEBTASK_VERIFICATION_PATH}`)
            .query(query)
            .accept('json')
            .set('Authorization', `Bearer ${WEBTASK_SMS_EMAIL_TOKEN}`);

        return issueRequest(request)
            .get('body')
            .then((data) => {
                const onCancel = () => {
                    verify.unmount();
                    this.setState({ verifyingCode: false });
                };
                const onError = (error) => {
                    verify.unmount();
                    this.setState({ verifyingCode: false, error });
                };
                const onLogin = (data) => {
                    verify.unmount();
                    this.setState({ verifyingCode: false });
                    this.onLogin(data);
                };
                const verify = this.props.stack.push(VerifyConfirmationCode, { onCancel, onError, onLogin, type, value });
            })
            .catch((error) => this.setState({
                error,
                verifyingCode: false,
            }));

        function isPhone (value) {
            return !!value.match(/^\+?[0-9]{1,15}$/);
        }

        function isEmail (value) {
            return !!value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
        }
    }
    
    onClickPromptForToken() {
        this.setState({ promptingForToken: true });
        
        const onLogin = (sandbox) => {
            token.unmount();
            this.setState({ promptingForToken: false });
            this.onLogin(sandbox);
        };
        const onCancel = () => {
            token.unmount();
            this.setState({ promptingForToken: false });
        };
        const token = this.props.stack.push(PromptForToken, { onCancel, onLogin });
    }
}

Login.title = 'Send verification code';


Login.proptTypes = {
    onCancel: React.PropTypes.func.isRequired,
    onLogin: React.PropTypes.func.isRequired,
    stack: React.PropTypes.instanceOf(ComponentStack).isRequired,
};