library(dplyr)

proportions = function(data, group_list, word_list, group, word, n) {
  word = dplyr::enquo(word)
  group = dplyr::enquo(group)
  n = dplyr::enquo(n)
  
  # Get the total word counts for each group
  group_counts = data %>%
    dplyr::group_by(group) %>%
    dplyr::summarise(n = sum(n))
  
  # Create a subset of data with the words in word_list
  # If word_list is empty, use all words
  if (length(word_list) > 0) {
    data_subset = data %>%
        dplyr::filter(word %in% word_list)
  } else {
    data_subset = data
  }
  
  # If data_subset is empty, end the function
  if (nrow(data_subset) == 0) {
    return(data.frame())
  }
  
  # Calculate word use proportion for each word/group combination
  proportions = c()
  for (i in 1:nrow(data_subset)) {
    # Get the total word count of the current group
    curr_count = group_counts %>%
      dplyr::filter(group == data_subset$group[i]) %>%
      head(n = 1) %>%
      dplyr::pull(n)
    
    # Calculate word use proportion
    value = data_subset$n[i] / curr_count
    proportions = c(proportions, value)
  }
  
  # Add proportions column
  data_subset = data_subset %>%
    dplyr::mutate(proportion = proportions) %>%
    dplyr::select(-id, -n)
  
  return(data_subset)
}

proportions_all_groups = function(data, word_list, word, n) {
  word = dplyr::enquo(word)
  n = dplyr::enquo(n)
  
  # Get the total word count
  total_count = data %>%
    dplyr::summarise(n = sum(n)) %>%
    dplyr::pull(n)
  
  # Create a subset of data with the words in word_list
  # If word_list is empty, use all words
  if (length(word_list) > 0) {
    data_subset = data %>%
        dplyr::filter(word %in% word_list)
  } else {
    data_subset = data
  }
  
  # If data_subset is empty, end the function
  if (nrow(data_subset) == 0) {
    return(data.frame())
  }
  
  # Calculate word use proportion for each word/group combination
  proportions = c()
  for (i in 1:nrow(data_subset)) {    
    # Calculate word use proportion
    value = data_subset$n[i] / total_count
    proportions = c(proportions, value)
  }
  
  # Add proportions column
  data_subset = data_subset %>%
    dplyr::mutate(proportion = proportions) %>%
    dplyr::select(-id, -n)
  
  return(data_subset)
}