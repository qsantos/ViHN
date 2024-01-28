const things = Array(...document.querySelectorAll('.athing'));

function thingDepth(thing) {
    return parseInt(thing.querySelector('td[indent]').getAttribute('indent'));
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
        gotoThing(things[currentThingIndex < 0 ? 0 : currentThingIndex + 1]);
    } else if (event.key == 'k') {
        gotoThing(things[currentThingIndex - 1]);
    } else if (event.key == 'J') {
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex + 1;
        while (nextThingIndex < things.length && thingDepth(things[nextThingIndex]) > currentDepth) {
            nextThingIndex++;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'K') {
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && thingDepth(things[nextThingIndex]) > currentDepth) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    } else if (event.key == 'h') {
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && thingDepth(things[nextThingIndex]) >= currentDepth) {
            nextThingIndex--;
        }
        gotoThing(things[nextThingIndex]);
    }
});
