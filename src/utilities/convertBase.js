/*
 * Utility class to Convert Base
 */

function ConvertBase(num) {
	return {
		from: function(baseFrom) {
			return {
				to: function(baseTo) {
					return parseInt(num, baseFrom).toString(baseTo);
				}
			};
		}
	};
}

// binary to decimal
export const bin2dec = num => {
	return ConvertBase(num)
		.from(2)
		.to(10);
};

// binary to hexadecimal
export const bin2hex = num => {
	return ConvertBase(num)
		.from(2)
		.to(16);
};

// decimal to binary
export const dec2bin = num => {
	return ConvertBase(num)
		.from(10)
		.to(2);
};

// decimal to hexadecimal
export const dec2hex = num => {
	return ConvertBase(num)
		.from(10)
		.to(16);
};

export const hex2dec = num => {
	return ConvertBase(num)
		.from(16)
		.to(10);
};

// hexadecimal to binary
export const hex2bin = num => {
	return ConvertBase(num)
		.from(16)
		.to(2);
};
