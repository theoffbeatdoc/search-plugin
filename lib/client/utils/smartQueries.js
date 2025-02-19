import lunr from "lunr";
import { smartTerms } from "./smartTerms";
/**
 * Get all possible queries for a list of tokens consists of words mixed English and Chinese,
 * by a Chinese words dictionary.
 *
 * @returns A smart query list.
 */
export function smartQueries(tokens, queryOptions = { removeDefaultStopWordFilter: false }) {
    const { removeDefaultStopWordFilter } = queryOptions;
    const terms = smartTerms(tokens);
    if (terms.length === 0) {
        // There are no matched terms.
        // All tokens are considered required and with wildcard.
        return [
            {
                tokens,
                term: tokens.map((value) => ({
                    value,
                    presence: lunr.Query.presence.REQUIRED,
                    wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
                })),
            },
        ];
    }
    // The last token of a term maybe incomplete while user is typing.
    for (const term of terms) {
        term[term.length - 1].maybeTyping = true;
    }
    // Try to append terms without stop words,
    // since they are removed in the index.
    const stopWordPipelines = [];
    if (!removeDefaultStopWordFilter) {
        stopWordPipelines.unshift(lunr.stopWordFilter);
    }
    let refinedTerms;
    if (stopWordPipelines.length > 0) {
        const pipe = (term) => stopWordPipelines.reduce((term, p) => term.filter((item) => p(item.value)), term);
        refinedTerms = [];
        const newTerms = [];
        for (const term of terms) {
            const filteredTerm = pipe(term);
            refinedTerms.push(filteredTerm);
            // Add extra terms only if some stop words are removed,
            // and some non-stop-words exist too.
            if (filteredTerm.length < term.length && filteredTerm.length > 0) {
                newTerms.push(filteredTerm);
            }
        }
        terms.push(...newTerms);
    }
    else {
        refinedTerms = terms.slice();
    }
    // Also try to add extra terms which miss one of the searched tokens,
    // when the term contains 3 or more tokens,
    // to improve the search precision.
    const extraTerms = [];
    for (const term of refinedTerms) {
        if (term.length > 2) {
            for (let i = term.length - 1; i >= 0; i -= 1) {
                extraTerms.push(term.slice(0, i).concat(term.slice(i + 1)));
            }
        }
    }
    return getQueriesMaybeTyping(terms).concat(getQueriesMaybeTyping(extraTerms));
}
function getQueriesMaybeTyping(terms) {
    return termsToQueries(terms).concat(termsToQueries(
    // Ignore terms whose last token already has a trailing wildcard,
    // or the last token is not `maybeTyping`.
    terms.filter((term) => {
        const token = term[term.length - 1];
        return !token.trailing && token.maybeTyping;
    }), true));
}
function termsToQueries(terms, maybeTyping) {
    return terms.map((term) => ({
        tokens: term.map((item) => item.value),
        term: term.map((item) => ({
            value: item.value,
            presence: lunr.Query.presence.REQUIRED,
            // The last token of a term maybe incomplete while user is typing.
            // So append more queries with trailing wildcard added.
            wildcard: (maybeTyping ? item.trailing || item.maybeTyping : item.trailing)
                ? lunr.Query.wildcard.TRAILING
                : lunr.Query.wildcard.NONE,
        })),
    }));
}
