/* This function returns the html without opening a new tab for the page
 * accessed the param url. It is assumed that for WaterlooWorks the url will have
 * the format like <baseWaterlooWorksUrl>?<QueryParam>

 * @param {String} url - page url whose html we need to return
 * @return {String} - string defining the html of the page */
function getJobPostingHTML(url) {

  return $.get(url, function(firsthtml) {
    var parsedFirstHtml = $.parseHTML(firsthtml);

    // An array of objects of format: {name: <name>, value: <value>}
    var inputNameValues = new Object;

    $.each(parsedFirstHtml[0], function(i, el) {
      inputNameValues[el.name] = el.value;
    });

    return inputNameValues;
  })
  .then((value) => {
    return $.ajax({
      type: "POST",
      url: "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm",
      data: value
    })
  })

}

const baseWaterlooWorksUrl = "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm";
var testurl = baseWaterlooWorksUrl + "?action=_-_-xps-CTTTkwP8nQhDoJIOewbWnqrPuPQRFrDd44kyFmhUvbQuOeYbflR2oDiXWCHcVP-yKde07ohfviclaCOPCWOGX-p3HYVMdVhYeL0uqc8DWUdZ7IZFPq4K3A5a5ASN3lzb_WdIIpcA3e0uLeJ-L7vsShVCWtiE995ywlq-jA&initialSearchAction=displayMyProgramJobs&searchType=&accessToPostings=infoForPostings&postingId=5048&npfGroup=&sortDirection=Reverse";

//console.log(getJobPostingHTML(testurl));

getJobPostingHTML(testurl).then((result) => {
  console.log(result);
});


// console.log(Object.keys(getJobPostingHTML(testurl)));

