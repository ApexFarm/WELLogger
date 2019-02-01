import { LightningElement, api } from 'lwc';

export default class WelLogFooterToggle extends LightningElement {
    @api
    isActive = false;
    @api
    trueClass;
    @api
    falseClass;
    @api
    trueTitle;
    @api
    falseTitle;

    get className() {
        return this.isActive ?  this.trueClass : this.falseClass;
    }

    get titleName() {
        return this.isActive ? this.trueTitle : this.falseTitle;
    }
}
