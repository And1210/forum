/* question.js
** Created by Michael Albinson 2/15/17
*/

"use strict";

// question page specific templates
var questionTemplate = '<div class="info-block row" id="{9}" data-hasvoted="{10}" data-hastype="post">\
                            <div class="col-sm-12">\
                                <h2 class="title" id="title"><a href="/question?id={0}">{1}</a></h2>\
                                <span class="thumbs-up pointer" onclick="vote(this)" onkeypress="vote(this)" tabindex="0">\
                                    <img src="../assets/thumbsUp.svg" class="svg" />\
                                </span>\
                                <span id="votes" class="{2}">{3}</span>\
                                <span class="thumbs-down pointer" onclick="vote(this)" onkeypress="vote(this)" tabindex="0">\
                                    <img src="../assets/thumbsDown.svg" class="svg" />\
                                </span>\
                                <span class="date">Posted on {4} by <a href="/profile?username={5}">{6}</a></span>\
                                <div class="description show-links">{7}</div>\
                                <div class="action-links">\
                                    <a href="javascript: void 0;" onclick="subscribe(this)">Subscribe</a>\
                                    <a href="javascript: void 0;" onclick="save(this)">Save</a>\
                                    <a href="javascript: void 0;" onclick="triggerReportModal(this)" >Report</a>\
                                </div>\
                                {8}\
                                <div class="comment-button-wrap">\
                                    <button type="button" class="btn btn-sm button" data-toggle="collapse" data-target="#editor">Comment</button>\
                                </div>\
                                <div id="editor" class="collapse">\
                                    <br/>\
                                    <textarea name="editor1" id="editor2" rows="10" cols="80"></textarea>\
                                    <button id="test" type="button" class="btn btn-sm button" data-target="#editor" data-toggle="collapse" onclick="reply(this)">Submit</button>\
                                </div>\
                            </div>\
                        </div>';

// hold the itemID and the state of the page as a global variable
var itemID;
var loaded = false;

/**
 * Run once the page is loaded. Gets the question and its comments out of the database and renders them. Additionally,
 * this function sets up the editors appended to each of the comments and the question header.
 */
function whenLoaded() {
    var href;
    var content = {
        requested: "question"
    };

    if (window.location.href.includes("?"))
        href = '/info' + window.location.href.slice(window.location.href.indexOf('?'));
    else
        href = '/info';

    AJAXCall(href, content, true, onGetQuestionDataSuccess);
}

function onGetQuestionDataSuccess(data) {
    fillInQuestionHeader(data.question);
    addComments(data.comments);
    svgConverter();
    CKEDITOR.replace( 'editor1' );
    activateEditors();
    loaded = true;
}

/** Sets up and renders the question information as an HTML string, and then appends it to the page at the #questionHead
 *  element
 *
 * @param details: The question JSON object received from the server
 */
function fillInQuestionHeader(details) {
    var temp = fillTemplate(questionTemplate, details.id, details.title, positiveOrNegative(details.votes), details.votes, getDateString(details.date), details.author, details.author, details.summary, getTags(details.tags), details.id, details.voted);

    itemID = details.id;

    if (details.voted)
        updateItemsWithPolarity.push({id: details.id, polarity: details.voted});

    $('#questionHead').append(temp);
}

/** Adds the comments and subcomments to the page at the #comments. Additionally, changes the page footer depending on
 * if there are more comments that can be retrieved from the server or not.
 *
 * @param comments: The comment array retrieved from the server. Each comment is represented as a JSON object.
 */
function addComments(comments) {
    var template;

    if (comments.length === 0) {
        $('#getMore').hide();
        $('#foot').append("<h6 class='info-block'>Nothing here yet! Add a comment to get the discussion going!</h6>");
        return;
    }
    else if (comments.length < 10) {
        $('#foot').hide();
    }

    for (var comment in comments) {
        if (!comments.hasOwnProperty(comment))
            continue;

        if (comments[comment].voted)
            updateItemsWithPolarity.push({id: comments[comment].id, polarity: comments[comment].voted});

        template = fillCommentLevel1Template(comments[comment]);

        if (comments[comment].children) {
            for (var child in comments[comment].children) {
                if (!comments[comment].children.hasOwnProperty(child))
                    continue;

                if (comments[comment].children[child].voted)
                    updateItemsWithPolarity.push({id: comments[comment].children[child].id,
                        polarity: comments[comment].children[child].voted});

                template += fillCommentLevel2Template(comments[comment].children[child]);
            }
        }

        $('#comments').append(template);
    }
}

// render the page
$(document).ready(whenLoaded);
