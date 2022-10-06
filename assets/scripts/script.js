const DateTime = luxon.DateTime;

var todaysDateEl = $('#currentDay');

var timeBlockContainerEl = $('#timeblock-container')

var todaysDate = DateTime.now();

const startHour = "7:00";

const endHour = "18:00";

var timeBlockEl = $("<div>").addClass("time-block w-100 row d-flex flex-nowrap flex-row justify-content-between").html('<div> class="hour col-2 col-lg-1 p-3">Works</div>');

var savedTimeBlocks = [];



var showCurrentDate = function () {
    todaysDate = DateTime.now();

    todaysDateEl.text(
        todaysDate.toLacaleString(DateTime.DATETIME_SHORT)
    );
}

var createTimeBlock = function (timeBlockObj) {
   
    var newTimeBlockEl = timeBlockEl.clone();
  
    newTimeBlockEl.attr("id", timeBlockObj.id);
    newTimeBlockEl.children(".description").children("p").text(timeBlockObj.description);

    var comparedTime = DateTime.fromISO(timeBlockObj.timeSlot);
    if (comparedTime.startOf('hour') < todaysDate.startOf('hour')) {
        newTimeBlockEl.addClass('past');
    }
    else if (comparedTime.startOf('hour') > todaysDate.startOf('hour')) {
        newTimeBlockEl.addClass('future');
    }
    else {
        newTimeBlockEl.addClass('present');
    }
   
    var displayTime = comparedTime
        .toLocaleString({
            hour: '2-digit',
            hourCycle: 'h12'
        });
   
    newTimeBlockEl.children(".hour").text(displayTime);
   
    timeBlockContainerEl.append(newTimeBlockEl);
};


var saveTimeBlocks = function () {
    var localArray = JSON.stringify(savedTimeBlocks);
    localStorage.setItem('savedTimeBlocks', localArray);
    console.log("Saved changes to Local Storage");
};


var loadTimeBlocks = function () {
    var localArray = JSON.parse(localStorage.getItem('savedTimeBlocks'));
    if (localArray) {
        console.log("Loaded timeBlock array from Local Storage");
        savedTimeBlocks = localArray;
        return true;
    }
    else {
        console.log("No timeBlock array found in Local Storage")
        return false;
    }
};

var createNewArray = function () {
    console.log("Generating New Array");
    var end = DateTime.fromISO(endHour);
    var start = DateTime.fromISO(startHour);
    var numBlocks = (end.diff(start, 'hours')).values.hours;

    for (i = 0; i < numBlocks + 1; i++) {

        var newObj = {};

    
        newTime = DateTime.fromISO(startHour).plus({ hours: i });


        newTimeSlot = newTime.toLocaleString({
            hour: 'numeric',
            minute: 'numeric',
            hourCycle: 'h23'
        });
 
        newObj.timeSlot = newTimeSlot;


        newId = newTime.toLocaleString({
            hour: '2-digit',
            hourCycle: 'h12'
        }).replace(" ", "");

    
        newObj.id = newId;

     
        newObj.description = "";


        savedTimeBlocks.push(newObj);
    }
}


var createTimeChart = function (savedTimeBlocks) {
    for (i = 0; i < savedTimeBlocks.length; i++) {
        var timeBlockObj = savedTimeBlocks[i];
        createTimeBlock(timeBlockObj);
    }
};


var timeChartInit = function (savedTimeBlocks) {

 
    if (savedTimeBlocks.length === 0) {
        createNewArray();
        saveTimeBlocks();
    }

    createTimeChart(savedTimeBlocks);
};


var editHandler = function () {
    var text = $(this).children("p").text();
    inputField = $('<textarea>')
        .attr("type", "text")
        .val(text)
        .addClass("form-control h-100 bg-transparent text-left");


    $(this).children("p").replaceWith(inputField);
};


var searchTimeBlocks = function (inputId) {
    var index = savedTimeBlocks.findIndex(block => block.id === inputId);
    return index;
};

var saveHandler = function () {
    var parentId = $(this)
        .closest("div .time-block")
        .attr("id");

    console.log(parentId);

    var text = $("#" + parentId)
        .children(".description")
        .children("textarea")
        .val()
        .trim();

    var index = searchTimeBlocks(parentId);

    savedTimeBlocks[index].description = text;
    saveTimeBlocks();

    var newDescriptionEl = $("<div>").addClass("description col-5 col-sm-10 p-3");
    var newPEl = $("<p>").text(text);

    newDescriptionEl.append(newPEl);

    $("#" + parentId)
        .children(".description")
        .replaceWith(newDescriptionEl);
};

showCurrentDate();
loadTimeBlocks();
timeChartInit(savedTimeBlocks);

timeBlockContainerEl.on("click", "div .description", editHandler);

timeBlockContainerEl.on("click", "div .saveBtn", saveHandler);

intervalId = setInterval(showCurrentDate, 60000);