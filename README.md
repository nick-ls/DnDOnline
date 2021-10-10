# DnDOnline
This is an online whiteboard app that uses WebSockets to connect a DM and players so that an encounter can be run online. It was created to help a couple of friends and I to continue playing DnD when meeting in person was not an option. ![An image of the board and the editor that was used to make it](https://github.com/Nicholas264/DnDOnline/raw/main/readme/app.png)
## How to set up
You will need a server with a public facing IP if you want to have other people not on the same network be able to connect, and Node.js.
1) Clone this repository `git clone https://github.com/Nicholas264/DnDOnline`
2) Assuming you already have node and npm installed, run `npm i` in the cloned directory
3) Run `node .` in the directory and a locally running copy of the app should be available at `http://localhost:2738`