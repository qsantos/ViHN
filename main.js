chrome.storage.sync.get((options) => {
    let currentThing = undefined;

    const maybeSmoothScrolling = {
        block: "nearest",
        behavior: getOption(options, "smoothScrolling") ? "smooth" : "instant",
    };
    let persistCollapse = getOption(options, "persistentCollapse");
    let enableNewestItems = getOption(options, "newestItems");

    chrome.storage.sync.onChanged.addListener((changes) => {
        // smooth scrolling
        const smoothScrolling = changes.smoothScrolling?.newValue;
        if (smoothScrolling === true) {
            maybeSmoothScrolling.behavior = "smooth";
        } else if (smoothScrolling === false) {
            maybeSmoothScrolling.behavior = "instant";
        }
        // persistent collapse
        const persistentCollapse = changes.persistentCollapse?.newValue;
        if (persistentCollapse !== undefined) {
            persistCollapse = persistentCollapse;
        }
        // newest items
        const newestItemsOption = changes.newestItems?.newValue;
        if (newestItemsOption === true) {
            enableNewestItems = true;
            initNewestItems();
        } else if (newestItemsOption === false) {
            enableNewestItems = false;
            focusNewest = false;
            if (newestItems) {
                newestItems.style.display = "none";
            }
        }
    });

    // set top color
    const pageSpace = document.getElementById("pagespace");
    if (pageSpace) {
        const topColor =
            pageSpace?.previousElementSibling?.firstElementChild?.getAttribute(
                "bgcolor",
            );
        if (topColor) {
            document.body.style.setProperty("--top-color", topColor);
        }
    }

    let helpOuter = null;
    let helpInner = null;
    let helpShown = false;
    function initHelp() {
        if (helpOuter) {
            return;
        }
        // Make the addition of help idempotent (useful for extension reloading when debugging)
        const oldHelp = document.getElementById("help");
        if (oldHelp) {
            oldHelp.remove();
        }
        helpOuter = document.createElement("DIV");
        helpOuter.id = "help";
        // tabindex needed to focus div
        // SECURITY: this is static HTML content
        helpOuter.innerHTML = `
        <div id="help-inner" tabindex="0">
            <h2>ViHN Key bindings</h2>
            <p>Press <kbd>?</kbd> to toggle help.</p>
            <p><strong>Note:</strong> Like in Vim mapping, case is important. So <kbd>j</kbd> means hitting the <kbd>j</kbd> key with <kbd>Caps Lock</kbd> disabled, and without holding <kbd>Shift</kbd>. But <kbd>J</kbd> means hitting <kbd>j</kbd> key with either <kbd>Caps Lock</kbd> enabled, or while holding <kbd>Shift</kbd>.</p>
            <h3>Navigate Comments/Stories</h3>
            <table>
                <thead>
                    <tr><th>Key</th><th>Effect</th></tr>
                </thead>
                <tbody>
                    <tr><td><kbd>j</kbd></td><td>Next comment/story</td></tr>
                    <tr><td><kbd>k</kbd></td><td>Previous comment/story</td></tr>
                    <tr><td><kbd>J</kbd></td><td>Next sibling comment</td></tr>
                    <tr><td><kbd>K</kbd></td><td>Previous sibling comment</td></tr>
                    <tr><td><kbd>g</kbd></td><td>Go to first story/comment</td></tr>
                    <tr><td><kbd>G</kbd></td><td>Go to last story, last root comment or “More” link</td></tr>
                    <tr><td><kbd>H</kbd></td><td>Focus on story/comment at the top of the screen (<strong>h</strong>igh)</td></tr>
                    <tr><td><kbd>M</kbd></td><td>Focus on story/comment in the <strong>m</strong>iddle of the screen</td></tr>
                    <tr><td><kbd>L</kbd></td><td>Focus on story/comment at the bottom of the screen (<strong>l</strong>ow)</td></tr>
                    <tr><td><kbd>n</kbd></td><td>Switch to Newest Items</td></tr>
                    <tr><td><kbd>h</kbd></td><td>Parent comment/story (see Follow Links)</td></tr>
                    <tr><td><kbd>p</kbd></td><td>Parent comment/story (see Follow Links)</td></tr>
                </tbody>
            </table>
            <p><strong>Note:</strong> You can also select an item by clicking in its bounding box.</p>
            <h3>Follow links</h3>
            <table>
                <thead>
                    <tr><th>Key</th><th>Effect</th></tr>
                </thead>
                <tbody>
                    <tr><td><kbd>o</kbd></td><td>Open story link/comment</td></tr>
                    <tr><td><kbd>O</kbd></td><td>Open story link/comment in background</td></tr>
                    <tr><td><kbd>c</kbd></td><td>Open comment thread</td></tr>
                    <tr><td><kbd>C</kbd></td><td>Open comment thread in background</td></tr>
                    <tr><td><kbd>b</kbd></td><td>Open both story link and comment thread</td></tr>
                    <tr><td><kbd>B</kbd></td><td>Open both story link and comment thread in background</td></tr>
                    <tr><td><kbd>h</kbd></td><td>Follow “context” link (go to comment thread, but focus on current comment)</td></tr>
                    <tr><td><kbd>p</kbd></td><td>Follow “parent” link (go to parent's page, and focus on parent comment/story)</td></tr>
                    <tr><td><kbd>1</kbd></td><td>Open 1st link in comment (maintain shift to open in background)</td><tr>
                    <tr><td><kbd>…</kbd></td><td>…</td><tr>
                    <tr><td><kbd>9</kbd></td><td>Open 9th link in comment (maintain shift to open in background)</td><tr>
                    <tr><td><kbd>0</kbd></td><td>Open 10th link in comment (maintain shift to open in background)</td><tr>
                </tbody>
            </table>
            <p><strong>Note:</strong> When on the “XXX more comments” link, you can hit either of <code>[lLcC]</code> to go to the next page of comments.</p>
            <p><strong>Note:</strong> The digits of the numeric keypad work as well to open links in comments. However, this can only open links in foreground.</p>
            <p><strong>Note:</strong> When using AZERTY, the key bindings to open links inside comments still work like in QWERTY. Hit the <kbd>1</kbd> key <strong>without</strong> shift (like typing <code>&</code>) to open the 1st link in foreground. Hit the <kbd>1</kbd> key <strong>with</strong> shift (like typing <code>1</code>) to open the 1st link in background. Same for the other link numbers.</p>
            <h3>Actions</h3>
            <table>
                <thead>
                    <tr><th>Key</th><th>Effect</th></tr>
                </thead>
                <tbody>
                    <tr><td><kbd>m</kbd></td><td>Collapse/uncollapse comment tree</td></tr>
                    <tr><td><kbd>u</kbd></td><td>Upvote story/comment, or cancel vote</td></tr>
                    <tr><td><kbd>d</kbd></td><td>Downvote story/comment, or cancel vote</td></tr>
                    <tr><td><kbd>f</kbd></td><td>Favorite/un-favorite story/comment of the current page</td></tr>
                    <tr><td><kbd>F</kbd></td><td>Flag/unflag story/comment of the current page</td></tr>
                    <tr><td><kbd>r</kbd></td><td>Comment on story, or reply to comment (with preview)</td></tr>
                    <tr><td><kbd>e</kbd></td><td>Edit comment (with preview)</td></tr>
                    <tr><td><kbd>D</kbd></td><td>Delete comment</td></tr>
                    <tr><td><kbd>Ctrl</kbd>+<kbd>Return</kbd></td><td>Submit current form</td></tr>
                </tbody>
            </table>
            <h3>Navigate Newest Items</h3>
            <p>In the Newest Items list, the following key bindings are available:</p>
            <table>
                <thead>
                    <tr><th>Key</th><th>Effect</th></tr>
                </thead>
                <tbody>
                    <tr><td><kbd>l</kbd></td><td>Show selected comment/story</td></tr>
                    <tr><td><kbd>j</kbd></td><td>Next comment/story</td></tr>
                    <tr><td><kbd>k</kbd></td><td>Previous comment/story</td></tr>
                    <tr><td><kbd>J</kbd></td><td>Jump 10 down</td></tr>
                    <tr><td><kbd>K</kbd></td><td>Jump 10 up</td></tr>
                    <tr><td><kbd>g</kbd></td><td>Go to top story/comment</td></tr>
                    <tr><td><kbd>G</kbd></td><td>Go to last story/comment</td></tr>
                    <tr><td><kbd>n</kbd></td><td>Switch back from Newest Items</td></tr>
                </tbody>
            </table>
        </div>
        `;
        document.body.appendChild(helpOuter);
        helpInner = document.getElementById("help-inner");
        // Close when clicking outside of documentation
        helpInner.addEventListener("click", (event) => {
            event.stopPropagation();
        });
        helpOuter.addEventListener("click", (event) => {
            hideHelp();
        });
        // Initialize visible state
        hideHelp();
    }
    function hideHelp() {
        helpOuter.style.display = "none";
        helpShown = false;
    }
    function showHelp() {
        helpOuter.style.display = "block";
        helpShown = true;
        helpInner.focus();
    }
    initHelp();

    const loggedIn = document.getElementById("logout") !== null;
    const things = Array.from(document.getElementsByClassName("athing"));

    activateThing(document.querySelector(".athing:target"));

    // handle the “XXX more comments” link like a thing
    const morelink = document.getElementsByClassName("morelink")[0];
    const morelinkThing = morelink
        ? morelink.parentElement.parentElement
        : null;
    if (morelink) {
        morelinkThing.id = "morelink";
        things.push(morelinkThing);
        if (document.location.hash === "#morelink") {
            activateThing(morelinkThing);
            currentThing.scrollIntoView(true);
        }
    }

    // from https://stackoverflow.com/a/34064434/4457767
    function htmlDecode(input) {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    function formatComment(comment) {
        // NOTE: This function takes untrusted user input and sanitizes it to be
        // injected as HTML. This content should come from the extension's user,
        // but we do need to escape HTML anyway. Instead of guessing what could go
        // wrong, we just make sure this function handles untrusted input.
        //
        // SECURITY: this produces a series of <p>s which might contain escaped
        // HTML code, <code><pre>s, <i>s and <a>s. The HTML content is immediately
        // escaped, and the raw content is not used afterwards. In the generated
        // HTML, the <code>, <pre> and <i> tags do not include user-controlled
        // content, so cannot be malformed. The opening <a> tag contains an href attribute
        // whose value is controlled by the user. However, this value is put
        // between double quotes and must match a regex which does not allow double
        // quotes at all. Also, this value is an URL, but only allows the http: and
        // https: protocols (no javascript:).
        return comment
            .split("\n\n")
            .map((paragraph) => {
                const htmlEscaped = paragraph
                    .replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;");
                if (htmlEscaped.startsWith("  ")) {
                    return `<code><pre>${htmlEscaped}</code></pre>`;
                }
                // replaces *something*, but not **something**, \*something\*, \*something**, etc.
                const italicized = htmlEscaped.replace(
                    /(?<!\\|\*)\*((?!\*).*?(?<!\\|\*))\*(?!\*)/gs,
                    "<i>$1</i>",
                );
                // URL regex inspired from https://stackoverflow.com/a/6041965/4457767
                // plus ugly hack at the end to avoid parsing escaped '>' as part of search parameters
                const linkified = italicized.replace(
                    /https?:\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])(?!(?<=&gt);|(?<=&g)t;|(?<=&)gt;)/g,
                    '<a href="$&">$&</a>',
                );
                return `<p>${linkified}</p>`;
            })
            .join("");
    }

    // We assume the queue is always pretty short, so using an Array should be okay
    const requestQueue = [];
    let lastRequestTime = null;
    let requestTimer = null;
    function hnfetch(url, options) {
        // Note: There are no race conditions because this is JavaScript
        const now = new Date();
        // We always make a new Promise, so that we can delay the request if we get 503
        const promise = new Promise((resolve, reject) => {
            requestQueue.push([url, options, resolve, reject]);
        });
        // Start a timer to handle the next request if there is not one already
        if (!requestTimer) {
            const remaining = lastRequestTime
                ? Math.max(lastRequestTime - now + 2000, 0)
                : 0;
            requestTimer = setTimeout(handleRequest, remaining);
        }
        return promise;
    }
    function handleRequest() {
        const request = requestQueue.shift();
        if (!request) {
            console.warn("No request to handle!");
            return;
        }
        const [url, options, resolve, reject] = request;
        lastRequestTime = new Date();
        fetch(url, options)
            .then((response) => {
                if (response.status === 503) {
                    // Still too fast, try again
                    requestQueue.unshift([url, options, resolve, reject]);
                    if (!requestTimer) {
                        requestTimer = setTimeout(handleRequest, 2000);
                    }
                } else if (response.status === 200) {
                    // Good!
                    response
                        .text()
                        .then((html) => {
                            // Very good!
                            resolve({ html, response });
                        })
                        .catch(() => {
                            reject(
                                "Failed to read response; are you connected to the Internet?",
                            );
                        });
                } else if (response.status === 504) {
                    reject("Hacker News is down; try again later (504 error)");
                } else {
                    reject(`Unexpected error (${response.status})`);
                }
            })
            .catch(() => {
                reject(
                    "Connection failure; are you connected to the Internet?",
                );
            });
        // Program handling the next request, if any
        if (requestQueue.length > 0) {
            requestTimer = setTimeout(handleRequest, 2000);
        } else {
            requestTimer = null;
        }
    }

    const thingIndexes = [];
    things.forEach((thing, index) => (thingIndexes[thing.id] = index));

    // Newest Items
    let newestItems;
    let datedIndexes = [];
    let newestList;
    let focusNewest = false;
    let currentNewestIndex = 0;
    function initNewestItems() {
        if (newestItems !== undefined) {
            newestItems.style.display = "block";
            return;
        }
        newestItems = document.createElement("DIV");
        datedIndexes = Array.from(document.getElementsByClassName("age"))
            .map((age, index) => [age.title, index])
            // Chrome is very slow without an explicit comparison function
            .sort((a1, a2) => (a1[0] < a2[0] ? -1 : a1[0] === a2[0] ? 0 : 1))
            .reverse();
        if (datedIndexes.length === 0) {
            return;
        }
        const hasOtherPages =
            morelinkThing !== null ||
            document.location.search.indexOf("&p=") > 0;
        newestItems.id = "newest-items";
        // Setting innerHTML is still faster than doing DOM
        const parts = ["<h3><u>N</u>ewest Items</u></h3>"];
        if (hasOtherPages) {
            parts.push("<p>(items on this page)</p>");
        }
        parts.push("<ul>");
        let lastDay = null;
        for (const [datetime, index] of datedIndexes) {
            // for format provided by Hacker News is "2024-09-03T19:06:26 000000"
            // slice should be slightly more robust to change than split
            const day = datetime.slice(0, 10);
            const time = datetime.slice(11, 19);
            if (day === lastDay) {
                parts.push(
                    `<li data-index="${index}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${time}</li>`,
                );
            } else {
                lastDay = day;
                parts.push(`<li data-index="${index}">${day} ${time}</li>`);
            }
        }
        parts.push("</ul>");
        // SECURITY: ${index} is a local index, ${day} and ${time} come from the
        // title attribute which is generated by Hacker News and not
        // user-controlled. We do trust Hacker News itself.
        newestItems.innerHTML = parts.join("");
        // Make the addition of Newest Comments idempotent (useful for extension reloading when debugging)
        const previousLatestComment = document.getElementById("newest-items");
        if (previousLatestComment) {
            previousLatestComment.remove();
        }
        newestItems.addEventListener("click", (event) => {
            gotoThingFromIndex(event.target.dataset.index);
        });
        document.body.appendChild(newestItems);
        newestList = newestItems.getElementsByTagName("ul")[0];
    }
    if (enableNewestItems) {
        initNewestItems();
    }

    function thingIndexParent(thingIndex) {
        const currentDepth = thingDepth(currentThing);
        thingIndex--;
        for (; thingIndex >= 0; thingIndex--) {
            const thing = things[thingIndex];
            console.log(thing);
            if (
                thing.parentElement.parentElement.classList.contains("fatitem")
            ) {
                return thingIndex;
            }
            if (!thingIsHidden(thing) && thingDepth(thing) < currentDepth) {
                return thingIndex;
            }
        }
        return undefined;
    }

    function gotoNewestIndex(index) {
        newestList.children[currentNewestIndex].classList.remove(
            "active-newest",
        );
        currentNewestIndex = index;
        const newest = newestList.children[currentNewestIndex];
        newest.classList.add("active-newest");
        const thingIndex = datedIndexes[currentNewestIndex][1];
        gotoThingFromIndex(thingIndex);
    }

    function gotoThingFromIndex(index) {
        const thing = things[index];
        // Uncollapse all the ancestors to make the thing visible
        let currentDepth = thingDepth(thing);
        let otherIndex = index;
        // We need to uncollapse ancestors in descending order to avoid showing children of other collapsed things
        const ancestorsToUncollapse = [];
        // The thing itself
        if (thing.classList.contains("coll")) {
            ancestorsToUncollapse.push(thing);
        }
        // Its ancestors
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
            if (otherThing.classList.contains("coll")) {
                ancestorsToUncollapse.push(otherThing);
            }
        }
        // Uncollapse ancestors in descending order
        ancestorsToUncollapse.reverse().forEach(toggleCollapse);
        // The thing is now visible, we can navigate to it
        gotoThing(thing);
    }

    // From Hacker News's JavaScript
    function nextcomm(el) {
        while ((el = el.nextElementSibling)) {
            if (el.classList.contains("comtr")) return el;
        }
    }

    function setClassIf(el, className, condition) {
        if (el) {
            if (condition) {
                el.classList.add(className);
            } else {
                el.classList.remove(className);
            }
        }
    }

    function openURL(relativeUrl, active) {
        const url = new URL(relativeUrl, document.location).href;
        const currentUrl = new URL("", document.location).href;
        if (url === currentUrl) {
            return;
        }
        chrome.runtime.sendMessage({ action: "open", url, active });
    }

    function thingURL(thing) {
        const anchor = thing.querySelector(".titleline>a");
        return anchor ? anchor.href : `item?id=${thing.id}`;
    }

    function openThing(thing, active) {
        if (!thing) {
        } else if (thing === morelinkThing) {
            morelink.click();
        } else {
            const relativeUrl = thingURL(thing);
            openURL(relativeUrl, active);
        }
    }

    function commentURL(thing) {
        const subtext = thing.nextElementSibling;
        if (!subtext || subtext.classList.contains("athing")) {
            return null;
        }
        const anchor = subtext.querySelector(".age>a");
        return anchor?.href;
    }

    function openComments(thing, active) {
        const relativeUrl = commentURL(thing);
        if (relativeUrl) {
            openURL(relativeUrl, active);
        }
    }

    function openCommentLink(thing, linkNumber, active) {
        if (!thing) {
            return;
        }
        let textElement = thing.getElementsByClassName("commtext")[0];
        if (!textElement) {
            // maybe a story with text
            const subtext = thing?.nextElementSibling;
            const spacer = subtext?.nextElementSibling;
            const toptext = spacer?.nextElementSibling;
            textElement = toptext?.getElementsByClassName("toptext")[0];
        }
        if (!textElement) {
            return;
        }
        /* Map 0 to 10th link */
        const n = linkNumber === 0 ? 10 : linkNumber;
        const link = textElement.getElementsByTagName("a")[n - 1];
        if (!link) {
            return;
        }
        if (link.getAttribute("href").startsWith("reply")) {
            // Ignore reply link when it is part of .commtext (see HN bug fix in main.css)
            return;
        }
        openURL(link.href, active);
    }

    // Basically from Hacker News's JavaScript
    function toggleCollapse(thing) {
        if (!thing.classList.contains("comtr")) {
            // Not a comment, do not try to collapse it
            return;
        }
        const coll = !thing.classList.contains("coll");

        if (loggedIn && persistCollapse) {
            // This is non critical, so no point in blocking the collapsing on getting
            // a result. We just do best effort. Do use hnfetch() to handle the user
            // {,un}collapsing many things in a row.
            hnfetch(
                `https://news.ycombinator.com/collapse?id=${thing.id}${
                    coll ? "" : "&un=true"
                }`,
            ).catch(console.warn);
        }

        // The thing itself
        setClassIf(thing, "coll", coll);
        setClassIf(thing.getElementsByClassName("votelinks")[0], "nosee", coll);
        setClassIf(thing.getElementsByClassName("comment")[0], "noshow", coll);
        const el = thing.getElementsByClassName("togg")[0];
        el.textContent = coll ? `[${el.getAttribute("n")} more]` : "[–]";

        // Descendants
        const show = !coll;
        const n0 = thingDepth(thing);
        let n = thingDepth(nextcomm(thing));
        let coll2 = false;
        if (n > n0) {
            while ((thing = nextcomm(thing))) {
                if (thingDepth(thing) <= n0) {
                    break;
                } else if (!show) {
                    thing.classList.add("noshow");
                } else if (!coll2 || thingDepth(thing) <= n) {
                    n = thingDepth(thing);
                    coll2 = thing.classList.contains("coll");
                    thing.classList.remove("noshow");
                }
            }
        }
    }

    // From Hacker News's JavaScript
    function vurl(id, how, auth, _goto) {
        return `vote?id=${id}&how=${how}&auth=${auth}&goto=${encodeURIComponent(
            _goto,
        )}&js=t`;
    }

    // Basically from Hacker News's JavaScript
    function vote(id, how, auth, _goto) {
        const upLink = document.getElementById(`up_${id}`);
        const downLink = document.getElementById(`down_${id}`);
        const unLink = document.getElementById(`unv_${id}`);
        // Display vote links as “in-progress”
        upLink.classList.add("nosee", "inprogress-votelink");
        if (downLink) {
            downLink.classList.add("nosee", "inprogress-votelink");
        }
        const originalUnlinkContent = unLink.innerHTML;
        // SECURITY: this is static HTML content
        unLink.innerHTML = "| …";

        function restore() {
            // Clear “in-progress”
            upLink.classList.remove("inprogress-votelink");
            if (downLink) {
                downLink.classList.remove("inprogress-votelink");
            }
            setClassIf(upLink, "nosee", how === "un");
            setClassIf(downLink, "nosee", how === "un");
            // SECURITY: this is HTML which was already active on the page before
            unLink.innerHTML = originalUnlinkContent;
        }
        function complete() {
            // Clear “in-progress”
            upLink.classList.remove("inprogress-votelink");
            if (downLink) {
                downLink.classList.remove("inprogress-votelink");
            }
            // Toggle links
            setClassIf(upLink, "nosee", how !== "un");
            setClassIf(downLink, "nosee", how !== "un");
            if (how === "un") {
                // SECURITY: this is static HTML content
                unLink.innerHTML = "";
            } else {
                const unUrl = vurl(id, "un", auth, _goto);
                // SECURITY: unUrl depends on id, auth and _goto; these are
                // extracted from the URL provided by Hacker News on the arrow
                // button or unvote link. These URLs are not user-controlled, and
                // we do trust Hacker News itself.
                unLink.innerHTML = ` | <a id='un_${id}' class='clicky' href='${unUrl}'>${
                    how === "up" ? "unvote" : "undown"
                }</a>`;
            }
        }

        // Do the query
        const url = `https://news.ycombinator.com/${vurl(
            id,
            how,
            auth,
            _goto,
        )}`;
        hnfetch(url)
            .then(({ html }) => {
                if (html.match("<b>Login</b>")) {
                    throw "You are not connected";
                }
                complete();
            })
            .catch((msg) => {
                restore();
                alert(msg);
            });
    }
    // Basically from Hacker News's JavaScript
    function voteFromLink(el) {
        const u = new URL(el.href, location);
        const p = u.searchParams;
        if (u.pathname === "/vote") {
            vote(p.get("id"), p.get("how"), p.get("auth"), p.get("goto"));
        }
    }

    function faveFromLink(faveLink) {
        if (!faveLink || faveLink.textContent === "…") {
            return;
        }
        const url = faveLink.href;
        const originalLinkLabel = faveLink.textContent;
        faveLink.textContent = "…";
        hnfetch(url)
            .then(({ html }) => {
                if (html.match("Please log in.<br>")) {
                    throw "You are not connected";
                }
                /* Switch URL between favorite/un-favorite and update link label */
                const searchParams = new URLSearchParams(
                    url.substr(url.indexOf("?")),
                );
                if (searchParams.get("un")) {
                    searchParams.delete("un");
                    faveLink.textContent = "favorite";
                } else {
                    searchParams.set("un", "t");
                    faveLink.textContent = "un-favorite";
                }
                faveLink.href = `fave?${searchParams.toString()}`;
            })
            .catch((msg) => {
                faveLink.textContent = originalLinkLabel;
                alert(msg);
            });
    }

    function flagFromLink(flagLink) {
        if (!flagLink || flagLink.textContent === "…") {
            return;
        }
        const url = flagLink.href;
        const originalLinkLabel = flagLink.textContent;
        flagLink.textContent = "…";
        hnfetch(url)
            .then(({ html }) => {
                if (html.match("Please log in.<br>")) {
                    // NOTE: actually never happen
                    // TODO: detect logged out in this case
                    throw "You are not connected";
                }
                /* Switch URL between flag/unflag and update link label */
                const searchParams = new URLSearchParams(
                    url.substr(url.indexOf("?")),
                );
                if (searchParams.get("un")) {
                    searchParams.delete("un");
                    flagLink.textContent = "flag";
                } else {
                    searchParams.set("un", "t");
                    flagLink.textContent = "unflag";
                }
                flagLink.href = `flag?${searchParams.toString()}`;
            })
            .catch((msg) => {
                flagLink.textContent = originalLinkLabel;
                alert(msg);
            });
    }

    function hideFromLink(hideLink) {
        if (!hideLink || hideLink.textContent === "…") {
            return;
        }
        const url = hideLink.href;
        const originalLinkLabel = hideLink.textContent;
        hideLink.textContent = "…";
        hnfetch(url)
            .then(({ html }) => {
                if (html.match("<b>Login</b>")) {
                    throw "You are not connected";
                }
                /* Switch URL between hide/unhide and update link label */
                const searchParams = new URLSearchParams(
                    url.substr(url.indexOf("?")),
                );
                if (searchParams.get("un")) {
                    searchParams.delete("un");
                    hideLink.textContent = "hide";
                } else {
                    searchParams.set("un", "t");
                    hideLink.textContent = "un-hide";
                }
                hideLink.href = `hide?${searchParams.toString()}`;
            })
            .catch((msg) => {
                hideLink.textContent = originalLinkLabel;
                alert(msg);
            });
    }

    function findThingInAscendants(el) {
        while (!el.classList.contains("comtr") && (el = el.parentElement));
        return el;
    }

    function quickReplyFromLink(replyLink) {
        if (!replyLink) {
            return;
        }
        initQuickReplyForm();
        quickReplyFormSubmit.disabled = true;
        quickReplyFormError.innerText = "";
        hnfetch(replyLink.href)
            .then(({ html }) => {
                const parentMatch = html.match(
                    /<input type="hidden" name="parent" value="(.*?)">/,
                );
                const hmacMatch = html.match(
                    /<input type="hidden" name="hmac" value="(.*?)">/,
                );
                const gotoMatch = html.match(
                    /<input type="hidden" name="goto" value="(.*?)">/,
                );
                if (parentMatch && hmacMatch && gotoMatch) {
                    quickReplyFormParent.value = parentMatch[1];
                    quickReplyFormHmac.value = hmacMatch[1];
                    quickReplyFormGoto.value = gotoMatch[1];
                    quickReplyFormSubmit.disabled = false;
                } else if (
                    html.match("You have to be logged in to reply.<br>")
                ) {
                    throw "You need to be logged in to reply";
                } else if (
                    html.match("<td>Sorry, you can't comment here.</td>")
                ) {
                    throw "Cannot reply to this anymore (thread locked or comment deleted)";
                } else {
                    console.warn(html);
                    throw "Unexpected error";
                }
            })
            .catch((msg) => {
                quickReplyFormError.innerText = msg;
            });
        const thing = findThingInAscendants(replyLink);
        if (thing) {
            thing.getElementsByTagName("tbody")[0].appendChild(quickReplyForm);
            quickReplyFormTextarea.focus();
        }
    }

    function quickEditFromLink(editLink) {
        if (!editLink) {
            return;
        }
        initEditForm();
        editFormSubmit.disabled = true;
        editFormTextarea.disabled = true;
        editFormTextarea.value = "loading…";
        hnfetch(editLink.href)
            .then(({ html }) => {
                const idMatch = html.match(
                    /<input type="hidden" name="id" value="(.*?)">/,
                );
                const hmacMatch = html.match(
                    /<input type="hidden" name="hmac" value="(.*?)">/,
                );
                const textMatch = html.match(
                    /<textarea name="text" .*?>(.*?)<\/textarea>/s,
                );
                if (idMatch && hmacMatch && textMatch) {
                    const content = htmlDecode(textMatch[1]);
                    editFormId.value = idMatch[1];
                    editFormHmac.value = hmacMatch[1];
                    editFormTextarea.value = content;
                    // SECURITY: see SECURITY comment inside formatComment
                    editFormPreview.innerHTML = formatComment(content);
                    editFormSubmit.disabled = false;
                    editFormTextarea.disabled = false;
                    editFormTextarea.focus();
                } else {
                    // NOTE: actually never happen
                    // TODO: detect logged out in this case
                    throw "You cannot edit this";
                }
            })
            .catch((msg) => {
                editFormTextarea.value = msg;
            });
        const thing = findThingInAscendants(editLink);
        if (thing) {
            const tbody =
                thing.getElementsByTagName("tbody")[0] || thing.parentElement;
            tbody.appendChild(editForm);
        }
    }

    function quickDeleteFromLink(deleteLink) {
        if (!deleteLink || deleteLink.textContent === "…") {
            return;
        }
        const thing = findThingInAscendants(deleteLink);
        const thingIndex = thingIndexes[thing.id];
        if (!thingIndex) {
            return;
        }
        if (!confirm("Are you sure you want to delete this comment?")) {
            return;
        }
        deleteLink.textContent = "…";
        const loc = document.location;
        const parentIndex = thingIndexParent(thingIndex);
        const parent = things[parentIndex];
        const goto =
            loc.pathname.substr(1) +
            loc.search +
            (parent ? `#${parent.id}` : "");
        // NOTE: fetch only accepts absolute URLs
        // see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#content_script_https_requests
        const url = `https://news.ycombinator.com/delete-confirm?id=${
            thing.id
        }&goto=${encodeURIComponent(goto)}`;
        hnfetch(url)
            .then(({ html }) => {
                const hmacMatch = html.match(
                    /<input type="hidden" name="hmac" value="(.*?)">/,
                );
                if (html === "You can't delete that.") {
                    throw "You cannot delete this comment";
                } else if (!hmacMatch) {
                    console.warn(html);
                    throw "Unexpected error while deleting comment";
                }
                const formData = new URLSearchParams();
                formData.append("id", thing.id);
                formData.append("goto", goto);
                formData.append("hmac", hmacMatch[1]);
                formData.append("d", "Yes");
                return hnfetch("https://news.ycombinator.com/xdelete", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
            })
            .then(({ response }) => {
                if (response.url) {
                    // NOTE: response.url seems to ignore our goto
                    document.location = goto;
                    // The page might not reload if only the hash has changed
                    document.location.reload();
                } else {
                    console.warn(response);
                    throw "Unexpected response while deleting comment";
                }
            })
            .catch((msg) => {
                deleteLink.textContent = "delete";
                alert(msg);
            });
    }

    const op = document.querySelector(".fatitem .hnuser");
    if (op) {
        const opUsername = op.textContent;
        const hnusers = document.getElementsByClassName("hnuser");
        for (const hnuser of hnusers) {
            if (hnuser.textContent === opUsername) {
                hnuser.classList.add("op");
            }
        }
    }

    function thingDepth(thing) {
        if (!thing) {
            return 0;
        }
        const indentTd = thing.querySelector("td[indent]");
        if (!indentTd) {
            return 0;
        }
        return Number.parseInt(indentTd.getAttribute("indent")) || 0;
    }

    function thingIsHidden(thing) {
        return thing.classList.contains("noshow");
    }

    function getThingLinks(thing) {
        if (
            currentThing.parentElement.parentElement.classList.contains(
                "fatitem",
            )
        ) {
            // The current thing is the top element
            //
            // For comment pages, the text is still in the .commtext. But, for
            // Ask HN texts, the relevant text is in the third sibling <tr>:
            //
            // <table class="fatitem">
            //  <tbody>
            //   <tr id="XXXXXXX" clss="athing">
            //   <tr> <!-- points, OP, time, action links -->
            //   <tr> <!-- empty -->
            //   <tr> <!-- text -->
            //  </tbody>
            // <table>
            //
            const textRow =
                currentThing?.nextElementSibling?.nextElementSibling
                    ?.nextElementSibling;
            if (textRow) {
                return textRow.querySelectorAll(".toptext a");
            }
        }
        // The current thing is a regular comment
        return currentThing.querySelectorAll(".commtext a");
    }

    function getThingTop10Links(thing) {
        return Array.from(getThingLinks(thing)).slice(0, 10);
    }

    function activateThing(thing) {
        if (!thing) {
            return;
        }
        currentThing = thing;
        currentThing.classList.add("activething");
        for (const link of getThingTop10Links(currentThing)) {
            link.classList.add("numbered-link");
        }
    }

    function deactivateCurrentThing() {
        if (!currentThing) {
            return;
        }
        for (const link of getThingTop10Links(currentThing)) {
            link.classList.remove("numbered-link");
        }
        currentThing.classList.remove("activething");
        currentThing = undefined;
    }

    function gotoTop() {
        deactivateCurrentThing();
        scrollTo(0, 0);
    }

    function gotoThing(thing) {
        if (thing) {
            // Immediately makes the change visible
            if (
                thing.classList.contains("comtr") ||
                !thing.nextElementSibling
            ) {
                // The thing is a comment, or the “more” link
                thing.scrollIntoView(maybeSmoothScrolling);
            } else {
                // The thing is a story, also scroll the associated .subtext into view if possible
                // NOTE: smooth scrolling does not allow scrollIntoView on multiple elements
                thing.scrollIntoView({ block: "nearest" });
                thing.nextElementSibling.scrollIntoView({ block: "nearest" });
            }
            deactivateCurrentThing();
            activateThing(thing);
        }
    }

    function gotoThingAt(x, y) {
        let el = document.elementFromPoint(x, y);
        do {
            if (el.classList.contains("athing")) {
                // Story or comment
                gotoThing(el);
                break;
            } else if (el.classList.contains("subtext")) {
                // Metadata on story
                gotoThing(el.parentElement.previousElementSibling);
                break;
            } else if (el.classList.contains("toptext")) {
                // Ask HN text
                gotoThing(
                    el.parentElement.parentElement.parentElement
                        .firstElementChild,
                );
                break;
            }
        } while ((el = el.parentElement));
    }

    // unconditionally add the preview container to the new comment form
    // NOTE: this also enable preview in submission form
    const newCommentFormTextarea = document.getElementsByTagName("textarea")[0];
    if (newCommentFormTextarea) {
        const newCommentFormPreview = document.createElement("DIV");
        newCommentFormPreview.classList.add("preview");
        newCommentFormTextarea.insertAdjacentElement(
            "afterend",
            newCommentFormPreview,
        );
        newCommentFormTextarea.addEventListener("input", (event) => {
            // SECURITY: see SECURITY comment inside formatComment
            newCommentFormPreview.innerHTML = formatComment(
                newCommentFormTextarea.value,
            );
        });
    }

    let quickReplyForm = null;
    let quickReplyFormParent = null;
    let quickReplyFormGoto = null;
    let quickReplyFormHmac = null;
    let quickReplyFormTextarea = null;
    let quickReplyFormSubmit = null;
    function initQuickReplyForm() {
        if (quickReplyForm !== null) {
            return;
        }
        const container = document.createElement("tbody");
        // SECURITY: this is static HTML content
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
        quickReplyFormTextarea = container.getElementsByTagName("textarea")[0];
        const quickReplyFormPreview =
            container.getElementsByClassName("preview")[0];
        quickReplyFormSubmit = container.querySelector('[type="submit"]');
        quickReplyFormError = container.getElementsByClassName("error")[0];
        quickReplyFormTextarea.addEventListener("input", (event) => {
            // SECURITY: see SECURITY comment inside formatComment
            quickReplyFormPreview.innerHTML = formatComment(
                quickReplyFormTextarea.value,
            );
        });
    }

    let editForm = null;
    let editFormId = null;
    let editFormHmac = null;
    let editFormTextarea = null;
    let editFormPreview = null;
    let editFormSubmit = null;
    function initEditForm() {
        if (editForm !== null) {
            return;
        }
        const container = document.createElement("tbody");
        // SECURITY: this is static HTML content
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
        editFormTextarea = container.getElementsByTagName("textarea")[0];
        editFormPreview = container.getElementsByClassName("preview")[0];
        editFormSubmit = container.querySelector('[type="submit"]');
        editFormTextarea.addEventListener("input", (event) => {
            // SECURITY: see SECURITY comment inside formatComment
            editFormPreview.innerHTML = formatComment(editFormTextarea.value);
        });
    }

    function thingEvent(event) {
        const currentThingIndex =
            thingIndexes[currentThing ? currentThing.id : ""];
        if (event.key === "j") {
            /* Next thing */
            if (currentThingIndex === undefined) {
                gotoThing(things[0]);
            } else {
                let nextThingIndex = currentThingIndex + 1;
                while (
                    nextThingIndex < things.length &&
                    thingIsHidden(things[nextThingIndex])
                ) {
                    nextThingIndex++;
                }
                gotoThing(things[nextThingIndex]);
            }
        } else if (event.key === "k") {
            /* Previous thing */
            if (currentThingIndex === 0) {
                gotoTop();
            } else {
                let nextThingIndex = currentThingIndex - 1;
                while (
                    nextThingIndex > 0 &&
                    nextThingIndex < things.length &&
                    thingIsHidden(things[nextThingIndex])
                ) {
                    nextThingIndex--;
                }
                gotoThing(things[nextThingIndex]);
            }
        } else if (event.key === "J") {
            /* Next sibling thing */
            const currentDepth = thingDepth(currentThing);
            console.time("NEXT SIBLING");
            let nextThingIndex = currentThingIndex + 1;
            while (
                nextThingIndex < things.length &&
                (thingIsHidden(things[nextThingIndex]) ||
                    thingDepth(things[nextThingIndex]) > currentDepth)
            ) {
                nextThingIndex++;
            }
            console.timeEnd("NEXT SIBLING");
            gotoThing(things[nextThingIndex]);
        } else if (event.key === "K") {
            /* Previous sibling thing */
            if (currentThingIndex === 0) {
                gotoTop();
            } else {
                const currentDepth = thingDepth(currentThing);
                let nextThingIndex = currentThingIndex - 1;
                while (
                    nextThingIndex > 0 &&
                    (thingIsHidden(things[nextThingIndex]) ||
                        thingDepth(things[nextThingIndex]) > currentDepth)
                ) {
                    nextThingIndex--;
                }
                gotoThing(things[nextThingIndex]);
            }
        } else if (event.key === "H") {
            /* Focus on thing at top of screen (high) */
            gotoThingAt(visualViewport.width / 5, 1);
        } else if (event.key === "M") {
            /* Focus on thing in the **middle** of the screen */
            gotoThingAt(visualViewport.width / 5, visualViewport.height / 2);
        } else if (event.key === "L") {
            /* Focus on thing at bottom of screen (low) */
            gotoThingAt(visualViewport.width / 5, visualViewport.height - 2);
        } else if (event.key === "h" || event.key === "p") {
            /* Parent comment (h: say in context when changing page, p: directly go to comment) */
            const parentIndex = thingIndexParent(currentThingIndex);
            if (parentIndex !== undefined) {
                gotoThing(things[parentIndex]);
            } else {
                // Use context link for h, and parent link for p
                const selector = event.key === "h" ? ".navs>a+a" : ".navs>a";
                const parentLink = things[0].querySelector(selector);
                if (parentLink) {
                    parentLink.click();
                }
            }
        } else if (event.key === "m") {
            /* Toggle comment tree */
            if (currentThing) {
                toggleCollapse(currentThing);
            }
        } else if (event.key === "o" || event.key === "O") {
            /* Open thing permalink (l: foreground, L: background) */
            openThing(currentThing || document, event.key === "o");
        } else if (event.key === "c" || event.key === "C") {
            /* Open comments (c: foreground, C: background) */
            if (currentThing) {
                openComments(currentThing, event.key === "c");
            }
        } else if (event.key === "b" || event.key === "B") {
            /* Open both (b: foreground, B: background) */
            openThing(currentThing || document, event.key === "b");
            openComments(currentThing, event.key === "b");
        } else if (event.key === "g") {
            /* Go to top */
            gotoTop();
        } else if (event.key === "G") {
            /* Go to last thing */
            const topThings = document.querySelectorAll(
                '.athing:has([indent="0"]),#morelink',
            );
            const thing = topThings[topThings.length - 1];
            gotoThing(thing);
        } else if (event.key === "u") {
            /* Upvote */
            const upArrow = document.getElementById(`up_${currentThing.id}`);
            if (!upArrow) {
            } else if (upArrow.classList.contains("nosee")) {
                // upArrow hidden, we can only unvote
                const unvoteLink = document.getElementById(
                    `un_${currentThing.id}`,
                );
                if (unvoteLink) {
                    voteFromLink(unvoteLink);
                }
            } else {
                voteFromLink(upArrow);
            }
        } else if (event.key === "d") {
            /* Downvote */
            const downArrow = document.getElementById(
                `down_${currentThing.id}`,
            );
            if (!downArrow) {
            } else if (downArrow.classList.contains("nosee")) {
                // downArrow hidden, we can only undown
                const unvoteLink = document.getElementById(
                    `un_${currentThing.id}`,
                );
                if (unvoteLink) {
                    voteFromLink(unvoteLink);
                }
            } else {
                voteFromLink(downArrow);
            }
        } else if (event.key === "r") {
            /* Comment on story, or reply to comment */
            if (!currentThing || currentThingIndex === 0) {
                newCommentFormTextarea.focus();
            } else {
                // can comment:    <div class="reply"><p><font><u><a>reply
                // cannot comment: <div class="reply"><p><font>
                const replyDiv =
                    currentThing.getElementsByClassName("reply")[0];
                const replyLink = replyDiv?.getElementsByTagName("a")[0];
                quickReplyFromLink(replyLink);
            }
        } else if (event.key === "e") {
            /* Edit */
            const editLink = currentThing.querySelector('a[href^="edit"]');
            quickEditFromLink(editLink);
        } else if (event.key === "D") {
            /* Delete */
            const deleteLink = currentThing.querySelector(
                'a[href^="delete-confirm"]',
            );
            quickDeleteFromLink(deleteLink);
        } else if (event.key === "f") {
            /* Favorite */
            const thing = currentThing || things[0];
            const faveLink =
                thing.querySelector('a[href^="fave"]') ||
                thing.nextSibling?.querySelector?.('a[href^="fave"]');
            faveFromLink(faveLink);
        } else if (event.key === "F") {
            /* Flag */
            const thing = currentThing || things[0];
            const flagLink =
                thing.querySelector('a[href^="flag"]') ||
                thing.nextSibling?.querySelector?.('a[href^="flag"]');
            flagFromLink(flagLink);
        } else if (event.key === "n") {
            /* Switch to Newest Items */
            if (enableNewestItems) {
                focusNewest = true;
                newestItems.classList.add("active-newest-items");
                gotoNewestIndex(currentNewestIndex);
            }
        } else if (48 <= event.keyCode && event.keyCode <= 57) {
            /* Top-row 0, 1, 2, 3, 4, 5, 6, 7, 8 or 9 */
            /* We use keyCode to avoid having to ignore effect of shift key */
            openCommentLink(currentThing, event.keyCode - 48, !event.shiftKey);
        } else if (96 <= event.keyCode && event.keyCode <= 105) {
            /* Numpad 0, 1, 2, 3, 4, 5, 6, 7, 8 or 9 */
            openCommentLink(currentThing, event.keyCode - 96, !event.shiftKey);
        } else {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
    }

    function newestEvent(event) {
        if (event.key === "n") {
            /* Switch back from Newest Items */
            focusNewest = false;
            newestItems.classList.remove("active-newest-items");
        } else if (event.key === "j") {
            /* Next newest */
            if (currentNewestIndex < newestList.childElementCount - 1) {
                gotoNewestIndex(currentNewestIndex + 1);
            }
        } else if (event.key === "k") {
            /* Previous newest */
            if (currentNewestIndex > 0) {
                gotoNewestIndex(currentNewestIndex - 1);
            }
        } else if (event.key === "J") {
            /* Jump 10 down */
            gotoNewestIndex(
                Math.min(
                    currentNewestIndex + 10,
                    newestList.childElementCount - 1,
                ),
            );
        } else if (event.key === "K") {
            /* Jump 10 up */
            gotoNewestIndex(Math.max(currentNewestIndex - 10, 0));
        } else if (event.key === "g") {
            /* First newest */
            gotoNewestIndex(0);
        } else if (event.key === "G") {
            /* Last newest */
            gotoNewestIndex(newestList.childElementCount - 1);
        } else {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
    }

    document.addEventListener("keydown", (event) => {
        if (helpShown) {
            if (event.key === "Escape" || event.key === "?") {
                hideHelp();
            }
        } else if (event.target.tagName !== "BODY") {
            if (event.key === "Escape") {
                event.target.blur();
            } else if (event.ctrlKey && event.key === "Enter") {
                const form = event.target.parentNode;
                // Simulate click on submit button to handle the case where it is disabled
                const submitButton = form.querySelector("[type=submit]");
                submitButton.click();
            }
        } else if (event.ctrlKey || event.altKey || event.metaKey) {
            // do not capture Ctrl+r and such
            return;
        } else if (event.key === "?") {
            showHelp();
        } else if (focusNewest) {
            newestEvent(event);
        } else {
            thingEvent(event);
        }
    });

    function handleLinkClick(el) {
        const url = new URL(el.href, document.location);
        if (url.pathname === "/vote") {
            voteFromLink(el);
            event.stopPropagation();
            event.preventDefault();
            return true;
        } else if (el.classList.contains("togg")) {
            const thing = findThingInAscendants(el);
            if (thing) {
                toggleCollapse(thing);
                return true;
            }
        } else if (url.pathname === "/flag") {
            flagFromLink(el);
            return true;
        } else if (url.pathname === "/hide") {
            hideFromLink(el);
            return true;
        } else if (url.pathname === "/fave") {
            faveFromLink(el);
            return true;
        } else if (url.pathname === "/reply") {
            quickReplyFromLink(el);
            return true;
        } else if (url.pathname === "/edit") {
            quickEditFromLink(el);
            return true;
        } else if (url.pathname === "/delete-confirm") {
            quickDeleteFromLink(el);
            return true;
        }
        return false;
    }

    document.addEventListener(
        "click",
        (event) => {
            // find link
            let el = event.target;
            while (!el.href && (el = el.parentElement));
            // use link
            if (el?.href) {
                if (handleLinkClick(el)) {
                    event.stopPropagation();
                    event.preventDefault();
                    return;
                }
            }
            // just select thing
            gotoThingAt(event.clientX, event.clientY);
        },
        true,
    );

    // set the URL to the current comment when closing the tab
    window.addEventListener("beforeunload", () => {
        if (currentThing) {
            const url = new URL(document.location);
            url.hash = currentThing.id;
            history.pushState(null, "", url);
        }
    });
});
