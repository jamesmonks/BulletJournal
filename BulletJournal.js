$(function(){
    console.log("anything 2");
    init();
});

let tasklist = [];
let initializing = true;

const _2DAYS_ = 1000 * 60 * 60 * 24 * 2;
const _LIST_PREFIX_     = "list_";
const _CHECKBOX_PREFIX_ = "chck_";
const _LABEL_PREFIX_    = "labl_";
const _TIME_PREFIX_     = "time_";
const _BUTTON_PREFIX_   = "bttn_";

console.log("anything blergh?");

function init()
{
    console.log("init");
    $("#bulletItem").on("submit", addBulletListener);

    database.ref("/bullets").once("value").then(function(snapshot){
        let bullets = snapshot.val();
        console.log(bullets);
        Object.keys(bullets).forEach(key => {
          console.log(key, bullets[key]);
          addBullet(bullets[key]);
        });
    });

    //tasklist.push({time_id:id, timeStamp:timestamp});Timers
    setInterval(updateTimers, 1000);
    $("#bujoTitle").modal("show");
    $("#bujoTitle").on("hide.bs.modal", animateMenu);

}

function animateMenu() {
    console.log("animateMenu");
    $("#bujoTitle").off("hide.bs.modal", animateMenu);
    $("#bujoTitle").modal("hide");
    let delay = 1500;
    // $("#bulletNav").animate( { "margin-top": "0px"}, delay, "linear", showEntries );
    $("#bulletNav").animate( { "margin-top": "0px"}, delay, "linear", showEntries);

    initializing = false;
}

function showEntries() {
    console.log("showEntries");
    let delay = 600;
    $("#bulletList").animate( { "opacity": "1.0"}, delay, "linear");
    setTimeout(showEntryInput, delay/2);
}

function showEntryInput() {
    console.log("showEntryInput");
    let delay = 1200;
    $("#bulletItemDiv").animate( {"opacity": "1.0"}, delay, "linear");
}

function nothing() {}

function addBulletListener(event) {
    console.log("addBulletListener");
    event.preventDefault();

    let tf = $("#bullet");
    let bulletItem = tf.val();
    tf.val("");
        //console.log(tf.val());
    //let rx = /^\s*$/;
    //console.log("whitespace:" + tf.val().search(/^\s*$/));
    if (bulletItem.search(/^\s*$/) > -1)
        return;

    let d = new Date();
    let startTime = d.getTime();
    
    let obj = { 
        timeStamp: startTime,
        time_id: _TIME_PREFIX_ + startTime.toString(),
        bullet_item: bulletItem,
        completed: false
    };

    addBullet(obj);
}

function addBullet(obj) {
    let startTime = obj.timeStamp;

    let li_id = "li_" + startTime;

    //div_entry
    let lbl_text = $("<LABEL>").append( obj.bullet_item );
    $(lbl_text).attr({ class:"entry_text", for:_CHECKBOX_PREFIX_ + startTime, id: _LABEL_PREFIX_ + startTime });
    let div_entry = $("<DIV>").attr({ class: "col-12 col-md-8 entry" }).append(lbl_text);
    let chk = $("<input>").attr({ type: "checkbox", class: "mr-2", id: _CHECKBOX_PREFIX_ + startTime });
    // let chk = $("<input>").attr({ type: "checkbox", class: "form-check-input mr-2", id: li_id + "_chk" });
    chk.on("click", strikeThrough);
    $(div_entry).append(chk).append(lbl_text);

    if (obj.completed == true)
    {
        $(lbl_text).toggleClass("struck");
        $(chk).attr( {checked: true})
    }

    //spn_stamp
    let spn_stamp = $("<SPAN>").attr({ class: "col-4 offset-4 col-sm-3 offset-sm-6 col-md-2 offset-md-0 text-right timestamp align-text-bottom" });
    $(spn_stamp).attr({ id: _TIME_PREFIX_ + startTime});
    $(spn_stamp).append(formatted_time_left(startTime));

    //btn
    let btn = $("<button>").append("Delete");
    $(btn).attr({ type: "button", class: "btn delete btn-danger col-4 col-sm-3 col-md-2 pull-right", id: _BUTTON_PREFIX_ + startTime });
    btn.on("click", deleteEntry);

    //li
    let bullet = $("<li>").attr({ id: _LIST_PREFIX_ + startTime, class: "form-row mb-1 align-text-bottom" })
    // if (tasklist.length % 2 == 0)
    //     $(bullet).addClass(["zero"]);
    // else
    //     $(bullet).addClass(["one"]);

    
    if (!initializing)
    {
        $(bullet).css("opacity", "0").animate( { "opacity": "1.0"}, 500, "linear");
        database.ref("/bullets/" + startTime).set( obj );
    }
    else
    {
        
    }

    //push to database
    tasklist.push( obj );

    $(bullet).append(div_entry).append(spn_stamp).append(btn);

    //div_row
    //let div_row = $("<DIV>").attr({ class: "row" }).append(bullet);
    $("#bulletList").append(bullet);

    console.log(tasklist);
}

// obsolete code
// function delete2(event) {
//     console.log(event.target);
//     let tar = event.target;
//     let par = $(tar).parent();
//     if ($(par).hasClass(["zero"]))
//     {
//         $(par).removeClass(["zero"]);
//         $(par).addClass(["one"]);
//     } else if ($(par).hasClass(["one"]))
//     {
//         $(par).removeClass(["one"]);
//         $(par).addClass(["zero"]);
//     }
//     console.log($(tar).parent().hasClass(["zero"]));
//     // console.log($(tar).parent().remove());
// }

// no longer needed
// function createList() {
//     //grab array, add each element individually
// }

/**
 * Function returns a formatted string with the time remaining using the number argument in
 * detDate() time.
 * @param {*} time_eval 
 */
function formatted_time_left(time_eval)
{
    if (time_left(time_eval) !== NaN)
        return format_time_left(time_left(time_eval));
    else
        return "Error, NaN"
}

/**
 * Function calculates time remaining before self-deletion should proceed
 * @param {number} time_eval 
 */
function time_left(time_eval) {
    if (typeof time_eval === 'number' && Number.isSafeInteger(time_eval))
    {
        // console.log("time_left");
        let d = new Date();
        let curr_time = d.getTime();
        let deadline = time_eval + (_2DAYS_);
        // console.log([deadline, curr_time]);
        // console.log([deadline - curr_time, _2DAYS_]);
        return Math.max(deadline - curr_time, 0);
    }
    else
    {
        console.log("time_left error");
        return NaN;
    }
}

/**
 * Given a number in milliseconds, calculates the amount of time left in days HH:MM:SS format
 * @param {number} time_left 
 */
function format_time_left(time_left) {
    // console.log("format_time_left:" + [time_left, _2DAYS_]);
    if (time_left <= _2DAYS_)
    {
        // console.log("formatting time left");
        //1000 * 60 * 60 * 24 * 2;
        let mal = parseInt(time_left / 1000);
        //seconds
        let str = ":" + two_char_int(mal % 60);
        //minutes
        mal = parseInt(mal / 60);
        str = ":" + two_char_int(mal % 60) + str;
        //hours
        mal = parseInt(mal / 60);
        str = " " + two_char_int(mal % 24) + str;
        //days
        mal = parseInt(mal / 24);
        str = mal + "d" + str;
        // console.log(time_left + " becomes:" + str);
        return str;
    }
}

/**
 * Formatting an integer so that it will always display two digits for readability
 * @param {number} val 
 */
function two_char_int(val) {
    if (val < 10)
        return "0" + val.toString();
    else if (val >= 0)
        return val.toString();
    else
        return "error, -ve int";
}

/**
 * Function removes entry from the unordered list and it's reference from the tasklist array
 * @param {*} event 
 */
function deleteEntry(event) {
    console.log("deleteEntry");
    let delay = 300;
    let target = event.target;
    //let liObject = $(target).parent();
    console.log(target.id);
    console.log($(target).parent());
    let timeStamp = parseInt(get_stripped_id(target.id));

    //$("#" + _LIST_PREFIX_ + timeStamp).animate( { "opacity" : "0" }, 2350, "linear", deleteAnimationFinished(event));
    //$("#" + _LIST_PREFIX_ + timeStamp).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", deleteAnimationFinished);
    deleteID(timeStamp);
    // for (let i=0; i<tasklist.length; i++)
    // {
    //     if ( tasklist[i].timeStamp == timeStamp )
    //     {
    //         tasklist.splice(i, 1);
    //         i=tasklist.length;
    //     }
    // }
//    $(liObject).remove();
    //document.removeChild(parent);


    //bujo-todo
}

// function deleteAnimationFinished(event) {
//     console.log("deleteAnimationFinished");
//     console.log("event:", event);
//     let target = event.target;
//     //let liObject = $(target).parent();
//     console.log(target.id);
//     console.log($(target).parent());
//     console.log(tasklist);
//     let timeStamp = parseInt(get_stripped_id(target.id));
//     deleteID(timeStamp);
//     console.log(tasklist);
// }

function deleteID(timeStamp)
{
    for (let i=0; i<tasklist.length; i++)
    {
        if ( tasklist[i].timeStamp == timeStamp )
        {
            $("#" + _LIST_PREFIX_ + timeStamp).remove();
            tasklist.splice(i, 1);
            database.ref("/bullets/" + timeStamp).remove();
            return;
        }
    }
    console.log("Error, unable to deleteID( " + timeStamp + " )");
}

/**
 * Function toggles the strike-through effect when checkbox is checked/unchecked
 * @param {*} event 
 */
function strikeThrough(event) {
    let blt_id = get_stripped_id(event.target.id);
    let lbl_id = "#" + _LABEL_PREFIX_ + blt_id;
    console.log(lbl_id);
    console.log($(lbl_id));
    $(lbl_id).toggleClass("struck");
    let struck = $(lbl_id).hasClass("struck");
    database.ref("/bullets/" + blt_id + "/completed").set( struck );
}

/**
 * Given a properly formatted id, will return the timeleft which is used as part of the id.
 * @param {string} ref 
 */
function get_stripped_id(ref) {
    console.log(ref, ref.substring(5));
    return ref.substring(5);
}

/**
 * Updates the ...
 */
function updateTimers() {
    // console.log("updateTimers()");
    for (let i=0; i < tasklist.length; i++) {
        // console.log(tasklist[i].time_id);
        // console.log($("#" + tasklist[i].time_id));
        // console.log(formatted_time_left(tasklist[i].timeStamp));
        $("#" + tasklist[i].time_id).text(formatted_time_left(tasklist[i].timeStamp));
        //TODO: evaluate timeleft to see if it a zero value, if so delete from the unordered list
        //      and the tasklist
    }
}