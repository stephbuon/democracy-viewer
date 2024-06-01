from nltk.stem.snowball import SnowballStemmer
from util.spacy_models import load_spacy_model

# Stemmer
def stem(text: str, language: str = "English"):
    stemmer = SnowballStemmer(language = language.lower())
    return list(map(lambda x: stemmer.stem(x), text.split()))

# Lemmatizer
def lemmatize(text: str, language: str = "English"):
    nlp = load_spacy_model(language)
    return [ token.lemma_ for token in nlp(text) ]