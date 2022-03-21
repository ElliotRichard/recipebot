/** Holds relevant recipe information to display a card */
class Recipe {
    constructor(title, imageUrl, sourceUrl, sourceName, summary) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.sourceUrl = sourceUrl;
        this.sourceName = sourceName;
        this.summary = summary;
    }
}

module.exports.Recipe = Recipe;
