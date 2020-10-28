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

    let tf = $("#bullet");
    let txt = "<SPAN class='memo'>" + tf.val() + "</SPAN>" + 
              "<SPAN class='timestamp'>" + startTime + "</SPAN>";
    tf.val("");

    let bullet;
    let li_id = "li_" + startTime;
    if (tasklist.length % 2 == 0)
        bullet = $("<li>").attr({ id: li_id, class: "zero" });
    else
        bullet = $("<li>").attr({ id: li_id, class: "one" });
    let chk = document.createElement("input");
    let btn = $("<input>").attr({ type: "button", value: "delete"});

    btn.on("click", showMe);
    chk.addEventListener("click", showMe);
    chk["type"] = "checkbox";
    console.log(txt);
    console.log(chk);
    $(bullet).html(txt);
    $(bullet).prepend(chk).append(btn);
    let bulletList = $("#bulletList");
    bulletList.append(bullet);

    tasklist.push({ id: li_id, timeStamp: startTime });
}

function createList() {
    //grab array, add each element individually
}

function showMe(event) {
    let d = new Date();
    let startTime = d.getTime();
    let expiryTime = startTime + _2days_;
    console.log(d.getTime());
    let target = event.target;
    let liObject = $(target).parent();
    $(liObject).remove();
    console.log(target);
    console.log($(target).parent());
    //document.removeChild(parent);
}