/** @preserve jquery.numeric
 * git://github.com/danielgindi/jquery.numeric.git
 */
import $ from 'jquery';

const DECIMAL_SEPARATOR = (1.1).toLocaleString().match(/\d(.*?)\d/)[1];

const DECIMAL_SEPARATOR_REGEX = new RegExp('\\' + regexEscape(DECIMAL_SEPARATOR), 'g');

function regexEscape(str) {
    return str.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&');
}

// Edge has a bug from 2014:
// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/669685/
// So we need to use deep feature detection.
const isSupported = (() => {
    let mem = null;
    return () => {
        if (mem === null) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = '1';
            mem = input.valueAsNumber === 1;
        }
        return mem;
    };
})();

function cleanupInput(input, decimal, negative) {
    const value = input.value;
    let strippedValue = '',
        hasDecimal = false,
        selectionStart, selectionEnd;

    if (input.type !== 'number') {
        selectionStart = input.selectionStart;
        selectionEnd = input.selectionEnd;
    }

    /*const rgx = new RegExp((negative ? '[-+]?' : '[+]?') + '(?:[0-9]+(?:' +
        (decimal ? regexEscape(decimal) : '') + '[0-9]*)?|' +
        (decimal ? regexEscape(decimal) : '') + '[0-9]*)', '');*/

    let i = 0, c;
    for (; i < value.length; i++) {
        c = value.charAt(i);
        if ((c >= '0' && c <= '9') || (negative && c === '-' && !strippedValue.length)) {
            strippedValue += c;
        } else if (decimal && value.substr(i, decimal.length) === decimal && !hasDecimal) {
            hasDecimal = true;
            strippedValue += decimal;
            i += decimal.length - 1;
        } else {
            if (i <= selectionStart) {
                selectionStart--
            }
            if (i <= selectionEnd) {
                selectionEnd--
            }
        }
    }

    if (value !== strippedValue) {
        input.value = strippedValue;
        if (input.type !== 'number') {
            input.selectionStart = selectionStart;
            input.selectionEnd = selectionEnd;
        }
        return true;
    }

    return false;
}

/** @expose */
$.fn.numeric = function (config) {
    this.each(function (index, item) {
        const isInput = item.tagName === 'INPUT';
        let attr;
        //if (isInput && item.type === 'number' && 'valueAsNumber' in item) return;

        if (typeof config === 'boolean') {
            config = {/** @expose */ decimal: config};
        }
        config = config || {};

        if (typeof config.negative === 'undefined') {
            // If the min attribute does not allow negatives, then disable the negative feature
            /** @expose */ config.negative = isInput ? (item.getAttribute('min') ? parseFloat(item.getAttribute('min')) < 0 : true) : true;
        }

        let decimal = (config.decimal === false)
            ? ''
            : ((typeof config.decimal === 'string' && config.decimal) ? config.decimal : DECIMAL_SEPARATOR);
        const negative = !!config.negative;

        // If we're going to use the real 'valueAsNumber', force using the native decimal separator
        if (decimal && this.tagName === 'INPUT' && this.type === 'number' && 'valueAsNumber' in this && isSupported()) {
            decimal = DECIMAL_SEPARATOR;
        }

        // If the step attribute does not allow decimals
        if (typeof config.decimal === 'undefined' && isInput) {
            attr = item.getAttribute('step');
            if (attr && attr !== 'any' && attr.indexOf('.') === -1) {
                decimal = '';
            }
        }

        return $(item)
            .data('numeric.decimal', decimal)
            .data('numeric.negative', negative)
            .on('keypress.numericValue', $.fn.numeric._event)
            .on('keyup.numericValue', $.fn.numeric._event)
            .on('blur.numericValue', $.fn.numeric._event)
            .on('input.numericValue', $.fn.numeric._event);
    });
    return this;
};

/** @expose */
$.fn.valueAsNumber = function () {
    if (!this.length) return null;
    const args = arguments;
    if (args.length) {
        return this.each(function () {
            if (this.tagName === 'INPUT' && this.type === 'number' && 'valueAsNumber' in this && isSupported()) {
                let val = args[0];
                if (val === undefined)
                    this.value = ''; // Compatibility with IE11
                else this.valueAsNumber = val;
            } else {
                this.value = (args[0] === null || args[0] === undefined)
                    ? ''
                    : args[0].toString().replace(/\./, $.data(this, 'numeric.decimal') || DECIMAL_SEPARATOR);
            }
        });
    } else {
        if (this[0].tagName === 'INPUT' && this[0].type === 'number' && 'valueAsNumber' in this[0] && isSupported()) {
            return this[0].valueAsNumber;
        } else {
            let decimal = this.data('numeric.decimal');
            if (decimal) {
                decimal = new RegExp(regexEscape(decimal), 'g');
            } else {
                decimal = DECIMAL_SEPARATOR_REGEX;
            }
            return this[0].value === '' ? null : parseFloat(this[0].value.replace(decimal, '.'));
        }
    }
};

$.fn.numeric._event = function (e) {
    const decimal = $.data(this, 'numeric.decimal'),
        negative = $.data(this, 'numeric.negative');

    cleanupInput(this, decimal, negative);
};

/** @expose */
$.fn.removeNumeric = function () {
    return this
        .removeData('numeric.decimal')
        .removeData('numeric.negative')
        .off('.numericValue');
};
