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

function gotoThing(thing) {
    if (thing) {
        document.location.replace('#' + thing.id);
    }
}

document.addEventListener('keypress', (event) => {
    const currentThing = document.querySelector('.athing:target');
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
    }
});
