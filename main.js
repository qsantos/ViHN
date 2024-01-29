const things = Array(...document.querySelectorAll('.athing'));

function thingDepth(thing) {
    return parseInt(thing.querySelector('td[indent]').getAttribute('indent'));
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
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && (thingIsHidden(things[nextThingIndex]) || thingDepth(things[nextThingIndex]) >= currentDepth)) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'm') {
        document.querySelector('[id="' + currentThing.id + '"].togg').click();
    }
});
