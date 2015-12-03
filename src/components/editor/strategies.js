import dedent from 'lib/dedent';


import { HistoryPane, LogsPane, SchedulePane, SecretsPane, SettingsPane } from './panes';


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
    onSave: saveWebtask,
    panes: [SecretsPane, SettingsPane, LogsPane],
    readOnlyUrl: false,
};

export const EditWebtaskStrategy = {
    defaultCode,
    defaultMergeBody: false,
    defaultPane: SecretsPane,
    defaultParseBody: true,
    onSave: saveWebtask,
    panes: [SecretsPane, SettingsPane, LogsPane],
    readOnlyUrl: false,
};

export const CreateCronJobStrategy = {
    defaultCode,
    defaultMergeBody: false,
    defaultPane: SchedulePane,
    defaultParseBody: true,
    onSave: saveCronJob,
    panes: [SecretsPane, SchedulePane, LogsPane],
    readOnlyUrl: false,
};

export const EditCronJobStrategy = {
    defaultCode,
    defaultMergeBody: false,
    defaultPane: HistoryPane,
    defaultParseBody: true,
    onSave: saveCronJob,
    panes: [SecretsPane, SchedulePane, HistoryPane, LogsPane],
    readOnlyUrl: true,
};


function saveCronJob() {
    return saveWebtask.call(this, CreateCronJobStrategy)
        .then(webtask => webtask.createCronJob({ schedule: this.state.schedule }))
        .tap(subject => {
            this.setState({ subject });
            this.setStrategy(EditCronJobStrategy);
        });
}

function saveWebtask(nextStrategy = EditWebtaskStrategy) {
    return this.props.sandbox.create(this.state.code, {
        name: this.state.name.trim(),
        mergeBody: this.state.mergeBody,
        parseBody: this.state.parseBody,
        secrets: this.state.secrets,
    })
        .tap(subject => {
            this.setState({ subject });
            this.setStrategy(nextStrategy);
        });
}