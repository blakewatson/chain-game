mkdir itch_chain
cp -R css itch_chain/css
cp -R fonts itch_chain/fonts
cp -R images itch_chain/images
cp -R js itch_chain/js
cp -R sound itch_chain/sound
cp all-words-alpha.txt itch_chain/all-words-alpha.txt
cp itch.html itch_chain/index.html
zip -r itch_chain itch_chain/*
rm -R itch_chain