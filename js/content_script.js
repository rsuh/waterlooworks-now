var reloadTimeout = null;
var renderTimeout = null;

/* This function returns the html without opening a new tab for the page
 * accessed the param url. It is assumed that for WaterlooWorks the url will have
 * the format like <baseWaterlooWorksUrl>?<QueryParam>

 * @param {String} url - page url whose html we need to return
 * @return {String} - string defining the html of the page
 */
function makePostingHtmlCall(params) {
    return $.ajax({
        type: "POST",
        url: API_URLS.WATERLOO_WORKS,
        data: params
    });
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
			url: API_URLS.GLASSDOOR,
			data: parameters
	});
}

/* This function fetches data about job, parses the html and populates info modal

 * @param {String} url - page url for job posting
 */
function showJobInfoModal(params, postingPageAction) {
	clearTimeout(renderTimeout);
    let loadingSpinnerHtml = '<div class="sk-circle">';
    for (var i = 1 ; i <= 12; i++) {
        loadingSpinnerHtml += `<div class="sk-circle${i} sk-child"></div>`;
    }
	$("#jobInfoModal").html(loadingSpinnerHtml);
	makePostingHtmlCall(params).then((result) => {
		let templateURL = chrome.extension.getURL("views/overlay_template.html")
		$.get(templateURL, function(template) {
			let infoArray = getInformationArray(result);
			let companyName = "";
			let city = "";
			let jobTitle = "";
			let rowHTML = "";
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
               // jobUrl: url,
			};
			getGlassDoorInfo(companyName).then((result) => {
				let perfectMatch = result.response.employers.find(employer => {
					return employer.exactMatch;
				});
				templateDictioary["glassDoorLink"] = result.response.attributionURL;
				if (perfectMatch != null) {
                    templateDictioary["glassDoorNumRatings"]
                        = perfectMatch.numberOfRatings !== null
                        && perfectMatch.numberOfRatings !== 0
                        ? perfectMatch.numberOfRatings : null;
                    templateDictioary["hasMultipleGlassdoorRatings"]
                    	= perfectMatch.numberOfRatings > 1;
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
				templateDictioary["postingPageAction"] = postingPageAction;
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

function getParamsFromBuildFormFn(givenInp) {
    //quick fix for now; we are manually getting rid of stuff we dont want
    /*orbisApp.buildForm({'action':'_-_-idlTHtg7qBi3QMCuJazlWAvZHCOEfLsHsKXPt73fToH9YYjukHRxa44RLDv2F38rGjV8zdBQByZchhTfXok6AcYa6-GxUyYvPDZr72_ow_4tvxp9AzM4_ftHOZnssrYAKBJ7PdnqcqiuzuWI2zbQZd1YbOqjylm48Yu2woAHng','initialSearchAction':'displayMyProgramJobs','searchType':'','accessToPostings':'infoForPostings','postingId':'20840','npfGroup':'','sortDirection':'Reverse'}, '', '').submit();

    we only want the passed first parameter
    */
    var params = givenInp.substring(19, givenInp.length - 19).toString(); //a quick fix for now. Probably will use regex in future
    params = JSON.parse(params.replace(/'/g, '"')); //replace single quotes with double and parse
    return params;
}

/* This function inserts info buttons into the page along with the action when
clicking the button */
function modifyJobTitleCol() {
	// gaurd to make sure we are not adding buttons more than once
	if ($('.infoIcon')[0]) { return; }

	$.each($(".searchResult"), function () {
		let indexOfJobTitle = $("th:contains('Job Title')").index();
		var td = $(this).find(`td:eq(${indexOfJobTitle})`);

		var firstColChildren = $(this).find("td:eq(0)")[0].children;
		var postingPageAction = ""
		for (var x = 0; x < firstColChildren.length; x++) {
			if ($(firstColChildren[x])[0].innerText.toLowerCase().includes("view")) {
				// Getting the open in new tab action from View -> DropDown -> New
				postingPageAction = firstColChildren[x].children[1].children[1].children[0].attributes.onclick.value;
			}
		}

		// Add classes to the new tags (if available)
		for(var i = 0; i < td[0].children.length; i++) {
			var child = td[0].children[i];
			if (child.tagName.toLowerCase() == "span" && child.innerHTML.toLowerCase().includes("new")) {
				$(child).addClass(CLASS_NAMES.NEW_TAG);
			}
		}

		// WW updated their UI, which resulted in the info button sometimes getting chopped off.
		// The following css fixes the issue
		td.css({
			"white-space": "normal",
			"min-width": "200px"
		});

        var link = td.find('a')[0];
        var params = getParamsFromBuildFormFn($(link)[0].attributes[1].value);
        $(`<i class="infoIcon fa fa-info-circle"></i>`)
		.attr({"data-toggle": "modal", "data-target": "#jobInfoModal"})
		.click(function() {
			showJobInfoModal(params, postingPageAction);
		})
		.insertAfter(link);
	});
	// Incase we are running this function cuz of page change!
	configureShowHideNewTag();
	clearTimeout(reloadTimeout);
}

/* This function inserts css links into the page */
function insertCSSLinks() {
    let titleTag = $("head").find("title");

	$('<link> </link>')
	.attr({"href": chrome.extension.getURL("css/spinkit.css"), "rel": "stylesheet"})
	.insertAfter(titleTag);

    // content.css
	$('<link> </link>')
	.attr({"href": chrome.extension.getURL("css/content.css"), "rel": "stylesheet"})
	.insertAfter(titleTag);

    // font-awesome css
    $('<link> </link>')
    .attr({"href": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css", "rel": "stylesheet"})
    .insertAfter(titleTag);
}

function importAddToCalender() {
    $('<link> </link>')
    .attr({"href": "https://addtocalendar.com/atc/1.5/atc-style-blue.css", "rel": "stylesheet"})
    .appendTo($("head"));

    $(SCRIPT_TAGS.ADD_TO_CALENDAR).appendTo($("head"));
}

/* This function inserts a blank modal into the page */
function insertModalDiv() {
	$("<div></div>")
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
        reloadTimeout = setTimeout(reloadFunction, 600);
    });
 }


/* This function removes the "view" button from interviews page and
 * makes the whole row clickable.
 * Does not remove the "view" button for now
 */
function addInterviewsClickHandler() {
	if ($('tbody tr:eq(0) td:eq(0) a:eq(0)').length == 0) {
		return;
	}

	$('thead td:eq(0)').remove();
	$.each($('tbody tr'), function () {
		$(this).attr("onclick", $(this).find('td:eq(0) a:eq(0)').attr("onclick"));
		// This removes the "view" button but we're taking it out for now as it causes for some confusing UX
		// $(this).find("td:eq(0)").remove();
	});
	clearTimeout(reloadTimeout);
}

// Changed cursor in applications table from pointer to default since rows are not clickable
function changePointerOnApplicationRows() {
	$('tbody tr td').css("cursor", "default");
}

/* Formats time for add to calendar api
 * @param {String} time - time in format hh:MM[AM|PM]
 * @return {String} - time in format HH:MM:SS
*/
function getFormattedTime(time) {
	var pmTimeOffset = 0;
	if (time.includes("PM")) {
		pmTimeOffset = 12;
	}
	time = time.substring(0, time.length - 2);
	let minAndHour = time.split(":");
	return (parseInt(minAndHour[0]) + pmTimeOffset) + ":" + minAndHour[1] + ":00";
}

/* Inserts 'Add to Calendar' buttons in interview details page. must be in
 * interview details when called, scrapes html for interview details and
 * inserts a button to create a calendar event
 */
function insertAddToCalendarButton() {
  	let dateAndTime = $("tbody tr:contains('When') td:eq(1)")[0].innerText.split("from");
  	let date = new Date(dateAndTime[0]);
  	let formattedDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);

  	let fromAndToTime = dateAndTime[1].split("to");
  	let fromTime = fromAndToTime[0].replace(/\s/g, "");
  	let toTime = fromAndToTime[1].replace(/\s/g, "");
  	let interviewDescription = $("tr:contains('Interviewing') td:eq(1)")[0].innerText.split("\n");

  	let eventStart = formattedDate + " " + getFormattedTime(fromTime);
  	let eventEnd = formattedDate + " " + getFormattedTime(toTime);
  	let timeZone = "America/New_York";
  	let title = "Interview with " + interviewDescription[2];
  	let description = "WaterlooWorks interview with " + interviewDescription[2] + " for job position " + interviewDescription[1] + "\n Powered by MWGA -- Please remember to always double check WaterlooWorks for any last minute changes or other inaccurate information";
  	let location = $("tr:contains('Where') td:eq(1)")[0].innerText;
  	let privacy = "private";

    // todo: use mustache for this
  	$(`<span class="addtocalendar atc-style-blue">
        <var class="atc_event">
            <var class="atc_date_start">${eventStart}</var>
            <var class="atc_date_end">${eventEnd}</var>
            <var class="atc_timezone">${timeZone}</var>
            <var class="atc_title">${title}</var>
            <var class="atc_description">${description}</var>
            <var class="atc_location">${location}</var>
            <var class="atc_privacy">${privacy}</var>
        </var>
    </span>`).insertAfter($(".container-fluid .box"));
}

function removeFromShortlistCall(jobIds, action) {
    if (jobIds.length == 0) {
        return;
    }
    var count = jobIds.length;
    for (var i = 0; i < jobIds.length; i++) {
        // ww toggles between adding/removing to/from shortlist
        var requestUrl = "/myAccount/co-op/coop-postings.htm";
        // the following request is taken from ww source code and they use
        // the given action and rand value.
        var request = {
            action : action,
            postingId: jobIds[i],
            rand : Math.floor(Math.random()*100000)
        };

        $.post(requestUrl, request, function(data, status, xhr){
            if (data && data.added) {
                // if for some reason, the job was added to shortlist, lets make a second
                // api call. This will ensure that job gets removed from the shortlist.
                // Ideally, it should have removed the first time but because its ww,
                // lets check atleast once.
                $.post(requestUrl, request, function(data, status, xhr) {}, "json");
            } else {
            	count--;
            	if (count == 0) {
            		window.location.reload();
            	}
            }
        }, "json");
    }

}

function clearShortlist() {
    var jobids = [];
    $.each($(".searchResult"), function () {
        var indexOfJobTitle = $("th:contains('Job Title')").index();
        var link = $(this).find(`td:eq(${indexOfJobTitle})`).find('a')[0];
        var params = getParamsFromBuildFormFn($(link)[0].attributes[1].value);
        jobids.push(params.postingId.toString());
    });

    var script = $(".tab-content .row-fluid:eq(0) .span12 script:eq(0)").html();
	var regex1 = /function saveFavoritePosting\(pId, priorityId, orderBy, sortDirection, currentPage, searchBy, keyword\)\n\s*\{\s*\n*var\srequest\s=\s\{\s+action.+\n/g;
	var regex2 = /'(.*?)'/;
	var action = regex2.exec(regex1.exec(script)[0])[0].replace("'","").replace("'","");
    removeFromShortlistCall(jobids, action);
}

function insertClearShortlistButton() {
	var imgURL = "url(" + chrome.extension.getURL("assets/gooseButtonIcon.png") + ")";
	$("<button \ \
		class='goose-button'\
		type='button'>Clear Shortlist \
	</button>")
	.css('background-image', imgURL)
	.click(clearShortlist)
	.appendTo($(".tab-content .row-fluid:eq(0) .span12 .aaaa .row-fluid:eq(0)"));
}

function hideNewTag(buttonID) {
	$(buttonID).removeClass(CLASS_NAMES.SHOWING_NEW_TAG)
			   .addClass(CLASS_NAMES.HIDING_NEW_TAG);
	$(`.${CLASS_NAMES.NEW_TAG}`).hide();
	$(buttonID)[0].innerText = "Show New Tags";
}

function showNewTag(buttonID) {
	$(buttonID).removeClass(CLASS_NAMES.HIDING_NEW_TAG)
			   .addClass(CLASS_NAMES.SHOWING_NEW_TAG);

	$(`.${CLASS_NAMES.NEW_TAG}`).show();
	$(buttonID)[0].innerText = "Hide New Tags";
}


function configureShowHideNewTag() {
	var buttonID = `#${ID_NAMES.SHOW_HIDE_NEW_TAG}`;
	var hasHidingClass = $(buttonID).attr("class").includes(CLASS_NAMES.HIDING_NEW_TAG);
	var hasShowingClass = $(buttonID).attr("class").includes(CLASS_NAMES.SHOWING_NEW_TAG);

	if (hasHidingClass) {
		hideNewTag(buttonID);
	} else if (hasShowingClass) {
		showNewTag(buttonID);
	}
}

function showHideNewButtonHandler() {
	var buttonID = `#${ID_NAMES.SHOW_HIDE_NEW_TAG}`;
	var hasHidingClass = $(buttonID).attr("class").includes(CLASS_NAMES.HIDING_NEW_TAG);
	var hasShowingClass = $(buttonID).attr("class").includes(CLASS_NAMES.SHOWING_NEW_TAG);


	if (hasHidingClass) {
		showNewTag(buttonID);
	} else if (hasShowingClass) {
		hideNewTag(buttonID);
	}
}

function insertShowHideNewButton() {
	var imgURL = "url(" + chrome.extension.getURL("assets/gooseButtonIcon.png") + ")";
	$(`<button \
		class='goose-button ${CLASS_NAMES.SHOWING_NEW_TAG}' \
		id='${ID_NAMES.SHOW_HIDE_NEW_TAG}' \
		type='button'>Hide New Tags\
	</button>`)
	.click(showHideNewButtonHandler)
	.css("background-image", imgURL)
	.appendTo($(".tab-content .row-fluid:eq(0) .span12 .aaaa .row-fluid:eq(0)"));
}

$(document).ready(function() {
    if ($("#postingsTablePlaceholder").length) { // postings
        insertCSSLinks();
        insertModalDiv();
        insertShowHideNewButton();
        modifyJobTitleCol();
        if ($(".orbisModuleHeader:contains('Shortlist')").length) {
        	insertClearShortlistButton();
        }
        addReloadListener('.container-fluid', modifyJobTitleCol);
    } else if($('#na_studentApplicationGrid').length) { // applications
    	changePointerOnApplicationRows();
    	addReloadListener('#na_studentApplicationGrid', changePointerOnApplicationRows);
    } else if($('#ccrm_studentInterviews').length) { // interviews
    	addInterviewsClickHandler();
    	addReloadListener('#ccrm_studentInterviews', addInterviewsClickHandle644r);
    } else if ($(".panel-default:contains('Interview Schedule')").length) { // Dashboard interviews
    	// TODO: Add to calendar from dashboard
    	// let clickHandler = $(".panel-default:contains('Interview Schedule') tbody tr:eq(0)").attr("onclick");
    	// str.split('{')[1].split('}')[0].split(',')
    } else if ($(".boxContent:contains('INTERVIEW DETAILS')").length) { // interview details
    	importAddToCalender();
    	insertAddToCalendarButton();
    }
});
