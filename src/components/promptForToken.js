import React from 'react';
import Sandbox from 'sandboxjs';
import Superagent from 'superagent';

import { WEBTASK_CLUSTER_URL } from '../lib/constants';
import issueRequest from '../lib/issueRequest';

import Alert from '../components/alert';
import Button from '../components/button';
import Input from '../components/input';


export default class A0PromptForToken extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {};
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;
        
        const loading = state.validatingToken;
        const cancel = props.reject.bind(null, new Error('Clicked cancel.'));
        const validateToken = self.validateToken.bind(self);

        return (
            <div className="a0-promptfortoken">
                { state.error
                ?   (
                        <Alert bsStyle="danger">
                            <p>{ state.error.message }</p>
                        </Alert>
                    )
                :   null
                }
                <form className="form" onSubmit={ loading ? null : validateToken }>
                    <Input
                        type="textarea"
                        rows="4"
                        value={ state.token }
                        disabled={ loading }
                        placeholder="ey..."
                        label="Phone number of email address"
                        help="A webtask token is a JSON Web Token (JWT) and should start with the characters ey."
                        ref="token"
                    />

                    <div className="btn-list text-right">
                        <Button
                            type="button"
                            onClick={ cancel }>
                            Cancel
                        </Button>

                        <Button
                            bsStyle="primary"
                            type="submit"
                            disabled={ loading }
                            onClick={ loading ? null : validateToken }>
                            { self.state.validatingToken
                            ?   'Validating token...'
                            :   'Validate token'
                            }
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    validateToken(e) {
        e.preventDefault();

        const self = this;
        const token = this.refs.token.getValue().trim();

        try {
            const profile = Sandbox.fromToken(token, {url: WEBTASK_CLUSTER_URL});

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
}

A0PromptForToken.title = 'Enter your webtask.io token';