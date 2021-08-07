var postsContainer, nextButton, previousButton, editForm, editTitleInput, editTextInput;

// default page 0 of all posts
var page = 1;

function clearPosts() {

    while(postsContainer.children.length) {
        postsContainer.removeChild(postsContainer.children[0])
    }
}

function like(e) {

    const post_id = this.parentElement.parentElement.parentElement.dataset.id;
    var currentState = this.classList.contains("liked");
    fetch("/likes", {

        method: !currentState? "POST" : "DELETE",
        mode: "same-origin",
        headers: new Headers({

            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken").value,
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({post_id, liked: !currentState})
    })
    .then(r => {

        const nextSibling = this.nextElementSibling;
        if (!currentState == true) {
            // liked
            nextSibling.innerText = parseInt(nextSibling.innerText) + 1;
            this.classList.add("liked")
        } else {
            // unliked
            nextSibling.innerText = parseInt(nextSibling.innerText) - 1;
            this.classList.remove("liked")
        }
    })

}

function createPost(post_information, form=null, userid=null) {

    // creating the post
    const tempContainer = document.createElement("div");
    tempContainer.classList.add("post")
    tempContainer.dataset.id = post_information.id;
    const tempContentContainer = document.createElement("div");
    tempContentContainer.classList.add("post-content")
    const editButton = document.createElement("button");
    editButton.classList.add("edit")
    editButton.innerText = "Edit"
    const who = document.createElement("a");
    who.setAttribute('href', `/users/${post_information.user_id}`)
    who.innerText = `By ${post_information.username}`;
    const header = document.createElement("h3");
    header.innerText = post_information.title;
    const paragraph = document.createElement("p");
    paragraph.innerText = post_information.text;
    const spanContainer = document.createElement("span");
    const heart = document.createElement("img");
    heart.classList.add("heart")
    heart.setAttribute("src", "/static/network/images/heart.svg")
    heart.setAttribute("height", "15px")
    heart.setAttribute("width", "15px")
    heart.addEventListener("click", like)
    const tempP = document.createElement("p");
    tempP.innerHTML = `&nbsp;${post_information.likes}&nbsp;`;
    tempP.style.display = "inline-block";
    spanContainer.appendChild(heart)
    spanContainer.appendChild(tempP)
    // for created or updated 
    const time = document.createElement("time");
    time.setAttribute("datetime", post_information.created)
    time.innerText = (post_information.updated ? "Updated: " : "") + post_information.created;
    const comment = document.createElement("a");
    comment.innerText = "Comment";
    if (parseInt(post_information.user_id) == userid) {
        tempContentContainer.appendChild(editButton)
        editButton.addEventListener("click", function() {

            // if the edit form is in a post still, then hide the form, so that the post
            // that was clicked can use it.
            if (editForm.parentElement.classList.contains("post")) {
                hideForm()
            }

            const parentElement = this.parentElement.parentElement;

            // add editing class
            parentElement.classList.toggle("editing");

            const content = parentElement.querySelector(".post-content");
            // TODO add an animation where the content is inactive when we are trying to load
            // the post data, also disable the inputs
            parentElement.appendChild(editForm);

            fetch(`/posts?id=${parentElement.dataset.id}`)
            .then(async r => await r.json())
            .then(r => {
                // information of post recieved, set form edit inputs value to the information recieved.
                editTitleInput.value = r.title;
                editTextInput.value = r.text;
            }).catch(e => {console.log(e);})
        })
    }
    tempContentContainer.appendChild(who)
    tempContentContainer.appendChild(header)
    tempContentContainer.appendChild(paragraph)
    tempContentContainer.appendChild(spanContainer)
    tempContentContainer.appendChild(time)
    tempContentContainer.appendChild(comment)
    tempContainer.appendChild(tempContentContainer)
    if (form) {
        postsContainer.insertBefore(tempContainer, postsContainer.firstChild)
    } else {
        postsContainer.appendChild(tempContainer)
    }
} 

function morePosts() {

    fetch(`/is_more?page=${page}${document.location.pathname == '/following' ? "&following=True" : ""}`)
    .then(async r => await r.json())
    .then(r => {
        if (r.result) {
            // displaying the button
            nextButton.classList.remove("hidden");
            // TODO what if the user removes hidden in the html inspector and a request is sent 
            // to get more posts, constraint for that
        } else {
            nextButton.classList.add("hidden");
        }
    }).catch(e => console.log(e))
}

///
//// When the page content has loaded
/// 
document.addEventListener("DOMContentLoaded", function() {

    postsContainer = document.querySelector("#posts"); 

    var path = document.location.pathname == "/" ? "posts" : "following";

    editForm = document.querySelector("#edit-form");
    editTitleInput = editForm.querySelector("#id_title");
    editTextInput = editForm.querySelector("#id_text");

    // get all the posts and render in the postsContainer
    fetch(`/${path}?page=${page}`)
    .then(async r => await r.json())
    .then(r => {
        for (const post of r.posts) {
            createPost(post, null, r.userid)
        }
    }).catch(e => {console.log(e)})

    // onload of the document check if there are most posts to be displayed 
    morePosts()

    ///
    //// Traversing through posts (previous and next buttons)
    ///
    nextButton = document.querySelector("#next");
    previousButton = document.querySelector("#previous");
    nextButton.addEventListener("click", function() {

        // load all the posts that are on page + 1 from current
        page += 1;
        fetch(`/${path}?page=${page}`)
        .then(async r => await r.json())
        .then(r => {
            if (page >= 1 && previousButton.classList.contains("hidden")) {
                previousButton.classList.remove("hidden")
            }
            morePosts()
            clearPosts()
            for (const post of r.posts) {
                createPost(post)
            }
        }).catch(e => console.log(e))
    })
    previousButton.addEventListener("click", function() {

        page -= 1;
        fetch(`/${path}?page=${page}`)
        .then(async r => await r.json())
        .then(r => {
            if (page == 1 && previousButton.classList.contains("hidden") == false) {
                previousButton.classList.add("hidden")
            }
            morePosts()
            clearPosts()
            for (const post of r.posts) {
                createPost(post)
            }
        }).catch(e => console.error(e))
    })

    ///
    ////// EDIT FORM
    ///

    const hideForm = () => {
        // remove editing class
        editForm.parentElement.classList.toggle("editing");

        // move this form from the post to the body and hide
        document.querySelector("body").appendChild(editForm);

        // erasing the input since its not going to belong to anything anymore, when it belongs
        // to a post, then it will be filled with the posts information.
        editTitleInput.value = null;
        editTextInput.value = null;
    };

    editForm.addEventListener("submit", function(e) {

        e.preventDefault();
        // TODO: check on change of the edit form inputs, if changed after Edit ON THE FORM
        // button has been clicked then patch, otherwise if no edit was made do not fetch
        // to server.
        fetch(`/posts?id=${this.parentElement.dataset.id}`, {
            method: "PATCH",
            mode: "same-origin",  // used so that I do not send CSRF token anywher else. good practice. https://docs.djangoproject.com/en/3.2/ref/csrf/#setting-the-token-on-the-ajax-request 
            headers: new Headers({
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken").value,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({
                title: editTitleInput.value,
                text: editTextInput.value
            })
        })
        .then(r => {
            // success, edit the text of the post and hide this form
            // replacing the text of the post title and text with the patched version
            editForm.parentElement.querySelector("h3").innerText = editTitleInput.value;
            editForm.parentElement.querySelector("p").innerText = editTextInput.value;
            hideForm()
        }).catch(e => {console.log(e);})
    })

})
