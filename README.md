This is a demo MMO-RPG game build with IONIC, an AngularJS based wrapper of cross-platform web application project.

environment setup:
install npm: (use su to be root if has access problem)
`sudo npm install`
`sudo ionic cordova plugin add cordova-plugin-file`
`sudo npm install --save @ionic-native/file`
`sudo ionic cordova plugin add cordova-plugin-file-transfer`
`sudo npm install --save @ionic-native/file-transfer`

build:
`ionic build`

run web server:
`ionic serve --no-livereload`

generate android project:
`sudo ionic cordova build android`

generate iOS project:
`sudo ionic cordova build ios`