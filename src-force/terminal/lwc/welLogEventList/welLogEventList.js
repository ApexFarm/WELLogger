import { LightningElement, api } from 'lwc';

export default class WelLogEventList extends LightningElement {
    @api
    logEvents = [];
}
