# DOM of Hacker News

The section describes the HTML and resulting DOM that make a typical Hacker News page.

## Comment

```html
<tr id="XXXXXX" class="athing comtr">
 <td>
  <table>
   <tbody>
    <tr>
     <td class="ind">               for the visual representation of the depth of the thread
     <td class="votelinks">         for the up and down arrows
     <td class="default">
      <div>                         author, age, and various links
      <br>
      <div class="comment">
       <span class="commtext c00">  for the comment itself
       <div class="reply">          reply link
                                    NOTE: this <div> is actually a child of the previous <span> in comments with multiple paragraphs
    <tr>                            only present on comments the user can reply to (recent and logged in)
     <td colspan="2">               covers the .ind and .votelinks <td> from the first <tr>
     <td>                           for the reply form
```

## Story

```html
<tr id="XXXXXX" class="athing">
 <td class="title">                 actually for the story number
 <td class="votelinks">             for up and down arrows
 <td class="title">                 the actual title of the story (and domain)
<tr>
  <tr>
   <td colspan="2">                 covers the first .title and .votelinks <td> from the first <tr>
   <td class="subtext">             points, author, age, links and comments
```

## Comment Thread

```html
<table class="fatitem">
 <tbody>
  ONE STORY or ONE COMMENT
  <tr style="height: 10px">         spacer (only present on recent items, even if logged out)
  <tr>                              only present on recent items, even if logged out
   <td colspan="2">
   <td>
    <form>                          the “add comment”/“reply” form
<br>
<br>
<table class="comment-tree">
 <tbody>
  COMMENTS
```


## Reply Link Bug

Due to a bug, the reply link may or may not be part of `<span class="commtext">`.

Hacker News does not closes `<p>` tags in comments. Since comments are wrapped
in a `<span class="commtext">`, closing the `<span>` does not actually closes
the `<p>`. This causes the reply link to be in the `<span>` when the comment
contains a `<p>`.

```html
<span class="commtext c00">
Not a proper paragraph
</span>
<div class='reply'>
```

Works as expected: the reply `<div>` is a sibling of the comment `<span>`

```html
<span class="commtext c00">Not a paragraph
<p>First paragraph
<p>Second paragraph
</span>
<div class='reply'>
```

Here, the `</span>` is ignored and the reply `<div>` is still in the comment
`<span>`. However, when the reply `<div>` closes, it does closes the comment
`<span>` at well, making the layout not completely broken.
