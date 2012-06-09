/**
 * jquery.monthpicker
 * https://github.com/sogoltsov/jquery.monthpicker
 *
 * Copyright (c) 2012 Sergey Ogoltsov
 * Licensed under the MIT, GPL licenses.
 *
 * Based on jquery-ui code:
 *  http://docs.jquery.com/UI/
 *
 * Depends:
 *	jquery.ui.core.js
 */

(function ($) {
    $.widget("ui.monthpicker", {
        // These options will be used as defaults
        options:{
            clear:null,
            monthNames:['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], // Names of months
            monthNamesShort:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Short names of months
            disabled:false,
            defaultYear:null,
            defaultMonth:null,
            showMonthAfterYear:true,
            useShortMonthNames:false,
            yearSuffix:'',
            _inDialog:false, // True if showing within a "dialog", false if not
            duration:1
        },

        // Set up the widget
        _create:function () {
            var self = this,
                options = self.options;
            this.ym = this._getDefaultYM();
            this.mpDiv = self.element;
            self.element.addClass(' ui-monthpicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all ').append(this._generateHTML());
//            this.mpDiv = $('<div class="ui-monthpicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>').append(this._generateHTML());
            this._bindHover();
//            this.mpDiv.appendTo(self.element);
            self.ymButton = this.mpDiv.find('.ui-monthpicker-month-year-cell');
            self.prevYearButton = self.element.find('.ui-monthpicker-prev-year');
            self.prevMonthButton = self.element.find('.ui-monthpicker-prev-month');
            self.nextMonthButton = self.element.find('.ui-monthpicker-next-month');
            self.nextYearButton = self.element.find('.ui-monthpicker-next-year');
            self.prevYearButton.bind("click.monthpicker", function (event) {
                if (options.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else {
                    self._adjustYM(-100);
                }
            });
            self.prevMonthButton.bind("click.monthpicker", function (event) {
                if (options.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else {
                    self._adjustYM(-1);
                }
            });
            self.nextMonthButton.bind("click.monthpicker", function (event) {
                if (options.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else {
                    self._adjustYM(1);
                }
            });
            self.nextYearButton.bind("click.monthpicker", function (event) {
                if (options.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else {
                    self._adjustYM(100);
                }
            });
            self.mainPickerDiv = $('<div class="ui-monthpicker-popup ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>').append(this._generateMonthpickerHTML());
            this._bindHoverPopup();
            self.mainPickerDiv.css("display", "none");
            self.mainPickerDiv.find('.ui-monthpicker-picker-ok-btn').bind("click.monthpicker", function() {
                self.ym = self.drawYear * 100 + self.drawMonth;
                self.ymButton.empty().append(self._generateMonthYearHeader());
                self.mainPickerDiv.hide();
                self._trigger('change', null, self.ym);
            });
            self.mainPickerDiv.find('.ui-monthpicker-picker-cancel-btn').bind("click.monthpicker", function() {
                self.mainPickerDiv.hide();
            });
            self.mainPickerDiv.find('.ui-monthpicker-picker-prev-year-cell').bind("click.monthpicker", function() {
                self.baseYear -= 10;
                self._selectYear(self.drawYear);
            });
            self.mainPickerDiv.find('.ui-monthpicker-picker-next-year-cell').bind("click.monthpicker", function() {
                self.baseYear += 10;
                self._selectYear(self.drawYear);
            });
            self.mainPickerDiv.find('.ui-monthpicker-picker-year-cell button').bind("click.monthpicker", function(event) {
                var year = parseInt(event.srcElement.innerText, 10);
                if (!isNaN(year)) {
                    self.drawYear = year;
                    self._selectYear(self.drawYear);
                }
            });
            self.mainPickerDiv.find('.ui-monthpicker-picker-month-cell button').bind("click.monthpicker", function(event) {
                var button = $(event.srcElement);
                var month = null;
                for (var i = 0; i < 12; i++) {
                    if (button.hasClass("ui-monthpicker-picker-month-" + i)) {
                        month = i;
                        break;
                    }
                }
                if (!isNaN(month)) {
                    self.drawMonth = month;
                    self._selectMonth(self.drawMonth);
                }
            });

            $('body').append(self.mainPickerDiv);
            self.ymButton.bind("click.monthpicker", function (event) {
                self._showMonthYearPicker();
            });
        },
        _showMonthYearPicker:function () {
            var self = this;
            self.drawYear = self.baseYear = self._ym2year(self.ym);
            self.drawMonth = self._ym2month(self.ym);
            self._selectYear(self.drawYear);
            self._selectMonth(self.drawMonth);

            if (!self._pos) { // position below input
                var lposition = self.mpDiv.offset();
                self._pos = [lposition.left, lposition.top];
//            $.monthpicker._pos[1] += inst.dpDiv.offsetHeight; // add the height
            }
            var isFixed = false;
            self.mpDiv.parents().each(function () {
                isFixed |= $(this).css('position') === 'fixed';
                return !isFixed;
            });

            if (isFixed && $.browser.opera) { // correction for Opera when fixed and scrolled
                self._pos[0] -= document.documentElement.scrollLeft;
                self._pos[1] -= document.documentElement.scrollTop;
            }
            var offset = {left:self._pos[0], top:self._pos[1]};
            self._pos = null;

            self.mainPickerDiv.css({position:'absolute', display:'block', top:'-1000px'});


            offset = this._checkOffset(offset, isFixed);
            var position = (self._inDialog && $.blockUI ? 'static' : (isFixed ? 'fixed' : 'absolute'));
            var width = self.mpDiv.innerWidth();
            self.mainPickerDiv.css({position:position, display:'none', left:offset.left + 'px', top:offset.top + 'px', width:width + 'px'});

            var zIndex = self.mpDiv.css('zIndex') + 1;
            self.mainPickerDiv.css('zIndex', zIndex);
            var postProcess = function () {
                var cover = self.mainPickerDiv.find('iframe.ui-monthpicker-cover'); // IE6- only
                if (!!cover.length) {
                    var borders = this._getBorders(self.mainPickerDiv);
                    cover.css({left:-borders[0], top:-borders[1],
                        width:self.mainPickerDiv.outerWidth(), height:self.mainPickerDiv.outerHeight()});
                }
            };
            self.mainPickerDiv.show(true, null, self.options.duration, postProcess); //use jQuery().show() instead this
//            self.mainPickerDiv.show(duration, $.monthpicker._get(inst, 'showOptions'), postProcess);
        },
        /* Check positioning to remain on screen. */
        _checkOffset:function (offset, isFixed) {
            var self = this;
            var dpWidth = this.mainPickerDiv.outerWidth();
            var dpHeight = this.mainPickerDiv.outerHeight();
            var inputWidth = this.mpDiv ? this.mpDiv.outerWidth() : 0;
            var inputHeight = this.mpDiv ? this.mpDiv.outerHeight() : 0;
            var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
            var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();

            offset.left -= (this.options.isRTL ? (dpWidth - inputWidth) : 0);
            offset.left -= (isFixed && offset.left === self.input.offset().left) ? $(document).scrollLeft() : 0;
            offset.top -= (isFixed && offset.top === (self.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

            // now check if monthpicker is showing outside window viewport - move to a better place if so.
            offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
                Math.abs(offset.left + dpWidth - viewWidth) : 0);
            offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight) : 0);

            return offset;
        },
        _calcYM:function (ym, offset) {
            offset = Math.floor(offset);
            var monthoffset = offset % 100;
            if (monthoffset !== 0) {
                var year = this._ym2year(ym) * 100 + (offset < 0 ? Math.ceil(offset / 12) : Math.floor(offset / 12)) * 100;
                var month = this._ym2month(ym);
                var cmonth = (month + monthoffset) % 12;
                if (cmonth < 0) {
                    year -= 100;
                    month = cmonth + 12;
                } else if (month + monthoffset > 11) {
                    year += 100;
                    month = cmonth;
                } else {
                    month = cmonth;
                }
                ym = year + (year > -1 ? month : (-1 * month));
            } else {
                ym += offset;
            }
            return ym;
        },
        /* Adjust one of the date sub-fields. */
        _adjustYM:function (offset) {
            this.ym = this._calcYM(this.ym, offset);
            this.ymButton.empty().append(this._generateMonthYearHeader());
            this._trigger('change', null, this.ym);
        },
        _getDefaultYM:function () {
            var year = this.options.defaultYear;
            var month = this.options.defaultMonth;
            if (year == null || month == null) {
                var defaultYM = new Date();
                if (year == null) {
                    year = defaultYM.getFullYear();
                }
                if (month == null) {
                    month = defaultYM.getMonth();
                }
            }
            return Math.floor(year * 100 + month);
        },
        // Use the _setOption method to respond to changes to options
        _setOption:function (key, value) {
/*
            switch (key) {
                case "clear":
                    // handle changes to clear option
                    break;
            }
*/

            // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
            $.Widget.prototype._setOption.apply(this, arguments);
            // In jQuery UI 1.9 and above, you use the _super method instead
//            this._super("_setOption", key, value);
        },

        // Use the destroy method to clean up any modifications your widget has made to the DOM
        destroy:function () {
            // In jQuery UI 1.8, you must invoke the destroy method from the base widget
            $.Widget.prototype.destroy.call(this);
            // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
        },

        /* Retrieve the size of left and top borders for an element.
         @param  elem  (jQuery object) the element of interest
         @return  (number[2]) the left and top borders */
        _getBorders:function (elem) {
            var convert = function (value) {
                return {thin:1, medium:2, thick:3}[value] || value;
            };
            return [parseFloat(convert(elem.css('border-left-width'))),
                parseFloat(convert(elem.css('border-top-width')))];
        },
        _ym2year:function (ym) {
            return ym >= 0 ? Math.floor(ym / 100) : Math.ceil(ym / 100);
        },
        _ym2month:function (ym) {
            return Math.abs(ym % 100);
        },
        _selectMonth: function(month) {
            var selector = '.ui-monthpicker-picker-month-cell button';
            var elem = $(this.mainPickerDiv).find(selector);
            elem.removeClass('ui-state-default');
            elem = $(this.mainPickerDiv).find('.ui-monthpicker-picker-month-' + month);
            elem.addClass('ui-state-default');
        },
        _selectYear: function(year) {
            var selector = '.ui-monthpicker-picker-year-cell button';
            var elem = $(this.mainPickerDiv).find(selector);
            for (var i = 0; i < 5; i++) {
                $(elem[i * 2]).text(this.baseYear - 4 + i);
                $(elem[i * 2 + 1]).text(this.baseYear + 1 + i);
            }
            elem.removeClass('ui-state-default');
            if (this.drawYear - 5 < year && this.baseYear + 6 > year) {
                var yearPosition = year - this.baseYear + 4;
                elem = $(this.mainPickerDiv).find('.ui-monthpicker-picker-year-' + yearPosition);
                elem.addClass('ui-state-default');
            }
        },
        _generateMonthYearHeader:function () {
            var drawMonth = this._ym2month(this.ym);
            var drawYear = this._ym2year(this.ym);
            var mnames = this.options.useShortMonthNames ? this.options.monthNamesShort : this.options.monthNames;
            var html = '<div class="ui-monthpicker-title">';
            var monthHtml = '';
            // month selection
            monthHtml += '<span class="ui-monthpicker-month">' + mnames[drawMonth] + '</span>';
            if (!this.options.showMonthAfterYear) {
                html += monthHtml + '&#xa0;';
            }
            html += '<span class="ui-monthpicker-year">' + drawYear + '</span>';
            html += this.options.yearSuffix;
            if (this.options.showMonthAfterYear) {
                html += '&#xa0;' + monthHtml;
            }
            html += '</div>'; // Close monthpicker_header
            return html;
        },
        /* Generate the HTML for the current state of the date picker. */
        _generateHTML:function () {
            var html = '<table border="0" cellpadding="0" cellspacing="0" class="ui-monthpicker-group ui-monthpicker-header ui-widget-header ui-helper-clearfix ui-corner-all">' +
                '<tbody><tr>' +
                '<td class="ui-monthpicker-prev-year ui-corner-all"><<</td>' +
                '<td class="ui-monthpicker-prev-month ui-corner-all"><</td>' +
                '<td class="ui-monthpicker-month-year-cell ui-corner-all">' +
                this._generateMonthYearHeader() + '</td>' +
                '<td class="ui-monthpicker-next-month ui-corner-all">></td>' +
                '<td class="ui-monthpicker-next-year ui-corner-all">>></td>' +
                '</tr></tbody></table>';
            return html;
        },
        _generateMonthpickerHTML:function () {
            var monthNamesShort = this.options.monthNamesShort;
            var html = '<table border="0" cellpadding="0" cellspacing="0" class="ui-monthpicker-picker ui-helper-clearfix ui-corner-all">' +
                '<tbody>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-0">' + monthNamesShort[0] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-6">' + monthNamesShort[6] + '</button></td>' +
                '   <td class=""><button class="ui-monthpicker-picker-prev-year-cell ui-button ui-button-text-only ui-corner-all"><</button></td>' +
                '   <td class=""><button class="ui-monthpicker-picker-next-year-cell ui-button ui-button-text-only ui-corner-all">></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-1">' + monthNamesShort[1] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-7">' + monthNamesShort[7] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-0"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-5"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-2">' + monthNamesShort[2] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-8">' + monthNamesShort[8] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-1"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-6"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-3">' + monthNamesShort[3] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-9">' + monthNamesShort[9] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-2"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-7"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-4">' + monthNamesShort[4] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-10">' + monthNamesShort[10] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-3"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-8"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-5">' + monthNamesShort[5] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-11">' + monthNamesShort[11] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-4"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-9"></button></td></tr>' +
                '<tr class="ui-widget-header">' +
                '<td colspan="2" class="ui-monthpicker-picker-ok-cell"><button class="ui-monthpicker-picker-ok-btn ui-widget ui-button ui-button-text-only ui-state-default ui-corner-all">OK</button></td>' +
                '<td colspan="2" class="ui-monthpicker-picker-cancel-cell"><button class="ui-monthpicker-picker-cancel-btn ui-widget ui-button ui-button-text-only ui-state-default ui-corner-all">Cancel</button></td>' +
                '</tr>' +
                '</tbody></table>';
            return html;
        },
        /*
         * Bind hover events for monthpicker elements.
         * Done via delegate so the binding only occurs once in the lifetime of the parent div.
         * Global instActive, set by _updateMonthpicker allows the handlers to find their way back to the active picker.
         */
        _bindHover:function () {
            var self = this;
            var selector = 'button, .ui-monthpicker-prev-year, .ui-monthpicker-prev-month, .ui-monthpicker-next-month, .ui-monthpicker-next-year, .ui-monthpicker-month-year-cell, .ui-monthpicker-calendar td a';
            return self.mpDiv.bind('mouseout.monthpicker',function (event) {
                var elem = $(event.target).closest(selector);
                if (!elem.length) {
                    return;
                }
                elem.removeClass("ui-state-hover ui-monthpicker-prev-year-hover ui-monthpicker-prev-month-hover ui-monthpicker-next-month-hover ui-monthpicker-next-year-hover");
            }).bind('mouseover.monthpicker', function (event) {
                    var elem = $(event.target).closest(selector);
                    if (self.options.disabled || !elem.length) {
                        return;
                    }
                    elem.parents('.ui-monthpicker-calendar').find('a').removeClass('ui-state-hover');
                    elem.addClass('ui-state-hover');
                    if (elem.hasClass('ui-monthpicker-prev-year')) {
                        elem.addClass('ui-monthpicker-prev-year-hover');
                    }
                    if (elem.hasClass('ui-monthpicker-month-year')) {
                        elem.addClass('ui-monthpicker-prev-month-hover');
                    }
                    if (elem.hasClass('ui-monthpicker-next-month')) {
                        elem.addClass('ui-monthpicker-next-month-hover');
                    }
                    if (elem.hasClass('ui-monthpicker-next-year')) {
                        elem.addClass('ui-monthpicker-next-year-hover');
                    }
                });
        },
        _bindHoverPopup:function () {
            var self = this;
            var selector = 'button, .ui-monthpicker-picker-month-cell button, .ui-monthpicker-picker-year-cell button, .ui-monthpicker-picker-prev-year-cell, .ui-monthpicker-picker-next-year-cell';
            return self.mainPickerDiv.bind('mouseout.monthpicker',
                function (event) {
                    var elem = $(event.target).closest(selector);
                    if (!elem.length) {
                        return;
                    }
                    elem.removeClass("ui-state-hover ui-monthpicker-picker-month-cell-hover ui-monthpicker-picker-year-cell-hover ui-monthpicker-picker-prev-year-cell-hover ui-monthpicker-picker-next-year-cell-hover");
//            elem.removeClass("ui-state-default ui-corner-all");
//            elem.removeClass("ui-state-default");
//            elem.removeClass("ui-corner-all");
                }).bind('mouseover.monthpicker', function (event) {
                    var elem = $(event.target).closest(selector);
                    if (self.options.disabled || !elem.length) {
                        return;
                    }
                    elem.parents('.ui-monthpicker-picker').find('a').removeClass('ui-state-hover');
                    elem.addClass('ui-state-hover');
//            elem.addClass('ui-corner-all');
//            elem.addClass('ui-state-default ui-corner-all');
                    if (elem.hasClass('ui-monthpicker-picker-month-cell')) {
                        elem.addClass('ui-monthpicker-picker-month-cell-hover');
                    }
                    if (elem.hasClass('ui-monthpicker-picker-year-cell')) {
                        elem.addClass('ui-monthpicker-picker-year-cell-hover');
                    }
                    if (elem.hasClass('ui-monthpicker-picker-prev-year-cell')) {
                        elem.addClass('ui-monthpicker-picker-prev-year-cell-hover');
                    }
                    if (elem.hasClass('ui-monthpicker-picker-next-year-cell')) {
                        elem.addClass('ui-monthpicker-picker-next-year-cell-hover');
                    }
                });
        },
        year: function (newValue) {
            if (arguments.length > 0) {
                newValue = Math.ceil(newValue);
                var lmonth = this._ym2month(this.ym);
                this.ym = newValue * 100 + lmonth * (newValue < 0 ?  -1 : 1);
                this.ymButton.empty().append(this._generateMonthYearHeader());
                if (this.mainPickerDiv.is(':visible')) {
                    this.baseYear = this._ym2year(this.ym);
                    this._selectYear(this.baseYear);
                }
                this._trigger('change', null, this.ym);
            } else {
                return this._ym2year(this.ym);
            }
        },
        month: function (newValue) {
            if (arguments.length > 0) {
                newValue = Math.ceil(newValue);
                if (newValue < 0 || newValue > 11) {
                    return;
                }
                var lyear = this._ym2year(this.ym);
                this.ym = lyear * 100 + newValue * (lyear < 0 ?  -1 : 1);
                this.ymButton.empty().append(this._generateMonthYearHeader());
                if (this.mainPickerDiv.is(':visible')) {
                    this._selectMonth(this._ym2month(this.ym));
                }
                this._trigger('change', null, this.ym);
            } else {
                return this._ym2month(this.ym);
            }
        },
        yearMonth: function (newValue) {
            if (arguments.length > 0) {
                newValue = Math.ceil(newValue);
                var lmonth = this._ym2month(newValue);
                if (lmonth < 0 || lmonth > 11) {
                    return;
                }
                this.ym = newValue;
                this.ymButton.empty().append(this._generateMonthYearHeader());
                if (this.mainPickerDiv.is(':visible')) {
                    this.baseYear = this._ym2year(this.ym);
                    this._selectYear(this.baseYear);
                    this._selectMonth(this._ym2month(this.ym));
                }
                this._trigger('change', null, this.ym);
            } else {
                return this.ym;
            }
        }
    });
}(jQuery) );
