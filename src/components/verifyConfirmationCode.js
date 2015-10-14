import Decode from 'jwt-decode';
import React from 'react';
import Superagent from 'superagent';

import { WEBTASK_CLUSTER_URL, WEBTASK_VERIFICATION_PATH, WEBTASK_SMS_EMAIL_TOKEN } from '../lib/constants';
import issueRequest from '../lib/issueRequest';

import Alert from '../components/alert';
import Button from '../components/button';
import Input from '../components/input';


export default class A0VerifyConfirmationCode extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {};
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;
        
        const loading = state.verifyingCode;
        const verifyCode = self.verifyCode.bind(self);
        const cancel = self.props.reject.bind(null, new Error('Verification cancelled.'));
        
        return (
            <div className="a0-verifyconfirmationcode">
                <form className="form" onSubmit={ loading ? null : verifyCode }>
                    <Input
                        type="text"
                        value={ state.verificationCode }
                        disabled={ loading }
                        placeholder="123456"
                        label="Enter the verification code you received"
                        help={ `You should soon receive the verification code we sent to ${props.value}.` }
                        ref="verificationCode"
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
                            onClick={ loading ? null : verifyCode }>
                            { state.verifyingCode
                            ?   'Verifying code...'
                            :   'Verify'
                            }
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    
    verifyCode(e) {
        e.preventDefault();

        const self = this;
        const verificationCode = this.refs.verificationCode.getValue().trim();
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
}

A0VerifyConfirmationCode.title = 'Verify your identity';