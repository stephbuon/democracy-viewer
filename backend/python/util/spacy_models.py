from spacy import load as load_spacy, Language

MODEL_SIZE = "sm"

def load_spacy_model(language: str = "English") -> Language:
    language = language.lower()
    if language == "chinese":
        return load_spacy("zh_core_web_{}".format(MODEL_SIZE))
    elif language == "english":
        return load_spacy("en_core_web_{}".format(MODEL_SIZE))
    elif language == "french":
        return load_spacy("fr_core_news_{}".format(MODEL_SIZE))
    elif language == "german":
        return load_spacy("de_core_news_{}".format(MODEL_SIZE))
    elif language == "greek":
        return load_spacy("el_core_news_{}".format(MODEL_SIZE))
    elif language == "italian":
        return load_spacy("it_core_news_{}".format(MODEL_SIZE))
    elif language == "latin":
        return load_spacy("la_core_web_{}".format(MODEL_SIZE))
    elif language == "portuguese":
        return load_spacy("pt_core_news_{}".format(MODEL_SIZE))
    elif language == "russian":
        return load_spacy("ru_core_news_{}".format(MODEL_SIZE))
    elif language == "spanish":
        return load_spacy("es_core_news_{}".format(MODEL_SIZE))
    else:
        raise Exception("'{}' is not a supported langauge".format(language))