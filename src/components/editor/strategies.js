import dedent from 'lib/dedent';


import {
    CodePane,
    HistoryPane,
    LogsPane,
    MetadataPane,
    SchedulePane,
    SecretsPane,
    SettingsPane,
} from './panes';


const defaultCode = dedent`
    module.exports = function (ctx, cb) {
        cb(null, 'Hello world');
    };
`.trim();



export const CreateWebtaskStrategy = {
    defaultCode,
    defaultMergeBody: false,
    defaultPane: SecretsPane,
    defaultParseBody: true,
    getJobState: () => undefined,
    getUrlInfo: (sandbox) => {
        return {
            copyButton: false,
            prefix: sandbox.url + '/api/run/' + sandbox.container + '/',
            readonly: false,
        };
    },
    onSave: saveWebtask,
    panes: [CodePane, SecretsPane, MetadataPane, SettingsPane, LogsPane],
};

export const EditWebtaskStrategy = {
    defaultCode,
    defaultMergeBody: false,
    defaultPane: SecretsPane,
    defaultParseBody: true,
    getJobState: () => undefined,
    getUrlInfo: (sandbox) => {
        return {
            copyButton: true,
            prefix: sandbox.url + '/api/run/' + sandbox.container + '/',
            readonly: false,
        };
    },
    onSave: saveWebtask,
    panes: [CodePane, SecretsPane, MetadataPane, SettingsPane, LogsPane],
};

export const CreateCronJobStrategy = {
    defaultCode,
    defaultMergeBody: false,
    defaultPane: SchedulePane,
    defaultParseBody: true,
    getJobState: function() { return this.state.jobState; },
    getUrlInfo: (sandbox) => {
        return {
            copyButton: false,
            prefix: 'Job name: ',
            readonly: false,
        };
    },
    onChangeState: function (state) {
        console.log('CronCronJobStrategy.onChangeState', state);
        this.setState({ jobState: state });
    },
    onSave: saveCronJob,
    panes: [CodePane, SecretsPane, MetadataPane, SchedulePane, LogsPane],
};

export const EditCronJobStrategy = {
    defaultCode,
    defaultMergeBody: false,
    defaultPane: HistoryPane,
    defaultParseBody: true,
    getJobState: function () { return this.state.subject.state; },
    getUrlInfo: (sandbox) => {
        return {
            copyButton: false,
            prefix: 'Job name: ',
            readonly: true,
        };
    },
    onChangeState: function (state) {
        this.setState({ jobStateChangePending: true });

        this.state.subject.setJobState({ state })
            .tap(job => this.forceUpdate())
            .catch(error => this.setState({ error }))
            .finally(() => this.setState({ jobStateChangePending: false }));
    },
    onSave: saveCronJob,
    panes: [CodePane, SecretsPane, MetadataPane, SchedulePane, LogsPane, HistoryPane],
};


function saveCronJob() {
    const jobState = this.getJobState();

    return saveWebtask.call(this, EditCronJobStrategy)
        .then(webtask => webtask.createCronJob({ schedule: this.state.schedule, state: jobState }))
        .tap(subject => this.setState({ subject }));
}

function saveWebtask(nextStrategy = EditWebtaskStrategy) {
    return this.props.sandbox.create(this.state.code, {
        name: this.state.name.trim(),
        mergeBody: this.state.mergeBody,
        meta: this.state.meta,
        parseBody: this.state.parseBody,
        secrets: this.state.secrets,
    })
        .tap(subject => {
            this.setState({ subject });
            this.setStrategy(nextStrategy);
        });
}