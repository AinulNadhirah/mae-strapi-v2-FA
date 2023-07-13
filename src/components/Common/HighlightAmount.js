import React from "react";
import { Text, Alert } from "react-native";
import { findAll } from "./highwordscore";
import PropTypes from "prop-types";

HighlightAmount.propTypes = {
	autoEscape: PropTypes.bool,
	highlightStyle: Text.propTypes.style,
	searchWords: PropTypes.arrayOf(PropTypes.string).isRequired,
	textToHighlight: PropTypes.string.isRequired,
	sanitize: PropTypes.func,
	style: Text.propTypes.style,
	wholeNumbers: PropTypes.bool
};

// Specifies the default values for props:
HighlightAmount.defaultProps = {
	wholeNumbers: false
};

/**
 * Highlights all occurrences of search terms (searchText) within a string (textToHighlight).
 * This function returns an array of strings and <Text> elements (wrapping highlighted words).
 */

function numberWithCommas(x) {
	x = x.toString();
	var pattern = /(-?\d+)(\d{3})/;
	while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
	return x;
}

function HighlightAmount({
	autoEscape,
	highlightStyle,
	searchWords,
	textToHighlight,
	sanitize,
	style,
	wholeNumbers,
	...props
}) {
	const chunks = findAll({ textToHighlight, searchWords, sanitize, autoEscape });

	return (
		<Text style={style} {...props}>
			{chunks.map((chunk, index) => {
				const text = textToHighlight.substr(chunk.start, chunk.end - chunk.start);
				let resStr = "";
				if (wholeNumbers) {
					resStr = text;
				} else {
					if (text.length === 1) {
						resStr = text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
					} else if (text.length < 3) {
						resStr = text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
					} else {
						if (parseInt(text) > 0) {
							resStr = text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
						} else {
							resStr = "0.00";
						}
					}
				}

				resStr = numberWithCommas(resStr);
				return !chunk.highlight ? (
					"0.00"
				) : (
					<Text key={index} style={highlightStyle}>
						{resStr}
					</Text>
				);
			})}
		</Text>
	);
}
export { HighlightAmount };
