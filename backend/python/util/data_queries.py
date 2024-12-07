import util.s3 as s3

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
def basic_selection(table_name: str, column: str | None, values: list[str], word_list: list[str], pos_list: list[str] = [], token: str | None = None):
    dataset_table = f"datasets_{ table_name }"
    tokens_table = f"tokens_{ table_name }"
    dataset_query = None
    token_filter = []
    adj_noun_query = None
    subj_verb_query = None
    
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
        SELECT { f'dataset."{ column }" AS "group",' if dataset_query is not None else "" } tokens.word AS word, SUM(tokens.count) AS "count"
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
    
    df = s3.download(query, token)
    
    return df

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
    
    # Get record/group count for each word
    records = {}
    df = s3.download(query, token).collect()
    for row in df.iter_rows(named = True):
        records[row["word"]] = row["count"]
        
    return records

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
def total_word_count(table_name: str, token: str | None = None) -> int:
    query = f'''
        SELECT SUM(count) AS "count"
        FROM democracy_viewer_athena.tokens_{ table_name }
    '''
    
    # Get distinct values in column
    cnt = (
        s3.download(query, token)
            .collect()
            .get_column("count")
            .to_list()[0]
    )
        
    return int(cnt)

# Get the count of the given words in a corpus
def word_counts(table_name: str, word_list: list[str], pos_list: list[str] = [], token: str | None = None) -> dict[str, int]:
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
        SELECT word, SUM(count) AS "count"
        FROM democracy_viewer_athena.{ tokens_table }
        { "WHERE {}".format(" AND ".join(token_filter)) if len(token_filter) > 0 else "" }
        { f"UNION { adj_noun_query }" if adj_noun_query is not None else "" }
        { f"UNION { subj_verb_query }" if subj_verb_query is not None else "" }
        GROUP BY word
    '''
    
    # Convert to dict for easy access
    records = {}
    df = s3.download(query, token).collect()
    for row in df.iter_rows(named = True):
        records[row["word"]] = row["count"]
        
    return records

# Get the word count of group values
def group_counts(table_name: str, column: str, values: list[str], token: str | None = None) -> dict[str, int]:
    dataset_table = f"datasets_{ table_name }"
    tokens_table = f"tokens_{ table_name }"
    val_filter = None
        
    if len(values) > 0:
        val_filter = f'''
            WHERE "{ column }" IN ({ ", ".join([ f"'{ val }'" for val in values ])})
        '''
        
    query = f'''
        SELECT dataset."{ column }" as "group", SUM(tokens.count) AS "count"
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
        
    records = {}
    df = s3.download(query, token).collect()
    for row in df.iter_rows(named = True):
        records[row["group"]] = row["count"]
        
    return records