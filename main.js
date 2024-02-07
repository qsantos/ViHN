const things = Array.from(document.getElementsByClassName('athing'));

let currentThing = document.querySelector('.athing:target');
if (currentThing) {
    currentThing.classList.add('activething');
}

// handle the “XXX more comments” link like a thing
const morelink = document.getElementsByClassName('morelink')[0];
const morelinkThing = morelink ? morelink.parentElement.parentElement : null;
if (morelink) {
    morelinkThing.id = 'morelink';
    things.push(morelinkThing);
    if (document.location.hash == '#morelink') {
        currentThing = morelinkThing;
        currentThing.classList.add('activething');
        currentThing.scrollIntoView(true);
    }
}

// from https://stackoverflow.com/a/34064434/4457767
function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

function formatComment(comment) {
    return comment.split('\n\n').map(paragraph => {
        if (paragraph.startsWith('  ')) {
            return '<code><pre>' + paragraph + '</code></pre>';
        }
        const htmlEscaped = paragraph.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
        // replaces *something*, but not **something**, \*something\*, \*something**, etc.
        const italicized = htmlEscaped.replace(/(?<!\\|\*)\*((?!\*).*?(?<!\\|\*))\*(?!\*)/sg, '<i>$1</i>');
        // URL regex inspired from https://stackoverflow.com/a/6041965/4457767
        // plus ugly hack at the end to avoid parsing escaped '>' as part of search parameters
        const linkified = italicized.replace(/https?:\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])(?!(?<=&gt);|(?<=&g)t;|(?<=&)gt;)/g, '<a href="$&">$&</a>');
        return '<p>' + linkified + '</p>';
    }).join('');
}

const thingIndexes = [];
things.forEach((thing, index) => thingIndexes[thing.id] = index);

// Newest Items
const datedIndexes = Array.from(document.getElementsByClassName('age'))
    .map((age , index)=> [age.title, index])
    // Chrome is very slow without an explicit comparison function
    .sort((a1, a2) => a1[0] < a2[0] ? -1 : a1[0] == a2[0] ? 0 : 1)
    .reverse();
{
    const hasOtherPages = morelinkThing != null || document.location.search.indexOf('&p=') > 0
    const div = document.createElement('DIV');
    div.id = 'newest-items';
    // Setting innerHTML is still faster than doing DOM
    div.innerHTML = (
        '<h3><u>N</u>ewest Items</u></h3>'
        + (hasOtherPages ? '<p>(items on this page)</p>' : '')
        + '<ul>'
        + datedIndexes.map(([date, index]) => `<li data-index="${index}">${date}</li>`).join('')
        + '</ul>'
    );
    // Make the addition of Newest Comments idempotent (useful for extension reloading when debugging)
    const previousLatestComment = document.getElementById('newest-items');
    if (previousLatestComment) {
        previousLatestComment.remove();
    }
    div.addEventListener('click', event => {
        gotoThingFromIndex(event.target.dataset.index);
    });
    document.body.appendChild(div);
}
const newestList = document.querySelector('#newest-items ul')
let focusNewest = false;
let currentNewestIndex = 0;

function gotoNewestIndex(index) {
    newestList.children[currentNewestIndex].classList.remove('activenewest');
    currentNewestIndex = index;
    newestList.children[currentNewestIndex].classList.add('activenewest');
    gotoThingFromNewestIndex(currentNewestIndex);
}

function gotoThingFromNewestIndex(newestIndex) {
    const thingIndex = datedIndexes[newestIndex][1];
    gotoThingFromIndex(thingIndex);
}

function gotoThingFromIndex(index) {
    if (!index) {
        return;
    }
    const thing = things[index];
    // Uncollapse all the ancestors to make the thing visible
    let currentDepth = thingDepth(thing);
    let otherIndex = index - 1;
    // We need to uncollapse ancestors in descending order to avoid showing children of other collapsed things
    const ancestorsToUncollapse = [];
    while (currentDepth > 0) {
        // Find previous ancestor
        while (otherIndex > 0) {
            const otherDepth = thingDepth(things[otherIndex]);
            if (otherDepth < currentDepth) {
                currentDepth = otherDepth;
                break;
            }
            otherIndex--;
        }
        const otherThing = things[otherIndex];
        if (otherThing.classList.contains('coll')) {
            ancestorsToUncollapse.push(otherThing);
        }
    }
    // Uncollapse ancestors in descending order
    for (const ancestor of ancestorsToUncollapse.reverse()) {
        ancestor.getElementsByClassName('togg')[0].click();
    }
    // The thing is now visible, we can navigate to it
    gotoThing(thing);
}

const op = document.querySelector('.fatitem .hnuser');
if (op) {
    const opUsername = op.textContent;
    const hnusers = document.getElementsByClassName('hnuser');
    for (const hnuser of hnusers) {
        if (hnuser.textContent == opUsername) {
            hnuser.classList.add('op');
        }
    }
}

function thingDepth(thing) {
    const indentTd = thing.querySelector('td[indent]');
    if (!indentTd) {
        return 0;
    }
    return parseInt(indentTd.getAttribute('indent')) ||0;
}

function thingIsHidden(thing) {
    return thing.classList.contains('noshow');
}

let historyUpdateTimer = null;
function gotoThing(thing) {
    if (thing) {
        // Defer history update to avoid too many uses of the API, when the
        // user navigates through many things in a short amount of time
        clearTimeout(historyUpdateTimer);
        historyUpdateTimer = setTimeout(() => {
            document.location.replace('#' + thing.id);
            historyUpdateTimer = null;
        }, 50);
        // Immediately makes the change visible
        thing.scrollIntoView(true);
        if (currentThing) {
            currentThing.classList.remove('activething');
        }
        currentThing = thing;
        currentThing.classList.add('activething');
    }
}

let quickReplyForm = null;
let quickReplyFormParent = null;
let quickReplyFormGoto = null;
let quickReplyFormHmac = null;
let quickReplyFormTextarea = null;
let quickReplyFormSubmit = null;
function initQuickReplyForm() {
    if (quickReplyForm != null) {
        return;
    }
    const container = document.createElement('tbody');
    container.innerHTML = `
        <tr>
            <td colspan="2"></td>
            <td>
                <form action="comment" method="post">
                    <input type="hidden" name="parent" value="">
                    <input type="hidden" name="goto" value="">
                    <input type="hidden" name="hmac" value="">
                    <textarea name="text" rows="8" cols="80" wrap="virtual" autofocus="true"></textarea>
                    <a href="formatdoc" tabindex="-1">
                        <font size="-2" color="#afafaf">help</font>
                    </a>
                    <br>
                    <div class="preview"/></div>
                    <br>
                    <input type="submit" value="reply">
                    <span class="error"></span>
                </form>
            </td>
        </tr>
    `.trim();
    quickReplyForm = container.firstChild;
    quickReplyFormParent = container.querySelector('[name="parent"]');
    quickReplyFormGoto = container.querySelector('[name="goto"]');
    quickReplyFormHmac = container.querySelector('[name="hmac"]');
    quickReplyFormTextarea = container.getElementsByTagName('textarea')[0];
    quickReplyFormPreview = container.getElementsByClassName('preview')[0];
    quickReplyFormSubmit = container.querySelector('[type="submit"]');
    quickReplyFormError = container.getElementsByClassName('error')[0];
    quickReplyFormTextarea.addEventListener('input', event => {
        quickReplyFormPreview.innerHTML = formatComment(quickReplyFormTextarea.value);
    });
}

let editForm = null;
let editFormId = null;
let editFormHmac = null;
let editFormTextarea = null;
let editFormSubmit = null;
function initEditForm() {
    if (editForm != null) {
        return;
    }
    const container = document.createElement('tbody');
    container.innerHTML = `
        <tr>
            <td colspan="2"></td>
            <td>
                <form class="itemform" action="/xedit" method="post">
                    <input type="hidden" name="id" value="">
                    <input type="hidden" name="hmac" value="">
                    <textarea name="text" rows="5" cols="60" wrap="virtual"></textarea>
                    <a href="formatdoc" tabindex="-1">
                        <font size="-2" color="#afafaf">help</font>
                    </a>
                    <br>
                    <div class="preview"/></div>
                    <br>
                    <input type="submit" value="update"><br><br>
                </form>
            </td>
        </tr>
    `.trim();
    editForm = container.firstChild;
    editFormId = container.querySelector('[name="id"]');
    editFormHmac = container.querySelector('[name="hmac"]');
    editFormTextarea = container.getElementsByTagName('textarea')[0];
    editFormPreview = container.getElementsByClassName('preview')[0];
    editFormSubmit = container.querySelector('[type="submit"]');
    editFormTextarea.addEventListener('input', event => {
        editFormPreview.innerHTML = formatComment(editFormTextarea.value);
    });
}

function thingEvent(event) {
    const currentThingIndex = thingIndexes[currentThing ? currentThing.id : ''];
    if (event.key == 'j') {
        /* Next thing */
        if (currentThingIndex == undefined) {
            gotoThing(things[0]);
        } else {
            let nextThingIndex = currentThingIndex + 1;
            while (nextThingIndex < things.length && thingIsHidden(things[nextThingIndex])) {
                nextThingIndex++;
            }
            gotoThing(things[nextThingIndex]);
        }
    } else if (event.key == 'k') {
        /* Previous thing */
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && nextThingIndex < things.length && thingIsHidden(things[nextThingIndex])) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'J') {
        /* Next sibling thing */
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex + 1;
        while (nextThingIndex < things.length && (thingIsHidden(things[nextThingIndex]) || thingDepth(things[nextThingIndex]) > currentDepth)) {
            nextThingIndex++;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'K') {
        /* Previous sibling thing */
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && (thingIsHidden(things[nextThingIndex]) || thingDepth(things[nextThingIndex]) > currentDepth)) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'h' || event.key == 'p') {
        /* Parent comment (h: say in context when changing page, p: directly go to comment) */
        if (!currentThing || currentThingIndex == 0) {
            // Use context link for h, and parent link for p
            const selector = event.key == 'h' ? '.navs>a+a' : '.navs>a';
            const parentLink = things[0].querySelector('.navs>a+a');
            if (parentLink) {
                parentLink.click();
            }
            return;
        }
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && (thingIsHidden(things[nextThingIndex]) || thingDepth(things[nextThingIndex]) >= currentDepth)) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'm') {
        /* Toggle comment tree */
        if (currentThing) {
            const collapseToggle = currentThing.getElementsByClassName('togg')[0];
            if (collapseToggle) {
                collapseToggle.click();
            }
        }
    } else if (event.key == 'l' || event.key == 'L') {
        /* Open thing permalink (l: foreground, L: background) */
        if (currentThing == morelinkThing) {
            morelink.click();
        } else {
            const anchor = (currentThing || document).querySelector('.titleline>a');
            const relativeUrl = anchor ? anchor.href : 'item?id=' + currentThing.id;
            const url = new URL(relativeUrl, document.location).href;
            chrome.runtime.sendMessage({
                action: 'open',
                url,
                active: event.key == 'l',
            });
        }
    } else if (event.key == 'c' || event.key == 'C') {
        /* Open comments (c: foreground, C: background) */
        if (currentThing) {
            if (currentThing == morelinkThing) {
                morelink.click();
            } else {
                const subtext = currentThing.nextElementSibling;
                if (subtext && !subtext.classList.contains('athing')) {
                    const anchor = subtext.querySelector('.age>a');
                    const relativeUrl = anchor.href;
                    const url = new URL(relativeUrl, document.location).href;
                    chrome.runtime.sendMessage({
                        action: 'open',
                        url,
                        active: event.key == 'c',
                    });
                }
            }
        }
    } else if (event.key == 'g') {
        /* Go to last thing */
        gotoThing(things[0]);
    } else if (event.key == 'G') {
        /* Go to first thing */
        const topThings = document.querySelectorAll('.athing:has([indent="0"]),#morelink');
        const thing =  topThings[topThings.length - 1]
        gotoThing(thing);
    } else if (event.key == 'u') {
        /* Upvote */
        const upArrow = document.getElementById('up_' + currentThing.id);
        if (!upArrow) {
        } else if (upArrow.classList.contains('nosee')) {
            // upArrow hidden, we can only unvote
            const unvoteLink = document.getElementById('un_' + currentThing.id);
            if (unvoteLink) {
                unvoteLink.click();
            }
        } else {
            upArrow.click();
        }
    } else if (event.key == 'd') {
        /* Downvote */
        const downArrow = document.getElementById('down_' + currentThing.id);
        if (!downArrow) {
        } else if (downArrow.classList.contains('nosee')) {
            // downArrow hidden, we can only undown
            const unvoteLink = document.getElementById('un_' + currentThing.id);
            if (unvoteLink) {
                unvoteLink.click();
            }
        } else {
            downArrow.click();
        }
    } else if (event.key == 'r') {
        /* Comment on story, or reply to comment */
        if (!currentThing || currentThingIndex == 0) {
            const newCommentTextarea = document.getElementsByTagName('textarea')[0];
            if (newCommentTextarea) {
                newCommentTextarea.focus();
            }
        } else {
            // can comment:    <div class="reply"><p><font><u><a>reply
            // cannot comment: <div class="reply"><p><font>
            const replyDiv = currentThing.getElementsByClassName('reply')[0];
            const canReply = replyDiv?.firstElementChild?.firstElementChild?.firstElementChild !== null;
            if (canReply) {
                initQuickReplyForm();
                quickReplyFormSubmit.disabled = true;
                quickReplyFormError.innerText = '';
                const loc = document.location;
                const goto = loc.pathname.substr(1) + loc.search + '#' + currentThing.id;
                // NOTE: fetch only accepts absolute URLs
                // see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#content_script_https_requests
                const url = 'https://news.ycombinator.com/reply?id=' + currentThing.id + '&goto=' + encodeURIComponent(goto);
                fetch(url).then(response => {
                    if (response.status != 200) {
                        quickReplyFormError.innerText = 'Unexpected error (' + response.status + ')';
                        return;
                    }
                    response.text().then(html => {
                        const parentMatch = html.match(/<input type="hidden" name="parent" value="(.*?)">/);
                        const hmacMatch = html.match(/<input type="hidden" name="hmac" value="(.*?)">/);
                        if (parentMatch && hmacMatch) {
                            quickReplyFormParent.value = parentMatch[1];
                            quickReplyFormHmac.value = hmacMatch[1];
                            quickReplyFormSubmit.disabled = false;
                        } else if (html.match('You have to be logged in to reply.<br>')) {
                            quickReplyFormError.innerText = 'You need to be logged in to reply';
                        } else if (html.match("<td>Sorry, you can't comment here.</td>")) {
                            quickReplyFormError.innerText = 'Cannot reply to this anymore (thread locked or comment deleted)';
                        } else {
                            console.warn(html);
                            quickReplyFormError.innerText = 'Unexpected error';
                        }
                    }).catch(() => {
                        quickReplyFormError.innerText = 'Failed to read response; are you connected to the Internet?';
                    });
                }).catch(() => {
                    quickReplyFormError.innerText = 'Connection failure; are you connected to the Internet?';
                });
                quickReplyFormGoto.value = goto;
                currentThing.getElementsByTagName('tbody')[0].appendChild(quickReplyForm);
                quickReplyFormTextarea.focus();
            }
        }
    } else if (event.key == 'e') {
        /* Edit */
        const editLink = currentThing.querySelector('a[href^="edit"]');
        if (editLink) {
            const replyDiv = currentThing.getElementsByClassName('reply')[0];
            initEditForm();
            editFormSubmit.disabled = true;
            editFormTextarea.disabled = true;
            editFormTextarea.value = 'loading…';
            const url = 'https://news.ycombinator.com/edit?id=' + currentThing.id;
            fetch(url).then(response => {
                if (response.status != 200) {
                    editFormTextarea.value = 'Unexpected error (' + response.status + ')';
                    return;
                }
                response.text().then(html => {
                    const hmacMatch = html.match(/<input type="hidden" name="hmac" value="(.*?)">/);
                    const textMatch = html.match(/<textarea name="text" .*?>(.*?)<\/textarea>/s);
                    if (hmacMatch && textMatch) {
                        const content = htmlDecode(textMatch[1]);
                        editFormHmac.value = hmacMatch[1];
                        editFormTextarea.value = content;
                        editFormPreview.innerHTML = formatComment(content);
                        editFormSubmit.disabled = false;
                        editFormTextarea.disabled = false;
                        editFormTextarea.focus();
                    } else {
                        editFormTextarea.value = 'You cannot edit this';
                    }
                }).catch(() => {
                    editFormTextarea.value = 'Failed to read response; are you connected to the Internet?';
                });
            }).catch(() => {
                editFormTextarea.value = 'Connection failure; are you connected to the Internet?';
            });
            editFormId.value = currentThing.id;
            const tbody = currentThing.getElementsByTagName('tbody')[0] || currentThing.parentElement;
            tbody.appendChild(editForm);
        }
    } else if (event.key == 'D') {
        /* Delete */
        const deleteLink = currentThing.querySelector('a[href^="delete-confirm"]');
        if (deleteLink && confirm('Are you sure you want to delete this comment?')) {
            deleteLink.textContent = '…';
            const loc = document.location;
            const goto = loc.pathname.substr(1) + loc.search;
            // NOTE: fetch only accepts absolute URLs
            // see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#content_script_https_requests
            const url = 'https://news.ycombinator.com/delete-confirm?id=' + currentThing.id + '&goto=' + encodeURIComponent(goto);
            fetch(url).then(response => {
                if (response.status !== 200) {
                    deleteLink.textContent = 'delete';
                    alert('Unexpected error (' + response.status + ')');
                    return;
                }
                response.text().then(html => {
                    const hmacMatch = html.match(/<input type="hidden" name="hmac" value="(.*?)">/);
                    if (hmacMatch) {
                        const formData = new URLSearchParams();
                        formData.append('id', currentThing.id);
                        formData.append('goto', goto);
                        formData.append('hmac', hmacMatch[1]);
                        formData.append('d', 'Yes');
                        fetch('https://news.ycombinator.com/xdelete', {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        }).then(response => {
                            if (response.url) {
                                document.location = response.url;
                            } else {
                                console.warn(response);
                                deleteLink.textContent = 'delete';
                                alert('Unexpected response while deleting comment');
                            }
                        }).catch(() => {
                            deleteLink.textContent = 'delete';
                            alert('Second connection failure; are you connected to the Internet?');
                        });
                    } else if (html == "You can't delete that.")  {
                        deleteLink.textContent = 'delete';
                        alert('You cannot delete this comment');
                    } else {
                        console.warn(html);
                        deleteLink.textContent = 'delete';
                        alert('Unexpected error while deleting comment');
                    }
                }).catch(() => {
                    deleteLink.textContent = 'delete';
                    alert('Failed to read response; are you connected to the Internet?');
                });
            }).catch(() => {
                deleteLink.textContent = 'delete';
                alert('Connection failure; are you connected to the Internet?');
            });
        }
    } else if (event.key == 'f') {
        /* Favorite */
        const thing = currentThing || things[0];
        const faveLink = thing.querySelector('a[href^="fave"]') || thing.nextSibling?.querySelector?.('a[href^="fave"]');
        if (faveLink) {
            const url = faveLink.href;
            const originalLinkLabel = faveLink.textContent;
            faveLink.textContent = '…';
            fetch(url).then(response => {
                if (response.status !== 200) {
                    faveLink.textContent = originalLinkLabel;
                    alert('Unexpected error (' + response.status + ')');
                    return;
                }
                response.text().then(html => {
                    if (html.match('Please log in.<br>')) {
                        faveLink.textContent = originalLinkLabel;
                        alert('You are not connected');
                    } else {
                        /* Switch URL between favorite/un-favorite and update link label */
                        const searchParams = new URLSearchParams(url.substr(url.indexOf('?')));
                        if (searchParams.get('un')) {
                            searchParams.delete('un');
                            faveLink.textContent = 'favorite';
                        } else {
                            searchParams.set('un', 't');
                            faveLink.textContent = 'un-favorite';
                        }
                        faveLink.href = 'fave?' + searchParams.toString();
                    }
                }).catch(() => {
                    faveLink.textContent = originalLinkLabel;
                    alert('Failed to read response; are you connected to the Internet?');
                });
            }).catch(() => {
                faveLink.textContent = originalLinkLabel;
                alert('Connection failure; are you connected to the Internet?');
            });
        }
    } else if (event.key == 'F') {
        /* Flag */
        const thing = currentThing || things[0];
        const flagLink = thing.querySelector('a[href^="flag"]') || thing.nextSibling?.querySelector?.('a[href^="flag"]');
        if (flagLink) {
            const url = flagLink.href;
            const originalLinkLabel = flagLink.textContent;
            flagLink.textContent = '…';
            fetch(url).then(response => {
                if (response.status !== 200) {
                    flagLink.textContent = originalLinkLabel;
                    alert('Unexpected error (' + response.status + ')');
                    return;
                }
                response.text().then(html => {
                    if (html.match('Please log in.<br>')) {
                        flagLink.textContent = originalLinkLabel;
                        alert('You are not connected');
                    } else {
                        /* Switch URL between flag/unflag and update link label */
                        const searchParams = new URLSearchParams(url.substr(url.indexOf('?')));
                        if (searchParams.get('un')) {
                            searchParams.delete('un');
                            flagLink.textContent = 'flag';
                        } else {
                            searchParams.set('un', 't');
                            flagLink.textContent = 'unflag';
                        }
                        flagLink.href = 'flag?' + searchParams.toString();
                    }
                }).catch(() => {
                    flagLink.textContent = originalLinkLabel;
                    alert('Failed to read response; are you connected to the Internet?');
                });
            }).catch(() => {
                flagLink.textContent = originalLinkLabel;
                alert('Connection failure; are you connected to the Internet?');
            });
        }
    } else if (event.key == 'n') {
        /* Switch to Newest Items */
        focusNewest = true;
        newestList.classList.add('activenewestlist');
        gotoNewestIndex(currentNewestIndex);
    } else {
        return;
    }
    event.stopPropagation();
    event.preventDefault();
}

function newestEvent(event) {
    if (event.key == 'n') {
        /* Switch back from Newest Items */
        focusNewest = false;
        newestList.classList.remove('activenewestlist');
    } else if (event.key == 'j') {
        /* Next newest */
        if (currentNewestIndex < newestList.childElementCount - 1) {
            gotoNewestIndex(currentNewestIndex + 1);
        }
    } else if (event.key == 'k') {
        /* Previous newest */
        if (currentNewestIndex > 0) {
            gotoNewestIndex(currentNewestIndex - 1);
        }
    } else if (event.key == 'g') {
        /* First newest */
        gotoNewestIndex(0);
    } else if (event.key == 'G') {
        /* Last newest */
        gotoNewestIndex(newestList.childElementCount - 1);
    } else {
        return;
    }
    event.stopPropagation();
    event.preventDefault();
}

document.addEventListener('keydown', (event) => {
    if (event.target.tagName == 'TEXTAREA') {
        if (event.key == 'Escape') {
            event.target.blur();
        } else if (event.ctrlKey && event.key == 'Enter') {
            event.target.parentNode.submit();
        }
    } else if (event.ctrlKey || event.altKey || event.metaKey) {
        // do not capture Ctrl+r and such
        return;
    } else if (focusNewest) {
        newestEvent(event);
    } else {
        thingEvent(event);
    }
});
