from gensim.models import Word2Vec
import os
import pickle as pkl
from sklearn.decomposition import PCA
import util.s3 as s3

# move top similar words with keywords requested here
def load_data_from_pkl(pkl_name: str, token: str | None = None) -> Word2Vec | dict[str, Word2Vec]:
    data = s3.download_data("embeddings", "model_{}".format(pkl_name), "pkl", token)

    return pkl.loads(data)
    
def take_similar_words_over_group(keyword: str, models_per_year: dict[str, Word2Vec], vals: list[str] = [], topn: int = 5) -> list[dict]:
    results = []

    if len(vals) > 0:
        time_values = sorted(set(vals))
    else:
        time_values = list(models_per_year.keys()) 
        
    for time_value in time_values:
        try:
            model = models_per_year[time_value]
            similar_words_with_scores = model.wv.most_similar(keyword, topn=int(topn))

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

def take_similar_words(model: Word2Vec, keyword: str, topn: int = 5) -> list[dict]:
    results = []
    try:
        similar_words_with_scores = model.wv.most_similar(keyword, topn=int(topn)) 
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

def get_similar_words(table_name: str, keyword: str, group_col: str | None = None, vals: list[str] = [], topn: int = 5, token: str | None = None) -> dict:
    if group_col is not None and len(group_col.strip()) == 0:
        group_col = None
    
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
        results = take_similar_words_over_group(keyword, models_load, vals, topn)
    else:
        results = take_similar_words(models_load,keyword, topn)
        
    return results

def get_words_similarity(model: Word2Vec, word1: str, word2: str) -> list[dict]:
    try:
        similarity = model.wv.similarity(word1, word2)
        
        return [{
            "x": None,
            "y": float(similarity)
        }]
    except:
        return [{
            "x": None,
            "y": 0
        }]
        
def get_words_similarity_over_group(models: dict[str, Word2Vec], word1: str, word2: str, vals: list[str] = []) -> list[dict]:
    results = []

    if len(vals) > 0:
        time_values = sorted(set(vals))
    else:
        time_values = list(models.keys()) 
        
    for time_value in time_values:
        try:
            model = models[time_value]
            similarity = model.wv.similarity(word1, word2)
            results.append({
                "x": time_value,
                "y": float(similarity)
            })
        except:
            pass
            
    return results

def get_words_similarity_grouped(table_name: str, word1: str, word2: str, group_col: str | None = None, vals: list[str] = [], token: str | None = None) -> list[dict]:
    if group_col is not None and len(group_col.strip()) == 0:
        group_col = None
        
    # take the model out from pkl
    if group_col is not None:
        pkl_name = "{}_{}".format(table_name, group_col)
    else:
        pkl_name = table_name
    models_load = load_data_from_pkl(pkl_name, token)
    
    if group_col is None:
        results = get_words_similarity(models_load, word1, word2)
    else:
        results = get_words_similarity_over_group(models_load, word1, word2, vals)
        
    return results
    

def get_vectors(model: Word2Vec, keywords: list[str]) -> list[dict]:
    results = []
        
    pca = PCA(2)
    vectors = []
    used_words = []
    if len(keywords) > 0:
        for word in keywords:
            try:
                vectors.append(model.wv.get_vector(word))
                used_words.append(word)
            except Exception:
                pass
    else:
        for word in model.wv.index_to_key:
            vectors.append(model.wv.get_vector(word))
            used_words.append(word)
        
    vectors_2d = pca.fit_transform(vectors)
    for i, word in enumerate(used_words):
        results.append({
            "word": word,
            "x": vectors_2d[i, 0],
            "y": vectors_2d[i, 1]
        })
            
    return results

def get_vectors_over_group(keywords: list[str], models: dict[str, Word2Vec], vals: list[str] = []) -> list[dict]:
    results = []

    if len(vals) > 0:
        time_value = sorted(set(vals))[0]
    else:
        time_value = list(models.keys())[0]
        
    pca = PCA(2)
    vectors = []
    used_words = []
    model = models[time_value]
    if len(keywords) > 0:
        for word in keywords:
            try:
                model = models[time_value]
                vectors.append(model.wv.get_vector(word))
                used_words.append(word)
            except Exception:
                pass
    else:
        for word in model.wv.index_to_key:
            vectors.append(model.wv.get_vector(word))
            used_words.append(word)
        
    vectors_2d = pca.fit_transform(vectors)
    for i, word in enumerate(used_words):
        results.append({
            "word": word,
            "group": time_value,
            "x": vectors_2d[i, 0],
            "y": vectors_2d[i, 1]
        })
            
    return results

def get_word_vectors(table_name: str, keywords: list[str], group_col: str | None = None, vals: list[str] = [], token: str | None = None) -> dict:
    if group_col is not None and len(group_col.strip()) == 0:
        group_col = None
    
    # take the model out from pkl
    if group_col is not None:
        pkl_name = "{}_{}".format(table_name, group_col)
    else:
        pkl_name = table_name
        
    models_load = load_data_from_pkl(pkl_name, token)
    
    if group_col is not None:
        #NOTE: here we assume that if user doesn't select a group col for embedding, our SQL will return NA
        results = get_vectors_over_group(keywords, models_load, vals)
    else:
        results = get_vectors(models_load,keywords)
        
    return results