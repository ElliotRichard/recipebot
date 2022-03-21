const axios = require('axios');
const Recipe = require('./recipe');
const baseURL = 'https://api.spoonacular.com';
const apiKey = process.env.SpoonacularAPIKey;

class Spoonacular {
    constructor() {
        this.cuisines = null;
        this.categories = null;
    }

    async getRandomRecipe(diet, type) {
        const inputs = `&diet=${ diet.toLowerCase() }&type=${ type.toLowerCase() }`;
        const randomURL = '&sort=Random&number=1&addRecipeInformation=true';
        const URL = baseURL + '/recipes/complexSearch' + '?apiKey=' + apiKey;
        const config = {
            method: 'get',
            url: `${ URL }${ randomURL }${ inputs }`,
            headers: { }
        };

        return await axios(config)
            .then((response) => {
                let recipe = response.data.results[0];
                // Remove HTML tags that are typically embedded in summary
                const summary = recipe.summary.replace(/<(.|\n)*?>/g, '');
                recipe = new Recipe.Recipe(
                    recipe.title,
                    recipe.image,
                    recipe.sourceUrl,
                    recipe.sourceName,
                    summary);
                return recipe;
            })
            .catch((error) => {
                console.log(error);
            });
    }
}
module.exports.Spoonacular = Spoonacular;
