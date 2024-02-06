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
                    <br>
                    <br>
                    <input type="submit" value="reply">
                </form>
            </td>
        </tr>
    `.trim();
    quickReplyForm = container.firstChild;
    quickReplyFormParent = container.querySelector('[name="parent"]');
    quickReplyFormGoto = container.querySelector('[name="goto"]');
    quickReplyFormHmac = container.querySelector('[name="hmac"]');
    quickReplyFormTextarea = container.getElementsByTagName('textarea')[0];
    quickReplyFormSubmit = container.querySelector('[type="submit"]');
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
            const replyDiv = currentThing.getElementsByClassName('reply')[0];
            // <div class="reply"><p><font><u><a>reply
            // or
            // <div class="reply"><p><font>
            if (replyDiv?.firstElementChild?.firstElementChild?.firstElementChild) {
                initQuickReplyForm();
                quickReplyFormSubmit.disabled = true;
                const loc = document.location;
                const goto = loc.pathname.substr(1) + loc.search + '#' + currentThing.id;
                // NOTE: fetch only accepts absolute URLs
                const url = 'https://news.ycombinator.com/reply?id=' + currentThing.id + '&goto=' + encodeURIComponent(goto);
                fetch(url).then(response => {
                    response.text().then(html => {
                        const parentMatch = html.match(/<input type="hidden" name="parent" value="(.*?)">/);
                        const parent = parentMatch[1];
                        quickReplyFormParent.value = parent;
                        const hmacMatch = html.match(/<input type="hidden" name="hmac" value="(.*?)">/);
                        const hmac = hmacMatch[1];
                        quickReplyFormHmac.value = hmac;
                        quickReplyFormSubmit.disabled = false;
                    });
                });
                quickReplyFormGoto.value = goto;
                currentThing.getElementsByTagName('tbody')[0].appendChild(quickReplyForm);
                quickReplyFormTextarea.focus();
            }
        }
    } else if (event.key == 'f') {
        /* Favorite */
        if (!currentThing || currentThingIndex == 0) {
            const faveLink = things[0].nextSibling.querySelector('a[href^="fave"]');
            const url = faveLink.href;
            faveLink.textContent = '…';
            fetch(url).then(response => {
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
            });
        }
    } else if (event.key == 'F') {
        /* Flag */
        if (!currentThing || currentThingIndex == 0) {
            const faveLink = things[0].nextSibling.querySelector('a[href^="flag"]');
            const url = faveLink.href;
            faveLink.textContent = '…';
            fetch(url).then(response => {
                /* Switch URL between flag/unflag and update link label */
                const searchParams = new URLSearchParams(url.substr(url.indexOf('?')));
                if (searchParams.get('un')) {
                    searchParams.delete('un');
                    faveLink.textContent = 'flag';
                } else {
                    searchParams.set('un', 't');
                    faveLink.textContent = 'unflag';
                }
                faveLink.href = 'flag?' + searchParams.toString();
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
