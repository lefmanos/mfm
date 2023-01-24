#!/bin/sh
#

git_dir=$(git rev-parse --show-toplevel)
build_type=debug
build_path="$git_dir/platforms/android/app/build/outputs/apk/$build_type/"

CREDS="$git_dir/autobuild/mega.creds"

if test ! -e $CREDS; then
    echo file does not exist
    echo -n "Enter mega username (email): "
    read email
    echo -n "Enter mega password: "
    read -s password
    echo MEGA_USER="\"$email\"" > $CREDS
    echo MEGA_PASS="\"$password\"" >> $CREDS
else
    echo file exists
    source $CREDS
fi
exit

cordova build android && megatools copy -u $MEGA_USER -p $MEGA_PASS -l $build_path -r /Root/apk
