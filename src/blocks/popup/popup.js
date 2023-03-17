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
