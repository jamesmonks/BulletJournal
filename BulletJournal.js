$(function(){
    console.log("anything 2");
    init();
});

var database;
var auth;
var firebaseConfig;

let tasklist = [];
let initializing = true;
let guest = false;

const _2DAYS_ = 1000 * 60 * 60 * 24 * 2;
const _LIST_PREFIX_     = "list_";
const _CHECKBOX_PREFIX_ = "chck_";
const _SPAN_PREFIX_     = "span_";
const _TIME_PREFIX_     = "time_";
const _BUTTON_PREFIX_   = "bttn_";

console.log("anything blergh?");

async function init()
{
    console.log("init");

    await firebase_setup();
    init_modal_buttons();

    firebase.auth().onAuthStateChanged(function(user) {
        console.log(user);
        if (user) {
            $("#login-button").addClass("d-none").removeClass("d-flex");
            logged_in();
        } else {
            $("#login-button").addClass("d-flex").removeClass("d-none");
        }
    });

    $("#login-button").on("click", load_login);
    
    startAnimations();
}

async function firebase_setup()
{
    // Your web app's Firebase configuration
    firebaseConfig = {
        apiKey: "AIzaSyDXQTWpTcqrwy127WmW7cTUiPrCfl9lmMs",
        authDomain: "bujo-todo.firebaseapp.com",
        databaseURL: "https://bujo-todo.firebaseio.com",
        projectId: "bujo-todo",
        storageBucket: "bujo-todo.appspot.com",
        messagingSenderId: "946796899496",
        appId: "1:946796899496:web:60b6a60c6586282873a69d"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    auth = firebase.auth();
    auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
    
    // email = "jameszmonks@gmail.com";
    // pass = "testing123";
    // await auth.signInWithEmailAndPassword(email, pass).catch(loginError);
    
    // function loginError(error) {
    //     console.log("loginError");
    //     console.log(error);
    // }
    
}

function addBulletListener(event) {
    console.log("addBulletListener");
    event.preventDefault();

    let tf = $("#bullet");
    let bulletItem = tf.val();
    tf.val("");
    
    if (bulletItem.search(/^\s*$/) > -1)
        return;

    let d = new Date();
    let startTime = d.getTime();
    let ref = database.ref(`${auth.currentUser.uid}/bullets`).push();
    let ref_key = ref.key;
    // console.log(ref);    
    // console.log(ref.key);

    let obj = { 
        timeStamp: startTime,
        key: ref_key,
        bullet_item: bulletItem,
        completed: false
    };

    //listen for value changes
    ref.on("value", changedValue);
    
    ref.set( obj );
    ref = database.ref(`${auth.currentUser.uid}/bullets/${ref_key}`);

    console.log("  ", obj);
    addBullet(obj);
    //addBullet(obj, ref, initializing);

}

function addBullet(obj) {

    console.log("addBullet:", obj);

    if (keyExists(obj.key))
        return;

    let div_entry = $("<DIV>").attr({ class: "col-12 col-md-8 entry" });//.append(lbl_text);
    let spn_text = $("<SPAN>").append( obj.bullet_item ).attr({ id: _SPAN_PREFIX_ + obj.key });
    let chk = $("<input>").attr({ type: "checkbox", class: "mr-2", id: _CHECKBOX_PREFIX_ + obj.key });
    chk.on("click", strikeThroughEvent);
    $(div_entry).append(chk).append( spn_text );
    
    if (obj.completed == true)
    {
        $(spn_text).toggleClass("struck");
        $(chk).attr( {checked: true});
    }

    //spn_stamp
    let spn_stamp = $("<SPAN>").attr({ class: "col-4 offset-4 col-sm-3 offset-sm-6 col-md-2 offset-md-0 text-right timestamp align-text-bottom" });
    $(spn_stamp).attr({ id: _TIME_PREFIX_ + obj.key}).append(formatted_time_left(obj.timeStamp));

    //btn
    let btn = $("<button>").append("Delete");
    $(btn).attr({ type: "button", class: "btn delete btn-danger col-4 col-sm-3 col-md-2 pull-right", id: _BUTTON_PREFIX_ + obj.key });
    btn.on("click", deleteEntry);

    //li
    let bullet = $("<li>").attr({ id: _LIST_PREFIX_ + obj.key, class: "form-row mb-1 align-text-bottom" });
    
    if (!initializing)
    {
        $(bullet).css("opacity", "0").animate( { "opacity": "1.0"}, 500, "linear");
        // database.ref("/bullets/" + obj.id).set( obj );
    }

    $(bullet).append(div_entry).append(spn_stamp).append(btn);
    $("#bulletList").append(bullet);


    // console.log(tasklist);
}

function changedValue(snapshot) {
    console.log("changedValue: key:", snapshot.key);
    // console.log("  ", snapshot);
    // console.log("  ", tasklist);
    let keyPresent = keyExists(snapshot.key);
    console.log("  keyExists:", keyPresent);

    if (snapshot.val() == null) {
        //delete event triggered
        if (keyPresent) {
            deleteKey(snapshot.key);
        }
    } else {
        let obj = snapshot.val();
        console.log(obj);
        if (!keyPresent) {
            //create event
            console.log("    Adding via changedValue");
            addBullet(obj);
            //push to array
            tasklist.push( obj );

            //listen for value changes
            database.ref(`${auth.currentUser.uid}/bullets/${snapshot.key}`).on("value", changedValue);

        } else {
            //update event
            //update tasklist
            //update span
            //update checkbox
            console.log("    Altering via changedValue");
            // console.log(snapshot.val());
            updateHTMLBullet( updateTasklistBullet(snapshot.val(), snapshot.key) );
        }
        //is it create or update?
    }
    // bullet_item
    // completed
    // timeStamp
    // if (!snapshot.data.exists())
    // {
    //     console.log("no data exists? delete?");
    //     snapshot.data
    // } else if (snapshot.data.previous.exists()) {
    //     console.log("previous data exists? update?");
    // } else if (!snapshot.data.previous.exists() && snapshot.data.exists())
    // {
    //     console.log("no previous data? data exists? create?");
    // }
}

function updateTasklistBullet(obj, key) {
    console.log("updateTasklistBullet");//, obj, key);
    for (let i=0; i < tasklist.length; i++)
    {
        if (tasklist[i].key == key)
        {
            tasklist[i].bullet_item = obj.bullet_item;
            tasklist[i].completed = obj.completed;
            tasklist[i].timeStamp = obj.timeStamp;
            return tasklist[i];
        }
    }
    return null;
}

function updateHTMLBullet(obj) {
    console.log("updateHTMLBullet");//, obj);
    if (obj == null)
        return;
    let span = $("#" + _SPAN_PREFIX_ + obj.key);
    let completed = obj.completed;
    let span_struck = $(span).hasClass("struck");
    //update span
    $(span).text(obj.bullet_item);
    //update checkbox
    $("#" + _CHECKBOX_PREFIX_ + obj.key).attr( { checked: obj.completed });
    console.log(completed, span_struck)
    if ((completed && !span_struck) || (!completed && span_struck))
        $(span).toggleClass("struck");
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
    let id = get_stripped_id(target.id);

    deleteKey(id);
}

function keyExists(key) {
    // console.log("keyExists(", key, ")");
    for (let i=0; i<tasklist.length; i++)
    {
        if ( tasklist[i].key == key )
        {
            return true;
        }
    }
    return false;
}

function deleteKey(key)
{
    console.log("deleteKey");
    for (let i=0; i<tasklist.length; i++)
    {
        if ( tasklist[i].key == key )
        {
            tasklist.splice(i, 1);
            if ($("#" + _LIST_PREFIX_ + key) != null)
                $("#" + _LIST_PREFIX_ + key).remove();
            if (database.ref(`${auth.currentUser.uid}/bullets/${key}`) != null)
                database.ref(`${auth.currentUser.uid}/bullets/${key}`).remove();
            // console.log(tasklist);
            return;
        }
    }
    console.log("Error, unable to deleteKey( " + key + " )");
}

/**
 * Function toggles the strike-through effect when checkbox is checked/unchecked
 * @param {*} event 
 */
function strikeThroughEvent(event) {
    let blt_id = get_stripped_id(event.target.id);
    strikeBullet(blt_id, true);
}

function strikeBullet(key, localEvent) {
    let lbl_id = "#" + _SPAN_PREFIX_ + key;
    console.log(lbl_id);
    console.log($(lbl_id));
    $(lbl_id).toggleClass("struck");
    let struck = $(lbl_id).hasClass("struck");
    if (localEvent)
        database.ref(`${auth.currentUser.uid}/bullets/${key}/completed`).set( struck );
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
    //console.log("updateTimers()");
    for (let i=0; i < tasklist.length; i++) 
    {
        if (bullet_timed_out(tasklist[i]))
        {
            $("#" + _TIME_PREFIX_ + tasklist[i].key).text(formatted_time_left(tasklist[i].timeStamp));
        }
        else
        {
            deleteKey(tasklist[i].key);
        }
    }
}

/////////////////////////////
//TIME FORMATTING FUNCTIONS//
/////////////////////////////

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
        let d = new Date();
        let curr_time = d.getTime();
        let deadline = time_eval + (_2DAYS_);
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
    
    if (val >= 0)
        return val.toString();
    
    return "error, -ve int";
}

////////////////////
//INTRO ANIMATIONS//
////////////////////

function startAnimations(){
    //tasklist.push({time_id:id, timeStamp:timestamp});Timers
    setInterval(updateTimers, 1000);
    $("#bujoTitle").modal("show");
    $("#bujoTitle").on("hidden.bs.modal", load_login);
}

function load_login(event)
{
    if (event)
        if (event.type != "click")
            $(event.currentTarget).off(event.type, load_login);
    $("#email-login-modal").modal("show");
}

function animateMenu() {
    console.log("animateMenu");
    let delay = 1500;
    $("#bulletNav").animate( { "margin-top": "0px"}, delay, "linear", showEntries);

    initializing = false;
}

function sign_out() {
    auth.signOut();
    reset_display();
    reset_variables();
}

function reset_display() {
    console.log("reset_display");
    let delay = 1500;
    $("#bulletNav").animate( { "margin-top": "-50px"}, delay, "linear");
    $("#bulletList").empty();
}

function reset_variables() {
    tasklist = [];
    initializing = true;
    guest = false;
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
    database.ref(`${auth.currentUser.uid}/bullets`).on("child_added", changedValue);
}

// LOGIN MODAL FUNCTIONS
function init_modal_buttons()
{
    //email signup
    $("#email-signup-button").on("click", signup_with_email_event);
    $("#email-signup-login-button").on("click", show_modal_login_email);

    //email login
    $("#email-login-button").on("click", login_with_email_event);
    $("#email-login-signup-button").on("click", show_modal_signup_email);
    $("#email-login-sandbox").on("click", login_with_guest_account);

    //menu logout
    $("#sign-out-link").on("click", sign_out);
}

function show_modal_login_email(event = null)
{
    console.log("show_modal_login_email");
    if (event)
        event.preventDefault();
    $("#email-signup-modal").modal("hide").on("hidden.bs.modal", (event) => {
        event.preventDefault();
        $(event.currentTarget).off(event.type);
        $("#email-login-modal").modal("show").on("shown.bs.modal", (event) => {
            event.preventDefault();
            $(event.currentTarget).off(event.type);
        });
    });
}

function show_modal_signup_email(event = null)
{
    console.log("show_modal_signup_email");
    if (event)
        event.preventDefault();
    $("#email-login-modal").modal("hide").on("hidden.bs.modal", (event) => {
        event.preventDefault();
        $(event.currentTarget).off(event.type);
        $("#email-signup-modal").modal("show").on("shown.bs.modal", (event) => {
            event.preventDefault();
            $(event.currentTarget).off(event.type);
        });
    });
}

////////////////////
// LOGIN FUNCTIONS//
////////////////////
function login_with_email_event(event = null)
{
    if (event)
    {
        event.preventDefault();
        
        console.log($("#login-email").val());
        console.log($("#login-password").val());
    }
    let email = $("#login-email").val();
    let pass = $("#login-password").val();
    attempt_login_with_email(email, pass, false);
}

function login_with_guest_account(event = null)
{
    if (event)
    {
        event.preventDefault();
    }
    guest = true;
    attempt_login_with_email("sandbox@jamesmonks.com", "testing123", true);
}

function signup_with_email_event(event = null)
{
    console.log("signup_with_email_event");
    let email = $("#signup-email-email");
    let pass1 = $("#signup-email-password");
    let pass2 = $("#signup-email-password2");

    if (pass1.val() === pass2.val())
    {  
        console.log("equals");
        pass1.removeClass("is-invalid");
        pass2.removeClass("is-invalid");
        attempt_signup_with_email(email.val(), pass1.val());
    }
    else
    {
        console.log("not_equals");
        $("#signup-email-password-help").text("Passwords do not match");
        $("#signup-email-password2-help").text("Passwords do not match");
        pass1.addClass("is-invalid");
        pass2.addClass("is-invalid");
    }
}

function attempt_login_with_email(email, pass, is_guest)
{
    //auth.createUserWithEmailAndPassword(email, pass).catch(email_login_error);
    console.log("signin attempts", email, pass);
    guest = is_guest;
    auth.signInWithEmailAndPassword(email, pass).catch(email_login_error);
    
    function email_login_error(error) {
        console.log(error);
        
        reset_login_modals(false);

        switch (error.code)
        {
        case "auth/wrong-password": $("#login-password-help").text("Password error"); 
                                    $("#login-password").addClass("is-invalid");
                                    break;
        case "auth/user-not-found": $("#login-email-help").text("E-mail not found"); 
                                    $("#login-email").addClass("is-invalid");
                                    break;
        case "auth/invalid-email" : $("#login-email-help").text("Please retype the e-mail"); 
                                    $("#login-email").addClass("is-invalid");
                                    break;
        }

    }

}

function attempt_signup_with_email(email, pass)
{
    console.log("attempt_signup_with_email", email, pass);
    guest = false;
    try { auth.createUserWithEmailAndPassword(email, pass).catch( signup_failure ); }
    catch (error)
        { signup_failure(error); } //null arguments to auth function need a catch block
        
    function signup_failure(error = null) {
        console.log("signup_failure");
        console.log(error);
        switch(error.code)
        {
            case "auth/email-already-in-use" : 
                set_invalid("#signup-email-email", true);
                $("#signup-email-email-help").text("Email address already in use");
                break;
            case "auth/invalid-email" : 
                set_invalid("#signup-email-email", true);
                $("#signup-email-email-help").text(error.message);
                break;
            case "auth/weak-password" : 
                set_invalid("#signup-email-password", true);
                set_invalid("#signup-email-password2", true);
                $("#signup-email-password-help").text(error.message);
                $("#signup-email-password2-help").text(error.message);
                break;
            case "auth/argument-error" :
                console.log(error.message);
                break;
            case "auth/network-request-failed" :
                //TODO reload the page
                //TODO retry the connection
                break;
            default : break;
        }
    }
    
}

function logged_in()
{
    console.log("successful log in");
    load_user_bullets();
    reset_login_modals(true);
    $(".modal.show").modal("hide");
    // $("#email-signup-modal").modal("hide");
    // $("#email-login-modal").modal("hide");
    animateMenu();
}

function logged_out()
{
    reset_login_modals(true);
    //remove bullets
    //reset user
    //reset auth
    //show login
}

function reset_login_modals(clear_text = false)
{
    console.log("reset_email_login_form");
    $("#login-email-help").text("Please enter the e-mail you used to sign up.");
    $("#login-email").removeClass("is-invalid");
    $("#login-password-help").text("(Not the password for your email)");
    $("#login-password").removeClass("is-invalid");

    if (clear_text)
    {
        $("#login-email").val("");
        $("#login-password").val("");
    }
    
    $("#signup-email-email-help").text("Please enter your e-mail address");
    $("#signup-email-password-help").text("Create a password");
    $("#signup-email-password2-help").text("Re-enter your password");
    $("#signup-email-email").removeClass("is-invalid");
    $("#signup-email-password").removeClass("is-invalid");
    $("#signup-email-password2").removeClass("is-invalid");

    if (clear_text)
    {
        $("#signup-email-email").val("");
        $("#signup-email-password").val("");
        $("#signup-email-password2").val("");
    }
}

function load_user_bullets()
{
    
    $("#bulletItem").on("submit", addBulletListener);

    console.log("firebase.database.ServerValue.TIMESTAMP");
    console.log(firebase.database.ServerValue.TIMESTAMP);

    database.ref(`${auth.currentUser.uid}/bullets`).once("value").then(function(snapshot){
        let bullets = snapshot.val();
        // console.log(bullets);
        if (bullets != null)
        {
            Object.keys(bullets).forEach(key => {
                // console.log(key, bullets[key]);

                let obj = bullets[key];
                //let val = ref.val();
                obj.key = key;
                console.log("init:", key);

                if (bullet_timed_out(obj) && !guest)
                {
                    addBullet(obj);
                        
                    //push to array
                    tasklist.push( obj );
    
                    //listen for value changes
                    database.ref(`${auth.currentUser.uid}/bullets/${key}`).on("value", changedValue);
                }
                else
                    database.ref(`${auth.currentUser.uid}/bullets/${key}`).remove();
            });
        }
        if (guest)
        {
            console.log("adding guest values");
            $("#bullet").val("The checkbox strikes through the text");
            $("#bulletItem").trigger("submit");
            $("#bullet").val("The time on the right is how long this item will live for");
            $("#bulletItem").trigger("submit");
            $("#bullet").val("The delete button will remove the todo before the countdown ends");
            $("#bulletItem").trigger("submit");
            $("#bullet").val("There's more information on Bullet Journaling on the menu");
            $("#bulletItem").trigger("submit");
        }
    }).then(function() {
        
    });
}

function bullet_timed_out(obj)
{
    let eval = time_left(obj.timeStamp);
    console.log(`allow_bullet(obj.timeStamp = ${eval})`);
    return (eval > 0);
}

// JMTODO login failure and success feedback
function set_invalid(dom_elem, is_invalid = true)
{
    console.log(typeof dom_elem === "string");
    if (typeof dom_elem === "string")
        dom_elem = (dom_elem.indexOf("#") == -1) ? "#" + dom_elem: dom_elem;
    if (dom_elem instanceof jQuery)
    {
        if (dom_elem.length)
            for (let i=0; i < dom_elem.length; i++)
                set_invalid(dom_elem[i], is_invalid);
        return;
    }

    if (dom_elem instanceof Element || typeof dom_elem === "string")
    {
        console.log("elem or string == true");
        console.log($(dom_elem));
        if ($(dom_elem).hasClass("is-invalid"))
        {
            console.log("has is-invalid");
            if (!is_invalid) 
                $(dom_elem).removeClass("is-invalid");
        }
        else{
            console.log("does not have is-invalid");
            if (is_invalid)
                $(dom_elem).addClass("is-invalid")
        }
    }
}

function set_valid(dom_elem, is_valid = true)
{
    console.log(typeof dom_elem === "string");
    if (typeof dom_elem === "string")
        dom_elem = (dom_elem.indexOf("#") == -1) ? "#" + dom_elem: dom_elem;
    if (dom_elem instanceof jQuery)
    {
        if (dom_elem.length)
            for (let i=0; i < dom_elem.length; i++)
                set_invalid(dom_elem[i], is_invalid);
        return;
    }

    if (dom_elem instanceof Element || typeof dom_elem === "string")
    {
        console.log("elem or string == true");
        console.log($(dom_elem));
        if ($(dom_elem).hasClass("is-invalid"))
        {
            console.log("has is-invalid");
            if (!is_invalid) 
                $(dom_elem).removeClass("is-invalid");
        }
        else{
            console.log("does not have is-invalid");
            if (is_invalid)
                $(dom_elem).addClass("is-invalid")
        }
    }
}