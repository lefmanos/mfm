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

upload()
{
    megatools rm    -u $MEGA_USER -p $MEGA_PASS  /Root/apk/
    megatools mkdir -u $MEGA_USER -p $MEGA_PASS  /Root/apk/
    megatools copy  -u $MEGA_USER -p $MEGA_PASS -l $build_path -r /Root/apk
}
build_android()
{
    ionic cordova platform remove android --nosave
    ionic cordova platform add android --nosave
    ionic build
    ionic cordova prepare android
    ionic cordova build android 
}

build_and_upload()
{
    git pull
    build_android && upload
    git add --all
    git commit -m "Automatic build"
    git push
}

if [ $# -eq 1 ]; then
    if [ $1 = "-b" ]; then
        build_android
    elif [ $1 = "-u" ]; then
        upload
    else
        echo "-b build"
        echo "-u upload"
    fi
    exit
fi

echo start daemon check build and upload workflow
while true;
do
    check_for_updates && build_and_upload
    sleep 5s

done;

exit
