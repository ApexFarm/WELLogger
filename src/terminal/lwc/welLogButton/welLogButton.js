import { LightningElement, api } from 'lwc';

export default class WelLogButton extends LightningElement {
    @api isActive = false;
    @api trueIcon;
    @api falseIcon;
    @api trueTitle;
    @api falseTitle;
    @api label;

    @api
    set icon(value) {
        this.trueIcon = value;
        this.falseIcon = value;
    }

    get icon() {
        return this.isActive ?  this.trueIcon : this.falseIcon;
    }

    @api
    set title(value) {
        this.trueTitle = value;
        this.falseTitle = value;
    }

    get title() {
        return this.isActive ? this.trueTitle : this.falseTitle;
    }

    get hasIcon() {
        return this.trueIcon || this.falseIcon;
    }

    get className() {
        return this.isActive ? 'button active' : 'button';
    }

    get labelString() {
        if (typeof this.label === 'number') {
            return String(this.label);
        }
        return this.label;
    }
}
