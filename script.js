$(document).ready(function(){
	var root = $('html, body');
	$("#sidebar li").click(function () {
		var link = $(this).text();
		var offset = $("h1").filter(function() {
			return $(this).text() == link;
		}).offset().top;
		root.animate({scrollTop: offset}, 500);
	});
});