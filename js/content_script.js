
// var element = document.getElementsByClassName("searchResult")[0];

// var infoButton = document.createElement("BUTTON");
// infoButton.style = "background: ../Assets/infoButton.png; padding: 0.5em 1em";
// element.children[2].appendChild(infoButton);

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
		// $(this).find('td:eq(2)').find('a')
		// .append($(`<button> </button>`).css(buttonCss));

		var link = $(this).find('td:eq(2)').find('a');
		$(`<button> </button>`).css(buttonCss).insertAfter(link);

	});
});
