// раскрытие выпадающего списка
$(document).ready(function() {
    $('.input-container').each(function(i) {
        $(this).on('click', function() {
            $('.input-list').eq(i).slideToggle(500);
            $('.input__arrow').eq(i).toggleClass('input__arrow--up');
        });
    });
    $('.input-list-values').each(function(i) {
        $(this).on('click', function() {
            $('.input-list').eq(i).slideUp(500);
            $('.input__arrow').eq(i).removeClass('input__arrow--up');
        });
    });

    $('.contact-info-item-tel-mask').each(function(i) {
        $(this).on('click', function() {
            $('.contact-info-item-tel-list').eq(i).slideToggle(500);
            $('.contact-info-item-tel-mask__arrow').eq(i).toggleClass('contact-info-item-tel-mask__arrow--up');
        });
    });
    $('.input-list-countries').each(function(i) {
        $(this).on('click', function() {
            $('.contact-info-item-tel-list').eq(i).slideUp(500);
            $('.contact-info-item-tel-mask__arrow').eq(i).removeClass('contact-info-item-tel-mask__arrow--up');
        });
    });
});
// end

// заполнение инпута вариантом из выпадающего списка
const lists = document.querySelectorAll('.input-list-values');
const listInput = document.querySelectorAll('.input__list');
if (lists) {
    lists.forEach((item, i) => {
        Array.from(item.children).forEach(elem => {
            elem.addEventListener('click', () => {
                listInput[i].value = elem.innerHTML;
            })
        });
    });
}
// end

// заполнение поля маски телефонного номера флагом выбранной страны
const countries = document.querySelectorAll('.input-list-countries__value');
const flag = document.querySelector('.contact-info-item-tel-mask__flag');
const flagList = document.querySelectorAll('.input-list__flag');
if (countries) {
    countries.forEach((item, i) => {
        item.addEventListener('click', () => {
            flag.innerHTML = flagList[i].innerHTML;
        });
    });
}
// end

// поиск в выпадающем списке
const searchInput = document.querySelector('.input-list__search');
const searchList = document.querySelector('.search-list');
const inputWithSearch = document.querySelector('.input-with-search');
let arr = [];
if (searchList) {
    Array.from(searchList.children).forEach(item => {
        arr.push(item);
    });
    searchInput.addEventListener('input', () => {
        searchList.innerHTML = '';
        if (searchInput.value.length === 0) {
            arr.forEach(item => {
                searchList.innerHTML += `<div class="input-list__item">${item.innerHTML}</div>`;
            });
        } else {
            arr.forEach(item => {
                if (item.innerHTML.toLowerCase().includes(searchInput.value.toLowerCase())) {
                    searchList.innerHTML += `<div class="input-list__item">${item.innerHTML}</div>`;
                }
            });
        }
        for (let node of searchList.childNodes) {
            if (node.nodeName == '#text') {
                continue;
            }
            node.addEventListener('click', () => {
                inputWithSearch.value = node.innerHTML;
            })
        }
    });
}
// end

// подсчёт введённых в textarea символов
const textarea = document.querySelectorAll('.comment');
const count = document.querySelectorAll('.count');

if (textarea) {
    textarea.forEach((item, i) => {
        item.addEventListener('input', () => {
            const textLength = item.value.length;
            count[i].innerHTML = `${textLength}`;
        })
    })
}
// end

/* begin popup */
var popupAjax = (function() {
    init = function() {
      $(".popup").magnificPopup({
        type: "inline",
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: "scroll",
        showCloseBtn: false,
        preloader: false,
        midClick: true,
        removalDelay: 300,
        mainClass: "my-mfp-zoom-in"
      });
  
      $(".popup__close").on( "click", function() {
        $.magnificPopup.close();
      });
      $(".popup--close").on( "click", function() {
        $.magnificPopup.close();
      });
      $(".popup .link--back").on( "click", function(e) {
        e.preventDefault()
        $.magnificPopup.close();
      });
      $(".button-popup__close").on( "click", function() {
        $.magnificPopup.close();
      });
    };
  
    return {
      init: init
    }
})();

popupAjax.init();

function closePopup() {
  $.magnificPopup.close()
}

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