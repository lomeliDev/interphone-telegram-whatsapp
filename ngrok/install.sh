#!/usr/bin/env bash

if [ ! $(which wget) ]; then
    echo 'Please install wget package'
    exit 1
fi

if [ ! $(which unzip) ]; then
    echo 'Please install zip package'
    exit 1
fi

if (( $EUID != 0 )); then
    echo "Please run as root"
    exit 1
fi

if [ -z "$3" ]; then
    echo "./install.sh <your_authtoken> <your_port_api> <your_endpoint>"
    exit 1
fi

cp ngrok.service /lib/systemd/system/
mkdir -p /opt/ngrok
cp ngrok.yml /opt/ngrok
sed -i "s/<add_your_token_here>/$1/g" /opt/ngrok/ngrok.yml
sed -i "s/<add_your_port_api_here>/$2/g" /opt/ngrok/ngrok.yml
sed -i "s/<add_your_endpoint_here>/$3/g" /opt/ngrok/ngrok.yml

cd /opt/ngrok
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-arm.zip
unzip ngrok-stable-linux-arm.zip
rm ngrok-stable-linux-arm.zip
chmod +x ngrok

systemctl enable ngrok.service
systemctl stop ngrok.service
systemctl start ngrok.service
