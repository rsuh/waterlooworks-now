dummyData = true;
var modalData = [
	{title: "organization", content: "Goose Technologies"},
	{title: "job title", content: "Mr. Goose"},
	{title: "Documents Required", content: "Work History, Résumé, Grade Report"},
	{title: "Special Job Requirements", content: 
	"Do not apply on here. Please apply directly to goose@notarealcompany.com\n\
	This is not a real job position.\n\
	Last day to interview: May 22, 2020\n"},
	{title: "Job Summary", content: "Goose Technologies is the leading firm for disruptive geese.\
	We specialize in state of the art bird focusing on AI, machine learning, distributed systems,\
	IOT and other disruptive fields. Mr. Goose is the Unofficial and underappreciated mascot for the university.\
	This job is for ambitious geese that want something more out of life\n"},
	{title: "Job Responsibilies", content: "In charge of day to day honking. Lead inovation in our Agile Goose Labs.\
	 Manage a team of hard working and passionate birds. Must be willing to chase student around the campus.\n"},
	{title: "Required Skills", content:"Scary teeth is a must"}
];
	
var jobTitles = [
	"Customer Service ",
	"IT Specialist ",
	"Marking Assistant ",
	"iOS Developer for Android ",
	"Agile Janitor ",
	"Sales Associate ",
	"Mr. Goose ",
	"Potato Project Manager ",
	"Agile Customer Service ",
	"Cheese Developer ",
	"IT Specialist ",
	"Fry Cook Specialist ",
	"Marking Asistant ",
	"Android Developer ",
	"Senior Sales Associate ",
	"Software Engineering Intern ",
	"Project Manager ",
	"Customer Service ",
	"IT Specialist ",
	"Marking Assistant ",
	"iOS Developer for Android ",
	"Agile Janitor ",
	"Sales Associate ",
	"Mr. Goose ",
	"Potato Project Manager ",
	"Agile Customer Service ",
	"Cheese Developer ",
	"IT Specialist ",
	"Fry Cook Specialist ",
	"Marking Asistant ",
	"Android Developer ",
	"Senior Sales Associate ",
	"Software Engineering Intern ",
	"Project Manage r"
];

var companyNames = [
	"The Krusty Krab",
	"Big Software Company",
	"Vitia",
	"This Rupt Inc.",
	"Romeo Networks",
	"Rust",
	"Rocket Shop",
	"Big Store",
	"Fake Company",
	"The Chum Bucket",
	"The Krusty Krab",
	"Big Software Company",
	"Vitia",
	"This Rupt Inc.",
	"Romeo Networks",
	"Rust",
	"Rocket Shop",
	"Big Store",
	"Fake Company",
	"The Chum Bucket",
	"The Krusty Krab",
	"Big Software Company",
	"Vitia",
	"This Rupt Inc.",
	"Romeo Networks",
	"Rust",
	"Rocket Shop",
	"Big Store",
	"Fake Company",
	"The Chum Bucket"
];

var countries = [
	"Alaska",
	"New Zealand",
	"Old Zealand",
	"Earth",
	"Mars",
	"Greenland",
	"Antartica",
	"St. Lucia",
	"Alaska",
	"New Zealand",
	"Old Zealand",
	"Earth",
	"Mars",
	"Greenland",
	"Antartica",
	"St. Lucia",
	"Alaska",
	"New Zealand",
	"Old Zealand",
	"Earth",
	"Mars",
	"Greenland",
	"Antartica",
	"St. Lucia",
	"Alaska",
	"New Zealand",
	"Old Zealand",
	"Earth",
	"Mars",
	"Greenland",
	"Antartica"
];

var cities = [
	"MemeVillage",
	"Varrock",
	"City Name",
	"Atlantis",
	"MC",
	"Central City",
	"GooseTown",
	"Lumbridge",
	"Rug City",
	"Fizbo",
	"MemeVillage",
	"Varrock",
	"City Name",
	"Atlantis",
	"MC",
	"Central City",
	"GooseTown",
	"Lumbridge",
	"Rug City",
	"Fizbo",
	"City"
];

function insertDummyData() {
	let indexOfJobTitle = $("th:contains('Job Title')").index();
	let indexOfCompanyNames = $("th:contains('Organization')").index();
	let indexOfDivision = $("th:contains('Division')").index();
	let indexOfNumOpenings = $("th:contains('Number of Openings')").index();
	let indexOfStatus = $("th:contains('Internal Status')").index();
	let indexOfCountry = $("th:contains('Location')").index();
	let indexOfCity = $("th:contains('City')").index();
	let indexOfLevel = $("th:contains('Level')").index();
	let indexOfDeadLine = $("th:contains('Application Deadline')").index();
	var index = 0;
	$.each($(".searchResult"), function () {
		$(this).find(`td:eq(${indexOfJobTitle}) a`).html(jobTitles[index])
		$(this).find(`td:eq(${indexOfCompanyNames})`).html(companyNames[index]);
		$(this).find(`td:eq(${indexOfDivision})`).html("Main Office");
		$(this).find(`td:eq(${indexOfNumOpenings})`).html(1);
		$(this).find(`td:eq(${indexOfStatus})`).html("Open");
		$(this).find(`td:eq(${indexOfCountry})`).html(countries[index]);
		$(this).find(`td:eq(${indexOfCity})`).html(cities[index]);
		$(this).find(`td:eq(${indexOfLevel})`).html("Medium");
		$(this).find(`td:eq(${indexOfDeadLine})`).html("June 5, 2050");
		index++;
	});
}

function getDummyInformationArray() {
	return modalData;
}
