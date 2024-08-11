from nltk.stem.snowball import SnowballStemmer
from nltk.tokenize import word_tokenize
from util.spacy_models import load_spacy_model

# Tokenizer
def tokenize(text: str, language: str = "English"):
    return word_tokenize(text, language.lower())

# Stemmer
def stem(text: str, language: str = "English"):
    stemmer = SnowballStemmer(language = language.lower())
    return list(map(lambda x: stemmer.stem(x), tokenize(text, language)))

# Lemmatizer
def lemmatize(text: str, language: str = "English"):
    nlp = load_spacy_model(language)
    return [ token.lemma_ for token in nlp(text) ]