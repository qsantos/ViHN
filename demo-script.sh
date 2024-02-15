#!/usr/bin/env bash
set -Eeuo pipefail

# Script to run the video demo.
# Start with script with the mouse cursor over the about:addons page in Firefox, with ViHN disabled.

xdotool click 1
trap 'setxkbmap fr -variant oss' EXIT INT ERR TERM
setxkbmap us

# Show comment thread without addon
sleep 2
xdotool key Ctrl+t
sleep .5
xdotool type 'https://news.ycombinator.com/item?id=39302744'
xdotool key Return
sleep 3

# Close comment thread and enable addon
xdotool key Ctrl+w
sleep 1
xdotool key Tab Tab space

# Show comment thread with addon
sleep 1
xdotool key Ctrl+t
sleep .5
xdotool type 'https://news.ycombinator.com/item?id=39302744'
xdotool key Return
sleep 3

# Navigate comments and go to next page
xdotool key --repeat 20 --delay 300 j
sleep 1
xdotool key --repeat 3 --delay 300 k
sleep 1
xdotool key --repeat 9 --delay 500 h
sleep 2
xdotool key J
sleep 2
xdotool key K
sleep 2
xdotool key m
sleep 2
xdotool key j
sleep 2
xdotool key o
sleep 3

# Show help
xdotool key question
sleep 2
xdotool key space
sleep 2
xdotool key question

# Open links in comments
sleep 1
xdotool key --repeat 2 --delay 300 j
sleep 1
xdotool key 1
sleep 2
xdotool key Ctrl+w
sleep 1
xdotool key Shift+1
sleep 2
xdotool key Ctrl+Tab
sleep .5
xdotool key Ctrl+w

# Navigate Newest Items
sleep 1
xdotool key n
sleep 1
xdotool key --repeat 3 --delay 300 j
sleep 1
xdotool key J
sleep 1
xdotool key g
sleep 1
xdotool key l
sleep 1
xdotool key n
xdotool key --repeat 3 --delay 300 k

sleep 2
xdotool key r
sleep 1
xdotool type 'test, please ignore'
sleep 1
xdotool key Ctrl+Return
sleep 3
xdotool key j
sleep 1
xdotool key Shift+D
sleep 1
xdotool key Return
sleep 5
