library(dhmeasures, quietly = TRUE)
library(dplyr, quietly = TRUE)
library(textstem, quietly = TRUE)
options(dplyr.summarise.inform = FALSE)

# Split all text columns into word counts
split_text = function(data, text_col) {
  tokens = data %>%
    dhmeasures::count_tokens(text = text_col, group = "id") %>%
    dhmeasures::remove_stop_words() %>%
    dplyr::mutate(word = textstem::lemmatize_words(word)) %>%
    dplyr::group_by(id, word) %>%
    dplyr::summarise(n = sum(n)) %>%
    dplyr::ungroup() %>%
    dplyr::mutate(col = text_col)
  
  return(tokens)
}
