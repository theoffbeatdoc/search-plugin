import { tokenize } from "./tokenize";
import { smartQueries } from "./smartQueries";
import { sortSearchResults } from "./sortSearchResults";
import { processTreeStatusOfSearchResults } from "./processTreeStatusOfSearchResults";
export function SearchSourceFactory(props) {
    const { wrappedIndexes, removeDefaultStopWordFilter, resultsLimit, onResults, } = props;
    return function searchSource(input, callback) {
        // allow for the value to exist in a string
        const rawTokens = tokenize(`*${input}`);
        if (rawTokens.length === 0) {
            callback([]);
            onResults(input, []);
            return;
        }
        const queries = smartQueries(rawTokens, {
            removeDefaultStopWordFilter,
        });
        const results = [];
        search: for (const { term, tokens } of queries) {
            for (const { documents, index, type } of wrappedIndexes) {
                results.push(...index
                    .query((query) => {
                    for (const item of term) {
                        query.term(item.value, {
                            wildcard: item.wildcard,
                            presence: item.presence,
                        });
                    }
                })
                    .slice(0, resultsLimit)
                    // Remove duplicated results.
                    .filter((result) => !results.some((item) => item.document.i.toString() === result.ref))
                    .slice(0, resultsLimit - results.length)
                    .map((result) => {
                    const document = documents.find((doc) => doc.i.toString() === result.ref);
                    return {
                        document,
                        type,
                        page: type !== 0 &&
                            wrappedIndexes[0].documents.find((doc) => doc.i === document.p),
                        metadata: result.matchData.metadata,
                        tokens,
                        score: result.score,
                    };
                }));
                if (results.length >= resultsLimit) {
                    break search;
                }
            }
        }
        sortSearchResults(results);
        processTreeStatusOfSearchResults(results);
        callback(results);
        onResults(input, results);
    };
}
