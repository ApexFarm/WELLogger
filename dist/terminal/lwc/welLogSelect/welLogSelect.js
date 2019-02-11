import { LightningElement, api } from 'lwc';

export default class WelLogSelect extends LightningElement {
    @api options = [];

    change(event) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: event.target.value,
        }));
    }
}