/* This function returns the html without opening a new tab for the page
 * accessed the param url. It is assumed that for WaterlooWorks the url will have
 * the format like <baseWaterlooWorksUrl>?<QueryParam>

 * @param {String} url - page url whose html we need to return
 * @return {String} - string defining the html of the page
 */
function getJobPostingHTML(url) {
	return $.get(url, function(html) {
		return html;
	}).then((initialHTML) => {
		var parsedInitialHtml = $.parseHTML(initialHTML);
		var inputNameValues = new Object;

		$.each(parsedInitialHtml[0], function(i, el) {
			if (el && el.nodeName && el.nodeName.toLowerCase() === "input") {
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
function getInformationArray(html) {
	var postingDivHtml = $($('#postingDiv', $(html))[0].innerHTML);

	var nodeFilter =  function(el, section) {
		if (el && el.nodeName && el.nodeName.toLowerCase() === "div" &&
            el.className && el.className === "panel panel-default" &&
            el.innerText && el.innerText.includes(section)) {
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
	var jobPostingTableHtml = $(Array.prototype.slice
		.call($(jobPostingNode)[0].childNodes)
		.find(node => {
	  	if (node && node.nodeName && node.className &&
            node.nodeName.toLowerCase() === "div" && node.className === "panel-body") {
	  		return node.innerHTML;
	  	}
	}))[0].innerHTML;

	//Get the "Company Information" table
	var companyInfoTableHtml = $(Array.prototype.slice
		.call($(companyInfoNode)[0].childNodes)
		.find(node => {
  		if (node && node.nodeName && node.className &&
            node.nodeName.toLowerCase() === "div" && node.className === "panel-body") {
  			return node.innerHTML;
  		}
  	}))[0].innerHTML;


  	var infoValueHTMLArray = [];
  	const infoToInclude = ["Job Title",
						  	"Job - City",
						  	"Special Job Requirements",
						  	"Required Skills",
							"Job Responsibilities",
							"Compensation and Benefits Information"];

	// Assuming table has rows with two columns. First column describes the actual title such as "Location"
	// and the second column has the value such as "London" in html

	$('tr', $(jobPostingTableHtml)).toArray().forEach(row => {
		for(var i = 0; i < infoToInclude.length; i++) {
			if (row && row.children && row.children[0] && row.children[0].innerHTML &&
                row.children[0].innerHTML.toLowerCase().includes(infoToInclude[i].toLowerCase()) && row.children[1]) {
				infoValueHTMLArray.push({
					"title": infoToInclude[i],
					"content": row.children[1].innerHTML
				});
				break;
			}
		}
	});

	$('tr', $(companyInfoTableHtml)).toArray().forEach(row => {
		if (row && row.children && row.children[0] && row.children[0].innerHTML &&
            row.children[0].innerHTML.toLowerCase().includes("organization") && row.children[1]) {
			infoValueHTMLArray.push({
				"title": "Organization",
				"content": row.children[1].innerHTML
			});
		}
	})

	return infoValueHTMLArray;
}

/* This function fetches company info from glassdoor

 * @param {String} companyName - name of the company to search for
 * @return {String} - ajax promise of the api call
*/
function getGlassDoorInfo(companyName) {
	let parameters = {
		"t.p": 117950,
		"t.k": "ghr6GS8Qyqq",
		"userip": "0.0.0.0",
		useragent: "Mozilla/5.0 (X11, Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36",
		format: "json",
		version: 1,
		action: "employers",
		q: companyName
	}

	return $.ajax({
			type: "GET",
			url: "https://api.glassdoor.com/api/api.htm",
			data: parameters
	});
}

/* This function fetches data about job, parses the html and populates info modal

 * @param {String} url - page url for job posting
 */
function showJobInfoModal(url) {
	$("#jobInfoModal").html("");
	getJobPostingHTML(url).then((result) => {
		let templateURL = chrome.extension.getURL("overlay_template.html")
		$.get(templateURL, function(template) {
			let infoArray = getInformationArray(result);
			let companyName = ""
			let city = ""
			let jobTitle = ""
			var rowHTML = ""
			for (var i = 0; i < infoArray.length; i++) {
				let row = infoArray[i];
				if (row.title.toLowerCase() === "organization") {
					companyName = row.content;
				} else if (row.title.toLowerCase() === "job title") {
					jobTitle = row.content;
				} else if (row.title.toLowerCase() === "job - city") {
					city = row.content;
				} else {
				rowHTML +=
					`<tr >
						<td class="col-xs-3">${row.title}</td>
						<td class="col-xs-9 breakWord">${row.content}</td>
					</tr>`;
				}
			}
			var templateDictioary = {
				companyName: companyName,
				jobTitle: jobTitle,
				city: city,
				tableContent: rowHTML
			};
			getGlassDoorInfo(companyName).then((result) => {
				let perfectMatch = result.response.employers.find(employer => {
					return employer.exactMatch;
				});
				// let glassDoorLink = result.response.attributionURL;
				templateDictioary["glassDoorLink"] = result.response.attributionURL;
				if (perfectMatch != null) {
					templateDictioary["glassDoorRating"]
						= perfectMatch.overallRating !== null
						&& perfectMatch.overallRating !== "0"
						&& perfectMatch.overallRating !== ""
						? perfectMatch.overallRating : null;
					templateDictioary["squareLogo"]
						= perfectMatch.squareLogo !== null
						&& perfectMatch.squareLogo !== ""
						? perfectMatch.squareLogo : null;
					if (perfectMatch.website !== null
						&& perfectMatch.website !== "") {
						let companyWebsite = perfectMatch.website;
						if (companyWebsite.indexOf("http") === -1) {
							companyWebsite = "https://" + companyWebsite;
						}
						templateDictioary["companyWebsite"] = companyWebsite;
					}
				}

				let rendered = Mustache.render(template, templateDictioary);
				$("#jobInfoModal").append(rendered);
			}, (error) => {
				let rendered = Mustache.render(template, templateDictioary);
				$("#jobInfoModal").append(rendered);
			});
		}).then(() => {
			$("#waitingIcon").fadeOut("slow");
        })
	});
}

/* This function inserts info buttons into the page along with the action when clicking the button */
function insertInfoButtons() {
	let moreInfoImageUrl = chrome.extension.getURL("images/moreInfo.png");
	let buttonCss = {
		"background": `url(${moreInfoImageUrl}) no-repeat center center`,
		"background-size": '20px 20px'
	};

	$.each($(".searchResult"), function () {
		let indexOfJobTitle = $("th:contains('Job Title')").index();
		var link = $(this).find(`td:eq(${indexOfJobTitle})`).find('a')[0];
		$(`<button> </button>`)
		.addClass("infoButton btn-info btn-lg")
		.css(buttonCss)
		.attr({"data-toggle": "modal", "data-target": "#jobInfoModal"})
		.click(function() {
			showJobInfoModal(link.href);
		})
		.insertAfter(link);
	});
}

/* This function inserts content css link into the page */
function insertContentCSSLink() {
	let cssURL = chrome.extension.getURL("css/content.css");
	let titleTag = $("head").find("title");
	$('<link> </link>')
	.attr({"href": cssURL, "rel": "stylesheet"})
	.insertAfter(titleTag);
}

/* This function inserts a blank overlay into the page */
function insertOverlayDiv() {
    //loading icon thing for job info modal
    $("body").prepend("<div id='waitingIcon' style='display: none;'></div>");

	$(`<div></div>`)
	.addClass("modal")
	.attr({"id": "jobInfoModal", "role": "dialog"})
	.appendTo($("body"));

}

/* This function inserts a callback to the onclick handler for page changing.
 * As a hacky solution, currently the callback refreshes the entire page to
 * re-add buttons.
 */
function insertCallBackToReAddButtonsOnPagination() {
	$("<script> function reloadPage() { location.reload() } </script>").appendTo("head");

    var passTheCallBack = function(a) {
        var oldFunction = $(a).attr('onclick');
        if (typeof oldFunction === "string") {
            var newFunction = oldFunction.replace("null", "reloadPage");
            $(a).attr("onclick", newFunction);
        }
    };

	$(".pagination a").toArray().forEach(a => {
        passTheCallBack(a);
	});

    $("#postingsTable thead a").toArray().forEach(a => {
        passTheCallBack(a);
    });

}

/* This function is used to show insert an event listener. The purpose is to show
 * the loading spinner whent he modal dialog for job info is loading.
 */
function initializeEventListenerForModal() {
    // we want to wait for the gray scrollable area to appear to show the
    // waiting spinning icon.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes) return

            for (var i = 0; i < mutation.addedNodes.length; i++) {
              // do things to your newly added nodes here
              var node = mutation.addedNodes[i]

              if (node.className === "modal-scrollable") {
                $("#waitingIcon").css('display', 'block');
              }
            }
        })
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
}

$(document).ready(function() {
	insertContentCSSLink();
	insertOverlayDiv();
	insertInfoButtons();
	insertCallBackToReAddButtonsOnPagination();
    initializeEventListenerForModal();
});


