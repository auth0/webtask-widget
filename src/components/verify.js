import Decode from 'jwt-decode';
import { WEBTASK_CLUSTER_URL, WEBTASK_VERIFICATION_PATH, WEBTASK_SMS_EMAIL_TOKEN } from 'lib/constants';
import issueRequest from 'lib/issueRequest';
import React from 'react';
import Superagent from 'superagent';


export default class VerifyConfirmationCode extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            error: null,
            verificationCode: '',
            verifyingCode: false,
        };
    }
    
    render() {
        const loading = this.state.verifyingCode;
        
        const errorMessage = this.state.error
            ?   (
                    <div className="a0-error-message">
                        { this.state.error.message }
                    </div>
                )
            :   null;
        
        return (
            <div className="a0-verify-widget">
                { errorMessage }
                <form className="form"
                    onSubmit={ e => { e.preventDefault(); if (!loading) this.onSubmit(); } }
                >
                    <div className="a0-form-group">
                        <label htmlFor="a0-verify-verificationCode">Enter the verification code you received</label>
                        <input className="a0-form-control"
                            disabled={ loading }
                            id="a0-verify-verificationCode"
                            onChange={ e => this.setState({ verificationCode: e.target.value }) }
                            placeholder="123456"
                            ref="verificationCode"
                            type="text"
                            value={ this.state.verificationCode }
                        />
                        <p className="a0-help-block">
                            { `You should soon receive the verification code we sent to ${this.props.value}.` }
                        </p>
                    </div>

                    <div className="a0-button-list">
                        <button className="a0-inline-button -link"
                            type="button"
                            onClick={ e => this.onClickCancel() }>
                            Cancel
                        </button>

                        <button className="a0-inline-button -primary"
                            type="submit"
                            disabled={ loading }
                        >
                            { this.state.verifyingCode
                            ?   'Verifying code...'
                            :   'Verify'
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
    
    onError(error) {
        this.props.onError(error);
    }
    
    onSubmit() {
        const verificationCode = this.refs.verificationCode.value.trim();
        
        if (!verificationCode) {
            return this.setState({
                error: new Error('Please enter a verification code.'),
            });
        }
        
        const query = {
            verification_code: verificationCode,
            [this.props.type]: this.props.value,
        };

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
                if (!data.id_token) throw new Error(`Server response missing 'id_token' claim.`);
    
                const claims = Decode(data.id_token);
    
                if (!claims || !claims.webtask || !claims.webtask.token) {
                    throw new Error('Unexpected data received from server.');
                }
    
                this.props.onLogin({
                    url: claims.webtask.url,
                    container: claims.webtask.tenant,
                    containers: [claims.webtask.tenant, claims.webtask.subtenant],
                    token: claims.webtask.token,
                });
            })
            .catch((error) => {
                if (error.response) {
                    switch (error.response.statusCode) {
                        case 400: error = new Error('Authentication failed. Please try again.');
                    }
                }
                
                this.onError(error);
            })
            .finally(() => this.setState({ verifyingCode: false }));
    }
}

VerifyConfirmationCode.title = 'Verify your identity';

VerifyConfirmationCode.propTypes = {
    onCancel: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func.isRequired,
    onLogin: React.PropTypes.func.isRequired,
    type: React.PropTypes.oneOf(['email', 'phone']).isRequired,
    value: React.PropTypes.string.isRequired,
};