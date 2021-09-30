# Interphone with telegram and whatsapp
The project is an interphone to put it outside your house, it works like a normal one, only it is made for the raspberry pi, and integrates the telegram and whatsapp APIs, it also has two types of cameras, the native raspberry and one for the esp32-cam, the intercom can open a door, open the garage, sound an alarm, take photos, record videos.

The operation is as follows:

When a person presses the doorbell button, the software takes a capture from the camera and sends it to a group of users where it alerts that somebody rings, also using VOIP technology, it calls the users of the group, when a user answers the call it is it is visible between the interphone and the one who answered the call.

You can also send commands from telegram and whatsapp to open the garage, open the door, take a snapshot of the camera, record a video, turn on the alarm and general commands from the raspberry pi.

## Installation

Once the raspberry is turned on and the os of the raspberry pi server is installed, we begin to install the necessary libraries.

```sh
sudo apt-get update
sudo apt-get install fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils omxplayer unzip
sudo apt-get install chromium-browser --yes
sudo apt-get install fswebcam --yes
sudo apt-get install libatlas-base-dev libjasper-dev libqtgui4 libqt4-test libhdf5-dev --yes
sudo apt-get install libasound2-dev --yes
sudo apt-get install pulseaudio jackd2 alsa-utils dbus-x11 screen --yes
sudo apt-get install sysstat vnstat vnstati --yes
sudo apt install -y ffmpeg
```

If we use the native camera of the raspberry pi we proceed to configure it

```sh
sudo modprobe bcm2835-v4l2
sudo rpi-update
vcgencmd get_camera
```

Test that the raspberry pi camera works

```sh
raspistill -o test.jpg
```
The VOIP protocol can be installed on the raspberry pi or use a third party, but if in your case you need to install it, it is necessary to execute the following commands

```sh
sudo apt-get install asterisk --yes
sudo apt-get install asterisk-prompt-es asterisk-core-sounds-es asterisk-core-sounds-es-gsm asterisk-core-sounds-es-wav asterisk-core-sounds-es-g722 asterisk-core-sounds-es-wav --yes
sudo apt-get install asterisk-core-sounds-en asterisk-core-sounds-en-g722 asterisk-core-sounds-en-gsm asterisk-core-sounds-en-wav --yes
```

Now we are going to install nodejs and its dependencies

```sh
curl -sSL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt install -y nodejs
sudo npm i -g pm2 
sudo npm i -g shell-exec
sudo npm i -g yarn
sudo npm i -g nodemon
```

Now we have to configure the audio card for the raspberry pi, in my case I am using an external audio card, the following video shows how to configure the external sound card

```js
https://www.youtube.com/watch?v=xXoAswjFK5I
```

Pjsua softphone needs to be installed

```sh
wget https://github.com/pjsip/pjproject/archive/refs/tags/2.9.zip
unzip 2.9.zip
cd pjproject-2.9
./configure
make dep && make clean && make
cd pjsip-apps/bin/
```

Once finished compiling pjsua you need to validate the audio and microphone devices to test the device id and add them to the environment variables

```sh
cd pjsip-apps/bin/
./pjsystest-armv7l-unknown-linux-gnueabihf
```

Once you have finished validating the devices inside the current folder you will find the softphone program called "pjsua-armv7l-unknown-linux-gnueabihf" this name may vary depending on your OS, the global path of this file we will need in environment variables

**If you chose to use an esp32-cam camera, it is necessary to compile the program found in the "esp32-cam" folder with the extension platformio for visual studio code, in the include folder within the project, rename the file to home_wifi_multi.he enter the data of your WIFI so that the esp32-cam connects to the wifi, inside the platformio.ini file enter your serial device port.**

# Download the program code

```sh
cd /home/pi
git clone https://github.com/lomeliDev/interphone-telegram-whatsapp.git
cd interphone-telegram-whatsapp
```

# Configure asterisk if you need it

In the asterisk folder you must copy the files "extensions.conf", "queues.conf", "sip.conf" into "/etc/asterisk/", these files must be configured according to your needs, with your user extensions and passwords.

# IP telephony must be configured

In the asterisk folder there is a file called "sip.example.cfg" we rename it to "sip.cfg", within it we configure the parameters of our asterisk server or our ip telephony provider, likewise we configure the id of the devices of microphone and speakers

# Configure ngrok as a service

If we need to output the camera to the internet, it is necessary to install the proxy, in the ngrok folder we need to execute the script "install.sh", we must have our token, the port of our app, the endpoint, user and password at hand

```sh
sudo chmod +x install.sh
sudo ./install.sh <your_authtoken> <your_port_api> <your_endpoint> <your_user> <your_password>
```

**So far we have finished installing what is necessary for our program, now we need to configure our environment variables.**

## GPIO ports configuration

The ports that we will configure would be the following.

```bash
Relay door: 20
```
```bash
Relay garage: 16
```
```bash
Relay light: 12
```
```bash
Relay alarm: 21
```

```bash
Button ring: 2
```
```bash
Button door: 3
```
```bash
Button garage: 4
```
```bash
Button light: 5
```
```bash
Button alarm: 6
```

**The buttons only need ground and the signal from the gpio port, they do not need a resistor.**

**The relays need ground and 5v from the raspberry pi.**

## Graphic interface

The interface is in the ip of the raspberry and in the port "PORT_API", an example would be "http://192.168.0.10:5001/"

![Graphic interface](https://i.imgur.com/QTH7Svq.png)

## API Telegram

A bot is created for telegram with "@BotFather", the api that returns will be added to our global variables file

If we want to add a menu to our bot, I'll let you know in Spanish and English

```bash
user - Regresa el ID del usuario
free - Memoria ram
df - Detalle de la SD card
reboot - Reinicio de la raspberry
esp32 - Reinicia el ESP32-CAM
pjsua - Reincia el softhphone
hangup - Cuelga la llamada actual
redirect - URL del stream
help - Ayuda
```

```bash
user - Returns the user ID
free - Memory ram
df - SD card detail
reboot - Restart the raspberry
esp32 - Restart the ESP32-CAM
pjsua - Restart the softphone
hangup - Hang up the current call
redirect - Stream url
help - Help
```

## API Whatsapp

If we use whatsapp we must register a whatsapp with a QR, we must enter "http://192.168.0.10:5001/api/whatsapp/qr" remember to change the IP address and port for yours, this will return a code , which we must generate a qr with that key, and scan this qr with whatsapp

**So far we have finished configuring our program, now we just need to run it**

## Start our program

Our program is configured to run when the raspberry pi boots

```bash
cd /home/pi/interphone-telegram-whatsapp
pm2 start index.js --name interphone --restart-delay 5000
pm2 startup
pm2 save
```

**Now we must restart the raspberry pi**

```bash
sudo reboot
```

## Errors and contributions

For an error write the problem directly on github issues or submit it
to the mail miguel@lomeli.io. If you want to contribute to the project please send an email.

#Interphone , #Whatsapp , #Telegram , #Interfon
