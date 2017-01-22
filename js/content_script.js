$(document).ready(function() {
	var imageUrl = chrome.extension.getURL("images/moreInfo.png");
	let buttonCss = {
		"height": 23,
		"width": 23,
		"border": "none",
		"outline": "none",
		"background": `url(${imageUrl}) no-repeat center center`,
		"background-size": '20px 20px'
	};

	$.each($(".searchResult"), function () {
		var link = $(this).find('td:eq(2)').find('a');
		$(`<button> </button>`).css(buttonCss).insertAfter(link);

	});
});
