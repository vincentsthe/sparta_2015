$('.form').each(function() {
    var $this   = $(this);
    var $slides = $this.find('.form-slide');
    var buttonArray = [];
    var currentIndex = 0
    var $next = $('.form-btn-next');
    var $prev = $('.form-btn-prev')
    var $submit = $('.form-btn-submit');

    $prev.hide();
    $submit.hide();

    function move(newIndex) {
      if (currentIndex === newIndex) {
        return;
      }

      if (newIndex === 0) {
        $prev.hide();
      } else {
        $prev.show();
      }

      if (newIndex === buttonArray.length - 1) {
        $next.hide();
        $submit.show();
      } else {
        $next.show();
        $submit.hide();
      }

      buttonArray[currentIndex].removeClass('active');
      buttonArray[newIndex].addClass('active');

      $slides.eq(currentIndex).removeClass('active');
      $slides.eq(newIndex).addClass('active');

      currentIndex = newIndex;
    }


    $.each($slides, function(index) {
      var $button = $('<button type="button" class="slide-btn">&bull;</button>');
      if (index === currentIndex) {
        $button.addClass('active');
      }
      $button.on('click', function() {
        move(index);
      }).appendTo('.slide-buttons');
      buttonArray.push($button);
    });

    $next.on('click', function() {
      if (currentIndex !== buttonArray.length - 1) {
        move(currentIndex + 1);
        $("#progressbar li").eq(currentIndex).addClass("active");
      }
    });

    $prev.on('click', function() {
      if (currentIndex !== 0) {
        move(currentIndex - 1);
        $("#progressbar li").eq(currentIndex + 1).removeClass("active");
      }
    });
});

$(document).ready(function() { 
  $("#member-list").tablesorter({
    sortList: [[1, 0]], 
    // pass the headers argument and assing a object 
    headers: { 
      // assign the secound column (we start counting zero) 
      0: { 
          // disable it by setting the property sorter to false 
        sorter: false 
      }
    } 
  }); 

  $('.sign-in').on('click', function() {
    $('.wrapper').addClass('blurred');
  });  

  $('.close').on('click', function() {
    $('.wrapper').removeClass('blurred');
  });
  
  // hide flash message
  setTimeout(function() {
    $('.alert-wrapper').fadeOut('slow', function() {
      $(this).remove();
    });
  }, 2000);  
}); 