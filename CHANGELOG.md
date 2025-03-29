# v1.32

- Clicking inside/outside newest items activates/deactivates it

# v1.31

- Fix needless scroll when clicking in the active item
- Fix needless scroll when updating the URL in Firefox

# v1.30

- When scrolling to an item that is higher than the viewport, always scroll to the top of the item
- Enable optional smooth scrolling on submission listings as well
- Fix issue where clicking between submissions would do nothing, also causing H/M/L to not work
- Add options to update the URL when navigating items: immediately, after a delay, or not at all
- Add option to update the URL when closing the tab

# v1.29

- Save active item when closing tab (adds to history, and restores when reopening)
- Press l to copy permalink to clipboard

# v1.28

- Handle new time format in Hacker News that breaks Newest Items

# v1.27

- Immediately scroll to corresponding item when navigating newest items #54
- Revert change from v0.1.26 that always put the active item at top of view in normal browsing
- Do not update current URL when navigating items to avoid polluting browser history #46

# v0.1.26

- Reduce noise in browser history on Chrome #46

# v0.1.25

- Only annotate the first 10 links (the ones with matching number hotkeys) #43
- Clicking on the text of Ask HNs activates the top element #53

# v0.1.24

- Truncate milliseconds and UTC marker from times in Newest Items following format change in Hacker News: `2024-09-03 19:06:26.000000Z` → `2024-09-03 19:06:26`

# v0.1.23

- Fix navigating to parent on user's comments just moves upwards #48
- Fix pressing "p" navigating to full thread instead of parent's page #49

# v0.1.22

- Scrolling to top really goes to top: removes hash from URL, and active comment/item

# v0.1.21

- Hitting o/c/b does not open self-referential links of Ask HNs

# v0.1.20

- Enable using 0 key to open 10th link

# v0.1.19

- Fix typo in options page

# v0.1.18

- More specific message for 504 errors (Hacker News is down)

# v0.1.17

- More descriptive name for extension

# v0.1.16

- Fix voting causing the content to move (reflow)

# v0.1.15

- Fix showing children of collapsed comment when uncollapsing grandparent

# v0.1.14

- Document that key bindings are case-sensitive

# v0.1.13

- Enable preview in new-comment form without hitting “r”
- Enable preview in submission form
- Use 503-safe method when clicking vote links (not just when using key bindings)
- Same when collapsing/uncollapsing comments
- Same with favorite/un-favorite/flag/unflag links
- Same with hide/un-hide links
- Quick-reply/edit/delete when clicking corresponding link

# v0.1.12

- Fix showing link counter on some “reply” links (since v0.1.11)

# v0.1.11

- Extend the orange vertical bar to “add comment”/“reply” form and story text (Show HN) in head item
- Can now use the digit keys to open links in submission text (e.g. Show HN)

# v0.1.10

- Add options page
- Apply options immediately

# v0.1.9

- Schedule vote requests to avoid 503s
- Fix hitting m on story in comment thread making upvote button disappear
- Fix innocuous error when toggling last comment
- Fix quick-edit form broken by preview feature in v0.1.5
- Fix Ctrl+Return submitting disabled form
- Redirect to parent when deleting comment

# v0.1.8

- Fix smooth scrolling disabled when jumping to “more” link

# v0.1.7

- Fix regression in v0.1.6: unable to open comments threads by hitting c/C

# v0.1.6

- Use J/K to jump down/up 10 at a time in Newest Items
- Hit b/B to open both permalink and comment thread
- Fix missing space in help page
- Hit numeric keys to open links in comments

# v0.1.5

- Use user-defined top color
- Fix unable to open the story link on page with no “more” link when no item is selected
- Add preview to new top comments (not just replies) as well
- Press ? for help

# v0.1.4

- Prefer smooth scrolling between comments (easier to keep track of moves)
- In Newest Items, do not repeat date of a same day
- Fix unable to go to “more” link (regression from v0.1.3)
- Do not capture key presses in input fields

# v0.1.3

- Fix selecting the oldest item being ignored
- Click to go to an item
- Fully bring story item in view (story points, age, etc. were not)
- Use o/O to open story link instead of l/o

# v0.1.2 - Newest Items Fixes

- Always show Newest Items for width ≥1600 instead of ≥1800px
- Fix horizontal overflow issues in Newest Items
- Scroll to selected entry in Newest Items
- Improve appearance of Newest Items
- Only show Newest Items when not empty

# v0.1.1 - Fix Key Binding Conflict

- Fix binding conflict on L key

# v0.1.0 - Initial Release

- Basic navigation
- Quick-reply, quick-edit, quick-delete
- Upvote, unvote, downvote, undown, flag, unflag, favorite, unfavorite
- Comment preview
- Newest Items
