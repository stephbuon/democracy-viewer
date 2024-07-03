export const metricNames = {
    "counts": "Word Counts",
    "proportions": "Proportion",
    "tf-idf": "TF-IDF",
    "ll": "Log Likelihood",
    "jsd": "Jensen-Shannon Divergence",
    "embeddings-similar": "Word Embeddings Similarity",
    "embeddings-different": "Word Embeddings Difference",
    "embeddings-raw": "Word Embedding Vectors"
};

export const metricTypes = {
    "bar": [
        "counts", "proportions"
    ],
    "scatter": [
        "tf-idf", "ll", "embeddings-raw"
    ],
    "heatmap": [
        "jsd"
    ],
    "dotplot": [
        "embeddings-similar", "embeddings-different"
    ]
};

