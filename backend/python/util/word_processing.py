from nltk.stem.snowball import SnowballStemmer

# Stemmer function
def stem_nltk(text):
    stemmer = SnowballStemmer(language = "english")
    return list(map(lambda x: stemmer.stem(x), text.split()))