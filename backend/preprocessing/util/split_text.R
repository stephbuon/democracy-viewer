library(dhmeasures)
library(dplyr)
library(textstem)

# Split all text columns into word counts
split_text = function(data, text_cols) {
    final = list()
    
    if (is.vector(text_cols)) {
        all_tokens = list()
        
        for (i in 1:length(text_cols)) {
            curr = data %>%
              dhmeasures::count_tokens(text = text_cols[i], group = "id") %>%
              dhmeasures::remove_stop_words() %>%
              dplyr::mutate(word = textstem::lemmatize_words(word)) %>%
              dplyr::group_by(id, word) %>%
              dplyr::summarise(n = sum(n)) %>%
              dplyr::ungroup() %>%
              dplyr::mutate(col = text_cols[i])
            all_tokens[[i]] = curr
        }
        
        final = do.call(rbind, all_tokens)
    } else {
      final = data %>%
        dhmeasures::count_tokens(text = text_cols, group = "id") %>%
        dhmeasures::remove_stop_words() %>%
        dplyr::mutate(word = textstem::lemmatize_words(word)) %>%
        dplyr::group_by(id, word) %>%
        dplyr::summarise(n = sum(n)) %>%
        dplyr::ungroup() %>%
        dplyr::mutate(col = text_cols)
    }
    
    return(final)
}
