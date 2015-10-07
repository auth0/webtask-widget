import AceEditor from 'react-ace';
import Bluebird from 'bluebird';
import Brace from 'brace';
import Debounce from 'lodash.debounce';
import React from 'react';
import Sandbox from 'sandboxjs';
// import ZeroClipboard from 'zeroclipboard';

import {Alert, Button, Collapse, Input, Modal, Panel} from 'react-bootstrap';
import Inspector from 'react-json-inspector';
import ReactZeroClipboard from 'react-zeroclipboard';

require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/textmate');

const defaultCode = `
module.exports = function (ctx, cb) {
    cb(null, 'Hello ' + ctx.query.hello);
};
`.trim();


class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            code: props.code,
            secrets: {},
            creatingToken: false,
            showAdvanced: false,
            savingWebtask: false,
            tryingWebtask: false,
            mergeBody: true,
            parseBody: true,
            name: props.name,
            successMessage: '',
        };

        const debounceInterval = Math.max(1000, Number(props.autoSaveInterval));

        this.autoSave = Debounce(() => this.saveWebtask(), debounceInterval);
    }

    componentDidMount() {
        this.refs.ace.editor.resize();
        window.addEventListener("resize", () => this.refs.ace.editor.resize());

        if (this.props.autoSaveOnLoad) {
            this.saveWebtask({ hideSuccessMessage: true });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", () => this.refs.ace.editor.resize());
    }

    toggleSecrets () {
        this.setState({ showAdvanced: !this.state.showAdvanced });
    }

    tryWebtask () {
        this.setState({
            creatingToken: true,
            successMessage: '',
        });

        const sandbox = Sandbox.init(this.props.profile);

        sandbox.create(this.state.code, {
            merge: this.state.mergeBody,
            parse: this.state.parseBody,
            secret: this.state.secrets,
            name: this.state.name
                ? this.state.name + '__try'
                : null,
        })
            .then((testWebtask) => this.setState({
                testWebtask,
                tryingWebtask: true,
            }))
            .finally(() => this.setState({ creatingToken: false }));
    }

    saveWebtask ({hideSuccessMessage = false} = {}) {
        // Cancel any pending autoSaves
        this.autoSave.cancel();

        this.setState({
            savingWebtask: true,
            successMessage: '',
        });

        const sandbox = Sandbox.init(this.props.profile);

        sandbox.create(this.state.code, {
            merge: this.state.mergeBody,
            parse: this.state.parseBody,
            secret: this.state.secrets,
            name: this.state.name,
        })
            .tap(this.props.onSave)
            .tap(() => !hideSuccessMessage && this.setState({
                successMessage: 'Webtask successfully created',
            }))
            .tap((webtask) => this.setState({
                webtask,
            }))
            .finally(() => this.setState({ savingWebtask: false }));
    }

    onChange(code) {
        this.setState({
            code: code,
        });
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevState.code !== this.state.code && this.props.autoSaveOnChange) {
            this.autoSave();
        }
    }

    render() {
        const self = this;
        const loading = this.state.creatingToken
            || this.state.savingWebtask
            || this.state.tryingWebtask;

        const copyButton = this.state.webtask
            ?   (<ReactZeroClipboard text={this.state.webtask.url}>
                    <Button>Copy</Button>
                </ReactZeroClipboard>)
            : null;

        return (
            <Panel className="a0-editor" header="Create a webtask">
                { self.state.error
                    ? (<Alert
                        bsStyle="danger">
                        {self.state.error.message}
                    </Alert>)
                    : null
                }

                { self.state.tryingWebtask
                    ? (<TryWebtask
                        show={self.state.tryingWebtask}
                        onHide={self.setState.bind(self, { tryingWebtask: false })}
                        code={self.state.code}
                        webtask={self.state.testWebtask}
                        showTryWebtaskUrl={self.props.showTryWebtaskUrl}
                        tryParams={self.props.tryParams}
                    />)
                    : null
                }

                <div className="form-group form-group-grow">
                    <label className="control-label">Edit webtask code:</label>
                    <AceEditor
                        ref="ace"
                        name="code"
                        className="form-control"
                        mode="javascript"
                        theme="textmate"
                        value={this.state.code}
                        maxLines={15}
                        height=""
                        width=""
                        onChange={self.onChange.bind(self)}
                        editorProps={{$blockScrolling: true}}
                    />
                </div>

                { self.state.showAdvanced
                    ?   <div className="a0-advanced">
                            <label className="control-label">Advaned options:</label>
                            <div className="form-group">
                                <label className="checkbox-inline">
                                    <input
                                        ref="parseBody"
                                        type="checkbox"
                                        onChange={(e) => self.setState({parseBody: e.target.checked})}
                                        disabled={loading}
                                        checked={self.state.parseBody}
                                    />
                                    parse body
                                </label>
                                <label className="checkbox-inline">
                                    <input
                                        ref="mergeBody"
                                        type="checkbox"
                                        onChange={(e) => self.setState({mergeBody: e.target.checked})}
                                        disabled={loading}
                                        checked={self.state.mergeBody}
                                    />
                                    merge body
                                </label>
                            </div>

                            <Input
                                label="Webtask name (optional)"
                                type="text"
                                bsSize="small"
                                placeholder="Name"
                                name="key"
                                ref="name"
                                value={self.state.name}
                                onChange={() => self.setState({
                                    name: self.refs.name.getValue(),
                                })}
                            />

                            <div className="form-group">
                                <SecretEditor
                                    ref="secrets"
                                    secrets={self.state.secrets}
                                    onChange={() => self.setState({
                                        secrets: self.refs.secrets.getValue()
                                    })}
                                />
                            </div>
                        </div>
                    : null
                }

                { self.state.webtask
                    ? (<div>
                        { self.state.successMessage
                            ? (<Alert
                                bsStyle="success"
                                onDismiss={() => self.setState({successMessage: ''})}
                                dismissAfter={2000}>
                                {self.state.successMessage}
                            </Alert>)
                            : null
                        }

                        { self.props.showWebtaskUrl
                            ?   (<Input
                                    type="text"
                                    disabled
                                    label="Webtask url:"
                                    buttonAfter={copyButton}
                                    value={self.state.webtask.url}
                                />)
                            : null
                        }

                        </div>)
                    : null
                }

                <div className="btn-list text-right">
                    <Button
                        bsStyle="link"
                        className="pull-left"
                        type="button"
                        disabled={loading}
                        onClick={loading ? null : self.toggleSecrets.bind(self)}>
                        {self.state.showAdvanced ? 'Hide advanced' : 'Show advanced'}
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        onClick={loading ? null : self.tryWebtask.bind(self)}>
                        {self.state.creatingToken ? 'Sending...' : 'Try'}
                    </Button>

                    <Button
                        bsStyle="primary"
                        type="submit"
                        disabled={loading}
                        onClick={loading ? null : self.saveWebtask.bind(self)}>
                        {self.state.savingWebtask ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </Panel>
        );
    }
}


class TryWebtask extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            runningCode: false,
            httpMethod: 'post',
            parseBody: true,
            mergeBody: true,
            logs: [],
            json: JSON.stringify(props.tryParams, null, 4),
            result: null,
        };
    }

    componentDidMount() {
        this.logStream = this.props.webtask.createLogStream();

        this.logStream.on('error', (e) => {
            console.error(e);

            this.setState({
                error: new Error('Logs error: ' + e.message),
            });
        });
        this.logStream.on('data', (msg) => {
            const logs = this.state.logs.slice();

            if (msg.name === 'sandbox-logs') {
                logs.push(msg);
                logs.sort((a, b) => new Date(b) - new Date(a));

                this.setState({ logs });
            }
        });
    }

    componentWillUnmount() {
        this.logStream.destroy();
    }

    run (method) {
        const json = this.refs.data.editor.getValue();
        const webtask = this.props.webtask;
        let data;

        try {
            data = JSON.parse(json);
        } catch (__) {
            return this.setState({
                error: new Error('The data you enter must be valid json.'),
            });
        }

        this.setState({
            error: null,
            result: null,
            runningCode: true,
        });

        webtask.run({
            method: method,
            path: data.path,
            parse: !!this.state.parseBody,
            merge: !!this.state.mergeBody,
            headers: data.headers,
            query: data.query,
            body: data.body,
        })
            .then((res) => {
                if (res.error) throw new Error(res.error);

                const headers = res.header;
                const auth0HeaderRx = /^x-auth0/;

                for (let header in headers) {
                    if (auth0HeaderRx.test(header)) {
                        headers[header] = JSON.parse(headers[header]);
                    }
                }

                this.setState({
                    result: {
                        headers: headers,
                        statusCode: res.status,
                        body: res.body || res.text,
                    }
                });
            })
            .catch((err) => this.setState({error: err}))
            .finally(() => {
                this.setState({
                    runningCode: false,
                });
            });
    }

    onHide() {
        this.setState({
            error: null,
            result: null,
        });

        this.props.onHide();
    }

    render () {
        const self = this;
        const loading = this.state.runningCode;

        const copyButton = this.props.webtask
            ?   (<ReactZeroClipboard text={this.props.webtask.url}>
                    <Button>Copy</Button>
                </ReactZeroClipboard>)
            : null;

        /*// Parked for now
        const logsTable =
                                    <table className="a0-logs table table-striped table-hover">
                                        { self.state.logs.map((message) => (
                                            <tbody>
                                                <tr className="a0-logs-line" key={message.time + message.msg}>
                                                    <td>{message.time}</td>
                                                    <td>{message.msg}</td>
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>;*/


        return self.props.webtask
            ?   (
                <Modal bsSize="lg" show={self.props.show} onHide={self.onHide.bind(self)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Try webtask</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { self.state.error
                            ? (<Alert
                                bsStyle="danger">
                                {self.state.error.message}
                            </Alert>)
                            : null
                        }

                        { self.props.showTryWebtaskUrl
                            ?   (<Input
                                    type="text"
                                    disabled
                                    label="Webtask url:"
                                    buttonAfter={copyButton}
                                    value={self.props.webtask.url}
                                    help="This is the url of the temporary webtask created to this playground."
                                />)
                            : null
                        }

                        <div className="form-group form-group-grow">
                            <label className="control-label">Edit webtask payload:</label>
                            <AceEditor
                                ref="data"
                                name="data"
                                className="form-control"
                                mode="json"
                                theme="textmate"
                                value={self.state.json}
                                height=""
                                width=""
                                maxLines={12}
                                onChange={loading ? null : (json) => self.setState({ json })}
                                readOnly={loading}
                                editorProps={{$blockScrolling: true}}
                            />
                        </div>

                        { self.state.result
                            ?   <div>
                                    <label className="control-label">Result:</label>
                                    <Inspector data={self.state.result} search={null} />
                                </div>
                            : null
                        }

                        { self.state.logs && self.state.logs.length
                            ?   <div>
                                    <label className="control-label">Logs:</label>
                                    <pre className="a0-logs">
                                        { self.state.logs.map((line) => `${line.msg}\n` ) }
                                    </pre>
                                </div>
                            : null
                        }
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="btn-list text-right">
                            <Button
                                type="submit"
                                bsStyle="primary"
                                disabled={loading}
                                onClick={loading ? null : self.run.bind(self, 'get')}>
                                GET
                            </Button>
                            <Button
                                type="submit"
                                bsStyle="primary"
                                disabled={loading}
                                onClick={loading ? null : self.run.bind(self, 'put')}>
                                PUT
                            </Button>
                            <Button
                                type="submit"
                                bsStyle="primary"
                                disabled={loading}
                                onClick={loading ? null : self.run.bind(self, 'post')}>
                                POST
                            </Button>
                            <Button
                                type="submit"
                                bsStyle="primary"
                                disabled={loading}
                                onClick={loading ? null : self.run.bind(self, 'patch')}>
                                PATCH
                            </Button>
                            <Button
                                type="submit"
                                bsStyle="primary"
                                disabled={loading}
                                onClick={loading ? null : self.run.bind(self, 'delete')}>
                                DELETE
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>)
            : null;
    }
}

class SecretEditor extends React.Component {
    constructor(props) {
        super(props);

        const secrets = Object.keys(props.secrets)
            .reduce((secrets, key) => secrets.concat([{
                key: key,
                value: props.secrets[key]
            }]), []);

        // Add an empty one for good measure
        if (!secrets.length) secrets.push({
            key: '',
            value: '',
        });

        this.state = {
            error: null,
            secrets,
        };

        this.keyRefs = [];
        this.valueRefs = [];
    }

    static get defaultProps () {
        return {
            secrets: {},
            onChange: null,
        };
    }

    static get propTypes () {
        return {
            secrets: React.PropTypes.object,
            onChange: React.PropTypes.func,
        };
    }

    getValue() {
        return this.state.secrets.reduce((secrets, {key, value}) => {
            if (key) secrets[key] = value;

            return secrets;
        }, {});
    }

    addSecret() {
        const secrets = this.state.secrets.slice();

        secrets.push({
            key: '',
            value: '',
        });

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange();
    }

    removeSecret(i) {
        const secrets = this.state.secrets.slice();

        secrets.splice(i, 1);

        // Keep at least one secret row visible
        if (!secrets.length) {
            secrets.push({
                key: '',
                value: '',
            });
        }

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange();
    }

    updateSecret(i, field, value) {
        const secrets = this.state.secrets.slice();

        secrets[i][field] = value;

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange();
    }

    render() {
        const self = this;

        return (
            <div className="secret-editor">
                <label className="label">Edit secrets:</label>
                <table className="secret-editor-table">
                    <tbody>
                        { self.state.secrets.map(({key, value}, i) => (
                            <tr className="secret-editor-row" key={i}>
                                <td>
                                    <Input
                                        type="text"
                                        bsSize="small"
                                        placeholder="Key"
                                        name="key"
                                        ref={(c) => self.keyRefs[i] = c}
                                        value={key}
                                        onChange={() => self.updateSecret(i, 'key', self.keyRefs[i].getValue())}
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="text"
                                        bsSize="small"
                                        placeholder="Value"
                                        name="value"
                                        ref={(c) => self.valueRefs[i] = c}
                                        value={value}
                                        onChange={() => self.updateSecret(i, 'value', self.valueRefs[i].getValue())}
                                    />
                                </td>
                                <td>
                                    <Button
                                        bsStyle="danger"
                                        bsSize="sm"
                                        disabled={self.state.secrets.length === 1 && !self.state.secrets[0].key && !self.state.secrets[0].value}
                                        onClick={() => self.removeSecret(i)}
                                    >
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="3">
                                <Button
                                    bsStyle="link"
                                    bsSize="sm"
                                    disabled={self.state.secrets.length === 1 && !self.state.secrets[0].key && !self.state.secrets[0].value}
                                    onClick={self.addSecret.bind(self)}
                                >
                                    Add...
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}


export function editor (container, options = {}) {
    const promise = new Bluebird((resolve, reject) => {
        const props = Object.assign({resolve, reject, container}, options);

        React.render((
            <Editor container={this} {...props}></Editor>
        ), container);
    });

    return promise
        .finally(() => {
            React.unmountComponentAtNode(container);
            setTimeout(() => container.remove());
        });
}
