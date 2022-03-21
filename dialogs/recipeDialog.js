const {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    WaterfallDialog
} = require('botbuilder-dialogs');
const {
    CardFactory
} = require('botbuilder');
const { Recipe } = require('../classes/recipe');
const { Spoonacular } = require('../classes/spoonacular');

const RECIPE = 'RECIPE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const DIET_PROMPT = 'DIET_PROMPT';
const MEAL_PROMPT = 'MEAL_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const CARD_PROMPT = 'CARD_PROMPT';
const END_PROMPT = 'END_PROMPT';

class RecipeDialog extends ComponentDialog {
    constructor(userState) {
        super('recipeDialog');
        // Allow access to Recipe outside of dialog
        this.recipe = userState.createProperty(RECIPE);
        this.spoon = new Spoonacular();
        this.addDialog(new ChoicePrompt(DIET_PROMPT));
        this.addDialog(new ChoicePrompt(MEAL_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new ChoicePrompt(CARD_PROMPT));
        this.addDialog(new ConfirmPrompt(END_PROMPT));

        this.dialog = new WaterfallDialog(WATERFALL_DIALOG, [
            this.dietStep.bind(this),
            this.mealStep.bind(this),
            this.summaryStep.bind(this),
            this.displayRecipeStep.bind(this),
            this.endOfDialog.bind(this)
        ]);

        this.addDialog(this.dialog);

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();

        if (results.status === DialogTurnStatus.empty) {
            await turnContext.sendActivity('Sure!');
            await dialogContext.beginDialog(this.id);
        }
    }

    async dietStep(step) {
        return await step.prompt(DIET_PROMPT, {
            prompt: 'Please choose a diet.',
            retryPrompt: 'Sorry, that\'s not an available choice. Please try again.',
            choices: ChoiceFactory.toChoices(['Vegetarian', 'Vegan', 'Gluten-Free', 'None'])
        });
    }

    async mealStep(step) {
        step.values.diet = step.result.value;
        return await step.prompt(MEAL_PROMPT, {
            prompt: 'Now choose a meal type.',
            choices: ChoiceFactory.toChoices(['Main Course', 'Side Dish', 'Dessert', 'Snack', 'Drink'])
        });
    }

    async summaryStep(step) {
        step.values.mealType = step.result.value;
        await this.recipe.get(step.context, new Recipe());
        this.recipe.mealType = step.values.mealType;
        this.recipe.diet = step.values.diet;

        await step.context.sendActivity(`I have your meal type of ${ this.recipe.mealType } with a dietary restriction of ${ this.recipe.diet }`);
        return await step.prompt(CONFIRM_PROMPT, {
            prompt: 'Does that sound correct?',
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
    }

    async displayRecipeStep(step) {
        const RecipeSettingsCorrect = step.result;
        if (RecipeSettingsCorrect) {
            await step.context.sendActivity({
                attachments: [
                    this.createRecipeCard(
                        await this.getRandomRecipe(this.recipe.diet, this.recipe.mealType)
                    )
                ]
            });
            return await step.prompt(END_PROMPT, {
                prompt: 'Are you happy with this recipe?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });
        } else {
            return await step.replaceDialog(WATERFALL_DIALOG);
        }
    }

    async endOfDialog(step) {
        const notHappyWithRecipe = step.result !== true;
        if (notHappyWithRecipe) {
            await step.context.sendActivity('I\'ll get another one');
            await step.context.sendActivity({
                attachments: [
                    this.createRecipeCard(
                        await this.getRandomRecipe(this.recipe.diet, this.recipe.mealType)
                    )
                ]
            });
            await this.dialog.addStep(await this.endOfDialog.bind(this));
            return await step.prompt(END_PROMPT, {
                prompt: 'Are you happy with this recipe?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });
        } else {
            await step.context.sendActivity('Fantastic! Ask anytime to get another recipe :-)');
            return await step.endDialog();
        }
    }

    /** Returns object of class Recipe */
    async getRandomRecipe(diet, mealType) {
        return await this.spoon.getRandomRecipe(diet, mealType);
    }

    createThumbnailCard(
        title, imageUrl, clickThroughTitle,
        clickThoughUrl, subtitle, text) {
        return CardFactory.thumbnailCard(
            title,
            [{ url: imageUrl }],
            [{
                type: 'openUrl',
                title: clickThroughTitle,
                value: clickThoughUrl
            }],
            {
                subtitle: subtitle,
                text: text
            }
        );
    }

    createRecipeCard(recipe) {
        const buttonTitle = 'See Full Recipe';
        return this.createThumbnailCard(
            recipe.title, recipe.imageUrl, buttonTitle,
            recipe.sourceUrl, recipe.sourceName, recipe.summary);
    }
}

module.exports.RecipeDialog = RecipeDialog;
