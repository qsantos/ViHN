const things = Array(...document.getElementsByClassName('athing'));

const thingIndexes = [];
things.forEach((thing, index) => thingIndexes[thing.id] = index);

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

let currentThing = document.querySelector('.athing:target');
if (currentThing) {
    currentThing.classList.add('activething');
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

let newCommentTextarea = document.getElementsByTagName('textarea')[0];
if (newCommentTextarea) {
    newCommentTextarea.addEventListener('keypress', (event) => {
        event.stopPropagation();
    });
    newCommentTextarea.addEventListener('keydown', (event) => {
        if (event.key == 'Escape') {
            newCommentTextarea.blur();
        }
    });
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
    quickReplyForm.addEventListener('submit', event => {
        fetch('https://news.ycombinator.com/comment', {
            body: new FormData(quickReplyForm),
        }).then(() => {
            alert('ok!');
            quickReplyForm.parent.removeChild(quickReplyForm);
        });
    });
    quickReplyFormTextarea.addEventListener('keypress', (event) => {
        event.stopPropagation();
    });
    quickReplyFormTextarea.addEventListener('keydown', (event) => {
        if (event.key == 'Escape') {
            quickReplyFormTextarea.blur();
        }
    });
}

document.addEventListener('keypress', (event) => {
    const currentThingIndex = thingIndexes[currentThing ? currentThing.id : ''];
    if (event.key == 'j') {
        if (currentThingIndex < 0) {
            gotoThing(things[0]);
        } else {
            let nextThingIndex = currentThingIndex + 1;
            while (nextThingIndex < things.length && thingIsHidden(things[nextThingIndex])) {
                nextThingIndex++;
            }
            gotoThing(things[nextThingIndex]);
        }
    } else if (event.key == 'k') {
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && nextThingIndex < things.length && thingIsHidden(things[nextThingIndex])) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'J') {
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex + 1;
        while (nextThingIndex < things.length && (thingIsHidden(things[nextThingIndex]) || thingDepth(things[nextThingIndex]) > currentDepth)) {
            nextThingIndex++;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'K') {
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && (thingIsHidden(things[nextThingIndex]) || thingDepth(things[nextThingIndex]) > currentDepth)) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'h') {
        if (!currentThing || currentThingIndex == 0) {
            const parentLink = things[0].querySelector('.navs>a');
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
        const collapseToggle = document.querySelector('[id="' + currentThing.id + '"].togg')
        if (collapseToggle) {
            collapseToggle.click();
        }
    } else if (event.key == 'l') {
        const anchor = (currentThing || document).querySelector('.titleline>a');
        const url = anchor ? anchor.href : 'item?id=' + currentThing.id;
        open(url, '_blank');
    } else if (event.key == 'g') {
        gotoThing(things[0]);
    } else if (event.key == 'G') {
        const topThings = document.querySelectorAll('.athing:has([indent="0"])');
        const thing =  topThings[topThings.length - 1]
        gotoThing(thing);
    } else if (event.key == 'u') {
        const upArrow = document.getElementById('up_' + currentThing.id);
        if (upArrow.classList.contains('nosee')) {
            // upArrow hidden, we can only unvote
            const unvoteLink = document.getElementById('un_' + currentThing.id);
            if (unvoteLink) {
                unvoteLink.click();
            }
        } else {
            upArrow.click();
        }
    } else if (event.key == 'd') {
        const downArrow = document.getElementById('down_' + currentThing.id);
        if (downArrow.classList.contains('nosee')) {
            // downArrow hidden, we can only undown
            const unvoteLink = document.getElementById('un_' + currentThing.id);
            if (unvoteLink) {
                unvoteLink.click();
            }
        } else {
            downArrow.click();
        }
    } else if (event.key == 'r') {
        initQuickReplyForm();
        if (currentThingIndex == 0) {
            document.getElementsByTagName('textarea')[0].focus();
        } else if (currentThing) {
            quickReplyFormSubmit.disabled = true;
            const loc = document.location;
            const goto = loc.pathname.substr(1) + loc.search + '#' + currentThing.id;
            // NOTE: fetch only accepts absolute URLs
            const url = 'https://news.ycombinator.com/reply?id=' + currentThing.id + '&goto=' + encodeURIComponent(goto);
            fetch(url).then(response => {
                response.text().then(html => {
                    const parent_match = html.match(/<input type="hidden" name="parent" value="(.*?)">/);
                    const parent = parent_match[1];
                    quickReplyFormParent.value = parent;
                    const hmac_match = html.match(/<input type="hidden" name="hmac" value="(.*?)">/);
                    const hmac = hmac_match[1];
                    quickReplyFormHmac.value = hmac;
                    quickReplyFormSubmit.disabled = false;
                });
            });
            quickReplyFormGoto.value = goto;
            currentThing.getElementsByTagName('tbody')[0].appendChild(quickReplyForm);
            quickReplyFormTextarea.focus();
        }
    } else {
        return;
    }
    event.stopPropagation();
    event.preventDefault();
});
