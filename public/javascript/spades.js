require('playingcards');

deckModel = new PlayingCards.DeckModel(null, {});
deckModel.shuffle()

deckView = new PlayingCards.DeckView({
      el: $('#cards'),
      model: deckModel,
      templates: new PlayingCards.Templates()
});
deckView.setCardWidth(settings.width);

deckView.render();