const things = Array(...document.querySelectorAll('.athing'));

function thingDepth(thing) {
    return parseInt(thing.querySelector('td[indent]').getAttribute('indent'));
}

document.addEventListener('keypress', (event) => {
    if (event.key == 'j') {
        const currentThing = document.querySelector('.athing:target');
        const currentThingIndex = things.indexOf(currentThing);
        const nextThingIndex = currentThingIndex < 0 ? 0 : currentThingIndex + 1;
        const nextThing = things[nextThingIndex];
        if (nextThing) {
            document.location = '#' + nextThing.id;
        }
    } else if (event.key == 'k') {
        const currentThing = document.querySelector('.athing:target');
        const currentThingIndex = things.indexOf(currentThing);
        const nextThingIndex = currentThingIndex <= 0 ? 0 : currentThingIndex - 1;
        const nextThing = things[nextThingIndex];
        document.location = '#' + nextThing.id;
    } else if (event.key == 'J') {
        const currentThing = document.querySelector('.athing:target');
        const currentThingIndex = things.indexOf(currentThing);
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex + 1;
        while (nextThingIndex < things.length && thingDepth(things[nextThingIndex]) > currentDepth) {
            nextThingIndex++;
        }
        const nextThing = things[nextThingIndex];
        if (nextThing) {
            document.location = '#' + nextThing.id;
        }
    } else if (event.key == 'K') {
        const currentThing = document.querySelector('.athing:target');
        const currentThingIndex = things.indexOf(currentThing);
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && thingDepth(things[nextThingIndex]) > currentDepth) {
            nextThingIndex--;
        }
        const nextThing = things[nextThingIndex];
        if (nextThing) {
            document.location = '#' + nextThing.id;
        }
    } else if (event.key == 'h') {
        const currentThing = document.querySelector('.athing:target');
        const currentThingIndex = things.indexOf(currentThing);
        const currentDepth = thingDepth(currentThing);
        let nextThingIndex = currentThingIndex - 1;
        while (nextThingIndex > 0 && thingDepth(things[nextThingIndex]) >= currentDepth) {
            nextThingIndex--;
        }
        const nextThing = things[nextThingIndex];
        if (nextThing) {
            document.location = '#' + nextThing.id;
        }
    }
});
