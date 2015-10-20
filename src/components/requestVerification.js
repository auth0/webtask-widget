import React from 'react';
import Superagent from 'superagent';

import { WEBTASK_CLUSTER_URL, WEBTASK_VERIFICATION_PATH, WEBTASK_SMS_EMAIL_TOKEN } from '../lib/constants';
import issueRequest from '../lib/issueRequest';

import Alert from '../components/alert';
import Button from '../components/button';
import Input from '../components/input';
import PromptForToken from '../components/promptForToken';
import VerifyConfirmationCode from '../components/verifyConfirmationCode';


export default class A0RequestVerification extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {};
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;
        
        const loading = state.verifyingCode
            || state.promptingForToken;
        const issueVerificationCode = self.issueVerificationCode.bind(self);
        const promptForToken = self.promptForToken.bind(self);
        const tryAgain = self.tryAgain.bind(self);
        
        return (
            <div className="a0-requestverification">
                { state.error
                ?   (
                        <Alert
                            bsStyle="danger">
                            <p>{ state.error.message }</p>
                            <p>
                                <Button bsSize="small" onClick={ tryAgain }>Try again</Button>
                            </p>
                        </Alert>
                    )
                : null
                }
                <form className="form" onSubmit={ loading ? null : issueVerificationCode }>
                    <Input
                        type="text"
                        value={ state.phoneOrEmail }
                        disabled={ loading }
                        placeholder="+15555555555 or name@example.com"
                        label="Phone number or email address"
                        help="We will send a verification code to the phone number or email address indicated."
                        ref="phoneOrEmail"
                    />

                    <div className="btn-list text-right clearfix">

                        <Button
                            bsStyle="link"
                            type="button"
                            disabled={ loading }
                            onClick={ loading ? null : promptForToken }>
                            Enter token
                        </Button>

                        <Button
                            bsStyle="primary"
                            type="submit"
                            disabled={ loading }
                            onClick={ loading ? null : issueVerificationCode }>
                            { state.verifyingCode
                            ?   'Sending code...'
                            :   'Send code'
                            }
                        </Button>
                    </div>
                </form>
            </div>
        );
    }
    
    tryAgain(e) {
        this.setState({
            error: null,
        });

        this.issueVerificationCode(e);
    }
    
    promptForToken(e) {
        e.preventDefault();
        
        this.setState({ promptingForToken: true });
        
        this.props.componentStack.push(PromptForToken, {})
            .then(this.props.resolve)
            .catch(() => this.setState({ promptingForToken: false }));
    }
    
    issueVerificationCode(e) {
        e.preventDefault();
        
        const self = this;

        let phoneOrEmail = this.refs.phoneOrEmail.getValue().trim();
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
            .then(handleIssuanceResponse)
            .catch(function (error) {
                self.setState({
                    error,
                    verifyingCode: false,
                });
            });

        function isPhone (value) {
            return !!value.match(/^\+?[0-9]{1,15}$/);
        }

        function isEmail (value) {
            return !!value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
        }

        function handleIssuanceResponse(data) {
            return self.props.componentStack.push(VerifyConfirmationCode, { type, value, data })
                .then(self.props.resolve)
                .catch(function (error) {
                    self.setState({
                        error,
                        verifyingCode: false,
                    });
                });
        }
    }
}

A0RequestVerification.title = 'Send verification code';