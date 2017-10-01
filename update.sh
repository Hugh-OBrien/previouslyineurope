#!/bin/bash
#
# Management script to update the site
#
# - Runs the episode update script and pushes to site
#
# Requires some Environment Variables:
# "SIMPLECAST" : API key for Simplecast to poll episode info as JSON
# "PIE_DIR"    : Directory where the updatable site lives
# "pie"        : Simplecast id for the cast
#
# Requires keychain to be setup with rsa keys to push to repo
#
# sh update.sh >> logs/update.log 2>> logs/update.log
#

echo --------------------------------------------------------------
date
keychain
. ~/.keychain/`/bin/hostname`-sh
cd $PIE_DIR

git stash

ssh-add $HOME/.ssh/gh_rsa

git checkout master

if [ $? = 0 ]
then
    git pull

    # Run update script, returns 0 if episodes added
    ruby episode_generate.rb

    # Do a push to the repo if we've added episodes
    if [ $? = 0 ]
    then
        git add -A
        git commit -am "adding episodes"
	git push origin master
    else
        echo No episodes added
    fi
fi

git stash pop
