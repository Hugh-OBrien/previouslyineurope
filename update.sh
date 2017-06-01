#
# Management script to update the site
#
# - Runs the episode update script and pushes to site
#
# Requires some Environment Variables:
# "SIMPLECAST" : API key for Simplecast to poll episode info as JSON
# "PIE_DIR"    : Directory where the updatable site lives
# "pie"        : Simplecast id for the cast

echo $PIE_DIR
cd $PIE_DIR

git stash
git checkout master
echo $?
if [ $? = 0 ]
then
    git pull; git reset --hard origin/master

    ## COUNT PAGES HERE

    # Run update script
    ruby episode_generate.rb

    echo $?
fi

git stash pop
