// importing named exports we use brackets
import { createPostTile, uploadImage, createElement, checkStore} from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();
// time you have load the screen
var loadTimes;
// this global variable shows the number of posts you wanna load every time
const imageNoLoaded = 2;

function login() {  
    // get password and user name
    var username = document.getElementById("username").value;
    var playload = JSON.stringify({
        "username": username,
        "password": document.getElementById("password").value,
    })

    // if user haven't logged in 
    if (checkStore("curr_user") != null) {
        alert("you have already logged in");
        window.location.href = "/auth/login";
    } else {
        // read data from db and log in
        api.login(playload)
        .then((json)=>{
            if(json.token != null) {
                api.userInfo(json.token, username, null)
                .then((r) =>{
                    // store user info and authkey locally
                    window.localStorage.setItem("curr_user", JSON.stringify(r));
                    window.localStorage.setItem("AUTH_KEY", json.token);
                    // redirect to user page
                    window.location.href = "/user";
                })
            } else {
                alert("invalid username or password")
            }
        })
    }
}

// sign up page
function signUp() {
    // get password and user name
    var playload = JSON.stringify({
        "username": document.getElementById("Username").value,
        "password": document.getElementById("Password").value,
        "email": document.getElementById("Email").value,
        "name": document.getElementById("Name").value
    })

    api.signUp(playload);
}

// user main page
function userHome() {
    // load current user 
    const usr = JSON.parse(checkStore("curr_user"));

    // get the most recent data
    api.userInfo(checkStore("AUTH_KEY"),usr.username,usr.id)
    .then((user) =>{
        // set name
        document.getElementById("profile-user-name").textContent = user.username;
        // set follower post and following
        document.getElementById("follower").textContent = user.followed_num;
        document.getElementById("following").textContent = user.following.length;
        document.getElementById("post").textContent = user.posts.length;
        // personal info
        document.getElementById("realname").textContent = user.name;
        document.getElementById("emailAddress").textContent = user.email;
    })
}

// update user info
function update() {
    // grab user info fron the html
    const playload = JSON.stringify({
        "email": document.getElementById("Email").value,
        "name": document.getElementById("Name").value,
        "password": document.getElementById("Password").value
    })

    //call api
    api.updateInfo(checkStore("AUTH_KEY"), playload)
    .then(json => {
        alert("you have updated your info");
        window.location.href = "/user"; // redirecting
    })
}

// content of homepage logged in/no
function feedHomePage(AUTH_KEY, start, numberLoaded) { 
    // increment the time the posts loaded
    loadTimes++;
    // we can use this single api request multiple times
    const feed = api.getFeed(AUTH_KEY, start, numberLoaded);
    // default home page data
    feed
    .then(posts => {
        if (!(posts instanceof Array)) {
            posts = posts.posts;
        }
        posts.reduce((parent, post) => {
            parent.appendChild(createPostTile(post));
            return parent;
        }, document.getElementById('large-feed'))

        // add event listener for like but sleep for 0.5s
        setTimeout(()=>{
            // like button feature
            for (var iterator of document.getElementsByClassName("like-image")) {
                like(iterator);
            }
        },500) 
    });
}

// like function
function like(element) {
    // add event listener to the like buton
    element.addEventListener('click', ()=>{
        // switch src images
        if (element.src == "http://localhost:8080/styles/logos/likes.png") {
            element.src = 'styles/logos/likes_red.png';
            api.like(checkStore("AUTH_KEY"),element.id, "post/like");
        } else {
            element.src = 'styles/logos/likes.png';
            api.like(checkStore("AUTH_KEY"),element.id, "post/unlike")
        }
        // redirecting 
        setTimeout(()=>{
            window.location.href = "/";
        },100) 
    })
}

// user post function
function post() {
    // if no image selected or not logged in
    if (checkStore("image_src") == null) {
        alert("need to upload image")
        window.location.href = "/";
    } else if (checkStore("curr_user") == null) {
        alert("you need to log in")
        window.location.href = "/";
    }

    // render
    var post = JSON.stringify({
        "description_text": document.getElementById("description").value,
        "src": checkStore("image_src")
    })

    api.post(checkStore("AUTH_KEY"),post)
    .then((r)=>{
        // refresh comments
        window.location.href = "/";
    })
}

// infinite scroll
function handleScroll() {
    window.onscroll = function() {
        var scrollTop = window.pageYOffset;
        var bodyHeight = document.documentElement.scrollHeight - window.innerHeight;
        // if reach the end of page
        if(scrollTop >= bodyHeight) {
            // load more page
            feedHomePage(checkStore("AUTH_KEY"), imageNoLoaded*loadTimes,imageNoLoaded);
        }
    };
}

// home page
if (window.location.pathname == "/") {
    // Potential example to upload an image
    const input = document.querySelector('input[type="file"]');
    input.addEventListener('change', uploadImage);
    document.getElementById("post").addEventListener("click", post);

    var auth_key = checkStore("AUTH_KEY");
    if (auth_key == null) {
        // not logged in feed the default posts
        feedHomePage();
    } else {
        // feed from /user/feed
        loadTimes = 0;
        feedHomePage(auth_key,"0",imageNoLoaded.toString());
    }
    handleScroll();
}

// log in
if (window.location.pathname == "/auth/login") {
    document.getElementById("login-form").addEventListener("submit", login);
}


// sign up 
if (window.location.pathname == "/auth/signup") {
    document.getElementById("register-form").addEventListener("submit", signUp);
}

// user page
if (window.location.pathname == "/user") {
    // post user info to home page
    if (checkStore("curr_user") == null) {
        alert("you need to login to access home age");
        window.location.href = "/auth/login"; 
    } else {
        userHome();
    }    
}

// updatingi user profile
if (window.location.pathname == "/update_profile") {
    document.getElementById("update-form").addEventListener("submit", update);
}


// view others profile
if (window.location.pathname == "/view") {
    const usrname = window.location.href.replace('http://localhost:8080/view?','');
    api.userInfo(checkStore("AUTH_KEY"),usrname,null)
    .then((user) =>{
        document.getElementById("profile-user-name").textContent = user.username;
        // set follower post and following
        document.getElementById("follower").textContent = user.followed_num;
        document.getElementById("following").textContent = user.following.length;
        document.getElementById("post").textContent = user.posts.length;
        // personal info
        document.getElementById("realname").textContent = user.name;
        document.getElementById("emailAddress").textContent = user.email;
    })

    // add follow unfollow listener  
    const button = document.getElementsByClassName("btn profile-edit-btn")[0];
    button.addEventListener("click",() => {
        if(button.textContent == "Unfollow") {
            // unfollow
            button.textContent = "Follow";
            api.follow_unfollow(checkStore("AUTH_KEY"),usrname,"user/unfollow")
            .then(()=>{
                alert(`unfollow ${usrname} successfully`)
            })
        } else {
            // follow
            button.textContent = "Unfollow";
            api.follow_unfollow(checkStore("AUTH_KEY"),usrname,"user/follow")
            .then(()=>{
                alert(`follow ${usrname} successfully`)
            })
        }
    })
}