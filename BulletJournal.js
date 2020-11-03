$(function(){
    console.log("anything 2");
    init();
});

let tasklist = [];

const _2days_ = 1000 * 60 * 60 * 24 * 2;

console.log("anything blergh?");

function init()
{
    console.log("init");
    $("#bulletItem").on("submit", addBullet);
    //$("#submit").on("click", addBullet(event));

    //TODO: import tasks and set timer
    //tasklist.push({id:id, timestamp:timestamp});
}

function addBullet(event) {
    console.log("addBullet");
    event.preventDefault();

    let d = new Date();
    let startTime = d.getTime();

    //div_entry
    let tf = $("#bullet");
    let txt_span = $("<SPAN>").attr({ class: "entry_text"}).append(tf.val());
    let div_entry = $("<DIV>").attr({ class: "col-12 col-md-8 entry" }).append(txt_span);
    tf.val("");
    let chk = $("<input>").attr({ type: "checkbox", class: "form-check-input" });
    chk.on("click", showMe);
    $(div_entry).prepend(chk);

    //div_stamp
    let div_stamp = $("<DIV>").attr({ class: "col-2 timestamp" }).append(startTime);

    //div_btn
    let div_btn = $("<div>").attr({ class: "col-1 align-self-end w-100" });
    let btn = $("<input>").attr({ type: "button", value: "delete"});
    btn.on("click", showMe);
    $(div_btn).append(btn);

    //li
    let li_id = "li_" + startTime;
    let bullet;
    if (tasklist.length % 2 == 0)
        bullet = $("<li>").attr({ id: li_id, class: "zero form-row form-inline" });
    else
        bullet = $("<li>").attr({ id: li_id, class: "one form-row form-inline" });
    
    $(bullet).append(div_entry).append(div_stamp).append(div_btn);

    //div_row
    //let div_row = $("<DIV>").attr({ class: "row" }).append(bullet);
    $("#bulletList").append(bullet);

    
    tasklist.push({ id: li_id, timeStamp: startTime });
    console.log(tasklist);
}

function delete2(event) {
    console.log(event.target);
    let tar = event.target;
    let par = $(tar).parent();
    if ($(par).hasClass(["zero"]))
    {
        $(par).removeClass(["zero"]);
        $(par).addClass(["one"]);
    } else if ($(par).hasClass(["one"]))
    {
        $(par).removeClass(["one"]);
        $(par).addClass(["zero"]);
    }
    console.log($(tar).parent().hasClass(["zero"]));
    // console.log($(tar).parent().remove());
}

function createList() {
    //grab array, add each element individually
}

function time_left(time_eval) {
    if (typeof time_eval === 'number' && Number.isSafeInteger(time_eval))
    {
        let d = new Date();
        let deadline = d.getTime() + this._2days_;
        return Math.max(deadline - time_eval, -1);
    }
    else
        return NaN;
}

function format_time_left(time_left) {
    if (time_left <= _2days_)
    {
        //1000 * 60 * 60 * 24 * 2;
        let mal = time_left / 1000;
        //seconds
        let str = ":" + (mal % 60).toString();
        //minutes
        mal /= 60;
        str.prepend(":" + (mal % 60).toString());
        //hours
        mal /= 60;
        str.prepend(":" + (mal % 24).toString());
        //days
        mal /= 24;
        str.prepend(mal.toString());
    }
}

function showMe(event) {
    let d = new Date();
    let startTime = d.getTime();
    let expiryTime = startTime + _2days_;
    console.log(d.getTime());
    let target = event.target;
    let liObject = $(target).parent().parent();
    $(liObject).remove();
    console.log(target);
    console.log($(target).parent().parent().type);
    //document.removeChild(parent);
}