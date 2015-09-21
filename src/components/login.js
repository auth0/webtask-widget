import Bluebird from 'bluebird';
import Decode from 'jwt-decode';
import React from 'react';
import Sandbox from 'sandboxjs';
import Superagent from 'superagent';

import {Alert, Button, Input, Modal, Panel} from 'react-bootstrap';

const WEBTASK_CLUSTER_URL = 'https://webtask.it.auth0.com';
const WEBTASK_VERIFICATION_PATH = '/api/run/auth0-webtask-cli';
const WEBTASK_SMS_EMAIL_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjIifQ.eyJqdGkiOiIyOTY5N2Y2MzM2ZTI0MWFjYTIxNjc1ZmE4ZWNmMjQ0MSIsImlhdCI6MTQzMzU0NzU2NCwiZHIiOjEsImNhIjpbXSwiZGQiOjAsInVybCI6Imh0dHBzOi8vY2RuLmF1dGgwLmNvbS93ZWJ0YXNrcy9zbXNfdmVyaWZpY2F0aW9uLmpzIiwidGVuIjoiYXV0aDAtd2VidGFzay1jbGkiLCJlY3R4IjoiK3BXR2MweFluUzV3V0laVlZOVjB5MmsyYitFY1MvbC9nTmwrc21ERkR6anFtdEp3RGl1a1JPMzcwVjZOUTJIZlc0am90YTQ0SXdDUE9iYUxneGhJc3pvWEVqdVAza1ZHWmUxZWF4T3BhdjFRelUzSTJRdlk2a1ZVVXM4YkhJMUtMcm52VjNEVjVRb1pJOEoxREErM2tuUDNXc3V4NnlydENPcXlrMUhpVGdFbS83Q1JSUFBmUzVuZTJEMTBKbnlaT2loMis1RTkzeVdidm5LM3F1aHF5VUl6QWlsQW1iSGNLRmpUMjB5OGF0MG03MXBzbm5teXN5K2I4MzJFN2F6aTBNbndTMUZ2UlRaWnNrUVdQdmlrWmpDRWE1bHhKUTBvanNHdklzMmVYRXhYNmxBUFBvTUVWd3k2T1pxYjA2Mzc2Njh4bHczQmRkUm9IUzF5UzZTVGNYcUY1YW42aDhkempxb29OWEF0aFFKeE5wQjN1c0VNcHdZOWxzSmxBNHpTLnhNaitWUGxkYUd5ZHhlcXRNYkJEK0E9PSJ9.cOcejs_Wj4XxpeR8WGxoSpQvec8NhfsScfirFPkATrg';

function invokeModal (container, Component, options = {}) {
    console.log('invokeModal', container, Component.name, Object.assign({container}, options));

    const wrapper = document.createElement('div');
    const promise = new Bluebird((resolve, reject) => {
        const props = Object.assign({resolve, reject, container}, options);

        React.render((
            <Component container={this} {...props}></Component>
        ), wrapper);
    });

    wrapper.className = 'a0-layer';

    container.appendChild(wrapper);

    return promise
        .finally(() => {
            React.unmountComponentAtNode(wrapper);
            setTimeout(() => wrapper.remove());
        });
}

export function login (container, options = {}) {
    return invokeModal(container, RequestVerification, options);
}

class VerifyConfirmationCode extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            verifyingCode: false,
        };
    }

    verifyCode(e) {
        e.preventDefault();

        const self = this;
        const verificationCode = this.refs.verificationCode.getValue().trim();
        const query = {
            verification_code: verificationCode,
        };

        query[this.props.type] = this.props.value;

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
            .catch((err) => self.setState({
                error: err,
                verifyingCode: false,
            }));

        function handleIssuanceResponse (data) {
            if (!data.id_token) throw new Error(`Server response missing 'id_token' claim.`);

            const claims = Decode(data.id_token);

            if (!claims || !claims.webtask || !claims.webtask.token) {
                throw new Error('Unexpected data received from server.');
            }

            return self.props.resolve({
                url: claims.webtask.url,
                container: claims.webtask.tenant,
                containers: [claims.webtask.tenant, claims.webtask.subtenant],
                token: claims.webtask.token,
            });
        }
    }

    render() {
        const self = this;
        const loading = this.state.verifyingCode;

        return (
            <Panel header="Verify your identity">
                <form className="form" onSubmit={loading ? null : self.verifyCode.bind(self)}>
                    <Input
                        type="text"
                        value={this.state.verificationCode}
                        disabled={loading}
                        placeholder="123456"
                        label="Enter the verification code you received"
                        help={'You should soon receive the verification code we sent to ' + this.props.value + '.'}
                        ref="verificationCode"
                    />

                    <div className="btn-list text-right">
                        <Button
                            type="button"
                            onClick={self.props.reject.bind(null, new Error('User cancelled.'))}>
                            Cancel
                        </Button>

                        <Button
                            bsStyle="primary"
                            type="submit"
                            disabled={loading}
                            onClick={loading ? null : self.verifyCode.bind(self)}>
                            {self.state.verifyingCode ? 'Verifying code...' : 'Verify'}
                        </Button>
                    </div>
                </form>
            </Panel>
        );
    }
}

class RequestVerification extends React.Component {
    constructor(props) {
        super(props);

        console.log('RequestVerification', props);

        this.state = {
            error: false,
            verifyingCode: false,
            promptingForToken: false,
        };
    }

    issueVerificationCode(e) {
        const self = this;

        let phoneOrEmail = this.refs.phoneOrEmail.getValue().trim();
        let type;
        let value;

        e.preventDefault();

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
            .catch(function (err) {
                self.setState({
                    error: err,
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
            return self.props.resolve(invokeModal(self.props.container, VerifyConfirmationCode, { type, value, data }));
        }
    }

    promptForToken() {
        this.setState({ promptingForToken: true });
        invokeModal(this.props.container, PromptForToken)
            .then(this.props.resolve)
            .catch(() => this.setState({ promptingForToken: false }));
    }

    tryAgain(e) {
        this.setState({
            error: null,
        });

        this.issueVerificationCode(e);
    }

    render() {
        const self = this;
        const loading = this.state.verifyingCode
            || this.state.promptingForToken;

        return (
            <Panel header="Sign in to webtask.io">
                { self.state.error
                    ? (<Alert
                        bsStyle="danger">
                        <p>{self.state.error.message}</p>
                        <p>
                            <Button bsSize="small" onClick={self.tryAgain.bind(self)}>Try again</Button>
                        </p>
                    </Alert>)
                    : null
                }
                <form className="form" onSubmit={loading ? null : self.issueVerificationCode.bind(self)}>
                    <Input
                        type="text"
                        value={this.state.phoneOrEmail}
                        disabled={loading}
                        placeholder="+15555555555 or name@example.com"
                        label="Phone number of email address"
                        help="We will send a verification code to the phone number or email address indicated."
                        ref="phoneOrEmail"
                    />

                    <div className="btn-list text-right">

                        <Button
                            bsStyle="link"
                            type="button"
                            disabled={loading}
                            onClick={loading ? null : self.promptForToken.bind(self)}>
                            Enter token
                        </Button>

                        <Button
                            bsStyle="primary"
                            type="submit"
                            disabled={loading}
                            onClick={loading ? null : self.issueVerificationCode.bind(self)}>
                            {self.state.verifyingCode ? 'Sending code...' : 'Send code'}
                        </Button>
                    </div>
                </form>
            </Panel>
        );
    }
}

class PromptForToken extends React.Component {
    constructor(props) {
        super(props);

        console.log('PromptForToken', props);

        this.state = {
            error: null,
            validatingToken: false,
        };
    }

    validateToken(e) {
        e.preventDefault();

        const self = this;
        const token = this.refs.token.getValue().trim();

        try {
            const profile = Sandbox.fromToken(token, {url: WEBTASK_CLUSTER_URL});

            console.log('profile', profile);

            validateProfile(profile);
        } catch (e) {
            console.error(e);
            this.setState({
                error: e,
                validatingToken: false,
            });
        }

        function validateProfile (profile) {
            self.setState({ validatingToken: true });

            return profile.listCronJobs()
                .then(() => profile) // Return the profile that is now validated
                .then(self.props.resolve)
                .catch((e) => {
                    self.setState({
                        error: new Error(`Token validation failed: ${e.message}`),
                        validatingToken: false,
                    });
                });
        }
    }

    render() {
        const self = this;
        const loading = this.state.validatingToken;

        return (
            <Panel header="Enter your webtask.io token">
                {this.state.error
                    ? (<Alert
                        bsStyle="danger">
                        <p>{this.state.error.message}</p>
                    </Alert>)
                    : null
                }
                <form className="form" onSubmit={loading ? null : self.validateToken.bind(self)}>
                    <Input
                        type="textarea"
                        rows="4"
                        value={self.state.token}
                        disabled={loading}
                        placeholder="ey..."
                        label="Phone number of email address"
                        help="A webtask token is a JSON Web Token (JWT) and should start with the characters ey."
                        ref="token"
                    />

                    <div className="btn-list text-right">
                        <Button
                            type="button"
                            onClick={self.props.reject.bind(null, new Error('Clicked cancel.'))}>
                            Cancel
                        </Button>

                        <Button
                            bsStyle="primary"
                            type="submit"
                            disabled={loading}
                            onClick={loading ? null : self.validateToken.bind(self)}>
                            {self.state.validatingToken ? 'Validating token...' : 'Validate token'}
                        </Button>
                    </div>
                </form>
            </Panel>
        );
    }
}

function issueRequest (request) {
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

function createResponseError (res) {
    if (res.clientError) return new Error('Invalid request: '
        + res.body && res.body.message
            ? res.body.message
            : res.text);
    if (res.serverError) return new Error('Server error: '
        + res.body && res.body.message
            ? res.body.message
            : res.text);
}
