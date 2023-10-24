library(dplyr)
library(textstem)

counts = function(data, word_list, word) {
  word = dplyr::enquo(word)

  # Lemmatize word list
  word_list = textstem::lemmatize_words(word_list)

  # Filter data to only include words in word_list
  data = data %>%
    dplyr::filter(word %in% word_list)

  return(data)
}