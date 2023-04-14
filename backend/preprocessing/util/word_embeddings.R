library(text2vec)

export_word_embeddings = function(data) {
  fullText = c()
  
  for (record in unique(data$id)) {
    text = ""
    temp = data %>% filter(id == record)
    for (i in 1:nrow(temp)) {
      for (j in 1:temp$n[i]) {
        text = paste(text, temp$word[i])
      }
    }
    fullText = c(fullText, text)
  }
  
  vocab_list = list(data$word)
  
  it = itoken(fullText, tokenizer = word_tokenizer, progressbar = FALSE)
  vocab = create_vocabulary(it)
  
  # term_count_min is the minimum number of times a word is stated
  vocab = prune_vocabulary(vocab, term_count_min = 20)
  
  vectorizer = vocab_vectorizer(vocab)
  
  # The default suggestion was a window of 10, but I am using a window of 5 because the results seem better
  # for the Hansard data set -- I get less stop words in results
  tcm = create_tcm(it, vectorizer, skip_grams_window = 5)
  
  glove = GlobalVectors$new(rank = 4, x_max = 100)
  
  wv_main = glove$fit_transform(tcm, n_iter = 1000, convergence_tol = 0.00000001, n_threads = 24)
  
  wv_context = glove$components
  
  # The developers of the method suggest that sum/mean may work best when creating a matrix
  print("Finding sum/mean")
  word_vectors = wv_main + t(wv_context)
  
  view_most_similar = FALSE
  if (view_most_similar == TRUE) { # test to see if this works 
    view_most_similar_wrods(word_vectors, keyword, 40) }
  
  output = data.frame(word_vectors)
  output$word = rownames(word_vectors)
  rownames(output) = NULL
  
  return(output)
}
