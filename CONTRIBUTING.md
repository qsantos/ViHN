# How to Contribute

This document list a few things to keep in mind when opening a PR.
With that said, it's okay to make mistakes, so don't worry too much about following these rules;
we'll discuss in the PR comments.

To test and debug your changes, you *can* use [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/).

## Be Fast

Everything must be fast.

That means no reflow (moving existing elements) on loading.
For instance, just adding a `border: 1px solid #ff6600` to show the active element does not cut it.
Doing so would change the total height of the element by two pixels, moving everything below.

**Note:**
It's okay to move elements in response to user action (e.g. quick reply), but that should still be fast.

**Note:**
It would be okay to move individual elements (e.g. the active comment) on loading, as long as it does not cascade to the rest.

In addition, actions should strive to minimize any delay.
For instance, the quick reply form must be shown immediately, without waiting for a network request to complete;
the submit button is disabled in the mean time, but the user can start writing their comment without waiting.

## Be Simple

There must be minimal friction for development.

That means no build step, no `npm`.
Just plain old [Vanilla JS](http://vanilla-js.com/).
The scope is too simple to warrant importing any external code.
One JavaScript file and one CSS file should be enough.
If a feature did warrant an external library, it should be vendored and served as a separate file.

TypeScript or JSDoc is not worth it here.
Adding automated testing in the CI would be acceptable.
