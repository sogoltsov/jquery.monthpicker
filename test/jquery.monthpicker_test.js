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

    module('jQuery#monthpicker', {
        setup:function () {
            this.elems = $('#qunit-fixture').children();
        }
    });

    test("widget method", function () {
        var actual = $("#mp1").monthpicker().monthpicker("widget")[0];
        deepEqual($("#mp1 > .ui-monthpicker:last")[0], actual);
    });

/*
    test('is chainable', 1, function () {
        // Not a bad test to run on collection methods.
        strictEqual(this.elems.awesome(), this.elems, 'should be chaninable');
    });

    test('is awesome', 1, function () {
        strictEqual(this.elems.awesome().text(), 'awesomeawesomeawesome', 'should be thoroughly awesome');
    });

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
