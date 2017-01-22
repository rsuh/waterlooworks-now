/* This function returns the html without opening a new tab for the page
 * accessed the param url. It is assumed that for WaterlooWorks the url will have
 * the format like <baseWaterlooWorksUrl>?<QueryParam>

 * @param {String} url - page url whose html we need to return
 * @return {String} - string defining the html of the page
 */
function getJobPostingHTML(url) {

  return $.get(url, function(html) {
    return html;
  })
  .then((initialHTML) => {
    var parsedInitialHtml = $.parseHTML(initialHTML);
    var inputNameValues = new Object;

    $.each(parsedInitialHtml[0], function(i, el) {
      if (el.nodeName.toLowerCase() === "input") {
        inputNameValues[el.name] = el.value;
      }
    });

    return $.ajax({
      type: "POST",
      url: "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm",
      data: inputNameValues
    });
  })
}


/* This function returns an array which contains the information to show.

 * @param {String} html - html to be parsed so we can find the appropriate information.
 * @return {Array<Object>} - Returns an Array of Objects which are of the following format
 *   {
        title: <Title>,
        content: <Content Value>
        ...
        ...
     }
 */
function getParsedHTMLTable(html) {
  var postingDivHtml = $($('#postingDiv', $(html))[0].innerHTML);

  var nodeFilter =  function(el, section) {
    if (el.nodeName.toLowerCase() === "div" && el.className === "panel panel-default"
      && el.innerText.includes(section)) {
      return true;
    } else {
      return false;
    }

  }

  var jobPostingNode = null;
  var companyInfoNode = null;

  $.each(postingDivHtml, function(i, el) {

    if (jobPostingNode && companyInfoNode) return false;

    if (nodeFilter(el, "Job Posting Information")) {
      jobPostingNode = el;
    } else if (nodeFilter(el, "Company Information")) {
      companyInfoNode = el;
    }

  });


  //Get the "Job Posting Information" table
  var jobPostingTableHtml = $(Array.prototype.slice.call($(jobPostingNode)[0].childNodes).find(node => {
    if (node.nodeName.toLowerCase() === "div" && node.className === "panel-body") {
      return node.innerHTML;
    }
  }))[0].innerHTML;

  //Get the "Company Information" table
  var companyInfoTableHtml = $(Array.prototype.slice.call($(companyInfoNode)[0].childNodes).find(node => {
    if (node.nodeName.toLowerCase() === "div" && node.className === "panel-body") {
      return node.innerHTML;
    }
  }))[0].innerHTML;


  var infoValueHTMLArray = [];

  const infoToInclude = ["Job Title", "Job - City", "Special Job Requirements", "Required Skills",
   "Job Responsibilities", "Compensation and Benefits Information"];

  // Assuming table has rows with two columns. First column describes the actual title such as "Location"
  // and the second column has the value such as "London" in html

  $('tr', $(jobPostingTableHtml)).toArray().forEach(row => {
    for(var i = 0; i < infoToInclude.length; i++) {
      if (row.children[0].innerHTML.toLowerCase().includes(infoToInclude[i].toLowerCase())) {
        infoValueHTMLArray.push({
          "title": infoToInclude[i],
          "content": row.children[1].innerHTML
        });
        break;
      }
    }
  });

  $('tr', $(companyInfoTableHtml)).toArray().forEach(row => {
    if (row.children[0].innerHTML.toLowerCase().includes("organization")) {
      infoValueHTMLArray.push({
        "title": "Organization",
        "content": row.children[1].innerHTML
      });
    }
  })

  return infoValueHTMLArray;

}

// const baseWaterlooWorksUrl = "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm";
// var testurl = baseWaterlooWorksUrl + "?action=_-_-xps-CTTTkwP8nQhDoJIOewbWnqrPuPQRFrDd44kyFmhUvbQuOeYbflR2oDiXWCHcVP-yKde07ohfviclaCOPCWOGX-p3HYVMdVhYeL0uqc8DWUdZ7IZFPq4K3A5a5ASN3lzb_WdIIpcA3e0uLeJ-L7vsShVCWtiE995ywlq-jA&initialSearchAction=displayMyProgramJobs&searchType=&accessToPostings=infoForPostings&postingId=5048&npfGroup=&sortDirection=Reverse";

// getJobPostingHTML(testurl)
// .then(html => {
//   var info = getParsedHTMLTable(html);
//   console.log(info);
// });



$(document).ready(function() {
	var moreInfoImageUrl = chrome.extension.getURL("images/moreInfo.png");
	let buttonCss = {
		"height": 23,
		"width": 23,
		"border": "none",
		"outline": "none",
		"background": `url(${moreInfoImageUrl}) no-repeat center center`,
		"background-size": '20px 20px'
	};

	$.each($(".searchResult"), function () {
		var link = $(this).find('td:eq(2)').find('a');
		$(`<button> </button>`).css(buttonCss).insertAfter(link);

	});
});

