import React from 'react';

import {OverlayTrigger} from 'react-bootstrap';



import Alert from '../components/alert';
import Button from '../components/button';
import Input from '../components/input';
import SecretsEditor from '../components/secretsEditor';
import Tooltip from '../components/tooltip';


export default class A0AdvanedEditorOptions extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            secrets: props.secrets,
        };
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;

        const parseBodyHelp = <Tooltip>
            This will attempt to parse the body of incoming requests and expose
            the parsed body at&nbsp;<code>context.body</code>. Do not enable this if
            you are using any server frameworks with&nbsp;
            <a href="https://github.com/auth0/webtask-tools" target="_blank">webtask-tools</a>.
        </Tooltip>;

        const mergeBodyHelp = <Tooltip>
            This will merge any parameters from the parsed body into
            &nbsp;<code>context.data</code>.
        </Tooltip>;
        
        const loading = false;

        return (
            <div className="a0-advanced">
                <label className="control-label">Advanced options:</label>
                <div className="form-group">
                    <OverlayTrigger placement="top" overlay={parseBodyHelp}>
                        <div className="checkbox">
                            <label>
                                <input
                                    ref="parseBody"
                                    type="checkbox"
                                    onChange={ (e) => self.setState({parseBody: e.target.checked}) }
                                    disabled={ loading }
                                    checked={ state.parseBody }
                                />
                                Automatically parse the request body into  <code>context.body</code>
                            </label>
                        </div>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={ mergeBodyHelp} >
                        <div className="checkbox">
                            <label>
                                <input
                                    ref="mergeBody"
                                    type="checkbox"
                                    onChange={ (e) => self.setState({mergeBody: e.target.checked}) }
                                    disabled={ loading }
                                    checked={ state.mergeBody }
                                />
                                Merge the parsed body into <code>context.data</code>
                            </label>
                        </div>
                    </OverlayTrigger>
                </div>

                <Input
                    label="Webtask name (optional)"
                    type="text"
                    bsSize="small"
                    placeholder="Name"
                    name="key"
                    ref="name"
                    value={ state.name }
                    onChange={ () => self.setState({
                        name: self.refs.name.getValue(),
                    }) }
                />

                <div className="form-group">
                    <SecretsEditor
                        ref="secrets"
                        secrets={ state.secrets }
                        onChange={ () => self.setState({
                            secrets: self.refs.secrets.getValue()
                        }) }
                    />
                </div>
            </div>
        );
    }
}

A0AdvanedEditorOptions.propTypes = {
    secrets: React.PropTypes.object.isRequired,
};