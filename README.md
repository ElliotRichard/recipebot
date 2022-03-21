# RecipeBot

A chatbot for ordering recipes.

A chatbot built with Microsoft Azure JavaScript SDK 4. Utilises NLU with LUIS to retrieve recipes based on user choices.

NLU is used to understand intent in greetings and with recipe requests. A controlled dialog is then used to gather the clients wants. The bot interacts with the [Spoonacular](https://spoonacular.com/food-api/) API to fetch this information.

Demonstrates the core capabilities of the Microsoft Bot Framework.

## In Use
Interprets greetings...
![greeting_intent](images/repo/greeting_intent.png)
...and recipe fetching
![recipe_intent](images/repo/recipe_intent.png)
![recipe_intent_2](images/repo/recipe_intent_2.png)

Asks for recipe choices. Allows the user to change selection.
![dietary_options](images/repo/dietary_options.png)

And then retrieves recipes until the user is happy
![recipe_fetched](images/repo/recipe_fetched.png)

Returns to neutral state
![dialog_finished](images/repo/dialog_finished.png)

## Prerequisites

- [Node.js](https://nodejs.org) version 10.14.1 or higher

    ```bash
    # determine node version
    node --version
    ```

## To run the bot

- Install modules

    ```bash
    npm install
    ```

- Start the bot

    ```bash
    npm start
    ```

## Testing the bot using Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.9.0 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to the bot using Bot Framework Emulator

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`