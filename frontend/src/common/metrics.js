export const metricNames = {
    "counts": "Word Counts",
    "proportions": "Proportions",
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

export const metricSettings = {
    "counts": {
        column: false,
        values: false,
        words: false
    },
    "proportions": {
        column: false,
        values: false,
        words: false
    },
    "tf-idf": {
        column: true,
        values: 2,
        words: false
    },
    "ll": {
        column: true,
        values: 2,
        words: false
    },
    "jsd": {
        column: true,
        values: false,
        words: false
    },
    "embeddings-similar": {
        column: false,
        values: false,
        words: 1
    },
    "embeddings-different": {
        column: false,
        values: false,
        words: 1
    },
    "embeddings-raw": {
        column: false,
        values: false,
        words: false
    }
}