import API from './api.js';

const api  = new API();

/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML elemesnt desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}

/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post 
 * @returns {HTMLElement}
 */
export function createPostTile(post) {
    // create title and image
    var imageSrc = '/images/'+post.src; 
    // distinguish between defualt data or api
    if (post.src.length > 60) var imageSrc = 'data:image/png;base64,' + post.src;

    // this post section
    const section = createElement('section', null, { class: 'post' });

    // add top title of post
    const userTile = createElement('h2', post.meta.author , {class: 'post-title' });
    userTile.addEventListener("click",() => {window.location.href = "/view?" + post.meta.author;});
    section.appendChild(userTile);

    // add image for post
    const postImage = createElement('img', null, 
    { src: imageSrc, alt: post.meta.description_text, class: 'post-image' })
    section.appendChild(postImage);
    postImage.addEventListener("click",() => {window.location.href = "/view?" + post.meta.author;});

    // add like button and comment button
    var div = createElement('div'); section.appendChild(div);
    var like_logo = createElement('img', null,{ src: 'styles/logos/likes.png',class: 'like-image', id: post.id ,hspace: '10'}); div.appendChild(like_logo);
    var comment_logo = createElement('img', null,{ src: 'styles/logos/comment.png' ,class: 'comment-image' }); div.appendChild(comment_logo);

    // add time 
    div.appendChild(createElement('div',post.meta.published.split(" ").slice(1, 5).join(" "),{ class: 'time'}));
    
    // description
    div.appendChild(createElement('div',post.meta.description_text, { class: 'time'}));

    // add show num likes and coment
    var post_like = createElement('div', post.meta.likes.length + " likes",{ class: 'post-like' });
    var post_comment = createElement('div', post.comments.length + " comments",{ class: 'post-comment' });
    div.appendChild(post_like);
    div.appendChild(post_comment);
    
    // if no user logged in feed the default data, no need to proceed the code below
    if (checkStore("curr_user") == null)  return section;

    // show a list of user who commented
    var temp = createElement('div',"",{class: 'comment'});
    for (var iterator of post.comments) {
        var span = createElement('p');
        span.textContent = iterator.author + ": " + iterator.comment;
        temp.appendChild(span);
    }
    div.appendChild(temp);
    toggle(post_comment,temp);

    // show a list of user who liked
    // check if current user hit like
    const curr_user_id = JSON.parse(checkStore("curr_user")).id;
    var tmp = createElement('div',"",{class: 'like'}); div.appendChild(tmp);
    for (var id of post.meta.likes) {
        // if current uesr hit like, change the default like logo
        if (curr_user_id == id) like_logo.src = 'styles/logos/likes_red.png';
        // call api to get info of user who hit like
        api.userInfo(checkStore("AUTH_KEY"),null,id)
        .then((r) =>{
            var span = createElement('p');
            // add user name
            span.textContent = r.username + " liked";
            tmp.appendChild(span);
        })
    }
    toggle(post_like,tmp);

    // add comment session so user can leave comment here
    var temp = createElement('div',"",{class: 'comment'}); div.appendChild(temp);
    var input = createElement('input', {type: 'text', class: 'user_comment', value: ''}); temp.appendChild(input);
    var button = createElement('button',"comment" , {type: 'button', class: 'comment_button'}); temp.appendChild(button);
    input.placeholder = "leave your comment";
    toggle(comment_logo,temp);
    
    // add a event listener 
    button.addEventListener('click', () => {
        var playload = JSON.stringify({
            "author": post.meta.author,
            "published": post.meta.published,
            "comment": input.value
        })
        // call the api to submit request 
        api.comment(checkStore("AUTH_KEY"),playload,post.id)
        .then((r) =>{
            window.location.href = "/"; // redirecting
        })
    });

    return section;
}

// add toggle class behavior
function toggle(parent, child) {
    child.style.display = "none";
    parent.addEventListener('click', ()=>{
        if (child.style.display === "none") {
            child.style.display = "block";
        } else {
            child.style.display = "none";
        }

        if (parent.className == "comment-image") {
            if (parent.src == "http://localhost:8080/styles/logos/comment.png") {
                parent.src = 'styles/logos/commented.png';
            } else {
                parent.src = 'styles/logos/comment.png';
            }
        }
    })
}

// Given an input element of type=file, grab the data uploaded for use
export function uploadImage(event) {
    const [ file ] = event.target.files;
    
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
        return false;
    
    // if we get here we have a valid image
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // extract only the bse 64 src
        const dataURL = e.target.result;
        var src = dataURL.replace('data:image/png;base64,','');

        // upload this to local storage
        localStorage.setItem("image_src", src);
    };
    // this returns a base64 image
    reader.readAsDataURL(file);
}

// check local storage and return the user
export function checkStore(key) {
    return window.localStorage.getItem(key);
}