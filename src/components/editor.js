import AceEditor from 'react-ace';
import Bluebird from 'bluebird';
import Brace from 'brace';
import React from 'react';
import Sandbox from 'sandboxjs';

import {Alert, Button, Collapse, Input, Modal, Panel} from 'react-bootstrap';
import Inspector from 'react-json-inspector';

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
            code: props.code || defaultCode,
            secrets: {},
            creatingToken: false,
            editingSecrets: false,
            creatingWebtask: false,
            tryingWebtask: false,
            mergeBody: true,
            parseBody: true,
        };
    }

    componentDidMount() {
        this.refs.ace.editor.resize();
        window.addEventListener("resize", () => this.refs.ace.editor.resize());
    }

    componentWillUnmount() {
        window.removeEventListener("resize", () => this.refs.ace.editor.resize());
    }

    toggleSecrets () {
        this.setState({ editingSecrets: !this.state.editingSecrets });
    }

    tryWebtask () {
        this.setState({ creatingToken: true });

        const sandbox = Sandbox.init(this.props.profile);

        sandbox.create(this.state.code, {
            merge: this.state.mergeBody,
            parse: this.state.parseBody,
            secret: this.state.secrets,
        })
            .then((webtask) => this.setState({
                webtask,
                tryingWebtask: true,
            }))
            .finally(() => this.setState({ creatingToken: false }));
    }

    createWebtask () {

    }

    onChange(code) {
        this.setState({
            code: code,
        })
    }

    render() {
        const self = this;
        const loading = this.state.creatingToken
            || this.state.creatingWebtask
            || this.state.tryingWebtask;

        // Parked for future reference
        const webtaskName = (
            <Input
                type="text"
                value={this.state.webtaskName}
                disabled={loading}
                placeholder="Name"
                label="Webtask name"
                ref="webtaskName"
            />
        );

        return (
            <Panel className="a0-editor" header="Create a webtask">
                { self.state.error
                    ? (<Alert
                        bsStyle="danger">
                        <p>{self.state.error.message}</p>
                    </Alert>)
                    : null
                }
                <TryWebtask
                    show={self.state.tryingWebtask}
                    onHide={self.setState.bind(self, { tryingWebtask: false })}
                    code={self.state.code}
                    webtask={self.state.webtask}
                />
                <div className="form-group form-group-grow">
                    <label className="control-label">Edit webtask code:</label>
                    <AceEditor
                        ref="ace"
                        name="code"
                        className="form-control"
                        mode="javascript"
                        theme="textmate"
                        value={this.state.code}
                        height=""
                        width=""
                        readOnlyq={loading}
                        onChange={self.onChange.bind(self)}
                        editorProps={{$blockScrolling: true}}
                    />
                </div>
                <div className="form-group">
                    <label className="checkbox-inline">
                        <input
                            ref="parseBody"
                            type="checkbox"
                            onChange={(e) => self.setState({parseBody: e.target.checked})}
                            disabled={loading}
                            checked={this.state.parseBody}
                        />
                        parse body
                    </label>
                    <label className="checkbox-inline">
                        <input
                            ref="mergeBody"
                            type="checkbox"
                            onChange={(e) => self.setState({mergeBody: e.target.checked})}
                            disabled={loading}
                            checked={this.state.mergeBody}
                        />
                        merge body
                    </label>
                </div>

                { self.state.editingSecrets
                    ?   <div className="form-group">
                            <SecretEditor
                                ref="secrets"
                                secrets={self.state.secrets}
                                onChange={() => self.setState({
                                    secrets: self.refs.secrets.getValue()
                                })}
                            />
                        </div>
                    : null
                }

                <div className="btn-list text-right">
                    <Button
                        bsStyle="link"
                        type="button"
                        disabled={loading}
                        onClick={loading ? null : self.toggleSecrets.bind(self)}>
                        {self.state.editingSecrets ? 'Hide secrets' : 'Edit secrets'}
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        onClick={loading ? null : self.tryWebtask.bind(self)}>
                        {self.state.creatingToken ? 'Creating...' : 'Try'}
                    </Button>

                    <Button
                        bsStyle="primary"
                        type="submit"
                        disabled={loading || true}
                        onClick={loading ? null : self.createWebtask.bind(self)}>
                        {self.state.creatingWebtask ? 'Creating...' : 'Create'}
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
            json: JSON.stringify({
                headers: {
                    'Content-Type': 'application/json',
                },
                query: {
                    hello: 'world',
                },
                body: {
                    hint: 'Only sent for PUT, POST and PATCH requests',
                },
            }, null, 4),
            result: null,
        };
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
            .finally(() => this.setState({runningCode: false}));
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
        const methodInput = (
            <Input
                ref="httpMethod"
                type="select"
                label="Http method:"
                labelClassName="col-xs-2"
                wrapperClassName="col-xs-10"
                onChange={() => self.setState({ httpMethod: self.refs.httpMethod.getValue() })}
                value={self.state.httpMethod}>
                <option value="get">GET</option>
                <option value="put">PUT</option>
                <option value="post">POST</option>
                <option value="patch">PATCH</option>
                <option value="delete">DELETE</option>
            </Input>
        );

        return (
            <Modal bsSize="lg" show={self.props.show} onHide={self.onHide.bind(self)}>
                <Modal.Header closeButton>
                    <Modal.Title>Try webtask</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { self.state.error
                        ? (<Alert
                            bsStyle="danger">
                            <p>{self.state.error.message}</p>
                        </Alert>)
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
                            height="200px"
                            width=""
                            onChange={loading ? null : (json) => self.setState({ json })}
                            readOnly={loading}
                            editorProps={{$blockScrolling: true}}
                        />
                    </div>

                    { self.state.result
                        ?   <div>
                                <label className="control-label">Result:</label>
                                <Inspector data={self.state.result} search={false} />
                            </div>
                        : null
                    }

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
                </Modal.Body>
            </Modal>
        );
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
                <table className="table table-hover">
                    <tbody>
                        {self.state.secrets.map(({key, value}, i) => (
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

class CreateWebtask extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            creatingWebtask: false,
        };
    }


    render() {
        const self = this;
        const loading = this.state.creatingWebtask;

        // Parked for future reference
        const webtaskName = (
            <Input
                type="text"
                value={this.state.webtaskName}
                disabled={loading}
                placeholder="Name"
                label="Webtask name"
                ref="webtaskName"
            />
        );

        return (
            <Panel className="a0-editor" header="Create a webtask">
                { self.state.error
                    ? (<Alert
                        bsStyle="danger">
                        <p>{self.state.error.message}</p>
                    </Alert>)
                    : null
                }
                <TryWebtask
                    show={self.state.tryingWebtask}
                    onHide={self.setState.bind(self, { tryingWebtask: false })}
                    code={self.state.code}
                    webtask={self.state.webtask}
                />
                <div className="form-group form-group-grow">
                    <label className="control-label">Edit webtask code:</label>
                    <AceEditor
                        ref="ace"
                        name="code"
                        className="form-control"
                        mode="javascript"
                        theme="textmate"
                        value={this.state.code}
                        height=""
                        width=""
                        readOnlyq={loading}
                        onChange={self.onChange.bind(self)}
                        editorProps={{$blockScrolling: true}}
                    />
                </div>
                <div className="form-group">
                    <label className="checkbox-inline">
                        <input
                            ref="parseBody"
                            type="checkbox"
                            onChange={(e) => self.setState({parseBody: e.target.checked})}
                            disabled={loading}
                            checked={this.state.parseBody}
                        />
                        parse body
                    </label>
                    <label className="checkbox-inline">
                        <input
                            ref="mergeBody"
                            type="checkbox"
                            onChange={(e) => self.setState({mergeBody: e.target.checked})}
                            disabled={loading}
                            checked={this.state.mergeBody}
                        />
                        merge body
                    </label>
                </div>

                <div className="form-group">
                    <SecretEditor />
                </div>

                <div className="btn-list text-right">
                    <Button
                        bsStyle="link"
                        type="button"
                        disabled={loading || true}
                        onClick={loading ? null : self.editSecrets.bind(self)}>
                        {self.state.editingSecrets ? 'Editing secrets...' : 'Edit secrets'}
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        onClick={loading ? null : self.tryWebtask.bind(self)}>
                        {self.state.creatingToken ? 'Creating...' : 'Try'}
                    </Button>

                    <Button
                        bsStyle="primary"
                        type="submit"
                        disabled={loading || true}
                        onClick={loading ? null : self.createWebtask.bind(self)}>
                        {self.state.creatingWebtask ? 'Creating...' : 'Create'}
                    </Button>
                </div>
            </Panel>
        );
    }
}


export function editor (container, options = {}) {
    console.log('editor', container, Object.assign({container}, options));

    const promise = new Bluebird((resolve, reject) => {
        const props = Object.assign({resolve, reject, container}, options);

        React.render((
            <Editor container={this} {...props}></Editor>
        ), container);
    });

    // container.classList.add('a0-editor');

    return promise
        .finally(() => {
            React.unmountComponentAtNode(container);
            setTimeout(() => container.remove());
        });
}
