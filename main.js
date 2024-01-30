const things = Array(...document.querySelectorAll('.athing'));

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
        }, 300);
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
let quickReplyFormTextarea = null;
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
                    <input type="hidden" name="parent" value="TODO">
                    <input type="hidden" name="goto" value="item?id=TOREMOVE#TOREMOVE">
                    <input type="hidden" name="hmac" value="TODO">
                    <textarea name="text" rows="8" cols="80" wrap="virtual" autofocus="true"></textarea>
                    <br>
                    <br>
                    <input type="submit" value="reply">
                </form>
            </td>
        </tr>
    `.trim();
    quickReplyForm = container.firstChild;
    quickReplyFormTextarea = container.querySelector('textarea');
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
    const currentThingIndex = things.indexOf(currentThing);
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
        while (nextThingIndex < things.length && thingIsHidden(things[nextThingIndex])) {
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
        if (!currentThing || currentThingIndex == 0) {
            document.querySelector('.titleline>a').click();
        } else {
            document.location = 'https://news.ycombinator.com/item?id=' + currentThing.id;
        }
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
            document.querySelector('textarea').focus();
        } else if (currentThing) {
            currentThing.querySelector('tbody').appendChild(quickReplyForm);
            quickReplyFormTextarea.focus();
        }
    }
});
