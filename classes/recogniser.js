const axios = require('axios').default;
const SUBSCRIPTION_KEY = process.env.LuisSubscriptionKey;
const endpoint = 'https://australiaeast.api.cognitive.microsoft.com/luis/prediction/v3.0/apps/bf01aa99-c6b0-4c58-9f27-cb5a9478212f/slots/production/predict?verbose=true&show-all-intents=true&log=true&subscription-key=' + SUBSCRIPTION_KEY + '&query=';
class Recogniser {
    async getIntentPrediction(query) {
        return axios.get(endpoint + query)
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                return error;
            });
    }
}

module.exports.Recogniser = Recogniser;
