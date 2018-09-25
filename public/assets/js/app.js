
function clear(){
  $.ajax("/delete", {
    type: "DELETE"
  })
}

$("#article").on("click", function() {
  // clear();

  $.ajax({
    url: "/articles/",
    method: "GET"
  })
  .then(function (data) {

    $.ajax("/scrape", {
      method: "get"
    })
    $(".main-box").show();
    for (var i = 0; i < data.length; i++) {
      $(".main-box").append(
    ` <div class="header-box">
        <a class="link" href="${data[i].link} target="_blank"><h1 class="headline">${data[i].headline}</h1></a>
      </div>
      <div>
        <h3 class="author">${data[i].author}</h3>
        <p class="summary">${data[i].summary}</p>
    </div>`
      );

      }
  });
});



// $("#article").on("click", function() {
//   $.ajax("/scrape", {
//     type: "string"
//   })
//   window.location.reload();
// })




$("#clear").on("click", function() {
 clear();

  $(".main-box").hide();
})
  