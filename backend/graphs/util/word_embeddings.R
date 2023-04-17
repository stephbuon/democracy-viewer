library(dplyr)
library(text2vec)

word_embeddings = function(data, search_word) {
    out = data.frame()

    if(search_word %in% data$word) {
        data.matrix = data %>%
            dplyr::select(-word, -table_name) %>%
            as.matrix()
        rownames(data.matrix) = data$word

        kw = data %>%
            dplyr::filter(word == search_word) %>%
            dplyr::select(-word, -table_name) %>%
            as.matrix()
        rownames(kw) = data %>%
            dplyr::filter(word == search_word) %>%
            .$word

        cos_sim_rom = text2vec::sim2(x = data.matrix, y = kw, method = "cosine", norm = "l2")

        forplot = as.data.frame(sort(cos_sim_rom[,1], decreasing = T)[2:16])

        colnames(forplot)[1] = "similarity"

        forplot$word = rownames(forplot)
        rownames(forplot) = NULL

        out = bind_rows(out, forplot)
    }

    print("here")

    return(out)
}