from gensim.models import Word2Vec
from os import path
from pickle import load
from util.s3 import download_file
import util.data_queries as data
# Word processing
from util.word_processing import lemmatize, stem

# move top similar words with keywords requested here
def load_data_from_pkl(pkl_name: str, token: str | None = None):
    pkl_model_file_name = download_file("embeddings", "model_{}.pkl".format(pkl_name), token)

    if path.isfile(pkl_model_file_name):
        with open(pkl_model_file_name, 'rb') as f:
            models_per_year = load(f)
        
        return models_per_year
    else:
        raise Exception("Pickle files not found.")# TO DO: change this to some error message for backend
    
def find_ids(results: list[dict], table_name: str, keyword: str, group_col: str | None = None, processing: str = "none", language: str = "English", token: str | None = None):
    for i in range(len(results)):
        curr = results[i]
        if group_col is None:
            val = None
        else:
            val = curr["group"]
            
        if processing == "stem":
            word = stem(curr["x"], language)[0]
        elif processing == "lemma":
            word = lemmatize(curr["x"], language)[0]
        else:
            word = curr["x"]
        df = data.basic_selection(table_name, group_col, [val], [keyword, word], token)
        results[i]["ids"] = list(sorted(set(df["record_id"])))
        
    return results
    
def take_similar_words_over_group(keyword: str, models_per_year: dict, vals: list[str] = [], similar: bool = True):
    results = []

    if len(vals) > 0:
        time_values = sorted(set(vals))
    else:
        time_values = list(models_per_year.keys()) 
        
    for time_value in time_values:
        try:
            model: Word2Vec = models_per_year[time_value]
            if similar:
                similar_words_with_scores = model.wv.most_similar(keyword, topn=5)
            else:
                similar_words_with_scores = model.wv.most_similar(negative = keyword, topn=5)

            similar_words = [word[0] for word in similar_words_with_scores]
            similarity_scores = [word[1] for word in similar_words_with_scores]
            # add the keyword and its similarity score to standardize result
            # similar_words.insert(0, keyword)
            # similarity_scores.insert(0, 1)
        except Exception:
            similar_words = []
            similarity_scores = []
            
        # Save to results list
        for i in range(len(similar_words)):
            results.append({
                "x": similar_words[i],
                "y": similarity_scores[i],
                "group": time_value
            })
            
    return results

def take_similar_words(model: Word2Vec, keyword: str, similar: bool = True):
    results = []
    try:
        if similar:
            similar_words_with_scores = model.wv.most_similar(keyword, topn=5) 
        else:
            similar_words_with_scores = model.wv.most_similar(negative = keyword, topn=5) 
        similar_words = [word[0] for word in similar_words_with_scores]
        similarity_scores = [word[1] for word in similar_words_with_scores]
        # add keyword and its similarity score
        # similar_words.insert(0, keyword)
        # similarity_scores.insert(0, 1)  # similarity score for the keyword itself is 1

        # Add similar words and scores to results
        for i in range(len(similar_words)):
            results.append({
                "x": similar_words[i],
                "y": similarity_scores[i],
                "group": keyword
            })
    except Exception:
        print('Sorry, no similar words found.')
        
    return results

def get_similar_words(table_name: str, keyword: str, group_col: str | None = None, vals: list[str] = [], processing: str = "none", language: str = "English", similar = True, token: str | None = None):
    # take the model out from pkl
    if group_col is not None:
        pkl_name = "{}_{}".format(table_name, group_col)
    else:
        pkl_name = table_name
        
    models_load = load_data_from_pkl(pkl_name, token)
    # get top words with score
    # the keyword will be include w a similarity score of 1
    if group_col is not None:
        #NOTE: here we assume that if user doesn't select a group col for embedding, our SQL will return NA
        results = take_similar_words_over_group(keyword, models_load, vals, similar)
    else:
        results = take_similar_words(models_load,keyword, similar)
        
    return find_ids(results, table_name, keyword, group_col, processing, language, token)
