const baseWaterlooWorksUrl = "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm";

/* This function returns the html without opening a new tab for the page
 * accessed the param url. It is assumed that for WaterlooWorks the url will have
 * the format like <baseWaterlooWorksUrl>?<QueryParam>

 * @param {String} url - page url whose html we need to return
 * @return {String} - string defining the html of the page */
function getJobPostingHTML(url) {

  var htmlObject = null;

  $.get(link, function(html) {
      htmlObject = html;
  });

  // WaterlooWorks submits this form and then redirects you to the posting. We will have to make
  // the form request

}

