const CLASS_NAMES = {
    "NEW_TAG": "new-label-MWGA-class",
    "SHOWING_NEW_TAG": "show-new-lable-MWGA-class",
    "HIDING_NEW_TAG": "hide-new-lable-MWGA-class"
};

const ID_NAMES = {
    "SHOW_HIDE_NEW_TAG": "show-hide-button-MWGA-id"
}

const API_URLS = {
	"GLASSDOOR": "https://api.glassdoor.com/api/api.htm",
	"WATERLOO_WORKS": "https://waterlooworks.uwaterloo.ca/myAccount/co-op/coop-postings.htm"
};

const SCRIPT_TAGS = {
    "ADD_TO_CALENDAR": `
    <script type="text/javascript">(function () {
        if (window.addtocalendar)if(typeof window.addtocalendar.start == "function")return;
        if (window.ifaddtocalendar == undefined) { window.ifaddtocalendar = 1;
            var d = document, s = d.createElement('script'), g = 'getElementsByTagName';
            s.type = 'text/javascript';s.charset = 'UTF-8';s.async = true;
            s.src = ('https:' == window.location.protocol ? 'https' : 'http')+'://addtocalendar.com/atc/1.5/atc.min.js';
            var h = d[g]('body')[0];h.appendChild(s); }})();
    </script>`
};

const infoToInclude = [	"Job Title",
						"Job - City",
						"Special Job Requirements",
						"Required Skills",
						"Job Summary",
						"Job Responsibilities",
						"Compensation and Benefits Information"];
