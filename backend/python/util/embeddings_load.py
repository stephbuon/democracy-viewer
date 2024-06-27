import pickle
import os

from gensim.models import Word2Vec

# move top similar words with keywords requested here
def load_data_from_pkl(pkl_name: str):
    pkl_model_file_name = "python/files/embeddings/model_{}.pkl".format(pkl_name)

    if os.path.isfile(pkl_model_file_name):
        with open(pkl_model_file_name, 'rb') as f:
            models_per_year = pickle.load(f)
        
        return models_per_year
    else:
        print("Pickle files not found.")# TO DO: change this to some error message for backend
        return None
    
def take_similar_words_over_group(keyword: str, models_per_year: dict, vals: list[str] = []):
    results = {}

    if len(vals) > 0:
        time_values = sorted(set(vals))
    else:
        time_values = list(models_per_year.keys()) 
        
    for time_value in time_values:
        try:
            model: Word2Vec = models_per_year[time_value]
            similar_words_with_scores = model.wv.most_similar(keyword, topn=10)

            similar_words = [word[0] for word in similar_words_with_scores]
            similarity_scores = [word[1] for word in similar_words_with_scores]
            # add the keyword and its similarity score to standardize result
            similar_words.insert(0, keyword)
            similarity_scores.insert(0, 1)
        except Exception:
            similar_words = []
            similarity_scores = []
            
        # Save to results dictionary
        results[time_value] = {}
        for i in range(len(similar_words)):
            results[time_value][similar_words[i]] = similarity_scores[i]
            
    return results

def take_similar_words(model, keyword: str):
    results = {}
    try:
        similar_words_with_scores = model.wv.most_similar(keyword, topn=10) 
        similar_words = [word[0] for word in similar_words_with_scores]
        similarity_scores = [word[1] for word in similar_words_with_scores]
        # add keyword and its similarity score
        similar_words.insert(0, keyword)
        similarity_scores.insert(0, 1)  # similarity score for the keyword itself is 1

        # Add similar words and scores to results
        for i in range(len(similar_words)):
            results[similar_words[i]] = similarity_scores[i]
    except Exception:
        print('Sorry, no similar words found.')
        
    return results

def get_similar_words(table_name: str, keyword: str, group_col: str | None = None, vals: list[str] = []):
    # take the model out from pkl
    if group_col is not None:
        pkl_name = "{}_{}".format(table_name, group_col)
    else:
        pkl_name = table_name
        
    models_load = load_data_from_pkl(pkl_name)
    if  models_load is not None:
        print("Data loaded successfully!") # TO DO: change this to some next step to frontend visualization
        # get top words with score
        # the keyword will be include w a similarity score of 1
        if group_col is not None:
            #NOTE: here we assume that if user doesn't select a group col for embedding, our SQL will return NA
            return take_similar_words_over_group(keyword, models_load, vals)
        else:
            return take_similar_words(models_load,keyword)
        # TO DO: save this for frontend visualization
    else:
        print("Failed to load data.")# TO DO: change this to some error message for backend
