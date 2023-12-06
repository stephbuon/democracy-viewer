def counts(data, word_list, word):
    # Filter for words in word_list
    output = data[data[word].isin(word_list)]
    
    return output

