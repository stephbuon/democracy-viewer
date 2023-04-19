library(dhmeasures)
library(dplyr)
library(textstem)

LogLikelihood = function(data, group_list, word_list, group, word, n) {
  word_list = textstem::lemmatize_words(word_list)
  output = dhmeasures::log_likelihood(data, group_list, word_list, group, word, n)
  return(output)
}

JSD = function(data, group_list, word_list, group, word, n) {
  word_list = textstem::lemmatize_words(word_list)
  output = dhmeasures::jsd(data, group_list, word_list, group, word, n)
  return(output)
}

OriginalJSD = function(data, group_list, word_list, group, word, n) {
  word_list = textstem::lemmatize_words(word_list)
  output = dhmeasures::original_jsd(data, group_list, word_list, group, word, n)
  return(output)
}