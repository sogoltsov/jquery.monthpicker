/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function ($) {

    /*
     ======== A Handy Little QUnit Reference ========
     http://docs.jquery.com/QUnit

     Test methods:
     expect(numAssertions)
     stop(increment)
     start(decrement)
     Test assertions:
     ok(value, [message])
     equal(actual, expected, [message])
     notEqual(actual, expected, [message])
     deepEqual(actual, expected, [message])
     notDeepEqual(actual, expected, [message])
     strictEqual(actual, expected, [message])
     notStrictEqual(actual, expected, [message])
     raises(block, [expected], [message])
     */

    module('jQuery.monthpicker', {
/*
        setup:function () {
            this.elems = $('#qunit-fixture').children();
        }
*/
    });

    test("widget method", function () {
        var mp = $("#mp1").monthpicker();
        var actual = mp.monthpicker("widget")[0];
        deepEqual($("#mp1.ui-monthpicker:last")[0], actual);
        mp.monthpicker('destroy').remove();
    });

    test("destroy", function() {
        $("<div></div>").appendTo('body').monthpicker().monthpicker("destroy").remove();
        ok(true, '.monthpicker("destroy") called on element');

        $([]).monthpicker().monthpicker("destroy").remove();
        ok(true, '.monthpicker("destroy") called on empty collection');

        $('<div></div>').appendTo('body').remove().monthpicker().monthpicker("destroy").remove();
        ok(true, '.monthpicker("destroy") called on disconnected DOMElement');

        var expected = $('<div></div>').monthpicker(),
            actual = expected.monthpicker('destroy');
        equal(actual, expected, 'destroy is chainable');
    });

    test("year, month and yearMonth methods", function () {
        var actual = $("<div></div>").appendTo('body').monthpicker({defaultYear: 2001, defaultMonth: 3});
        equal(actual.monthpicker('year'), 2001);
        equal(actual.monthpicker('month'), 3);
        equal(actual.monthpicker('yearMonth'), 200103);
        actual.monthpicker('yearMonth', 197411);
        equal(actual.monthpicker('year'), 1974);
        equal(actual.monthpicker('month'), 11);
        actual.monthpicker("destroy").remove();
    });

    test('is chainable', 1, function () {
        var actual = $("<div></div>").appendTo('body').monthpicker();
        strictEqual(actual.monthpicker(), actual, 'should be chaninable');
        actual.monthpicker("destroy").remove();
    });

    test('text representation', 1, function () {
        var actual = $("<div></div>").appendTo('body').monthpicker().monthpicker('yearMonth', 201301);
        strictEqual(actual.text(), "<<<2013\u00a0February>>>", 'should be thoroughly <<<2013\u00a0February>>>');
        actual.monthpicker("destroy").remove();
    });

    /*
    module('jQuery.awesome');

    test('is awesome', 1, function () {
        strictEqual($.awesome(), 'awesome', 'should be thoroughly awesome');
    });

    module(':awesome selector', {
        setup:function () {
            this.elems = $('#qunit-fixture').children();
        }
    });

    test('is awesome', 1, function () {
        // Use deepEqual & .get() when comparing jQuery objects.
        deepEqual(this.elems.filter(':awesome').get(), this.elems.last().get(), 'knows awesome when it sees it');
    });
*/

}(jQuery));
