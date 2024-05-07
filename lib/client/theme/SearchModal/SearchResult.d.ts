import * as React from "react";
import { SearchResult as ISearchResult } from "../../../types";
interface SuggestionTemplateProps {
    isSelected: boolean;
    isHovered: boolean;
    searchResult: ISearchResult;
    searchSource: string;
    setSelected: (searchResult: ISearchResult | undefined) => void;
    setHovered: (searchResult: ISearchResult | undefined) => void;
    onClick: () => void;
}
declare const SearchResult: React.FC<SuggestionTemplateProps>;
export default SearchResult;
