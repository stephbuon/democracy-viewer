from gensim.models import Word2Vec
import pickle as pkl
from sklearn.decomposition import PCA
import util.data_queries as data
import util.s3 as s3

# move top similar words with keywords requested here
def load_data_from_pkl(table_name: str, pkl_name: str, token: str | None = None) -> Word2Vec:
    local_file = "{}/embeddings/{}_{}.pkl".format(s3.BASE_PATH, table_name, pkl_name.replace("/", "_"))
    
    s3.download_file(local_file, "embeddings/{}".format(table_name), "{}.pkl".format(pkl_name), token)

    with open(local_file, 'rb') as f:
        return pkl.load(f)
    
    raise Exception("Failed to load embedding")
    
def take_similar_words_over_group(table_name: str, keyword: str, group_col: str, vals: list[str] = [], topn: int = 5, token: str | None = None) -> list[dict]:
    results = []

    if len(vals) > 0:
        time_values = sorted(set(vals))
    else:
        time_values = data.get_column_values(table_name, group_col, 10, token)
        
    for time_value in time_values:
        try:
            pkl_name = "model_{}_{}".format(group_col, time_value)
            model = load_data_from_pkl(table_name, pkl_name, token)
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

def take_similar_words(table_name: str, keyword: str, topn: int = 5, token: str | None = None) -> list[dict]:
    results = []
    try:
        model = load_data_from_pkl(table_name, "model", token)
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
    except Exception as err:
        print('Sorry, no similar words found.')
        print(err)
        
    return results

def get_similar_words(table_name: str, keyword: str, group_col: str | None = None, vals: list[str] = [], topn: int = 5, token: str | None = None) -> list[dict]:
    if group_col is not None and len(group_col.strip()) == 0:
        group_col = None

    # get top words with score
    # the keyword will be include w a similarity score of 1
    if group_col is not None:
        #NOTE: here we assume that if user doesn't select a group col for embedding, our SQL will return NA
        results = take_similar_words_over_group(table_name, keyword, group_col, vals, topn, token)
    else:
        results = take_similar_words(table_name, keyword, topn, token)
        
    return results

def get_words_similarity(table_name: str, word1: str, word2: str, token: str | None = None) -> list[dict]:
    try:
        model = load_data_from_pkl(table_name, "model", token)
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
        
def get_words_similarity_over_group(table_name: str, word1: str, word2: str, group_col: str, vals: list[str] = [], token: str | None = None) -> list[dict]:
    results = []

    if len(vals) > 0:
        time_values = sorted(set(vals))
    else:
        time_values = data.get_column_values(table_name, group_col, 10, token)
        
    for time_value in time_values:
        try:
            pkl_name = "model_{}_{}".format(group_col, time_value)
            model = load_data_from_pkl(table_name, pkl_name, token)
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
    
    if group_col is None:
        results = get_words_similarity(table_name, word1, word2, token)
    else:
        results = get_words_similarity_over_group(table_name, word1, word2, group_col, vals, token)
        
    return results
    

def get_vectors(table_name: str, keywords: list[str], token: str | None = None) -> list[dict]:
    results = []
    
    model = load_data_from_pkl(table_name, "model", token)
    pca = PCA(2)
    all_vectors = []
    all_used_words = []
    if len(keywords) > 0:
        for word in keywords:
            try:
                all_vectors.append(model.wv.get_vector(word))
                all_used_words.append(word)
            except Exception:
                pass
    else:
        word_counts = []
        vectors = []
        used_words = []
        for word in model.wv.index_to_key:
            vectors.append(model.wv.get_vector(word))
            used_words.append(word)
            word_counts.append(model.wv.get_vecattr(word, "count"))
            
        total_word_count = sum(word_counts)
        for i in range(len(vectors)):
            if word_counts[i] >= 0.00005 * total_word_count:
                all_vectors.append(vectors[i])
                all_used_words.append(used_words[i])
        
    vectors_2d = pca.fit_transform(all_vectors)
    for i, word in enumerate(all_used_words):
        results.append({
            "word": word,
            "x": vectors_2d[i, 0],
            "y": vectors_2d[i, 1]
        })
            
    return results

def get_vectors_over_group(table_name: str, keywords: list[str], group_col: str, vals: list[str] = [], token: str | None = None) -> list[dict]:
    results = []

    if len(vals) > 0:
        time_values = sorted(set(vals))
    else:
        time_values = data.get_column_values(table_name, group_col, 5, token)
        
    pca = PCA(2)
    all_vectors = []
    all_used_words = []
    all_values = []
    for time_value in time_values:
        pkl_name = "model_{}_{}".format(group_col, time_value)
        model = load_data_from_pkl(table_name, pkl_name, token)
        vectors = []
        used_words = []
        if len(keywords) > 0:
            for word in keywords:
                try:
                    vectors.append(model.wv.get_vector(word))
                    used_words.append(word)
                    all_values.append(time_value)
                except Exception:
                    pass
        else:
            word_counts = []
            for word in model.wv.index_to_key:
                vectors.append(model.wv.get_vector(word))
                used_words.append(word)
                word_counts.append(model.wv.get_vecattr(word, "count"))
                
            total_word_count = sum(word_counts)
            cnt = 0
            for i in range(len(vectors)):
                # Adjust number to include more/less words
                if word_counts[i] >= total_word_count * 0.00005:
                    all_vectors.append(vectors[i])
                    all_used_words.append(used_words[i])
                    all_values.append(time_value)
                    cnt += 1
        
    vectors_2d = pca.fit_transform(all_vectors)
    for i, word in enumerate(all_used_words):
        results.append({
            "word": word,
            "group": all_values[i],
            "x": vectors_2d[i, 0],
            "y": vectors_2d[i, 1]
        })
            
    return results

def get_word_vectors(table_name: str, keywords: list[str], group_col: str | None = None, vals: list[str] = [], token: str | None = None) -> list[dict]:
    if group_col is not None and len(group_col.strip()) == 0:
        group_col = None
    
    if group_col is not None:
        #NOTE: here we assume that if user doesn't select a group col for embedding, our SQL will return NA
        results = get_vectors_over_group(table_name, keywords, group_col, vals, token)
    else:
        results = get_vectors(table_name, keywords, token)
        
    return results