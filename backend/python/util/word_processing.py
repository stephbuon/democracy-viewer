from nltk.stem.snowball import SnowballStemmer
from spacy import load as load_spacy

# Stemmer
def stem(text):
    stemmer = SnowballStemmer(language = "english")
    return list(map(lambda x: stemmer.stem(x), text.split()))

# Lemmatizer
def lemmatize(text):
    nlp = load_spacy("en_core_web_sm")
    return [ token.lemma_ for token in nlp(text) ]