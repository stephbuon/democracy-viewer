import util.s3 as s3

# Collect the data for a query
def run_query(query: str, token: str | None = None):
    return s3.download(query, token)

# Get the unique values in a given column
def get_column_values(table_name: str, column: str, count: int | None = None, token: str | None = None):
    query = f'''
        SELECT "{ column }"
        FROM democracy_viewer_athena.datasets_{ table_name }
        GROUP BY "{ column }"
        ORDER BY COUNT(*) DESC
        { "" if count is None else f"LIMIT { count }" }
    '''
    
    values = (
        s3.download(query, token)
            .collect()
            .get_column(column)
            .to_list()
    )
    
    return values

# Select records by group and word lists
def basic_selection(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = []):
    dataset_table = f"datasets_{ table_name }"
    tokens_table = f"tokens_{ table_name }"
    dataset_query = None
    token_filter = []
    adj_noun_query = None
    subj_verb_query = None
    alt_group_select = f'''
        '_all_groups_' AS "group"
    '''
    
    if column is not None and column != "":
        val_filter = None
        if len(values) > 0:
            val_filter = f'''
                WHERE "{ column }" IN ({ ", ".join([ f"'{ val }'" for val in values ])})
            '''
            
        dataset_query = f'''
            JOIN (
                SELECT record_id, "{ column }"
                FROM democracy_viewer_athena.{ dataset_table }
                { val_filter if val_filter is not None else "" }
            ) AS dataset
            ON tokens.record_id = dataset.record_id
        '''

    if len(word_list) > 0:
        token_filter.append(f'''
            word IN ({ ", ".join([ f"'{ word }'" for word in word_list ]) })
        ''')
    
    if len(pos_list) > 0:
        token_filter.append(f'''
            pos IN ({ ", ".join([ f"'{ pos }'" for pos in pos_list ]) })
        ''')
    
    if "adj-noun" in pos_list:
        adj_noun_query = adj_noun_pairs(tokens_table, word_list)
        
    if "subj-verb" in pos_list:
        subj_verb_query = subj_verb_pairs(tokens_table, word_list)
        
    query = f'''
        SELECT { f'dataset."{ column }" AS "group"' if dataset_query is not None else alt_group_select }, tokens.word AS word, SUM(tokens.count) AS "count"
        FROM (
            SELECT record_id, word, "count"
            FROM democracy_viewer_athena.{ tokens_table }
            { "WHERE {}".format(" AND ".join(token_filter)) if len(token_filter) > 0 else "" }
            { f"UNION { adj_noun_query }" if adj_noun_query is not None else "" }
            { f"UNION { subj_verb_query }" if subj_verb_query is not None else "" }
        ) AS tokens
        { dataset_query if dataset_query is not None else "" }
        GROUP BY tokens.word{ f', dataset."{ column }"' if dataset_query is not None else "" }
    '''
    
    return query

# POS collocates
### Adjective/Noun
def adj_noun_pairs(tokens_table: str, word_list: list[str]):
    word_query = None
    
    if len(word_list) > 0:
        word_filter = ", ".join([ f"'{ word }'" for word in word_list ])
        word_query = f'''
            WHERE adjs.word IN ({ word_filter }) OR nouns.head IN ({ word_filter })
        '''
    
    query = f'''
        SELECT
            adjs.record_id AS record_id,
            CONCAT(adjs.word, ' ', nouns.head) AS word,
            GREATEST(adjs.count, nouns.count) AS "count"
        FROM (
            SELECT *
            FROM democracy_viewer_athena.{ tokens_table }
            WHERE pos = 'adj'
        ) AS adjs
        JOIN (
            SELECT *
            FROM democracy_viewer_athena.{ tokens_table }
            WHERE pos = 'noun'
        ) AS nouns
        ON adjs.record_id = nouns.record_id
            AND adjs.col = nouns.col
            AND adjs.head = nouns.word
        { word_query if word_query is not None else "" }
    '''
    
    return query
       
### Subject/Verb
def subj_verb_pairs(tokens_table: str, word_list: list[str]):
    word_query = None
    
    if len(word_list) > 0:
        word_filter = ", ".join([ f"'{ word }'" for word in word_list ])
        word_query = f'''
            WHERE subjs.word IN ({ word_filter }) OR verbs.head IN ({ word_filter })
        '''
    
    query = f'''
        SELECT
            subjs.record_id AS record_id,
            CONCAT(subjs.word, ' ', verbs.head) AS word,
            GREATEST(subjs.count, verbs.count) AS "count"
        FROM (
            SELECT *
            FROM democracy_viewer_athena.{ tokens_table }
            WHERE dep IN ('nsubj', 'nsubjpass')
            AND pos IN ('noun', 'propn', 'pron')
        ) AS subjs
        JOIN (
            SELECT *
            FROM democracy_viewer_athena.{ tokens_table }
            WHERE pos = 'verb'
        ) AS verbs
        ON subjs.record_id = verbs.record_id
            AND subjs.col = verbs.col
            AND (subjs.head = verbs.word OR subjs.word = verbs.head)
        { word_query if word_query is not None else "" }
    '''
    
    return query

# Get number of group values that include words
def group_count_by_words(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str], token: str | None = None) -> dict[str, int]:
    dataset_table = f"datasets_{ table_name }"
    tokens_table = f"tokens_{ table_name }"
    token_filter = []
    adj_noun_query = None
    subj_verb_query = None
    val_filter = None
    
    if len(values) > 0:
        val_filter = f'''
            WHERE "{ column }" IN ({ ", ".join([ f"'{ val }'" for val in values ])})
        '''

    if len(word_list) > 0:
        token_filter.append(f'''
            word IN ({ ", ".join([ f"'{ word }'" for word in word_list ]) })
        ''')
    
    if len(pos_list) > 0:
        token_filter.append(f'''
            pos IN ({ ", ".join([ f"'{ pos }'" for pos in pos_list if pos not in ["adj-noun", "subj-verb"] ]) })
        ''')
    
    if "adj-noun" in pos_list:
        adj_noun_query = adj_noun_pairs(tokens_table, word_list)
        
    if "subj-verb" in pos_list:
        subj_verb_query = subj_verb_pairs(tokens_table, word_list)
        
    query = f'''
        SELECT word, COUNT(DISTINCT dataset."{ column }") AS "count"
        FROM (
            SELECT record_id, word
            FROM democracy_viewer_athena.{ tokens_table }
            { "WHERE {}".format(" AND ".join(token_filter)) if len(token_filter) > 0 else "" }
            { f"UNION { adj_noun_query }" if adj_noun_query is not None else "" }
            { f"UNION { subj_verb_query }" if subj_verb_query is not None else "" }
        ) AS tokens
        JOIN (
            SELECT record_id, "{ column }"
            FROM democracy_viewer_athena.{ dataset_table }
            { val_filter if val_filter is not None else "" }
        ) AS dataset
        ON tokens.record_id = dataset.record_id
        GROUP BY word
    '''
    
    return query

# Get the total number of distinct group values
def group_count(table_name: str, column: str, token: str | None = None):
    query = f'''
        SELECT COUNT(DISTINCT "{ column }") AS "{ column }"
        FROM democracy_viewer_athena.datasets_{ table_name }
    '''
    
    # Get distinct values in column
    n_unique = (
        s3.download(query, token)
            .collect()
            .get_column(column)
            .to_list()[0]
    )
        
    return int(n_unique)

# Get the total word count in a corpus
def total_word_count(table_name: str):
    query = f'''
        SELECT SUM(count) AS total_count
        FROM democracy_viewer_athena.tokens_{ table_name }
    '''
    
    return query

# Get the count of the given words in a corpus
def word_counts(table_name: str, word_list: list[str], pos_list: list[str] = []):
    tokens_table = f"tokens_{ table_name }"
    token_filter = []
    adj_noun_query = None
    subj_verb_query = None

    if len(word_list) > 0:
        token_filter.append(f'''
            word IN ({ ", ".join([ f"'{ word }'" for word in word_list ]) })
        ''')
    
    if len(pos_list) > 0:
        token_filter.append(f'''
            pos IN ({ ", ".join([ f"'{ pos }'" for pos in pos_list if pos not in ["adj-noun", "subj-verb"] ]) })
        ''')
    
    if "adj-noun" in pos_list:
        adj_noun_query = adj_noun_pairs(tokens_table, word_list)
        
    if "subj-verb" in pos_list:
        subj_verb_query = subj_verb_pairs(tokens_table, word_list)
        
    query = f'''
        SELECT word, SUM(count) AS word_count
        FROM democracy_viewer_athena.{ tokens_table }
        { "WHERE {}".format(" AND ".join(token_filter)) if len(token_filter) > 0 else "" }
        { f"UNION { adj_noun_query }" if adj_noun_query is not None else "" }
        { f"UNION { subj_verb_query }" if subj_verb_query is not None else "" }
        GROUP BY word
    '''
    
    return query

# Get the word count of group values
def group_counts(table_name: str, column: str, values: list[str]):
    dataset_table = f"datasets_{ table_name }"
    tokens_table = f"tokens_{ table_name }"
    val_filter = None
        
    if len(values) > 0:
        val_filter = f'''
            WHERE "{ column }" IN ({ ", ".join([ f"'{ val }'" for val in values ])})
        '''
        
    query = f'''
        SELECT dataset."{ column }" as "group", SUM(tokens.count) AS group_count
        FROM (
            SELECT record_id, "{ column }"
            FROM democracy_viewer_athena.{ dataset_table }
            { val_filter if val_filter is not None else "" }
        ) AS dataset
        JOIN (
            SELECT record_id, "count"
            FROM democracy_viewer_athena.{ tokens_table }
        ) AS tokens
        ON dataset.record_id = tokens.record_id
        GROUP BY dataset."{ column }"
    '''
        
    return query

def metric_word_counts(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5):
    basic_query = basic_selection(table_name, column, values, word_list, pos_list)
    
    full_query = f'''
        WITH ranked_words AS (
            SELECT "group",
                "word",
                SUM("count") AS "count",
                ROW_NUMBER() OVER (
                    PARTITION BY "group"
                    ORDER BY SUM("count") DESC
                ) AS word_rank
            FROM (
                { basic_query }
            )
            GROUP BY "group", "word"
        )
        SELECT "group", "word", "count", word_rank
        FROM ranked_words
        WHERE word_rank <= { topn }
    '''
    
    return full_query

def metric_proportions(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = [], topn: int = 5):
    basic_query = basic_selection(table_name, column, values, [], pos_list)
    
    word_filter = None
    if len(word_list) > 0:
        word_filter = f'''
            WHERE "word" IN ({ ", ".join([ f"'{ word }'" for word in word_list ]) })
        '''
    
    full_query = f'''
        WITH proportion_data AS (
            SELECT "group",
                "word",
                SUM("count") AS "count",
                SUM(SUM("count")) OVER (PARTITION BY "group") AS total_count
            FROM (
                { basic_query }
            )
            GROUP BY "word", "group"
        ), ranked_words AS (
            SELECT "group",
                "word",
                (1. * "count" / total_count) AS proportion,
                ROW_NUMBER() OVER (
                    PARTITION BY "group"
                    ORDER BY (1. * "count" / total_count) DESC
                ) AS word_rank
            FROM proportion_data
            { word_filter if word_filter is not None else "" }
            GROUP BY "group", "word", "count", total_count
        )
        SELECT "group", "word", proportion, word_rank
        FROM ranked_words
        WHERE word_rank <= { topn }
    '''
    
    return full_query

def metric_log_likelihood(table_name: str, column: str, values: list[str], word_list: list[str], pos_list: list[str] = []):
    query = f'''
        WITH total_word_count AS (
            { total_word_count(table_name) }
        ), word_counts AS (
            { word_counts(table_name, word_list, pos_list) }
        ), group_counts AS (
            { group_counts(table_name, column, values) }
        ), basic_query AS (
            { basic_selection(table_name, column, values, word_list, pos_list) }
        )
        SELECT *
        FROM 
        (
            SELECT
                word,
                "group",
                CASE
                    WHEN a > 0 AND b > 0 THEN (2 * a * LN(a / e1) + 2 * b * LN(b / e2))
                    WHEN a > 0 AND b = 0 THEN (2 * a * LN(a / e1))
                    WHEN a = 0 AND b > 0 THEN (2 * b * LN(b / e2))
                    ELSE 0
                END AS ll
            FROM (
                SELECT
                    word,
                    "group",
                    a,
                    b,
                    (1. * (a + c) * (a + b) / total_count) AS e1,
                    (1. * (b + d) * (a + b) / total_count) AS e2
                FROM (
                    SELECT 
                        basic_query.word,
                        basic_query."group",
                        (basic_query."count") AS a,
                        (word_counts.word_count - basic_query."count") AS b,
                        (group_counts.group_count - basic_query."count") AS c,
                        (total_word_count.total_count - basic_query."count" - (word_counts.word_count - basic_query."count") - (group_counts.group_count - basic_query."count")) AS d,
                        total_count
                    FROM basic_query
                    JOIN word_counts
                    ON basic_query."word" = word_counts."word"
                    JOIN group_counts
                    ON basic_query."group" = group_counts."group"
                    CROSS JOIN total_word_count
                )
            )
        )
    '''
    
    return query