<img src="icon.svg" width="128" height="128" alt="ViHN">

Vi-style key bindings for browsing Hacker News.

It's fast. If you have to wait a perceptible amount of time, that's a bug.

## Features

Use the key bindings similar to Vi to navigate Hacker News stories and comments.
It should work on story listings (front page, /new, /newest, /best, user submissions, etc.), comment threads, and comment listings (user comments, etc.).

Also, you can quickly find new comments by hitting “n” to browse comments in inverse chronological order.

In addition, the quick-reply and quick-edit forms let you see a preview of the comment you are writing.

## Key bindings

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
| <kbd>h</kbd> | Follow “context” link (go to comment thread, but focus on current comment)
| <kbd>p</kbd> | Follow “parent” link (go to parent's page, and focus on parent comment/story)

**Note:**
When on the “XXX more comments” link, you can hit either of `[lLcC]` to go to the next page of comments.

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
| <kbd>g</kbd> | Go to top story/comment
| <kbd>G</kbd> | Go to last story/comment
| <kbd>n</kbd> | Switch back from Newest Items
