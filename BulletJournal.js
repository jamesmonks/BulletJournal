$(function(){
    console.log("anything 2");
    init();
});

const _2days_ = 1000 * 60 * 60 * 24 * 2;

console.log("anything blergh?");

function init()
{
    console.log("init");
    $("#bulletItem").on("submit", addBullet);
    //$("#submit").on("click", addBullet(event));
}


function addBullet(event) {
    console.log("addBullet");
    event.preventDefault();

    let tf = $("#bullet");
    let txt = tf.val();
    tf.val("");
    let bullet = document.createElement("li");
    let chk = document.createElement("input");

    chk.addEventListener("click", showMe);
    chk["type"] = "checkbox";
    console.log(txt);
    console.log(chk);
    bullet.appendChild(chk);
    bullet.append(txt);
    let bulletList = $("#bulletList");
    bulletList.append(bullet);
}

function showMe(event) {
    let d = new Date();
    let startTime = d.getTime();
    let expiryTime = startTime + _2days_;
    console.log(d.getTime());
    let target = event.target;
    let liObject = $(target).parent();
    //$(liObject).remove();
    console.log(target);
    console.log($(target).parent());
    //document.removeChild(parent);
}