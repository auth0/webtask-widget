import Decode from 'jwt-decode';
import { WEBTASK_CLUSTER_URL } from 'lib/constants';
import React from 'react';
import Sandbox from 'sandboxjs';


export default class Token extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            error: null,
            token: '',
            validatingToken: false,
        };
    }
    
    render() {
        const loading = this.state.validatingToken;

        const errorMessage = this.state.error
            ?   (
                    <div className="a0-error-message">
                        { this.state.error.message }
                    </div>
                )
            :   null;
            
        return (
            <div className="a0-token-widget">
                { errorMessage }
                <form className="form"
                    onSubmit={ e => { e.preventDefault(); if (!loading) this.onSubmit(); } }
                >
                    <div className="a0-form-group">
                        <label htmlFor="a0-verify-token">Phone number or email address</label>
                        <textarea className="a0-form-control"
                            disabled={ loading }
                            id="a0-verify-token"
                            placeholder="ey..."
                            onChange={ e => this.setState({ token: e.target.value }) }
                            ref="token"
                            value={ this.state.token }
                        />
                        <p className="a0-help-block">
                            A webtask token is a JSON Web Token (JWT) and should start with the characters ey.
                        </p>
                    </div>

                    <div className="a0-button-list">
                        <button className="a0-inline-button -link"
                            type="button"
                            onClick={ e => this.onClickCancel() }
                        >
                            Cancel
                        </button>

                        <button className="a0-inline-button -primary"
                            type="submit"
                            disabled={ loading }
                        >
                            { this.state.validatingToken
                            ?   'Validating token...'
                            :   'Validate token'
                            }
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    onClickCancel() {
        this.props.onCancel();
    }
    
    onLogin(sandbox) {
        this.props.onLogin(sandbox);
    }

    onSubmit() {
        const self = this;
        const token = this.refs.token.value.trim();
        
        if (!token) {
            return this.setState({
                error: new Error('You must enter a token.'),
            });
        }
        
        try {
            Decode(token);
        } catch (e) {
            return this.setState({
                error: new Error('The provided token is not a valid JSON Web Token.'),
            });
        }

        try {
            const sandbox = Sandbox.fromToken(token, {url: WEBTASK_CLUSTER_URL});

            validateProfile.call(this, sandbox)
                .then(
                    sandbox => this.onLogin(sandbox),
                    error => this.setState({ error })
                );
        } catch (e) {
            console.error(e);
            this.setState({
                error: e,
                validatingToken: false,
            });
        }

        function validateProfile (sandbox) {
            self.setState({ validatingToken: true });

            return sandbox.listCronJobs()
                .then(() => sandbox) // Return the sandbox that is now validated
                .catch((e) => { throw new Error(`Token validation failed: ${e.message}`) })
                .finally(() => this.setState({ validatingToken: false }));
        }
    }
}

Token.title = 'Enter your webtask.io token';

Token.proptTypes = {
    onCancel: React.PropTypes.func.isRequired,
    onLogin: React.PropTypes.func.isRequired,
};