export default function normalizeCronResult (result) {
    const auth0HeaderRx = /^x-auth0/;

    for (let header in result.headers) {
        if (auth0HeaderRx.test(header)) {
            try {
                result.headers[header] = JSON.parse(result.headers[header]);
            } catch (__) {}
        }
    }
    ['scheduled_at', 'started_at', 'completed_at']
        .forEach(function (dateField) {
            if (result[dateField]) {
                try {
                    result[dateField] = new Date(result[dateField]);
                } catch (__) {}
            }
        });
    
    return result;
}