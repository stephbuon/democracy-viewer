library(dhmeasures)
library(tidyverse)

# Split all text columns into word counts
split_text = function(file, cols) {
    data = read.csv(file)
    
    final = data.frame()
    
    if (is.vector(cols)) {
        
    } else {
        temp = tokenize_counts(data, text = cols)
        
        final = temp %>%
          mutate(column = cols)
    }
    
    output = paste(file, "-split", sep = "")
    write.csv(output)
    
    return(output)
}