library(dhmeasures)
library(dplyr)

LogLikelihood = function(data, group_list, word_list, group, word, n) {
  output = dhmeasures::log_likelihood(data, group_list, word_list, group, word, n)
  return(output)
}

JSD = function(data, group_list, word_list, group, word, n) {
  output = dhmeasures::jsd(data, group_list, word_list, group, word, n)
  return(output)
}

OriginalJSD = function(data, group_list, word_list, group, word, n) {
  output = dhmeasures::original_jsd(data, group_list, word_list, group, word, n)
  return(output)
}