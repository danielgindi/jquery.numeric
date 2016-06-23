// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/jquery-1.9.js
// ==/ClosureCompiler==
/** @preserve    Library by Daniel Cohen Gindi (danielgindi@gmail.com)
    MIT License!
*/
(function ($) {
    'use strict';
    
    /** @const */
    var DECIMAL_SEPARATOR = (1.1).toLocaleString().substr(1, 1);
    
    /** @const */
    var DECIMAL_SEPARATOR_REGEX = new RegExp('\\' + DECIMAL_SEPARATOR, 'g');

    var cleanupInput = function (input, decimal, negative) {
        var value = input.value,
            strippedValue = '',
            hasDecimal = false;
        if (input.type !== 'number') {
            var selectionStart = input.selectionStart;
            var selectionEnd = input.selectionEnd;
        }
        for (var i = 0, c; i < value.length; i++) {
            c = value.charAt(i);
            if ((c >= '0' && c <= '9') || (negative && c === '-' && !strippedValue.length)) {
                strippedValue += c;
            } else if (decimal && c === decimal && !hasDecimal) {
                hasDecimal = true;
                strippedValue += c;
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
    };

    /** @expose */
    $.fn.numeric = function (config) {
        this.each(function(index,item) {
            var isInput = item.tagName === 'INPUT', attr;
            //if (isInput && item.type === 'number' && 'valueAsNumber' in item) return;
        
            if (typeof config === 'boolean') {
                config = { /** @expose */ decimal: config };
            }
            config = config || {};

            if (typeof config.negative === 'undefined') {
                // If the min attribute does not allow negatives, then disable the negative feature
                /** @expose */ config.negative = isInput ? (item.getAttribute('min') ? parseFloat(item.getAttribute('min')) < 0 : true) : true;
            }
            var decimal = (config.decimal === false) ? '' : config.decimal || DECIMAL_SEPARATOR;
            var negative = !!config.negative;
            
            if (typeof config.decimal === 'undefined' && isInput) {
                // If the step attribute does not allow decimals
                attr = item.getAttribute('step');
                if (attr && attr !== 'any' && attr.indexOf('.') === -1 && attr.indexOf(',') === -1) {
                    decimal = '';
                }
            }

            // var cleanupRegex = new RegExp('[^' + (negative ? '-' : '') + '0-9' + (decimal ? decimal : '') + ']', 'g');

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
        var args = arguments;
        if (args.length) {
            this.each(function(){
                if (this.tagName === 'INPUT' && this.type === 'number' && 'valueAsNumber' in this) {
                    this.valueAsNumber = args[0];
                } else {
                    this.value = args[0].toString().replace(/\./, this.data('numeric.decimal') || DECIMAL_SEPARATOR);
                }
            });
        } else {
            if (this[0].tagName === 'INPUT' && this[0].type === 'number' && 'valueAsNumber' in this[0]) {
                return this[0].valueAsNumber;
            } else {
                var decimal = this.data('numeric.decimal');
                if (decimal) {
                    decimal = new RegExp('\\' + decimal, 'g');
                } else {
                    decimal = DECIMAL_SEPARATOR_REGEX;
                }
                return this[0].value === '' ? null : parseFloat(this[0].value.replace(decimal, '.'));
            }
        }
    };

    $.fn.numeric._event = function (e) {
        var decimal = $.data(this, 'numeric.decimal'),
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

})(jQuery);
