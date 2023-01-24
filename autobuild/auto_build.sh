#!/bin/sh
#

git_dir=$(git rev-parse --show-toplevel)
build_type=debug
build_path="$git_dir/platforms/android/app/build/outputs/apk/$build_type/"
CREDS="$git_dir/autobuild/mega.creds"

while true
do
    if test ! -e $CREDS; then
        echo Mega credential file does not exist
        echo -n "Enter mega username (email): "
        read email
        echo -n "Enter mega password: "
        read -s password
        echo MEGA_USER="\"$email\"" > $CREDS
        echo MEGA_PASS="\"$password\"" >> $CREDS
    else
        source $CREDS
        break
    fi
done;

check_for_updates()
{
    git remote update && git status | grep behind > /dev/null
    is_up_to_date=$?
    return $is_up_to_date
}


build_and_upload()
{
    cordova build android && megatools copy -u $MEGA_USER -p $MEGA_PASS -l $build_path -r /Root/apk
}

while true;
do
    echo checking for updates
    check_for_updates && build_and_upload
    sleep 5s

done;

exit
