/* This function returns the html without opening a new tab for the page
 * accessed the param url. It is assumed that for WaterlooWorks the url will have
 * the format like <baseWaterlooWorksUrl>?<QueryParam>

 * @param {String} url - page url whose html we need to return
 * @return {String} - string defining the html of the page */
function getJobPostingHTML(url) {

  return $.get(url, function(html) {
    return html;
  })
  .then((initialHTML) => {
    var parsedInitialHtml = $.parseHTML(initialHTML);
    var inputNameValues = new Object;

    $.each(parsedInitialHtml[0], function(i, el) {
      inputNameValues[el.name] = el.value;
    });

    return $.ajax({
      type: "POST",
      url: "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm",
      data: inputNameValues
    });
  })

}

// const baseWaterlooWorksUrl = "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm";
// var testurl = baseWaterlooWorksUrl + "?action=_-_-xps-CTTTkwP8nQhDoJIOewbWnqrPuPQRFrDd44kyFmhUvbQuOeYbflR2oDiXWCHcVP-yKde07ohfviclaCOPCWOGX-p3HYVMdVhYeL0uqc8DWUdZ7IZFPq4K3A5a5ASN3lzb_WdIIpcA3e0uLeJ-L7vsShVCWtiE995ywlq-jA&initialSearchAction=displayMyProgramJobs&searchType=&accessToPostings=infoForPostings&postingId=5048&npfGroup=&sortDirection=Reverse";

// getJobPostingHTML(testurl).then((result) => {
//   console.log(result);
// });

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

