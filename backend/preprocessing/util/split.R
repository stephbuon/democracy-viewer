library(dhmeasures)
library(tidyverse)

# Split all text columns into word counts
split_text = function(file, cols) {
    data = read.csv(file)
    
    final = data.frame()
    
    if (is.vector(cols)) {
        all_tokens = list()
        
        for (i in 1:length(cols)) {
            curr = data %>%
              dhmeasures::count_tokens(data, text = cols[i]) %>%
              dhmeasures::remove_stop_words() %>%
              dplyr::mutate(column = cols[i])
            all_tokens[[i]] = curr
        }
        
        final = do.call(rbind, all_tokens)
    } else {
      final = data %>%
        dhmeasures::count_tokens(data, text = cols) %>%
        dhmeasures::remove_stop_words() %>%
        dplyr::mutate(column = cols)
    }
    
    output = paste(file, "-split", sep = "")
    write.csv(output)
    
    return(output)
}