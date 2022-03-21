// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory, ActivityTypes } = require('botbuilder');
const { Recogniser } = require('./classes/recogniser');
const fs = require('fs');
const path = require('path');

const RANDOM_RECIPE = 'getRandomRecipe';
const GREETING = 'greeting';

class Bot extends ActivityHandler {
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) {
            throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        }
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // If in dialog
            const currentDialogState = await this.dialogState.get(context);
            const dialogInProgress =
        currentDialogState !== undefined && currentDialogState.dialogStack.length > 0;
            if (dialogInProgress) {
                // Dialog in progress
                // so Continue dialog which is in progress
                const currentDialogID = currentDialogState.dialogStack[0].id;
                switch (currentDialogID) {
                case 'recipeDialog':
                    await this.getRandomRecipe(context);
                }
            } else {
                // No dialog in progress
                // so start dialog
                const intent = await this.getLUISTopIntent(encodeURI(context.activity.text));

                switch (intent) {
                case RANDOM_RECIPE:
                    await this.getRandomRecipe(context);
                    break;
                case GREETING:
                    await context.sendActivity(this.getRandomizedGreeting());
                    break;
                case null:
                    await this.sendDog(context);
                    break;
                }
            }
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                    await context.sendActivity('If you\'d ever like a recipe just ask.');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async run(context) {
        await super.run(context);

        // Save any state changes.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

    /**
   * Sends input text to LUIS intent recognition.
   * Returns the intent with the highest recognition score.
   * @param {string} text The text sent to LUIS for intent recognition
   * @returns Intent that is recognised or null if none is.
   */
    async getLUISTopIntent(text) {
        const recogniser = new Recogniser();
        const response = await recogniser.getIntentPrediction(text).then((result) => {
            return result.prediction.topIntent;
        });
        return response === 'None' ? null : response;
    }

    /**
   * Starts dialog that generates a random recipe
   * @param {} turnContext The conversation context
   */
    async getRandomRecipe(turnContext) {
        await this.dialog.run(turnContext, this.dialogState);
    }

    async sendDog(turnContext) {
        const reply = { type: ActivityTypes.Message };
        reply.text = "I'm not sure what you mean, here's a dog";
        reply.attachments = [this.getInlineAttachment('dog_flipping', 'gif')];
        await turnContext.sendActivity(reply);
    }

    /**
   * Returns an image that is read to be sent on a channel.
   * @param {*} fileName The name of the file (without file suffix)
   * @param {*} fileType The type of file that is sent
   * @returns The image as an inline attachment
   */
    getInlineAttachment(fileName, fileType) {
        const file = fileName + '.' + fileType;
        const imageData = fs.readFileSync(path.join('./images', file));
        const base64Image = Buffer.from(imageData).toString('base64');

        return {
            name: file,
            contentType: `image/${ fileType }`,
            contentUrl: `data:image/${ fileType };base64,${ base64Image }`
        };
    }

    getRandomizedGreeting() {
        const GREETINGS = [
            'Hi',
            'Hey',
            'Hello',
            'Howdy'
        ];
        const randIndex = Math.round(Math.random() * 3);
        const emote = (Math.random() < 0.5) ? '!' : ' :)';
        return GREETINGS[randIndex] + emote;
    }
}

module.exports.Bot = Bot;
