import { LightningElement, api, track } from 'lwc';
import {
    store,
    fitlerByErrors,
    fitlerByWarnings,
    selectModule,
    selectUser,
    clearAll
} from 'c/welLogRedux';

export default class WelLogEventView extends LightningElement {
    @api isSubscribing = false;
    @api isFullscreen = false;
    @track isScrollLocked = false;
    @track showOutput = true;
    @track showChart = false;
    @track modules;
    @track userIds;
    @track filterErrorsOnly;
    @track filterWarningsOnly;
    @track warnings;
    @track errors;
    unsubscribe;

    get levelFilterClass() {
        if (this.filterErrorsOnly && this.filterWarningsOnly) {
            return 'ERROR WARN';
        } else if (this.filterErrorsOnly) {
            return 'ERROR';
        } else if (this.filterWarningsOnly) {
            return 'WARN';
        }
        return 'ALL';
    }

    toggleMenu(event) {
        this.showOutput = event.target.label === 'OUTPUT';
        this.showChart = event.target.label === 'CHART';
    }

    toggleScrollLock() {
        this.isScrollLocked = !this.isScrollLocked;
    }

    toggleSubscribe(event) {
        this.dispatchEvent(new CustomEvent('togglesubscribe', {
            detail: { event },
            bubbles: true,
            composed: true,
        }));
    }

    toggleFullscreen(event) {
        this.dispatchEvent(new CustomEvent('togglefullscreen', {
            detail: { event },
        }));
    }

    handleClearOutput() {
        store.dispatch(clearAll());
    }

    toggleErrors() {
        store.dispatch(fitlerByErrors());
    }

    toggleWarnings() {
        store.dispatch(fitlerByWarnings());
    }

    selectModule(event) {
        store.dispatch(selectModule(event.detail));
    }

    selectUser(event) {
        store.dispatch(selectUser(event.detail));
    }

    connectedCallback() {
        this.unsubscribe = store.subscribe(() => {
            let { logEvents } = store.getState();
            let { warnings, errors, filters, modules, userIds } = logEvents;
            this.warnings = warnings;
            this.errors = errors;
            this.filterErrorsOnly = filters.errorsOnly;
            this.filterWarningsOnly = filters.warningsOnly;
            this.modules = modules;
            this.userIds = userIds;
        });
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}
