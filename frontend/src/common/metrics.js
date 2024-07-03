export const metricNames = {
    "counts": "Word Counts",
    "proportions": "Proportion",
    "tf-idf": "TF-IDF",
    "ll": "Log Likelihood",
    "jsd": "Jensen-Shannon Divergence",
    "embeddings-similar": "Word Embeddings Similarity",
    "embeddings-different": "Word Embeddings Difference"
};

export const metricTypes = {
    "bar": [
        "counts", "proportions"
    ],
    "scatter": [
        "tf-idf", "ll"
    ],
    "heatmap": [
        "jsd"
    ],
    "dotplot": [
        "embeddings-similar", "embeddings-different"
    ]
};

