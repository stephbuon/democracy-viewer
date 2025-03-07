export const metricNames = {
    "counts": "Word Counts",
    "proportions": "Proportions",
    "tf-idf-scatter": "TF-IDF (Scatter Plot)",
    "tf-idf-bar": "TF-IDF (Bar Plot)",
    "ll": "Log Likelihood",
    "jsd": "Jensen-Shannon Divergence",
    "embeddings-similar": "Word Embeddings Similarity",
    "embeddings-different": "Word Embeddings Difference",
    "embeddings-raw": "Word Embedding Vectors",
    "embeddings-cluster":"Word Embedding K-Means Clustering"
};

export const metricTypes = {
    "bar": [
        "embeddings-different"
    ],
    "scatter": [
        "tf-idf-scatter", "ll", "embeddings-raw", "embeddings-cluster"
    ],
    "heatmap": [
        "jsd"
    ],
    "dotplot": [
        "embeddings-similar"
    ],
    "multibar": [
        "counts", "proportions", "tf-idf-bar"
    ]
};

export const metricSettings = {
    "counts": {
        column: false,
        values: false,
        words: false,
        wordsOptional: true
    },
    "proportions": {
        column: false,
        values: false,
        words: false,
        wordsOptional: true
    },
    "tf-idf-scatter": {
        column: true,
        values: 2,
        words: false,
        wordsOptional: true
    },
    "tf-idf-bar": {
        column: true,
        values: false,
        words: false,
        wordsOptional: true
    },
    "ll": {
        column: true,
        values: 2,
        words: false,
        wordsOptional: true
    },
    "jsd": {
        column: true,
        values: false,
        words: false,
        wordsOptional: true
    },
    "embeddings-similar": {
        column: false,
        values: false,
        words: 1,
        wordsOptional: false
    },
    "embeddings-different": {
        column: false,
        values: false,
        words: 2,
        wordsOptional: false
    },
    "embeddings-raw": {
        column: false,
        values: false,
        words: 2,
        wordsOptional: true
    },
    "embeddings-cluster": {
        column: false,
        values: false,
        words: 2,
        wordsOptional: true
    }
};

export const posOptionalMetrics = [
    "counts",
    "proportions",
    "tf-idf-scatter",
    "tf-idf-bar",
    "ll",
    "jsd"
];

export const embeddingMetrics = [
    "embeddings-similar",
    "embeddings-different",
    "embeddings-raw",
    "embeddings-cluster"
];

export const posOptions = [
    {
        "label": "Adjective",
        "value": "adj"
    },
    {
        "label": "Adposition",
        "value": "adp"
    },
    {
        "label": "Adverb",
        "value": "adv"
    },
    {
        "label": "Auxiliary Verb",
        "value": "aux"
    },
    {
        "label": "Conjunction",
        "value": "conj"
    },
    {
        "label": "Coordinating Conjunction",
        "value": "cconj"
    },
    {
        "label": "Interjection",
        "value": "intj"
    },
    {
        "label": "Noun",
        "value": "noun"
    },
    {
        "label": "Pronoun",
        "value": "pron"
    },
    {
        "label": "Proper Noun",
        "value": "propn"
    },
    {
        "label": "Subordinating Conjunction",
        "value": "sconj"
    },
    {
        "label": "Verb",
        "value": "verb"
    },
    {
        "label": "Adjective/Noun Pairs",
        "value": "adj-noun"
    },
    {
        "label": "Subject/Verb Pairs",
        "value": "subj-verb"
    }
];

export const clusteringMetrics = [
    "embeddings-cluster"
]