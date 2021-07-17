# install requirement


# environment setup 
* node js verion above 12
* meet the requirement of [discord.js V12](https://discord.js.org/)
1. Install [node js](https://nodejs.org/en/)  

2. Clone this repo. If you don't have git installed, click [here](https://git-scm.com/)
```
git clone https://github.com/jimmyliaoviva/discord-gameBot.git
```

3. Install packages
```
cd discord-gameBot
npm insall
``` 

4. Set project environment variables
    * This project is created using [slappey](https://www.npmjs.com/package/slappey). You don't need to slappey to run this project, but for develop purpose, slappey is recommended.{ option }
    ```
    npm install slappey -g
    ```
    1.  Create your own discord application and bot from [discord website](https://discord.com/developers/applications). 
    2. Create a file in the project file name it slappey.json, fill in the require information as this format.
    ```
    {
    "name": <your project name>,
    "language": 'javascript,
    "manager": "npm",
    "token": <bot token of your application>,
    "prefix": <the prefix of your command>
    }
    ```
5. Now you can run your project in several ways 
   * If you have nodemon installed
    ```
    npm run dev
    ```
   * The orginal node cli
    ```
    cd src/
    node index.js
    ```