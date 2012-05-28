/*
 * jquery.monthpicker
 * https://github.com/sogoltsov/jquery.monthpicker
 *
 * Copyright (c) 2012 Sergey Ogoltsov
 * Licensed under the MIT, GPL licenses.
 *
 * Based on ui-datepicker code:
 *  http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *	jquery.ui.core.js
 */

(function($, undefined) {
    $.extend($.ui, { monthpicker: { version: "@VERSION" } });

    var PROP_NAME = 'monthpicker';
    var mpuuid = new Date().getTime();
    var instActive;

    function Monthpicker() {
        console.log('Monthpicker() started');
        this.debug = true; // Change this to true to start debugging

        this._mainDivId = 'ui-monthpicker-div'; // The ID of the main monthpicker division
        this._popupDivId = 'ui-monthpicker-popup-div'; // The ID of the popup monthpicker division
        this._inDialog = false; // True if showing within a "dialog", false if not
        this._disabledInputs = []; // List of date picker inputs that have been disabled
        this.regional = []; // Available regional settings, indexed by language code
        this.regional[''] = { // Default regional settings
            closeText: 'Done', // Display text for close link
            prevText: 'Prev', // Display text for previous month link
            nextText: 'Next', // Display text for next month link
            currentText: 'Today', // Display text for current month link
            monthNames: ['January','February','March','April','May','June',
                'July','August','September','October','November','December'], // Names of months for drop-down and formatting
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
            dateFormat: 'mm/dd/yy', // See format options on parseDate
            firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
            isRTL: false, // True if right-to-left language, false if left-to-right
            showMonthAfterYear: false, // True if the year select precedes month, false for month then year
            yearSuffix: '' // Additional text to append to the year in the month headers
        };

        this._defaults = { // Global defaults for all the date picker instances
            defaultYearMonth: null, // Used when field is blank: actual yearMonth,
            showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
            stepMonths: 1, // Number of months to step back/forward
            stepYears: 1, // Number of years to step back/forward
            changeMonth: false, // True if month can be selected directly, false if only prev/next
            changeYear: true, // True if year can be selected directly, false if only prev/next
            duration: 'fast', // Duration of display/closure
            minYearMonth: null, // The earliest selectable year&month, or null for no limit
            maxYearMonth: null, // The latest selectable year&month, or null for no limit
            onSelect: null // Define a callback function when month/year are selected
        };
        $.extend(this._defaults, this.regional['']);
        this.dpDiv = null; //bindHover($('<div id="' + this._mainDivId + '" class="ui-monthpicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'));
        this.msMPDiv = bindHoverPopup($('<div id="' + this._popupDivId + '" class="ui-monthpicker-popup ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'));
        console.log('Monthpicker() done');
    }

    $.extend(Monthpicker.prototype, {
        /* Class name added to elements to indicate already configured with a date picker. */
        markerClassName: 'hasMonthpicker',

        //Keep track of the maximum number of rows displayed (see #7043)
        maxRows: 4,

        /* Debug logging (if enabled). */
        log: function () {
            if (this.debug) {
//            console.log.apply('', arguments);
                console.log(arguments);
            }
        },

        // TODO rename to "widget" when switching to widget factory
        _widgetMonthpicker: function() {
            return this.dpDiv;
        },

        /* Override the default settings for all instances of the date picker.
         @param  settings  object - the new settings to use as defaults (anonymous object)
         @return the manager object */
        setDefaults: function(settings) {
            extendRemove(this._defaults, settings || {});
            return this;
        },

        /* Attach the date picker to a jQuery selection.
         @param  target    element - the target input field or division or span
         @param  settings  object - the new settings to use for this date picker instance (anonymous) */
        _attachMonthpicker: function(target, settings) {
            console.log('_attachMonthpicker() started');
            // check for settings on the control itself - in namespace 'date:'
            var inlineSettings = null;
            for (var attrName in this._defaults) {
                var attrValue = target.getAttribute('date:' + attrName);
                if (attrValue) {
                    inlineSettings = inlineSettings || {};
                    try {
                        inlineSettings[attrName] = eval(attrValue);
                    } catch (err) {
                        inlineSettings[attrName] = attrValue;
                    }
                }
            }
            var nodeName = target.nodeName.toLowerCase();
            var inline = (nodeName === 'div' || nodeName === 'span');
            console.log('inline: ' + inline);
            if (!target.id) {
                this.uuid += 1;
                target.id = 'dp' + this.uuid;
            }
            var inst = this._newInst($(target), inline);
            inst.settings = $.extend({}, settings || {}, inlineSettings || {});
            if (nodeName === 'input') {
                this._connectMonthpicker(target, inst);
            } else if (inline) {
                this._inlineMonthpicker(target, inst);
            }
            console.log('_attachMonthpicker() done');
        },

        /* Create a new instance object. */
        _newInst: function(target, inline) {
            console.log('_newInst() started');
            var id = target[0].id.replace(/([^A-Za-z0-9_-])/g, '\\\\$1'); // escape jQuery meta chars
            var result = {id: id, input: target, // associated target
                selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
                drawMonth: 0, drawYear: 0, // month being drawn
                inline: inline, // is monthpicker inline or not
                dpDiv: bindHover($('<div class="ui-monthpicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')),
                msMPDiv: this.msMPDiv
            };
            console.log('_newInst() started');
            return result;
        },

        /* Attach the date picker to an input field. */
        _connectMonthpicker: function(target, inst) {
            console.log('ACHTUNG!!! Configuration doesn\'t implemented');
        },


        /* Attach an inline month calendar to a div. */
        _inlineMonthpicker: function(target, inst) {
            console.log('_inlineMonthpicker() started');
            var divSpan = $(target);
            if (divSpan.hasClass(this.markerClassName)) {
                return;
            }
            divSpan.addClass(this.markerClassName).append(inst.dpDiv).
                bind("setData.monthpicker", function(event, key, value){
                    inst.settings[key] = value;
                }).bind("getData.monthpicker", function(event, key){
                    return this._get(inst, key);
                });
            $.data(target, PROP_NAME, inst);

//        this.drawMonth = 5;
//        this.drawYear = 2012;
//        this._setDate(inst, this._getDefaultDate(inst), true);
//        this._setYear(ints, this._getDefaultYear(inst), true);

            this._setYM(inst, this._getDefaultYM(inst), true);

            this._updateMonthpicker(inst);
            this._updateAlternate(inst);
            //If disabled option is true, disable the monthpicker before showing it (see ticket #5665)
            if( inst.settings.disabled ) {
                this._disableMonthpicker( target );
            }
            // Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
            // http://bugs.jqueryui.com/ticket/7552 - A monthpicker created on a detached div has zero height
            inst.dpDiv.css( "display", "block" );
            divSpan.append(inst.msMPDiv);
            inst.msMPDiv.css( "display", "none" );
            console.log('_inlineMonthpicker() done');
        },

        _setYM: function(inst, yearMonth, noChange) {
            var year = this._ym2year(yearMonth);
            var month = this._ym2month(yearMonth);
            inst.drawMonth = inst.selectedMonth = inst.currentMonth = month;
            inst.drawYear = inst.selectedYear = inst.currentYear = year;
        },

        /* Generate the date picker content. */
        _updateMonthpicker: function(inst) {
            var self = this;
            self.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
            var borders = $.monthpicker._getBorders(inst.dpDiv);
            instActive = inst; // for delegate hover events
            inst.dpDiv.empty().append(this._generateHTML(inst));
            var cover = inst.dpDiv.find('iframe.ui-monthpicker-cover'); // IE6- only
            if( !!cover.length ){ //avoid call to outerXXXX() when not in IE6
                cover.css({left: -borders[0], top: -borders[1], width: inst.dpDiv.outerWidth(), height: inst.dpDiv.outerHeight()})
            }
            inst.dpDiv.find('.' + this._dayOverClass + ' a').mouseover();
        },

        /* Retrieve the size of left and top borders for an element.
         @param  elem  (jQuery object) the element of interest
         @return  (number[2]) the left and top borders */
        _getBorders: function(elem) {
            var convert = function(value) {
                return {thin: 1, medium: 2, thick: 3}[value] || value;
            };
            return [parseFloat(convert(elem.css('border-left-width'))),
                parseFloat(convert(elem.css('border-top-width')))];
        },

        /* Update any alternate field to synchronise with the main field. */
        _updateAlternate: function(inst) {
            var altField = this._get(inst, 'altField');
            if (altField) { // update alternate field too
                var altFormat = this._get(inst, 'altFormat') || this._get(inst, 'dateFormat');
                var date = this._getDate(inst);
                var dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
                $(altField).each(function() { $(this).val(dateStr); });
            }
        },

        /* Get a setting value, defaulting if necessary. */
        _get: function(inst, name) {
            return inst.settings[name] !== undefined ?
                inst.settings[name] : this._defaults[name];
        },

        /* Retrieve the instance data for the target control.
         @param  target  element - the target input field or division or span
         @return  object - the associated instance data
         @throws  error if a jQuery problem getting data */
        _getInst: function(target) {
            try {
                return $.data(target, PROP_NAME);
            }
            catch (err) {
                throw 'Missing instance data for this monthpicker';
            }
        },


        /* Adjust one of the date sub-fields. */
        _adjustDate: function(id, offset, period) {
            console.log('_adjustDate() started');
            console.log('offset: ' + offset);
            var target = $(id);
            var inst = this._getInst(target[0]);
            console.log('inst.drawMonth: ' + inst.drawMonth + ', inst.drawYear: ' + inst.drawYear);
            if (this._isDisabledMonthpicker(target[0])) {
                return;
            }
            this._adjustInstDate(inst, offset +
                (period === 'M' ? this._get(inst, 'showCurrentAtPos') : 0), // undo positioning
                period);
            console.log('inst.drawMonth: ' + inst.drawMonth + ', inst.drawYear: ' + inst.drawYear);
            this._updateMonthpicker(inst);
            console.log('_adjustDate() done');
        },

        /* Is the first field in a jQuery collection disabled as a monthpicker?
         @param  target    element - the target input field or division or span
         @return boolean - true if disabled, false if enabled */
        _isDisabledMonthpicker: function(target) {
            if (!target) {
                return false;
            }
            for (var i = 0; i < this._disabledInputs.length; i++) {
                if (this._disabledInputs[i] == target) {
                    return true;
                }
            }
            return false;
        },

        /* Adjust one of the date sub-fields. */
        _adjustInstDate: function(inst, offset, period) {
            console.log('_adjustInstDate() started');
            console.log('offset: ' + offset);
            console.log('period: ' + period);
            var year = inst.drawYear + (period === 'Y' ? offset : 0);
            var month = inst.drawMonth + (period === 'M' ? offset : 0);
            var date = new Date(year, month, 1);
//        inst.drawMonth = inst.selectedMonth = date.getMonth();
//        inst.drawYear = inst.selectedYear = date.getFullYear();
            this._selectYearMonth(inst, date.getFullYear(), date.getMonth());
//        console.log('inst.drawMonth: ' + inst.drawMonth + ', inst.drawYear: ' + inst.drawYear);
            if (period === 'M' || period === 'Y') {
                this._notifyChange(inst);
            }
            console.log('_adjustInstDate() done');
        },

        /* Notify change of month/year. */
        _notifyChange: function(inst) {
            var onChange = this._get(inst, 'onChangeMonthYear');
            if (onChange) {
                onChange.apply((inst.input ? inst.input[0] : null), [inst.selectedYear, inst.selectedMonth + 1, inst]);
            }
        },

        /* Generate the month and year header. */
        _generateMonthYearHeader: function(inst, drawMonth, drawYear, minDate, maxDate,
                                           secondary, monthNames, monthNamesShort) {
            var changeMonth = this._get(inst, 'changeMonth');
            var changeYear = this._get(inst, 'changeYear');
            var showMonthAfterYear = this._get(inst, 'showMonthAfterYear');
            var html = '<div class="ui-monthpicker-title">';
            var monthHtml = '';
            // month selection
            monthHtml += '<span class="ui-monthpicker-month">' + monthNames[drawMonth] + '</span>';
            if (!showMonthAfterYear) {
                html += monthHtml + (!(changeMonth && changeYear) ? '&#xa0;' : '');
            }
            // year selection
            if ( !inst.yearshtml ) {
                inst.yearshtml = '';
                html += '<span class="ui-monthpicker-year">' + drawYear + '</span>';
            }
            html += this._get(inst, 'yearSuffix');
            if (showMonthAfterYear) {
                html += (secondary || !(changeMonth && changeYear) ? '&#xa0;' : '') + monthHtml;
            }
            html += '</div>'; // Close monthpicker_header
            return html;
        },

        /* Generate the HTML for the current state of the date picker. */
        _generateHTML: function(inst) {
            console.log('_generateHTML started');
            var stepMonths = this._get(inst, 'stepMonths');
            var stepYears = this._get(inst, 'stepYears');

            var showCurrentAtPos = this._get(inst, 'showCurrentAtPos');

            var minDate = null; //this._getMinMaxDate(inst, 'min');
            var maxDate = null; //this._getMinMaxDate(inst, 'max');
            var drawMonth = inst.drawMonth - showCurrentAtPos;
            var drawYear = inst.drawYear;
            console.log('drawMonth: ' + drawMonth + ', drawYear: ' + drawYear);
            if (drawMonth < 0) {
                drawMonth += 12;
                drawYear--;
            }
            var monthNames = this._get(inst, 'monthNames');
            var monthNamesShort = this._get(inst, 'monthNamesShort');

            var html = '<table border="0" cellpadding="0" cellspacing="0" class="ui-monthpicker-group ui-monthpicker-header ui-widget-header ui-helper-clearfix ui-corner-all">' +
                '<tbody><tr>' +
                '<td class="ui-monthpicker-prev-year ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._adjustDate(\'#' + inst.id + '\', -' + stepYears + ', \'Y\');"><<</td>' +
                '<td class="ui-monthpicker-prev-month ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._adjustDate(\'#' + inst.id + '\', -' + stepMonths + ', \'M\');"><</td>' +
                '<td class="ui-monthpicker-month-year-cell ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._showMonthYearPicker(\'#' + inst.id + '\');">' +
                this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
                    false, monthNames, monthNamesShort) + '</td>' +
                '<td class="ui-monthpicker-next-month ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._adjustDate(\'#' + inst.id + '\', ' + stepMonths + ', \'M\');">></td>' +
                '<td class="ui-monthpicker-next-year ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._adjustDate(\'#' + inst.id + '\', ' + stepYears + ', \'Y\');">>></td>' +
                '</tr></tbody></table>';
            console.log('_generateHTML done');
            return html;
        },
        _showMonthYearPicker:function(id) {
            console.log('_showMonthYearPicker() started');
            var target = $(id);
            var inst = this._getInst(target[0]);

            if (!$.monthpicker._pos) { // position below input
                var lposition = inst.dpDiv.offset();
                console.log('position.top: ' + lposition.top);
                console.log('position.left: ' + lposition.left);

                $.monthpicker._pos = [lposition.left, lposition.top];
//            $.monthpicker._pos[1] += inst.dpDiv.offsetHeight; // add the height
            }
            var isFixed = false;
            inst.dpDiv.parents().each(function() {
                isFixed |= $(this).css('position') == 'fixed';
                return !isFixed;
            });
            console.log('isFixed: ' + isFixed);
            if (isFixed && $.browser.opera) { // correction for Opera when fixed and scrolled
                $.monthpicker._pos[0] -= document.documentElement.scrollLeft;
                $.monthpicker._pos[1] -= document.documentElement.scrollTop;
            }
            var offset = {left: $.monthpicker._pos[0], top: $.monthpicker._pos[1]};
            $.monthpicker._pos = null;
            inst.msMPDiv.empty();

            // determine sizing offscreen
            inst.msMPDiv.css({position: 'absolute', display: 'block', top: '-1000px'});

            inst.msMPDiv.append(this._generateMonthpickerHTML(inst));

            console.log('offset.top: ' + offset.top);
            console.log('offset.left: ' + offset.left);
            offset = $.monthpicker._checkOffset(inst, offset, isFixed);
            var position = ($.monthpicker._inDialog && $.blockUI ? 'static' : (isFixed ? 'fixed' : 'absolute'));
            console.log('position: ' + position);
            console.log('offset.top: ' + offset.top);
            console.log('offset.left: ' + offset.left);
            var width = inst.dpDiv.innerWidth();
            inst.msMPDiv.css({position: position, display: 'none', left: offset.left + 'px', top: offset.top + 'px', width: width + 'px'});

//            inst.msMPDiv.zIndex(inst.dpDiv.zIndex()+1);
            var zIndex = inst.dpDiv.css('zIndex') + 1;
            inst.msMPDiv.css('zIndex', zIndex);
            var postProcess = function() {
                var cover = inst.msMPDiv.find('iframe.ui-monthpicker-cover'); // IE6- only
                if( !! cover.length ){
                    var borders = $.monthpicker._getBorders(inst.msMPDiv);
                    cover.css({left: -borders[0], top: -borders[1],
                        width: inst.msMPDiv.outerWidth(), height: inst.msMPDiv.outerHeight()});
                }
            };
            var duration = $.monthpicker._get(inst, 'duration');
            inst.baseYear = inst.drawYear = inst.selectedYear;
            this._selectMonth(inst, inst.selectedMonth);
            this._selectYear(inst, inst.selectedYear);
            inst.msMPDiv.show(true, $.monthpicker._get(inst, 'showOptions'), duration, postProcess);
            console.log('_showMonthYearPicker() done');
        },
//    _updateMonthpicker:function (inst) {
//        inst.dpDiv.empty().append(this._generateMonthpickerHTML(inst));
//
//    },
        _generateMonthpickerHTML:function (inst) {
            console.log('_generateMonthpickerHTML() started');
            var monthNamesShort = this._get(inst, 'monthNamesShort');
            var html = '<table border="0" cellpadding="0" cellspacing="0" class="ui-monthpicker-picker ui-helper-clearfix ui-corner-all">' +
                '<tbody>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-0" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 0 + ');">' + monthNamesShort[0] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-6" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 6 + ');">' + monthNamesShort[6] + '</button></td>' +
                '   <td class=""><button class="ui-monthpicker-picker-prev-year-cell ui-button ui-button-text-only ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickPrevYearSet(\'#' + inst.id + '\');"><</button></td><td class=""><button class="ui-monthpicker-picker-next-year-cell ui-button ui-button-text-only ui-corner-all"  onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickNextYearSet(\'#' + inst.id + '\');">></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-1" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 1 + ');">' + monthNamesShort[1] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-7" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 7 + ');">' + monthNamesShort[7] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-0" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 0 + ');"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-5" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 5 + ');"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-2" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 2 + ');">' + monthNamesShort[2] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-8" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 8 + ');">' + monthNamesShort[8] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-1" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 1 + ');"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-6" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 6 + ');"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-3" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 3 + ');">' + monthNamesShort[3] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-9" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 9 + ');">' + monthNamesShort[9] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-2" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 2 + ');"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-7" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 7 + ');"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-4" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 4 + ');">' + monthNamesShort[4] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-10" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 10 + ');">' + monthNamesShort[10] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-3" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 3 + ');"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-8" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 8 + ');"></button></td></tr>' +
                '<tr><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-5" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 5 + ');">' + monthNamesShort[5] + '</button></td><td class="ui-monthpicker-picker-month-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-month-11" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectMonth(\'#' + inst.id + '\',' + 11 + ');">' + monthNamesShort[11] + '</button></td>' +
                '   <td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-4" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 4 + ');"></button></td><td class="ui-monthpicker-picker-year-cell"><button class="ui-button ui-button-text-only ui-corner-all ui-monthpicker-picker-year-9" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickSelectYear(\'#' + inst.id + '\',' + 9 + ');"></button></td></tr>' +
                '<tr class="ui-widget-header">' +
                '<td colspan="2" class="ui-monthpicker-picker-ok-cell"><button class="ui-monthpicker-picker-ok-btn ui-widget ui-button ui-button-text-only ui-state-default ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickOk(\'#' + inst.id + '\');">OK</button></td>' +
                '<td colspan="2" class="ui-monthpicker-picker-cancel-cell"><button class="ui-monthpicker-picker-cancel-btn ui-widget ui-button ui-button-text-only ui-state-default ui-corner-all" onclick="MP_jQuery_' + mpuuid + '.monthpicker._onClickCancel(\'#' + inst.id + '\');">Cancel</button></td>' +
                '</tr>' +
                '</tbody></table>';
            console.log('_generateMonthpickerHTML() done');
            return html;
        },

        /* Check positioning to remain on screen. */
        _checkOffset: function(inst, offset, isFixed) {
            var dpWidth = inst.msMPDiv.outerWidth();
            var dpHeight = inst.msMPDiv.outerHeight();
            var inputWidth = inst.dpDiv ? inst.dpDiv.outerWidth() : 0;
            var inputHeight = inst.dpDiv ? inst.dpDiv.outerHeight() : 0;
            var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
            var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();

            offset.left -= (this._get(inst, 'isRTL') ? (dpWidth - inputWidth) : 0);
            offset.left -= (isFixed && offset.left == inst.input.offset().left) ? $(document).scrollLeft() : 0;
            offset.top -= (isFixed && offset.top == (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

            // now check if monthpicker is showing outside window viewport - move to a better place if so.
            offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
                Math.abs(offset.left + dpWidth - viewWidth) : 0);
            offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight) : 0);

            return offset;
        },
        _onClickSelectMonth: function(id, month) {
            console.log('_onClickSelectMonth() started');
            console.log('month: ' + month);
            var target = $(id);
            var inst = this._getInst(target[0]);
            inst.drawMonth = month;
            this._selectMonth(inst, inst.drawMonth);
            console.log('_onClickSelectMonth() done');
        },
        _onClickSelectYear: function(id, year) {
            console.log('_onClickSelectYear() started');
            console.log('year: ' + year);
            var target = $(id);
            var inst = this._getInst(target[0]);
            inst.drawYear = inst.baseYear - 4 + year;
            console.log('inst.drawYear: ' + inst.drawYear);
            this._selectYear(inst, inst.drawYear);
            console.log('_onClickSelectYear() done');
        },
        _onClickPrevYearSet: function(id) {
            console.log('_onClickPrevYearSet() started');
            var target = $(id);
            var inst = this._getInst(target[0]);
            inst.baseYear -= 10;
            this._selectYear(inst, inst.drawYear);
            console.log('_onClickPrevYearSet() done');
        },
        _onClickNextYearSet: function(id) {
            console.log('_onClickNextYearSet() started');
            var target = $(id);
            var inst = this._getInst(target[0]);
            inst.baseYear += 10;
            this._selectYear(inst, inst.drawYear);
            console.log('_onClickNextYearSet() done');
        },
        _onClickOk: function(id) {
            console.log('_onClickOk() started');
            var target = $(id);
            var inst = this._getInst(target[0]);
            this._selectYearMonth(inst, inst.drawYear, inst.drawMonth);
            var duration = $.monthpicker._get(inst, 'duration');
            this._updateMonthpicker(inst);
            inst.msMPDiv.hide(duration);
            console.log('_onClickOk() done');
        },
        _onClickCancel: function(id) {
            console.log('_onClickCancel() started');
            var target = $(id);
            var inst = this._getInst(target[0]);
            var duration = $.monthpicker._get(inst, 'duration');
            inst.msMPDiv.hide(duration);
            console.log('_onClickCancel() done');
        },
        _selectMonth: function(inst, month) {
            var selector = '.ui-monthpicker-picker-month-cell button';
            var elem = $(inst.msMPDiv).find(selector);
            elem.removeClass('ui-state-default');
            elem = $(inst.msMPDiv).find('.ui-monthpicker-picker-month-' + month);
            console.log(elem);
            elem.addClass('ui-state-default');
        },
        _selectYear: function(inst, year) {
            var selector = '.ui-monthpicker-picker-year-cell button';
            var elem = $(inst.msMPDiv).find(selector);
            for (var i = 0; i < 5; i++) {
                $(elem[i * 2]).text(inst.baseYear - 4 + i);
                $(elem[i * 2 + 1]).text(inst.baseYear + 1 + i);
            }
            elem.removeClass('ui-state-default');
            if (inst.drawYear - 5 < year && inst.baseYear + 6 > year) {
                var yearPosition = year - inst.baseYear + 4;
                elem = $(inst.msMPDiv).find('.ui-monthpicker-picker-year-' + yearPosition);
                console.log(elem);
                elem.addClass('ui-state-default');
            }
        },
        _selectYearMonth: function(inst, year, month) {
            inst.selectedYear = inst.baseYear = inst.drawYear = year;
            inst.selectedMonth = inst.drawMonth = month;
            var onSelect = this._get(inst, 'onSelect');
            if (onSelect) {
                onSelect.apply((inst.input ? inst.input[0] : null), [inst.selectedYear, inst.selectedMonth, inst]);  // trigger custom callback
            } else if (inst.input) {
                inst.input.trigger('change'); // fire the change event
            }
        },
        _getDefaultYM: function(inst) {
            var defaultYM1 = this._get(inst, 'defaultYearMonth');
            var defaultYM2 = new Date();
            console.log("defaultYM1: " + defaultYM1 + ", defaultYM2: " + defaultYM2);
            return this._restrictMinMax(inst,
                this._determineYM(inst, defaultYM1, defaultYM2));
        },
        /* Ensure a year & month are within any min/max bounds. */
        _restrictMinMax: function(inst, ym) {
            var minYM = this._getMinMaxYM(inst, 'min');
            var maxYM = this._getMinMaxYM(inst, 'max');
            var newYM = (minYM && ym < minYM ? minYM : ym);
            newYM = (maxYM && newYM > maxYM ? maxYM : newYM);
            return newYM;
        },
        /* Determine the current maximum YM. */
        _getMinMaxYM: function(inst, minMax) {
            return this._determineYM(inst, this._get(inst, minMax + 'YearMonth'), null);
        },
        _determineYM: function(inst, ym, defaultYM) {
            var parseNumeric = function(numVal) {
                var year = Math.floor(numVal / 100);
                var month = Math.floor(numVal % 100);
                if (month > 11) {
                    month = 11;
                } else if (month < 0) {
                    month = 0;
                }
                return Math.floor(year * 100 + month);
            };
            var parseString = function(numVal) {
                return null;
            };

            var result = null;
            if (ym != null) {
                if (typeof ym === 'number' && !isNaN(ym)) {
                    result = parseNumeric(ym);
                } else if (typeof ym === 'string') {
                    result = parseString(ym);
                } else if (typeof ym === 'object') {
                    result = ym.getFullYear() * 100 + ym.getMonth();
                }
            }
            if (result == null && defaultYM != null) {
                console.log('defaultYM: ' + defaultYM);
                if (typeof defaultYM === 'number' && !isNaN(defaultYM)) {
                    result = parseNumeric(ym);
                } else if (typeof defaultYM === 'string') {
                    result = parseString(ym);
                } else if (typeof defaultYM === 'object') {
                    result = defaultYM.getFullYear() * 100 + defaultYM.getMonth();
                }
            }
            return result;
        },
        _ym2year: function(ym) {
            return Math.floor(ym / 100);
        },
        _ym2month: function(ym) {
            return Math.floor(ym % 100);
        },
        _getYearMonthpicker: function(target) {
            var inst = this._getInst(target);
            return inst.selectedYear;
        },
        _getMonthMonthpicker: function(target) {
            var inst = this._getInst(target);
            return inst.selectedMonth;
        },
        _getYearMonthMonthpicker: function(target) {
            var inst = this._getInst(target);
            return inst.selectedYear * 100 + inst.selectedMonth;
        },
        _setYearMonthMonthpicker: function(target, ym) {
            var inst = this._getInst(target);
            if (ym != null) {
//            var year = this._ym2year(ym);
//            var month = this._ym2month(ym);
//            this._selectYearMonth(inst, year, month);
                this._setYM(inst, ym, true);
            } else {
                this._setYM(inst, this._getDefaultYM(inst), true);
            }
            this._updateMonthpicker(inst);
            this._selectMonth(inst, inst.selectedMonth);
            this._selectYear(inst, inst.selectedYear);
        }
    });


    /*
     * Bind hover events for monthpicker elements.
     * Done via delegate so the binding only occurs once in the lifetime of the parent div.
     * Global instActive, set by _updateMonthpicker allows the handlers to find their way back to the active picker.
     */
    function bindHover(dpDiv) {
        var selector = 'button, .ui-monthpicker-prev-year, .ui-monthpicker-prev-month, .ui-monthpicker-next-month, .ui-monthpicker-next-year, .ui-monthpicker-month-year-cell, .ui-monthpicker-calendar td a';
        return dpDiv.bind('mouseout', function (event) {
            var elem = $(event.target).closest(selector);
            if (!elem.length) {
                return;
            }
            elem.removeClass("ui-state-hover ui-monthpicker-prev-year-hover ui-monthpicker-prev-month-hover ui-monthpicker-next-month-hover ui-monthpicker-next-year-hover");
        }).bind('mouseover', function (event) {
                var elem = $(event.target).closest(selector);
                if ($.monthpicker._isDisabledMonthpicker(instActive.inline ? dpDiv.parent()[0] : instActive.input[0]) ||
                    !elem.length) {
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
    }

    function bindHoverPopup(mpDiv) {
        var selector = 'button, .ui-monthpicker-picker-month-cell button, .ui-monthpicker-picker-year-cell button, .ui-monthpicker-picker-prev-year-cell, .ui-monthpicker-picker-next-year-cell';
        return mpDiv.bind('mouseout',
            function (event) {
                var elem = $(event.target).closest(selector);
                if (!elem.length) {
                    return;
                }
                elem.removeClass("ui-state-hover ui-monthpicker-picker-month-cell-hover ui-monthpicker-picker-year-cell-hover ui-monthpicker-picker-prev-year-cell-hover ui-monthpicker-picker-next-year-cell-hover");
//            elem.removeClass("ui-state-default ui-corner-all");
//            elem.removeClass("ui-state-default");
//            elem.removeClass("ui-corner-all");
            }).bind('mouseover', function (event) {
                var elem = $(event.target).closest(selector);
//            if ($.monthpicker._isDisabledMonthpicker(instActive.inline ? dpDiv.parent()[0] : instActive.input[0]) ||
//                !elem.length) {
//                return;
//            }
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
    }

    /* jQuery extend now ignores nulls! */
    function extendRemove(target, props) {
        $.extend(target, props);
        for (var name in props) {
            if (props[name] == null || props[name] === undefined) {
                target[name] = props[name];
            }
        }
        return target;
    }


    /* Invoke the monthpicker functionality.
     @param  options  string - a command, optionally followed by additional parameters or
     Object - settings for attaching new monthpicker functionality
     @return  jQuery object */
    $.fn.monthpicker = function(options){
        console.log('$.fn.monthpicker() started');

        /* Verify an empty collection wasn't passed - Fixes #6976 */
        if ( !this.length ) {
            return this;
        }

        /* Initialise the date picker. */
        if (!$.monthpicker.initialized) {
            $(document).mousedown($.monthpicker._checkExternalClick).
                find('body').append($.monthpicker.dpDiv);
            $.monthpicker.initialized = true;
        }

        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options === 'string' && (options == 'isDisabled' || options == 'getYear' || options == 'getMonth' || options == 'getYearMonth' || options == 'widget')) {
            return $.monthpicker['_' + options + 'Monthpicker'].apply($.monthpicker, [this[0]].concat(otherArgs));
        }
        if (options === 'option' && arguments.length === 2 && typeof arguments[1] === 'string') {
            return $.monthpicker['_' + options + 'Monthpicker'].apply($.monthpicker, [this[0]].concat(otherArgs));
        }
        var result = this.each(function() {
            typeof options === 'string' ?
                $.monthpicker['_' + options + 'Monthpicker'].apply($.monthpicker, [this].concat(otherArgs)) : $.monthpicker._attachMonthpicker(this, options);
        });
        console.log('$.fn.monthpicker() done');
        return result;
    };


    $.monthpicker = new Monthpicker(); // singleton instance
    $.monthpicker.initialized = false;
    $.monthpicker.uuid = new Date().getTime();
    $.monthpicker.version = "@VERSION";

// Add another global to avoid noConflict issues with inline event handlers
    window['MP_jQuery_' + mpuuid] = $;
})(jQuery);
