
function clear(){
  $.ajax("/delete", {
    type: "DELETE"
  })
}

$("#article").on("click", function() {
  // clear();

  $.ajax({
    method: "GET",
    url: "/articles/"
  })
  .then(function (article) {

    $.ajax("/scrape", {
      method: "get"
    })
   
    console.log(article);
  for(let i = 0; i < 10; i++){
    let div = $("div")
    div.addClass("print");

    $("#main").show();
    $(".print").append(`</a href="${article[0].link[i]}"><h2> ${article[0].headline[i]} </h2></a>`);
    $(".print").append(`<h3> ${article[0].author[i]} </h3>`);
    $(".print").append(`<p> ${article[0].summary[i]} </p>`);
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
  $("#main").hide();
})
  