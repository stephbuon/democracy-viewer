export const metricNames = {
    "counts": "Word Counts",
    "proportions": "Proportions",
    "tf-idf-scatter": "TF-IDF (Scatter Plot)",
    "tf-idf-bar": "TF-IDF (Bar Plot)",
    "ll": "Log Likelihood",
    "jsd": "Jensen-Shannon Divergence",
    "embeddings-similar": "Word Embeddings Similarity",
    "embeddings-different": "Word Embeddings Difference",
    "embeddings-raw": "Word Embedding Vectors"
};

export const metricTypes = {
    "bar": [
        "counts", "proportions", "embeddings-different"
    ],
    "scatter": [
        "tf-idf-scatter", "ll", "embeddings-raw"
    ],
    "heatmap": [
        "jsd"
    ],
    "dotplot": [
        "embeddings-similar"
    ],
    "multibar": [
        "tf-idf-bar"
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
    "tf-idf-scatter": {
        column: true,
        values: 2,
        words: false
    },
    "tf-idf-bar": {
        column: true,
        values: false,
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
        words: 2
    },
    "embeddings-raw": {
        column: false,
        values: 1,
        words: false
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

export const posMetrics = [
    
];

export const embeddingMetrics = [
    "embeddings-similar",
    "embeddings-different",
    "embeddings-raw"
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