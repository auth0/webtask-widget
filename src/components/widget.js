import AceEditor from 'react-ace';
import Brace from 'brace';
import LocalForage from 'localforage';
import React from 'react';

import {Alert, Button} from 'react-bootstrap';

import Login from 'components/login';

require('brace/mode/javascript');
require('brace/theme/textmate');

export default class Widget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            loading: true,
            profile: null,
        };
    }

    componentDidMount() {
        this.reloadProfile();
    }

    reloadProfile() {
        const self = this;
        const profileKey = this.props.namespace
            ? `${this.props.namespace}.webtask.profile`
            : 'webtask.profile';

        LocalForage.getItem(profileKey)
            .then(onProfileLoad, onProfileError);

        function onProfileLoad (profile) {
            self.setState({
                error: null,
                loading: false,
                profile: profile,
            });
        }

        function onProfileError (err) {
            self.setState({
                error: `Error reading your profile: ${err.message}.`,
                loading: false,
                profile: null,
            });
        }
    }

    render() {
        let editor = (
            <AceEditor
                mode="javascript"
                theme="textmate"
                editorProps={{$blockScrolling: true}}
            />
        );
        let error = (
            <Alert
                bsStyle="danger">
                <h4>Error loading your webtask profile</h4>
                <p>{this.state.error}</p>
                <p>
                    <Button onClick={this.reloadProfile}>Try again</Button>
                </p>
            </Alert>
        );
        let loading = (
            <Alert
                bsStyle="info">
                Loading...
            </Alert>
        );
        let login = (
            <Login
            />
        );

        return this.state.error
            ? error
            : this.state.loading
                ? loading
                : this.state.profile
                    ? editor
                    : login;
    }
}