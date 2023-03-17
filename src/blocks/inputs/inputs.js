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
