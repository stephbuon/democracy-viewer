import pickle
import os

from gensim.models import Word2Vec
import pandas as pd

# move top similar words with keywords requested here
def load_data_from_pkl(pkl_name):
    pkl_model_file_name = pkl_name + '_models.pkl'

    if os.path.isfile(pkl_model_file_name):
        with open(pkl_model_file_name, 'rb') as f:
            models_per_year = pickle.load(f)
        
        return models_per_year
    else:
        print("Pickle files not found.")# TO DO: change this to some error message for backend
        return None
    
def take_similar_words_over_group(df, keyword, models_per_year,group_col):
    time_values = sorted(df[group_col].unique())
    top_words_per_year = {}
    top_words_score_per_year = {}

    for time_value in time_values:
        try:
            model: Word2Vec = models_per_year[time_value]
            similar_words_with_scores = model.wv.most_similar(keyword, topn=10)

            similar_words = [word[0] for word in similar_words_with_scores]
            similarity_scores = [word[1] for word in similar_words_with_scores]
            # add the keyword and its similarity score to standardize result
            similar_words.append(keyword)
            similarity_scores.append(1)
            # save result for this year
            top_words_per_year[time_value] = similar_words
            top_words_score_per_year[time_value] = similarity_scores
            # save model
            models_per_year[time_value] = model
        except Exception:
            top_words_per_year[time_value] = []
            continue
    return top_words_per_year, top_words_score_per_year

def take_similar_words(model,keyword):
    try:
        similar_words_with_scores = model.wv.most_similar(keyword, topn=10) 
        similar_words = [word[0] for word in similar_words_with_scores]
        similarity_scores = [word[1] for word in similar_words_with_scores]
        # add keyword and its similarity score
        similar_words.append(keyword)
        similarity_scores.append(1)  # similarity score for the keyword itself is 1

    except Exception:
        print('Sorry, no similar words found.')
    return similar_words,similarity_scores

def get_similar_words(pkl_name, df, keyword,group_col):
    # take the model out from pkl
    models_load = load_data_from_pkl(pkl_name)
    if  models_load is not None:
        print("Data loaded successfully!") # TO DO: change this to some next step to frontend visualization
        # get top words with score
        # the keyword will be include w a similarity score of 1
        if group_col is not None:
            #NOTE: here we assume that if user doesn't select a group col for embedding, our SQL will return NA
            top_words_per_year, top_words_score_per_year = take_similar_words_over_group(df, keyword, models_load,group_col)
        else:
            top_words, top_words_score = take_similar_words(models_load,keyword)
        # TO DO: save this for frontend visualization
    else:
        print("Failed to load data.")# TO DO: change this to some error message for backend
