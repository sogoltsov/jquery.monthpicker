/**
 * Russian (UTF-8) initialisation for the monthpicker component
 * @author sogoltsov
 * @created 5/28/12 2:28 PM
 */
jQuery(function($){
    $.monthpicker.regional['ru'] = {
        closeText: 'Закрыть',
        prevText: '&#x3c;Пред',
        nextText: 'След&#x3e;',
        monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
            'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
            'Июл','Авг','Сен','Окт','Ноя','Дек'],
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''};
    $.monthpicker.setDefaults($.monthpicker.regional['ru']);
});
