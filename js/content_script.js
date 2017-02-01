var reloadTimeout = null;
var renderTimeout = null;

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
    var applicationInfoNode = null;

    $.each(postingDivHtml, function(i, el) {
     	if (jobPostingNode && companyInfoNode) return false;

     	if (nodeFilter(el, "Job Posting Information")) {
     		jobPostingNode = el;
     	} else if (nodeFilter(el, "Company Information")) {
     		companyInfoNode = el;
     	} else if (nodeFilter(el, "Application Information")) {
            applicationInfoNode = el;
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

    //Get the "Application Information" table
    var applicationInfoTableHtml = $(Array.prototype.slice
        .call($(applicationInfoNode)[0].childNodes)
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
    // TODO; We can probably abstract this code out.
    $('tr', $(applicationInfoTableHtml)).toArray().forEach(row => {
        if (row && row.children && row.children[0] && row.children[0].innerHTML &&
            row.children[0].innerHTML.toLowerCase().includes("application documents required") && row.children[1]) {
            infoValueHTMLArray.push({
                "title": "Application Documents Required",
                "content": row.children[1].innerHTML
            });
        }
    })


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
	clearTimeout(renderTimeout);

	$("#jobInfoModal").html('<div class="sk-circle">\
        <div class="sk-circle1 sk-child"></div>\
        <div class="sk-circle2 sk-child"></div>\
        <div class="sk-circle3 sk-child"></div>\
        <div class="sk-circle4 sk-child"></div>\
        <div class="sk-circle5 sk-child"></div>\
        <div class="sk-circle6 sk-child"></div>\
        <div class="sk-circle7 sk-child"></div>\
        <div class="sk-circle8 sk-child"></div>\
        <div class="sk-circle9 sk-child"></div>\
        <div class="sk-circle10 sk-child"></div>\
        <div class="sk-circle11 sk-child"></div>\
        <div class="sk-circle12 sk-child"></div>\
      </div>');
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
				tableContent: rowHTML,
                jobUrl: url,
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
				renderTimeout = setTimeout(function () {
					$("#jobInfoModal").html(rendered);

				}, 600);
			}, (error) => {
				let rendered = Mustache.render(template, templateDictioary);
				renderTimeout = setTimeout(function () {
					$("#jobInfoModal").html(rendered);
				}, 600);
			});
		})
	});
}

/* This function inserts info buttons into the page along with the action when
clicking the button */
function insertInfoIcons() {
	// gaurd to make sure we are not adding buttons more than once
	if ($('.infoIcon')[0]) { return; }

	$.each($(".searchResult"), function () {
		let indexOfJobTitle = $("th:contains('Job Title')").index();
		var link = $(this).find(`td:eq(${indexOfJobTitle})`).find('a')[0];
        $(`<i class="infoIcon fa fa-info-circle"></i>`)
		.attr({"data-toggle": "modal", "data-target": "#jobInfoModal"})
		.click(function() {
			showJobInfoModal(link.href);
		})
		.insertAfter(link);
	});
	clearTimeout(reloadTimeout);
}

/* This function inserts css links into the page */
function insertCSSLinks() {
    let titleTag = $("head").find("title");

	$('<link> </link>')
	.attr({"href": chrome.extension.getURL("css/spinkit.css"), "rel": "stylesheet"})
	.insertAfter(titleTag);

    //content.css
	$('<link> </link>')
	.attr({"href": chrome.extension.getURL("css/content.css"), "rel": "stylesheet"})
	.insertAfter(titleTag);

    //font-awesome css
    $('<link> </link>')
    .attr({"href": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css", "rel": "stylesheet"})
    .insertAfter(titleTag);
}

/* This function inserts a blank modal into the page */
function insertModalDiv() {
	$(`<div></div>`)
	.addClass("modal fade")
	.attr({"id": "jobInfoModal", "role": "dialog"})
	.appendTo($("body"));
}

/* This function adds a listener to DOMSubtreeModified so when user reloads \
 * table by changing page, shortlisting or re-sorting, we re-add our ui
 * @param {String} element - element string of container to watch
 * @param {String} reloadFunction - function to be called when subtree is modified
 */
 function addReloadListener(element, reloadFunction) {
 	 $(element).on("DOMSubtreeModified", function() {
        if(reloadTimeout) {
            clearTimeout(reloadTimeout);
        }
        reloadTimeout = setTimeout(reloadFunction, 700);
    });
 }


/* This function removes the "view" button from interviews page and 
 * makes the whole row clickable.
 */
function addInterviewsClickHandler() {
	if ($('tbody tr:eq(0) td:eq(0) a:eq(0)').length == 0) {
		return;
	}

	$('thead td:eq(0)').remove();
	$.each($('tbody tr'), function (index, row) {
		console.log("4")
		$(this).attr("onclick", $(this).find('td:eq(0) a:eq(0)').attr("onclick"));
		$(this).find("td:eq(0)").remove();
	});
	clearTimeout(reloadTimeout);
}


$(document).ready(function() {
    if ($("#postingsTablePlaceholder").length) { // postings
        insertCSSLinks();
        insertOverlayDiv();
        insertInfoIcons();
        addReloadListener('.container-fluid', insertInfoIcons);
    } else if($('#ccrm_studentInterviews').length) { // interviews
    	addInterviewsClickHandler();
    	addReloadListener('#ccrm_studentInterviews', addInterviewsClickHandler);
    } else {
    }
});
