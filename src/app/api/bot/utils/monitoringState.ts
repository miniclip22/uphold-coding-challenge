class MonitoringState {
    private _monitoringStarted = false;

    get monitoringStarted() {
        return this._monitoringStarted;
    }

    set monitoringStarted(value: boolean) {
        this._monitoringStarted = value;
    }
}

export const monitoringState: MonitoringState = new MonitoringState();
