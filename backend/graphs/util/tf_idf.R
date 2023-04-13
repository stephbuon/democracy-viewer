library(tidytext)
library(dplyr)
library(textstem)

tf_idf = function(data, group_list, word_list, group, word, n) {
  word = dplyr::enquo(word)
  group = dplyr::enquo(group)
  n = dplyr::enquo(n)

  # Lemmatize word list
  word_list = textstem::lemmatize_words(word_list)
  
  # Calculate tf-idf
  output = tidytext::bind_tf_idf(data, !!word, !!group, !!n) %>%
    select(group, word, tf_idf)
  
  # If word_list is defined, filter words
  if (!is.na(word_list)[1]) {
    if (is.vector(word_list)) {
      output = output %>%
        filter(word %in% word_list)
    } else {
      output = output %>%
        filter(word == word_list)
    }
  }
  
  # # If group_list is defined, filter groups
  if (!is.na(group_list)[1]) {
    if (is.vector(group_list)) {
      output = output %>%
        filter(group %in% group_list)
    } else {
      output = output %>%
        filter(group == group_list)
    }
  }
  
  return(output)
}
