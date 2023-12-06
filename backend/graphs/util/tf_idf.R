library(tidytext)
library(dplyr)
library(textstem)

tf_idf = function(data, group_list, word_list, group, word, n) {
  word = dplyr::enquo(word)
  group = dplyr::enquo(group)
  n = dplyr::enquo(n)
  
  # Calculate tf-idf
  output = tidytext::bind_tf_idf(data, !!word, !!group, !!n) %>%
    select(group, word, tf_idf)
  
  # If word_list is defined, filter words
  if (!is.na(word_list)[1]) {
    output = output %>%
      filter(word %in% word_list)
  }
  
  # # If group_list is defined, filter groups
  if (!is.na(group_list)[1]) {
    output = output %>%
      filter(group %in% group_list)
  }
  
  return(output)
}
