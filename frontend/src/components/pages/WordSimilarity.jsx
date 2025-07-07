import { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";

const WordSimilarity = (props) => {
    // Extract props - handle both direct prop passing and props object
    const dataset = props.dataset || props.currentDataset || null;
    const updateGraph = props.updateGraph || null;  //CREATE GRAPHING
    
    // State definitions
    const [keyword, setKeyword] = useState("");
    const [customWord, setCustomWord] = useState("");
    const [similarWords, setSimilarWords] = useState([]);
    const [plotData, setPlotData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [foundData, setFoundData] = useState(false);
    const [debugInfo, setDebugInfo] = useState("");
    const [embedCols, setEmbedCols] = useState([]);
    const [selectedEmbedCol, setSelectedEmbedCol] = useState("");
    const [errorLog, setErrorLog] = useState([]);
    
    const graph = useRef(null);

    // Helper function to add error logs
    const addErrorLog = (message, data = null) => {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, data };
        console.error(`[${timestamp}] ${message}`, data);
        setErrorLog(prev => [...prev.slice(-4), logEntry]); // Keep last 5 entries
        setDebugInfo(message);
    };

    // Helper function to add info logs
    const addInfoLog = (message, data = null) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`, data);
        setDebugInfo(message);
    };

    // Layout configuration
    const [layout, setLayout] = useState({
        title: `Word Embedding Similarity Analysis For "${dataset?.dataset?.title || 'Dataset'}"`,
        width: 1000,
        height: 500,
        margin: {
            l: 60,
            r: 50,
            b: 100,
            t: 60,
            pad: 4
        },
        xaxis: {
            automargin: true,
            title: {
                text: "Similar Words",
                standoff: 20
            }
        },
        yaxis: {
            automargin: true,
            title: {
                text: "Cosine Similarity",
                standoff: 40
            },
            range: [0, 1]
        },
        showlegend: false
    });

    // Initialize embedding columns with better validation
    useEffect(() => {
        addInfoLog("Initializing component...", { 
            dataset: dataset?.dataset || dataset,
            props: Object.keys(props)
        });
        
        // Handle both dataset.dataset and direct dataset structures
        const datasetInfo = dataset?.dataset || dataset;
        
        if (!datasetInfo) {
            addErrorLog("No dataset provided to component", {
                receivedProps: Object.keys(props),
                datasetProp: dataset
            });
            return;
        }
        addInfoLog("Dataset info:", datasetInfo);

        if (datasetInfo.embeddings && datasetInfo.embeddings_done) {
            if (datasetInfo.embed_col) {
                addInfoLog(`Using dataset embed_col: ${datasetInfo.embed_col}`);
                setEmbedCols([datasetInfo.embed_col]);
                setSelectedEmbedCol(datasetInfo.embed_col);
            } else {
                addInfoLog("No embed_col in dataset, using defaults");
                const defaultCols = ['embeddings', 'embed', 'embedding', 'vector'];
                setEmbedCols(defaultCols);
                setSelectedEmbedCol(defaultCols[0]);
            }
        } else {
            addErrorLog("Dataset embeddings not available or not done", {
                embeddings: datasetInfo.embeddings,
                embeddings_done: datasetInfo.embeddings_done
            });
        }
    }, [dataset]);

    // Validation function
    const validateInputs = () => {
        if (!updateGraph) {
            addErrorLog("updateGraph function not provided");
            return false;
        }

        if (!dataset?.dataset?.table_name && !dataset?.table_name) {
            addErrorLog("No table_name in dataset", {
                datasetStructure: dataset
            });
            return false;
        }

        if (!selectedEmbedCol) {
            addErrorLog("No embedding column selected");
            return false;
        }

        if (!keyword.trim()) {
            addErrorLog("Keyword is empty");
            return false;
        }

        return true;
    };

    // Function to make API request for similarity data
    const fetchSimilarityData = async (targetKeyword) => {
        addInfoLog(`Starting fetchSimilarityData for keyword: "${targetKeyword}"`);

        if (!validateInputs()) {
            return null;
        }

        try {
            // Handle both dataset structures
            const tableName = dataset?.dataset?.table_name || dataset?.table_name;
            
            const params = {
                table_name: tableName,
                group_name: selectedEmbedCol,
                group_list: [],
                metric: "embeddings-similar",
                word_list: [targetKeyword],
                pos_list: [],
                topn: 8,
                num_clusters: 5,
                to_col: "",
                from_col: ""
            };

            addInfoLog("Making API request with params:", params);
            
            // Add timeout and better error handling
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
            );

            const response = await Promise.race([
                updateGraph(params),
                timeoutPromise
            ]);

            addInfoLog("API Response received:", response);

            if (response === null || response === undefined) {
                addErrorLog("API returned null/undefined response");
                return null;
            }

            if (typeof response === 'object' && response.error) {
                addErrorLog("API returned error:", response.error);
                return null;
            }

            return response;
        } catch (error) {
            addErrorLog("Exception in fetchSimilarityData:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return null;
        }
    };

    // Function to make API request for word similarity over time
    const fetchWordSimilarityOverTime = async (word1, word2, groupCol) => {
        addInfoLog(`Fetching similarity over time for "${word1}" vs "${word2}"`);

        if (!validateInputs()) {
            return null;
        }

        try {
            // Handle both dataset structures
            const tableName = dataset?.dataset?.table_name || dataset?.table_name;
            
            const params = {
                table_name: tableName,
                group_name: groupCol,
                group_list: [],
                metric: "embeddings-similarity",
                word_list: [word1, word2],
                pos_list: [],
                topn: 10,
                num_clusters: 5,
                to_col: "",
                from_col: ""
            };

            addInfoLog("Similarity over time params:", params);
            
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
            );

            const response = await Promise.race([
                updateGraph(params),
                timeoutPromise
            ]);

            addInfoLog("Similarity over time response:", response);
            return response;
        } catch (error) {
            addErrorLog("Error in fetchWordSimilarityOverTime:", {
                message: error.message,
                stack: error.stack
            });
            return null;
        }
    };

    // Process similarity data from API response with better validation
    const processSimilarityData = (data) => {
        addInfoLog("Processing similarity data:", data);

        if (!data) {
            addErrorLog("No data to process");
            return { similarWords: [], plotData: [] };
        }

        if (!Array.isArray(data)) {
            addErrorLog("Data is not an array:", typeof data);
            return { similarWords: [], plotData: [] };
        }

        if (data.length === 0) {
            addErrorLog("Data array is empty");
            return { similarWords: [], plotData: [] };
        }

        try {
            // Extract words and similarities with better error handling
            const wordSimilarities = data.map((item, index) => {
                if (!item) {
                    addErrorLog(`Item at index ${index} is null/undefined`);
                    return null;
                }

                const word = item.x || item.label || item.word || `unknown_${index}`;
                const similarity = parseFloat(item.y || item.similarity || 0);

                if (isNaN(similarity)) {
                    addErrorLog(`Invalid similarity value for item at index ${index}:`, item);
                }

                return { word, similarity };
            }).filter(item => item !== null);

            addInfoLog(`Processed ${wordSimilarities.length} word similarities`);

            if (wordSimilarities.length === 0) {
                addErrorLog("No valid word similarities after processing");
                return { similarWords: [], plotData: [] };
            }

            // Sort by similarity (highest first)
            wordSimilarities.sort((a, b) => b.similarity - a.similarity);

            const similarWords = wordSimilarities.slice(0, 8).map(item => item.word);
            
            // Create plot data
            const plotData = [{
                x: wordSimilarities.map(item => item.word),
                y: wordSimilarities.map(item => item.similarity),
                type: 'bar',
                marker: {
                    color: '#3498db',
                    line: {
                        color: '#2980b9',
                        width: 1
                    }
                },
                hovertemplate: '<b>%{x}</b><br>Similarity: %{y:.4f}<extra></extra>'
            }];
            
            addInfoLog(`Successfully processed data: ${similarWords.length} words`);
            return { similarWords, plotData };
        } catch (error) {
            addErrorLog("Error processing similarity data:", error);
            return { similarWords: [], plotData: [] };
        }
    };

    // Handle keyword submission with comprehensive error handling
    const handleSubmit = async () => {
        addInfoLog(`Submit clicked for keyword: "${keyword}"`);
        
        // Reset states
        setLoading(true);
        setSimilarWords([]);
        setFoundData(false);
        setDebugInfo("Starting similarity search...");
        
        try {
            // Validate inputs first
            if (!validateInputs()) {
                setLoading(false);
                return;
            }

            addInfoLog("Validation passed, fetching data...");
            const data = await fetchSimilarityData(keyword.trim());
            
            if (!data) {
                addErrorLog("fetchSimilarityData returned no data");
                setLoading(false);
                return;
            }

            const { similarWords, plotData } = processSimilarityData(data);
            
            if (similarWords.length === 0) {
                addErrorLog(`No similar words found for keyword "${keyword}"`);
                setLoading(false);
                return;
            }
            
            // Success!
            setSimilarWords(similarWords);
            setPlotData(plotData);
            setFoundData(true);
            
            // Update layout title
            setLayout(prev => ({
                ...prev,
                title: `Words Most Similar to "${keyword}"`
            }));
            
            addInfoLog(`Successfully found ${similarWords.length} similar words`);
        } catch (error) {
            addErrorLog("Unexpected error in handleSubmit:", error);
        } finally {
            setLoading(false);
        }
    };

    // Plot word similarity over time with better error handling
    const plotWordOverTime = async (targetWord, keywordInput = keyword) => {
        addInfoLog(`Plotting similarity over time: "${targetWord}" vs "${keywordInput}"`);
        setLoading(true);
        
        try {
            const data = await fetchWordSimilarityOverTime(keywordInput, targetWord, selectedEmbedCol);
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                addErrorLog(`No temporal similarity data found between "${keywordInput}" and "${targetWord}"`);
                setFoundData(false);
                setLoading(false);
                return;
            }

            // Sort by time period if available
            const sortedData = data.sort((a, b) => {
                if (a.x && b.x) {
                    return String(a.x).localeCompare(String(b.x));
                }
                return 0;
            });

            const trace = {
                x: sortedData.map(d => d.x),
                y: sortedData.map(d => parseFloat(d.y) || 0),
                mode: 'lines+markers',
                name: targetWord,
                type: 'scatter',
                line: {
                    width: 3,
                    color: '#3498db'
                },
                marker: {
                    size: 8,
                    color: '#e74c3c'
                },
                hovertemplate: `<b>${targetWord}</b><br>` +
                              `Period: %{x}<br>` +
                              `Similarity: %{y:.4f}<extra></extra>`
            };

            setPlotData([trace]);
            setFoundData(true);
            
            // Update layout title and axis
            setLayout(prev => ({
                ...prev,
                title: `Similarity of "${targetWord}" to "${keywordInput}" over time`,
                xaxis: {
                    ...prev.xaxis,
                    title: { text: "Time Period", standoff: 20 }
                }
            }));

            addInfoLog(`Successfully plotted similarity data for ${targetWord} over time`);
        } catch (error) {
            addErrorLog("Error plotting over time:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle word button clicks
    const handleWordClick = (word) => {
        addInfoLog(`Word clicked: ${word}`);
        plotWordOverTime(word);
    };

    // Handle custom word plotting
    const handleCustomPlot = async (customWordInput = customWord.trim()) => {
        if (!customWordInput) {
            addErrorLog("Custom word is empty");
            return;
        }
        
        addInfoLog(`Custom plot for: ${customWordInput}`);
        plotWordOverTime(customWordInput, keyword);
    };

    // Effect to render plot with error handling
    useEffect(() => {
        if (foundData && plotData && graph.current) {
            try {
                addInfoLog("Rendering plot with Plotly...");
                Plotly.newPlot('similarity-graph', plotData, layout, { 
                    displayModeBar: "hover",
                    responsive: true 
                });
                addInfoLog("Plot rendered successfully");
            } catch (error) {
                addErrorLog("Error rendering plot:", error);
            }
        }
    }, [foundData, plotData, layout]);

    const styles = {
        container: {
            display: 'flex',
            height: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#f5f5f5'
        },
        sidebar: {
            width: '320px',
            backgroundColor: 'white',
            padding: '24px',
            overflowY: 'auto',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        },
        main: {
            flex: 1,
            padding: '24px',
            backgroundColor: '#fafafa'
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1976d2',
            margin: '0 0 24px 0',
            borderBottom: '2px solid #1976d2',
            paddingBottom: '8px'
        },
        subtitle: {
            fontSize: '18px',
            fontWeight: '500',
            color: '#333',
            margin: '24px 0 12px 0'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '8px',
            boxSizing: 'border-box',
            transition: 'border-color 0.3s ease'
        },
        select: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            boxSizing: 'border-box',
            backgroundColor: 'white'
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            marginBottom: '16px'
        },
        buttonDisabled: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#cccccc',
            color: '#666666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '16px'
        },
        buttonSecondary: {
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#1976d2',
            border: '2px solid #1976d2',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease'
        },
        wordGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '24px'
        },
        wordButton: {
            padding: '8px 12px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        plotContainer: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            height: 'calc(100% - 40px)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        },
        emptyState: {
            fontSize: '18px',
            color: '#666',
            textAlign: 'center'
        },
        debugInfo: {
            fontSize: '12px',
            color: '#666',
            marginTop: '8px',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-word',
            maxHeight: '100px',
            overflowY: 'auto'
        },
        errorLog: {
            fontSize: '11px',
            color: '#d32f2f',
            marginTop: '8px',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-word',
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #ffcdd2'
        }
    };

    const isButtonDisabled = loading || !selectedEmbedCol || (!dataset?.dataset?.table_name && !dataset?.table_name);

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <h3 style={styles.title}>Controls</h3>

                {/* Error Log */}
                {errorLog.length > 0 && (
                    <div style={styles.errorLog}>
                        <strong>Error Log:</strong><br/>
                        {errorLog.slice(-3).map((log, index) => (
                            <div key={index}>
                                [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                                {log.data && <pre>{JSON.stringify(log.data, null, 2)}</pre>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Debug Info */}
                {debugInfo && (
                    <div style={styles.debugInfo}>
                        <strong>Status:</strong> {debugInfo}
                    </div>
                )}

                {/* Dataset Info */}
                {(dataset?.dataset || dataset) && (
                    <div style={styles.debugInfo}>
                        <strong>Dataset Info:</strong><br/>
                        Title: {dataset?.dataset?.title || dataset?.title || 'N/A'}<br/>
                        Table: {dataset?.dataset?.table_name || dataset?.table_name || 'N/A'}<br/>
                        Embeddings: {(dataset?.dataset?.embeddings || dataset?.embeddings) ? 'Yes' : 'No'}<br/>
                        Embeddings Done: {(dataset?.dataset?.embeddings_done || dataset?.embeddings_done) ? 'Yes' : 'No'}<br/>
                        updateGraph Function: {updateGraph ? 'Available' : 'Missing'}<br/>
                        Props Keys: {Object.keys(props).join(', ')}<br/>
                        {selectedEmbedCol && `Embed Column: ${selectedEmbedCol}`}
                    </div>
                )}

                {/* Embedding Column Selection */}
                {embedCols.length > 1 && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                            Embedding Column:
                        </label>
                        <select
                            style={styles.select}
                            value={selectedEmbedCol}
                            onChange={(e) => setSelectedEmbedCol(e.target.value)}
                        >
                            {embedCols.map(col => (
                                <option key={col} value={col}>
                                    {col.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Keyword Input */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Keyword:
                    </label>
                    <input
                        style={styles.input}
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isButtonDisabled && handleSubmit()}
                    />
                    <button
                        style={isButtonDisabled ? styles.buttonDisabled : styles.button}
                        onClick={handleSubmit}
                        disabled={isButtonDisabled}
                        onMouseOver={(e) => !isButtonDisabled && (e.target.style.backgroundColor = '#1565c0')}
                        onMouseOut={(e) => !isButtonDisabled && (e.target.style.backgroundColor = '#1976d2')}
                    >
                        {loading ? 'Processing...' : 'Find Similar Words'}
                    </button>
                    {isButtonDisabled && (
                        <div style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px' }}>
                            {!updateGraph && "updateGraph function missing; "}
                            {!selectedEmbedCol && "No embedding column selected; "}
                            {(!dataset?.dataset?.table_name && !dataset?.table_name) && "No table name available; "}
                        </div>
                    )}
                </div>

                {/* Similar Words */}
                {similarWords.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={styles.subtitle}>Most Similar Words</h4>
                        <div style={styles.wordGrid}>
                            {similarWords.map((word, index) => (
                                <button
                                    key={index}
                                    style={styles.wordButton}
                                    onClick={() => handleWordClick(word)}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Word Input */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Compare custom word to "{keyword}":
                    </label>
                    <input
                        style={styles.input}
                        type="text"
                        value={customWord}
                        onChange={(e) => setCustomWord(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomPlot()}
                    />
                    <button
                        style={styles.buttonSecondary}
                        onClick={() => handleCustomPlot()}
                        disabled={!customWord.trim() || loading}
                        onMouseOver={(e) => !customWord.trim() || loading || (e.target.style.backgroundColor = '#1976d2', e.target.style.color = 'white')}
                        onMouseOut={(e) => !customWord.trim() || loading || (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#1976d2')}
                    >
                        Plot Similarity Over Time
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.main}>
                <div style={styles.plotContainer}>
                    {foundData ? (
                        <div 
                            id="similarity-graph" 
                            ref={graph}
                            style={{ width: '100%', height: '100%' }}
                        />
                    ) : (
                        <div style={styles.emptyState}>
                            {loading ? 'Loading...' : 'Enter a keyword to start analyzing word similarities'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WordSimilarity;