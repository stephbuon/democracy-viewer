export const metricNames = {
    "counts": "Word Counts",
    "proportions": "Proportion",
    "tf-idf": "tfi-idf",
    "ll": "Log Likelihood",
    "jsd": "Jensen-Shannon Divergence",
    "embeddings-similar": "Word Embeddings Similarity"
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
        "embeddings-similar"
    ]
};

