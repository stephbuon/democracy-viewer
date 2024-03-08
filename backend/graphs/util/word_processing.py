# Text mining
import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
from nltk.stem.snowball import SnowballStemmer
nltk.download("wordnet")
nltk.download('averaged_perceptron_tagger')

# Lemmatizer for sentances
def lemmatize_nltk(text):
    def get_wordnet_pos(word):
        """Map POS tag to first character lemmatize() accepts"""
        tag = nltk.pos_tag([word])[0][1][0].upper()
        tag_dict = {"J": wordnet.ADJ,
                    "N": wordnet.NOUN,
                    "V": wordnet.VERB,
                    "R": wordnet.ADV}

        return tag_dict.get(tag, wordnet.NOUN)
    
    lemmatizer = WordNetLemmatizer()
    return [ lemmatizer.lemmatize(w, get_wordnet_pos(w)) for w in nltk.word_tokenize(text) ]

# Lemmatizer for individual words
# def lemmatize_words_nltk(text):
#     lemmatizer = WordNetLemmatizer()
#     return [ lemmatizer.lemmatize(w) for w in nltk.word_tokenize(text) ]

# Stemmer function
def stem_nltk(text):
    stemmer = SnowballStemmer(language = "english")
    return list(map(lambda x: stemmer.stem(x), text.split()))