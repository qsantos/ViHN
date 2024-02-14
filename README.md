<img src="icon.svg" width="128" height="128" alt="ViHN">

Vi-style key bindings for browsing Hacker News.

It's fast. If you have to wait a perceptible amount of time, that's a bug.

<a href="https://addons.mozilla.org/fr/firefox/addon/vihn/"><img src="firefox.svg" width="172" height="60" alt="Get the Add-on"></a>
<a href="https://chromewebstore.google.com/detail/vihn/cfmccoefeojndmkdmbkgalghikfafdod"><img src="chrome.png" width="206" height="58" alt="Available in the Chrome Web Store"></a>

## Features

Use the key bindings similar to Vi to navigate Hacker News stories and comments.
It should work on story listings (front page, /new, /newest, /best, user submissions, etc.), comment threads, and comment listings (user comments, etc.).

Also, you can quickly find new comments by hitting “n” to browse comments in inverse chronological order.

In addition, the quick-reply and quick-edit forms let you see a preview of the comment you are writing.

Finally, the original poster (OP) is highlighted in comments.

https://github.com/qsantos/ViHN/assets/8493765/69d96e60-54d3-4c81-8f2b-24142d65225d

## Key bindings

Press <kbd>?</kbd> to toggle help.

### Navigate Comments/Stories

| Key          | Effect
| ------------ | ------
| <kbd>j</kbd> | Next comment/story
| <kbd>k</kbd> | Previous comment/story
| <kbd>J</kbd> | Next sibling comment
| <kbd>K</kbd> | Previous sibling comment
| <kbd>g</kbd> | Go to first story/comment
| <kbd>G</kbd> | Go to last story, last root comment or “More” link
| <kbd>H</kbd> | Focus on story/comment at the top of the screen (**h**igh)
| <kbd>M</kbd> | Focus on story/comment in the **m**iddle of the screen
| <kbd>L</kbd> | Focus on story/comment at the bottom of the screen (**l**ow)
| <kbd>n</kbd> | Switch to Newest Items
| <kbd>h</kbd> | Parent comment/story (see [#follow-links](Follow Links))
| <kbd>p</kbd> | Parent comment/story (see [#follow-links](Follow Links))

**Note:**
You can also select an item by clicking in its bounding box.

### Follow links

| Key          | Effect
| ------------ | ------
| <kbd>o</kbd> | Open story link/comment
| <kbd>O</kbd> | Open story link/comment in background
| <kbd>c</kbd> | Open comment thread
| <kbd>C</kbd> | Open comment thread in background
| <kbd>b</kbd> | Open both story link and comment thread
| <kbd>B</kbd> | Open both story link and comment thread in background
| <kbd>h</kbd> | Follow “context” link (go to comment thread, but focus on current comment)
| <kbd>p</kbd> | Follow “parent” link (go to parent's page, and focus on parent comment/story)
| <kbd>1</kbd> | Open 1st link in comment (maintain shift to open in background)
| <kbd>…</kbd> | …
| <kbd>9</kbd> | Open 9th link in comment (maintain shift to open in background)
| <kbd>0</kbd> | Open 10th link in comment (maintain shift to open in background)

**Note:**
When on the “XXX more comments” link, you can hit either of `[lLcC]` to go to the next page of comments.

**Note:**
The digits of the numeric keypad work as well to open links in comments.
However, this can only open links in foreground.

**Note:**
When using AZERTY, the key bindings to open links inside comments still work like in QWERTY.
Hit the <kbd>1</kbd> key **without** shift (like typing `&`) to open the 1st link in foreground.
Hit the <kbd>1</kbd> key **with** shift (like typing `1`) to open the 1st link in background.
Same for the other link numbers.

### Actions

| Key          | Effect
| ------------ | ------
| <kbd>m</kbd> | Collapse/uncollapse comment tree
| <kbd>u</kbd> | Upvote story/comment, or cancel vote
| <kbd>d</kbd> | Downvote story/comment, or cancel vote
| <kbd>f</kbd> | Favorite/un-favorite story/comment of the current page
| <kbd>F</kbd> | Flag/unflag story/comment of the current page
| <kbd>r</kbd> | Comment on story, or reply to comment (with preview)
| <kbd>e</kbd> | Edit comment (with preview)
| <kbd>D</kbd> | Delete comment
| <kbd>Ctrl</kbd>+<kbd>Return</kbd> | Submit current form

### Navigate Newest Items

In the Newest Items list, the following key bindings are available:

| Key          | Effect
| ------------ | ------
| <kbd>l</kbd> | Show selected comment/story
| <kbd>j</kbd> | Next comment/story
| <kbd>k</kbd> | Previous comment/story
| <kbd>J</kbd> | Jump 10 down
| <kbd>K</kbd> | Jump 10 up
| <kbd>g</kbd> | Go to top story/comment
| <kbd>G</kbd> | Go to last story/comment
| <kbd>n</kbd> | Switch back from Newest Items
