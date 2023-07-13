/**********
 Desc - tripledes Class for common functions
 Module - ChipAndPin Module
 **********/

// --- global chiptdes object ----
var chiptdes = {};
exports.chiptdes = chiptdes;
// special value stored in x[0] to indicate a problem
chiptdes.ERROR_VAL = -9876;

// initial permutation (split into left/right halves )
// since DES numbers bits starting at 1, we will ignore x[0]
chiptdes.IP_perm = new Array(
	-1,
	58,
	50,
	42,
	34,
	26,
	18,
	10,
	2,
	60,
	52,
	44,
	36,
	28,
	20,
	12,
	4,
	62,
	54,
	46,
	38,
	30,
	22,
	14,
	6,
	64,
	56,
	48,
	40,
	32,
	24,
	16,
	8,
	57,
	49,
	41,
	33,
	25,
	17,
	9,
	1,
	59,
	51,
	43,
	35,
	27,
	19,
	11,
	3,
	61,
	53,
	45,
	37,
	29,
	21,
	13,
	5,
	63,
	55,
	47,
	39,
	31,
	23,
	15,
	7
);

// final permutation (inverse initial permutation)
chiptdes.FP_perm = new Array(
	-1,
	40,
	8,
	48,
	16,
	56,
	24,
	64,
	32,
	39,
	7,
	47,
	15,
	55,
	23,
	63,
	31,
	38,
	6,
	46,
	14,
	54,
	22,
	62,
	30,
	37,
	5,
	45,
	13,
	53,
	21,
	61,
	29,
	36,
	4,
	44,
	12,
	52,
	20,
	60,
	28,
	35,
	3,
	43,
	11,
	51,
	19,
	59,
	27,
	34,
	2,
	42,
	10,
	50,
	18,
	58,
	26,
	33,
	1,
	41,
	9,
	49,
	17,
	57,
	25
);

// per-round expansion
chiptdes.E_perm = new Array(
	-1,
	32,
	1,
	2,
	3,
	4,
	5,
	4,
	5,
	6,
	7,
	8,
	9,
	8,
	9,
	10,
	11,
	12,
	13,
	12,
	13,
	14,
	15,
	16,
	17,
	16,
	17,
	18,
	19,
	20,
	21,
	20,
	21,
	22,
	23,
	24,
	25,
	24,
	25,
	26,
	27,
	28,
	29,
	28,
	29,
	30,
	31,
	32,
	1
);

// per-round permutation
chiptdes.P_perm = new Array(
	-1,
	16,
	7,
	20,
	21,
	29,
	12,
	28,
	17,
	1,
	15,
	23,
	26,
	5,
	18,
	31,
	10,
	2,
	8,
	24,
	14,
	32,
	27,
	3,
	9,
	19,
	13,
	30,
	6,
	22,
	11,
	4,
	25
);

// note we do use element 0 in the S-Boxes
chiptdes.S1 = new Array(
	14,
	4,
	13,
	1,
	2,
	15,
	11,
	8,
	3,
	10,
	6,
	12,
	5,
	9,
	0,
	7,
	0,
	15,
	7,
	4,
	14,
	2,
	13,
	1,
	10,
	6,
	12,
	11,
	9,
	5,
	3,
	8,
	4,
	1,
	14,
	8,
	13,
	6,
	2,
	11,
	15,
	12,
	9,
	7,
	3,
	10,
	5,
	0,
	15,
	12,
	8,
	2,
	4,
	9,
	1,
	7,
	5,
	11,
	3,
	14,
	10,
	0,
	6,
	13
);
chiptdes.S2 = new Array(
	15,
	1,
	8,
	14,
	6,
	11,
	3,
	4,
	9,
	7,
	2,
	13,
	12,
	0,
	5,
	10,
	3,
	13,
	4,
	7,
	15,
	2,
	8,
	14,
	12,
	0,
	1,
	10,
	6,
	9,
	11,
	5,
	0,
	14,
	7,
	11,
	10,
	4,
	13,
	1,
	5,
	8,
	12,
	6,
	9,
	3,
	2,
	15,
	13,
	8,
	10,
	1,
	3,
	15,
	4,
	2,
	11,
	6,
	7,
	12,
	0,
	5,
	14,
	9
);
chiptdes.S3 = new Array(
	10,
	0,
	9,
	14,
	6,
	3,
	15,
	5,
	1,
	13,
	12,
	7,
	11,
	4,
	2,
	8,
	13,
	7,
	0,
	9,
	3,
	4,
	6,
	10,
	2,
	8,
	5,
	14,
	12,
	11,
	15,
	1,
	13,
	6,
	4,
	9,
	8,
	15,
	3,
	0,
	11,
	1,
	2,
	12,
	5,
	10,
	14,
	7,
	1,
	10,
	13,
	0,
	6,
	9,
	8,
	7,
	4,
	15,
	14,
	3,
	11,
	5,
	2,
	12
);
chiptdes.S4 = new Array(
	7,
	13,
	14,
	3,
	0,
	6,
	9,
	10,
	1,
	2,
	8,
	5,
	11,
	12,
	4,
	15,
	13,
	8,
	11,
	5,
	6,
	15,
	0,
	3,
	4,
	7,
	2,
	12,
	1,
	10,
	14,
	9,
	10,
	6,
	9,
	0,
	12,
	11,
	7,
	13,
	15,
	1,
	3,
	14,
	5,
	2,
	8,
	4,
	3,
	15,
	0,
	6,
	10,
	1,
	13,
	8,
	9,
	4,
	5,
	11,
	12,
	7,
	2,
	14
);
chiptdes.S5 = new Array(
	2,
	12,
	4,
	1,
	7,
	10,
	11,
	6,
	8,
	5,
	3,
	15,
	13,
	0,
	14,
	9,
	14,
	11,
	2,
	12,
	4,
	7,
	13,
	1,
	5,
	0,
	15,
	10,
	3,
	9,
	8,
	6,
	4,
	2,
	1,
	11,
	10,
	13,
	7,
	8,
	15,
	9,
	12,
	5,
	6,
	3,
	0,
	14,
	11,
	8,
	12,
	7,
	1,
	14,
	2,
	13,
	6,
	15,
	0,
	9,
	10,
	4,
	5,
	3
);
chiptdes.S6 = new Array(
	12,
	1,
	10,
	15,
	9,
	2,
	6,
	8,
	0,
	13,
	3,
	4,
	14,
	7,
	5,
	11,
	10,
	15,
	4,
	2,
	7,
	12,
	9,
	5,
	6,
	1,
	13,
	14,
	0,
	11,
	3,
	8,
	9,
	14,
	15,
	5,
	2,
	8,
	12,
	3,
	7,
	0,
	4,
	10,
	1,
	13,
	11,
	6,
	4,
	3,
	2,
	12,
	9,
	5,
	15,
	10,
	11,
	14,
	1,
	7,
	6,
	0,
	8,
	13
);
chiptdes.S7 = new Array(
	4,
	11,
	2,
	14,
	15,
	0,
	8,
	13,
	3,
	12,
	9,
	7,
	5,
	10,
	6,
	1,
	13,
	0,
	11,
	7,
	4,
	9,
	1,
	10,
	14,
	3,
	5,
	12,
	2,
	15,
	8,
	6,
	1,
	4,
	11,
	13,
	12,
	3,
	7,
	14,
	10,
	15,
	6,
	8,
	0,
	5,
	9,
	2,
	6,
	11,
	13,
	8,
	1,
	4,
	10,
	7,
	9,
	5,
	0,
	15,
	14,
	2,
	3,
	12
);
chiptdes.S8 = new Array(
	13,
	2,
	8,
	4,
	6,
	15,
	11,
	1,
	10,
	9,
	3,
	14,
	5,
	0,
	12,
	7,
	1,
	15,
	13,
	8,
	10,
	3,
	7,
	4,
	12,
	5,
	6,
	11,
	0,
	14,
	9,
	2,
	7,
	11,
	4,
	1,
	9,
	12,
	14,
	2,
	0,
	6,
	10,
	13,
	15,
	3,
	5,
	8,
	2,
	1,
	14,
	7,
	4,
	10,
	8,
	13,
	15,
	12,
	9,
	0,
	3,
	5,
	6,
	11
);

//, first, key, permutation
chiptdes.PC_1_perm = new Array(
	-1,
	// C subkey bits
	57,
	49,
	41,
	33,
	25,
	17,
	9,
	1,
	58,
	50,
	42,
	34,
	26,
	18,
	10,
	2,
	59,
	51,
	43,
	35,
	27,
	19,
	11,
	3,
	60,
	52,
	44,
	36,
	// D subkey bits
	63,
	55,
	47,
	39,
	31,
	23,
	15,
	7,
	62,
	54,
	46,
	38,
	30,
	22,
	14,
	6,
	61,
	53,
	45,
	37,
	29,
	21,
	13,
	5,
	28,
	20,
	12,
	4
);

//, per-round, key, selection, permutation
chiptdes.PC_2_perm = new Array(
	-1,
	14,
	17,
	11,
	24,
	1,
	5,
	3,
	28,
	15,
	6,
	21,
	10,
	23,
	19,
	12,
	4,
	26,
	8,
	16,
	7,
	27,
	20,
	13,
	2,
	41,
	52,
	31,
	37,
	47,
	55,
	30,
	40,
	51,
	45,
	33,
	48,
	44,
	49,
	39,
	56,
	34,
	53,
	46,
	42,
	50,
	36,
	29,
	32
);

// save output in case we want to reformat it later
chiptdes.DES_output = new Array(65);

// remove spaces from input
chiptdes.remove_spaces = function(instr) {
	var i;
	var outstr = "";

	for (i = 0; i < instr.length; i++)
		if (instr.charAt(i) != " ")
			// not a space, include it
			outstr += instr.charAt(i);

	return outstr;
};

// split an integer into bits
// ary   = array to store bits in
// start = starting subscript
// bitc  = number of bits to convert
// val   = number to convert
chiptdes.split_int = function(ary, start, bitc, val) {
	var i = start;
	var j;
	for (j = bitc - 1; j >= 0; j--) {
		// isolate low-order bit
		ary[i + j] = val & 1;
		// remove that bit
		val >>= 1;
	}
};

// get the message to encrypt/decrypt
chiptdes.get_value = function(bitarray, str) {
	var i;
	var val; // one hex digit

	// insert note we probably are ok
	bitarray[0] = -1;

	// have hex data - remove any spaces they used, then convert
	str = chiptdes.remove_spaces(str);

	// check length of data
	if (str.length != 16) {
		window.alert("Message and key must be 64 bits (16 hex digits)");
		bitarray[0] = chiptdes.ERROR_VAL;
		return;
	}

	for (i = 0; i < 16; i++) {
		// get the next hex digit
		val = str.charCodeAt(i);

		// do some error checking
		if (val >= 48 && val <= 57)
			// have a valid digit 0-9
			val -= 48;
		else if (val >= 65 && val <= 70)
			// have a valid digit A-F
			val -= 55;
		else if (val >= 97 && val <= 102)
			// have a valid digit A-F
			val -= 87;
		else {
			// not 0-9 or A-F, complain
			window.alert(str.charAt(i) + " is not a valid hex digit");
			bitarray[0] = chiptdes.ERROR_VAL;
			return;
		}

		// add this digit to the array
		chiptdes.split_int(bitarray, i * 4 + 1, 4, val - 48);
	}
};

// format the output in the desired form
// if -1, use existing value
// -- uses the global array DES_output
chiptdes.format_DES_output = function() {
	var i;
	var bits;
	var str = "";

	// output hexdecimal data
	for (i = 1; i <= 64; i += 4) {
		bits =
			chiptdes.DES_output[i] * 8 +
			chiptdes.DES_output[i + 1] * 4 +
			chiptdes.DES_output[i + 2] * 2 +
			chiptdes.DES_output[i + 3];

		// 0-9 or A-F?
		if (bits <= 9) str += String.fromCharCode(bits + 48);
		else str += String.fromCharCode(bits + 87);
	}

	//--- final pinblock under tpk encryption ------
	chiptdes.outdata = str.toUpperCase();
};

// copy bits in a permutation
//   dest = where to copy the bits to
//   src  = Where to copy the bits from
//   perm = The order to copy/permute the bits
// note: since DES ingores x[0], we do also
chiptdes.permute = function(dest, src, perm) {
	var i;
	var fromloc;

	for (i = 1; i < perm.length; i++) {
		fromloc = perm[i];
		dest[i] = src[fromloc];
	}
};

// do an array XOR
// assume all array entries are 0 or 1
chiptdes.xor = function(a1, a2) {
	var i;

	for (i = 1; i < a1.length; i++) a1[i] = a1[i] ^ a2[i];
};

// process one S-Box, return integer from S-Box
chiptdes.do_S = function(SBox, index, inbits) {
	// collect the 6 bits into a single integer
	var S_index =
		inbits[index] * 32 +
		inbits[index + 5] * 16 +
		inbits[index + 1] * 8 +
		inbits[index + 2] * 4 +
		inbits[index + 3] * 2 +
		inbits[index + 4];

	// do lookup
	return SBox[S_index];
};

// do one round of DES encryption
chiptdes.des_round = function(L, R, KeyR) {
	var E_result = new Array(49);
	var S_out = new Array(33);

	// copy the existing L bits, then set new L = old R
	var temp_L = new Array(33);
	for (i = 0; i < 33; i++) {
		// copy exising L bits
		temp_L[i] = L[i];

		// set L = R
		L[i] = R[i];
	}

	// expand R using E permutation
	chiptdes.permute(E_result, R, chiptdes.E_perm);

	// exclusive-or with current key
	chiptdes.xor(E_result, KeyR);

	// put through the S-Boxes
	chiptdes.split_int(S_out, 1, 4, chiptdes.do_S(chiptdes.S1, 1, E_result));
	chiptdes.split_int(S_out, 5, 4, chiptdes.do_S(chiptdes.S2, 7, E_result));
	chiptdes.split_int(S_out, 9, 4, chiptdes.do_S(chiptdes.S3, 13, E_result));
	chiptdes.split_int(S_out, 13, 4, chiptdes.do_S(chiptdes.S4, 19, E_result));
	chiptdes.split_int(S_out, 17, 4, chiptdes.do_S(chiptdes.S5, 25, E_result));
	chiptdes.split_int(S_out, 21, 4, chiptdes.do_S(chiptdes.S6, 31, E_result));
	chiptdes.split_int(S_out, 25, 4, chiptdes.do_S(chiptdes.S7, 37, E_result));
	chiptdes.split_int(S_out, 29, 4, chiptdes.do_S(chiptdes.S8, 43, E_result));

	// do the P permutation
	chiptdes.permute(R, S_out, chiptdes.P_perm);

	// xor this with old L to get the new R
	chiptdes.xor(R, temp_L);
};

// shift the CD values left 1 bit
chiptdes.shift_CD_1 = function(CD) {
	var i;

	// note we use [0] to hold the bit shifted around the end
	for (i = 0; i <= 55; i++) CD[i] = CD[i + 1];

	// shift D bit around end
	CD[56] = CD[28];
	// shift C bit around end
	CD[28] = CD[0];
};

// shift the CD values left 2 bits
chiptdes.shift_CD_2 = function(CD) {
	var i;
	var C1 = CD[1];

	// note we use [0] to hold the bit shifted around the end
	for (i = 0; i <= 54; i++) CD[i] = CD[i + 2];

	// shift D bits around end
	CD[55] = CD[27];
	CD[56] = CD[28];
	// shift C bits around end
	CD[27] = C1;
	CD[28] = CD[0];
};

// do the actual DES encryption/decryption
chiptdes.des_encrypt = function(inData, Key, do_encrypt) {
	var tempData = new Array(65); // output bits
	var CD = new Array(57); // halves of current key
	var KS = new Array(16); // per-round key schedules
	var L = new Array(33); // left half of current data
	var R = new Array(33); // right half of current data
	var result = new Array(65); // DES output
	var i;

	// do the initial key permutation
	chiptdes.permute(CD, Key, chiptdes.PC_1_perm);

	// create the subkeys
	for (i = 1; i <= 16; i++) {
		// create a new array for each round
		KS[i] = new Array(49);

		// how much should we shift C and D?
		if (i == 1 || i == 2 || i == 9 || i == 16) chiptdes.shift_CD_1(CD);
		else chiptdes.shift_CD_2(CD);

		// create the actual subkey
		chiptdes.permute(KS[i], CD, chiptdes.PC_2_perm);
	}

	// handle the initial permutation
	chiptdes.permute(tempData, inData, chiptdes.IP_perm);

	// split data into L/R parts
	for (i = 1; i <= 32; i++) {
		L[i] = tempData[i];
		R[i] = tempData[i + 32];
	}

	// encrypting or decrypting?
	if (do_encrypt) {
		// encrypting
		for (i = 1; i <= 16; i++) {
			chiptdes.des_round(L, R, KS[i]);
		}
	} else {
		// decrypting
		for (i = 16; i >= 1; i--) {
			chiptdes.des_round(L, R, KS[i]);
		}
	}

	// create the 64-bit preoutput block = R16/L16
	for (i = 1; i <= 32; i++) {
		// copy R bits into left half of block, L bits into right half
		tempData[i] = R[i];
		tempData[i + 32] = L[i];
	}

	// do final permutation and return result
	chiptdes.permute(result, tempData, chiptdes.FP_perm);
	return result;
};

// get the key part1 and part2 of tpk
chiptdes.getKeys = function(tpk) {
	var arr = [];
	arr[0] = tpk.substr(0, 16);
	arr[1] = tpk.substr(16, 16);

	return arr;
};

// do Triple-DES encrytion/decryption
// do_encrypt is TRUE for encrypt, FALSE for decrypt
chiptdes.do_tdes = function(do_encrypt, pinblock, tpk) {
	var inData = new Array(65); // input message bits
	var tempdata = new Array(65); // interm result bits
	var KeyA = new Array(65);
	var KeyB = new Array(65);

	// get the message from the user
	// also check if it is ASCII or hex
	chiptdes.get_value(inData, pinblock);

	// problems??
	if (inData[0] == chiptdes.ERROR_VAL) {
		// alert(chiptdes.ERROR_VAL);
		return;
	}

	// get the tpk keys
	var tpkarr = chiptdes.getKeys(tpk);
	var tpk1 = tpkarr[0];
	var tpk2 = tpkarr[1];

	// get the key part A from the user
	chiptdes.get_value(KeyA, tpk1, false);
	// problems??
	if (KeyA[0] == chiptdes.ERROR_VAL) {
		// alert(chiptdes.ERROR_VAL);
		return;
	}

	// get the key part B from the user
	chiptdes.get_value(KeyB, tpk2, false);
	// problems??
	if (KeyB[0] == chiptdes.ERROR_VAL) {
		// alert(chiptdes.ERROR_VAL);
		return;
	}

	if (do_encrypt) {
		// TDES encrypt = DES encrypt/decrypt/encrypt
		tempdata = chiptdes.des_encrypt(inData, KeyA, true);
		tempdata = chiptdes.des_encrypt(tempdata, KeyB, false);
		chiptdes.DES_output = chiptdes.des_encrypt(tempdata, KeyA, true);
	} else {
		// TDES decrypt = DES decrypt/encrypt/decrypt
		tempdata = chiptdes.des_encrypt(inData, KeyA, false);
		tempdata = chiptdes.des_encrypt(tempdata, KeyB, true);
		chiptdes.DES_output = chiptdes.des_encrypt(tempdata, KeyA, false);
	}

	// process output
	chiptdes.format_DES_output();

	return chiptdes.outdata;
};
