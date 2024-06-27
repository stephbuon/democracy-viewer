from pandas import DataFrame
import pickle
from gensim.models import Word2Vec
from nltk.tokenize import word_tokenize
import pandas as pd
from time import time
# Database interaction
import util.data_queries as data
from util.s3 import upload_file, BASE_PATH

def prepare_text(text,stopWords):
    tokens = word_tokenize(text.lower())
    cleaned_tokens = [token for token in tokens if token.isalpha() and token not in stopWords]
    return cleaned_tokens

def train_word2vec(texts):
    model = Word2Vec(texts, vector_size=100, window=5, min_count=1, workers=4)
    return model

def model_similar_words(stopWords: set[str], df: pd.DataFrame, table_name: str, token: str | None = None):
    cleaned_texts = [prepare_text(text,stopWords) for text in df['text'].tolist()]
    model = train_word2vec(cleaned_texts)
    
    folder = "embeddings"
    name = "model_{}.pkl".format(table_name)
    pkl_model_file_name = "{}/{}/{}".format(BASE_PATH, folder, name)
    # save models_per_year
    with open(pkl_model_file_name, 'wb') as f:
        pickle.dump(model, f)
    upload_file(folder, name, token)

def model_similar_words_over_group(stopWords: set[str], df: pd.DataFrame, group_col: str, table_name: str, token: str | None = None):
    time_values = sorted(df[group_col].unique())
    models_per_year = {}

    for time_value in time_values:
        try:
            time_texts = df[df[group_col] == time_value]['text'].tolist()
            cleaned_texts = [prepare_text(text,stopWords) for text in time_texts]
            model = train_word2vec(cleaned_texts)
            models_per_year[time_value] = model
        
        except Exception:
            models_per_year[time_value] = []
            continue
        
    folder = "embeddings"
    name = "model_{}_{}.pkl".format(table_name, group_col)
    pkl_model_file_name = "{}/{}/{}".format(BASE_PATH, folder, name)
    # save models_per_year
    with open(pkl_model_file_name, 'wb') as f:
        # save models as dictionary, where key is the group_col unique value AND value is the model
        pickle.dump(models_per_year, f) 
    upload_file(folder, name, token)

# NOTE: we HAVE TO ask for the users' preferrence on stopwords at the very begining when they upload the file
# (for data cleaning purpose)
def compute_embeddings(df: DataFrame, metadata: dict, table_name: str, token: str | None = None):
    start = time()
    # Get grouping column if defined
    column = metadata.get("embed_col", None)
    
    # set up stop words from github
    stopWordFile = pd.read_csv('./python/util/stopwords.csv')# HAVE TO BE READY LOCAL
    stopWords = set(stopWordFile['stop_word'])

    if column is not None:
        # select top words over GROUP and save
        df_text = data.get_columns(table_name, [column], token)
        df_merged = pd.merge(df, df_text, left_on = "id", right_index = True)
        model_similar_words_over_group(stopWords, df_merged, column, table_name, token)
    else:
        model_similar_words(stopWords, df, table_name, token)
    print("Embeddings: {} minutes".format((time() - start) / 60))
        