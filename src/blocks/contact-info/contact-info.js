// телефонная маска
$(document).ready(function() {
    $.mask.definitions['9'] = false;
    $.mask.definitions['*'] = '[0-9]';
    $('input[name=phone]').mask('+7 *** ***-**-**');
    $.fn.setCursorPosition = function(pos) {
        if ($(this).get(0).setSelectionRange) {
          $(this).get(0).setSelectionRange(pos, pos);
        } else if ($(this).get(0).createTextRange) {
          var range = $(this).get(0).createTextRange();
          range.collapse(true);
          range.moveEnd('character', pos);
          range.moveStart('character', pos);
          range.select();
        }
    };
    $('input[name=phone]').click(function() {
        $(this).setCursorPosition(3);
    });
    $('.input-list-countries__value').each(function(i) {
        $(this).on('click', function() {
            var countryCode = $('.input-list__code').eq(i).html();
            $('input[name=phone]').val('');
            $('input[name=phone]').mask(`${countryCode} *** ***-**-**`);
            $('input[name=phone]').attr("placeholder", `${countryCode} ___ ___-__-__`);
            $('input[name=phone]').click(function(){
                $(this).setCursorPosition(countryCode.length + 1);
            });
        });
    });
});
// end