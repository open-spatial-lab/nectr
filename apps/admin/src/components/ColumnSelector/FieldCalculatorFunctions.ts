export const fieldCalculatorFunctions = {
  Math: [
    {
      label: '+',
      value: '+',
      tooltip: 'Addition'
    },
    {
      label: '-',
      value: '-',
      tooltip: 'Subtraction'
    },
    {
      label: '*',
      value: '*',
      tooltip: 'Multilpication'
    },
    {
      label: '/',
      value: '/',
      tooltip: 'Division'
    },
    {
      label: 'Remainder',
      value: '%',
      tooltip: 'Remainder after division'
    },
    {
      label: 'Exponent',
      value: '^',
      tooltip: 'Exponent / to the power of. Same as **'
    },
    {
      label: 'Factorial',
      value: '!',
      tooltip: 'Factorial'
    }
  ],
  Numeric: [
    {
      value: 'abs(x)',
      tooltip: 'Convert negative to positive (eg. abs(-1) > 1)',
      label: 'Absolute Value'
    },

    {
      value: 'round(x, y)',
      label: 'Round to Places',
      tooltip: 'round to y decimal places, values x < 0 are allowed	round(42.4332, 2)	42.43'
    },
    {
      value: 'ceiling(x)',
      label: 'Round Up',
      tooltip: 'Rounds the number up. Alias of ceil. (ex. ceiling(17.4) =	18)'
    },
    {
      value: 'even(x)',
      label: 'Round to Even',
      tooltip: '	round to next even number by rounding away from zero.	even(2.9)	4'
    },
    { value: 'floor(x)', label: 'Round Down', tooltip: '	rounds the number down	floor(17.4)	17' },
    {
      value: 'greatest(x1, x2, ...)',
      label: 'Greatest',
      tooltip: 'Selects the largest value	greatest(3, 2, 4, 4)	4'
    },
    {
      value: 'least(x1, x2, ...)',
      label: 'Smallest',
      tooltip: 'Selects the smallest value	least(3, 2, 4, 4)	2'
    },
    {
      value: 'least_common_multiple(x,y)',
      label: 'Least Common Multiple',
      tooltip: 'computes the least common multiple of x and y	least_common_multiple(42, 57)	798'
    },
    {
      value: 'greatest_common_divisor(x,y)',
      label: 'Greatest Common Divisor',
      tooltip: 'computes the greatest common divisor of x and y	gcd(42, 57)	3'
    },
    {
      value: 'sqrt(x)',
      label: 'Square Root',
      tooltip: '	returns the square root of the number	sqrt(9)	3'
    },
    {
      value: 'cbrt(x)',
      label: 'Cube Root',
      tooltip: '	returns the cube root of the number	cbrt(8)	2'
    },
    { value: 'power(x,y)', label: 'Exponent', tooltip: 'computes x to the power of y	pow(2, 3)	8' },

    {
      value: 'ln(x)',
      label: 'Natural Log',
      tooltip: '	computes the natural logarithm of x	ln(2)	0.693'
    },
    { value: 'log10(x)', label: 'Log10', tooltip: '	computes the 10-log of x	log(100)	2' },
    { value: 'log2(x)', label: 'Log2', tooltip: '	computes the 2-log of x	log2(8)	3' },
    {
      value: 'degrees(x)',
      label: 'Radians to Degrees',
      tooltip: '	converts radians to degrees	degrees(pi())	180'
    },
    {
      value: 'radians(x)',
      label: 'Degrees to Radians',
      tooltip: '	converts degrees to radians	radians(90)	1.5707963267948966'
    },
    {
      value: 'gamma(x)',
      label: 'Gamma',
      tooltip:
        'interpolation of (x-1) factorial (so decimal inputs are allowed)	gamma(5.5)	52.34277778455352'
    },
    {
      value: 'lgamma(x)',
      label: 'Log Gamma',
      tooltip: '	computes the log of the gamma function.	lgamma(2)	0'
    },
    { value: 'pi()	', label: 'Pi', tooltip: 'returns the value of pi	pi()	3.141592653589793' },
    {
      value: 'random()	',
      label: 'Random',
      tooltip: 'returns a random number between 0 and 1	random()	various'
    },
    {
      value: 'setseed(x)',
      label: 'Set Random Seed',
      tooltip: '	sets the seed to be used for the random function	setseed(0.42)	 '
    }
  ],
  Text: [
    {
      value: 'concat(string, string2, ...)',
      tooltip: "Concatenate many strings together	concat('Hello', ' ', 'World')	Hello World	 ",
      label: 'Combine Text'
    },
    {
      value: 'concat_ws(separator, string1, string2, ...)',
      tooltip:
        "Concatenate strings together separated by the specified separator	concat_ws(', ', 'Banana', 'Apple', 'Melon')	Banana, Apple, Melon	 ",
      label: 'Combine Text (with separator)'
    },
    { value: 'upper(string)', tooltip: '', label: 'Uppercase' },
    {
      value: 'lower(string)',
      tooltip: "	Convert string to lower case	lower('Hello')	hello	lcase",
      label: 'Lowercase'
    },

    {
      value: 'string[index]',
      tooltip: "Alias for array_extract.	'DuckDB'[4] =	'k'",
      label: 'Text Extract at Index'
    },
    {
      value: 'string[begin:end]',
      tooltip:
        "Alias for array_slice. Missing begin or end arguments are interpreted as the beginning or end of the list respectively.	'DuckDB'[:4] =	'Duck'	 ",
      label: 'Text Extract Between Indices'
    },
    {
      value: 'string_split(string,',
      tooltip:
        " separator)	Splits the string along the separator	string_split('hello␣world', '␣')	['hello', 'world']	str_split, string_to_array",
      label: ''
    },
    {
      value: 'substring(string,',
      tooltip:
        " start, length)	Extract substring of length characters starting from character start. Note that a start value of 1 refers to the first character of the string.	substring('Hello', 2, 2)	el	substr",
      label: ''
    },

    {
      value: 'contains(string,',
      tooltip:
        " search_string)	Return true if search_string is found within string	contains('abc', 'a')	true	 ",
      label: 'Contains Text'
    },
    {
      value: 'starts_with(string,',
      tooltip:
        " search_string)	Return true if string begins with search_string	starts_with('abc', 'a')	true	 ",
      label: 'Starts with Text'
    },
    {
      value: 'ends_with(string,',
      tooltip:
        " search_string)	Return true if string ends with search_string	ends_with('abc', 'c')	true	suffix",
      label: 'End with Text'
    },
    {
      value: 'left(string, count)',
      tooltip: "Extract the left-most count characters	left('Hello🦆', 2)	He	 ",
      label: 'Text from left'
    },
    {
      value: 'right(string, count)',
      tooltip: "Extract the right-most count characters	right('Hello🦆', 3)	lo🦆	 ",
      label: 'Text from right'
    },
    // {value: "left_gra÷pheme(string,", tooltip: " count)	Extract the left-most grapheme clusters	left_grapheme('🤦🏼‍♂️🤦🏽‍♀️', 1)	🤦🏼‍♂️	 ", label:""},
    {
      value: 'length(string)',
      tooltip: "Number of characters in string	length('Hello🦆')	6	 ",
      label: 'Length'
    },
    // {value: "length_grapheme(string)", tooltip: "	Number of grapheme clusters in string	length_grapheme('🤦🏼‍♂️🤦🏽‍♀️')	2	 ", label:""},
    {
      value: 'repeat(string, count)',
      tooltip: "Repeats the string count number of times	repeat('A', 5)	AAAAA	 ",
      label: 'Repeat'
    },
    {
      value: 'replace(string, source, target)',
      tooltip:
        "Replaces any occurrences of the source with target in string	replace('hello', 'l', '-')	he--o	 ",
      label: 'Replace'
    },
    {
      value: 'reverse(string)',
      tooltip: "	Reverses the string	reverse('hello')	olleh	 ",
      label: 'Reverse'
    },
    // {value: "right_grapheme(string,", tooltip: " count)	Extract the right-most count grapheme clusters	right_grapheme('🤦🏼‍♂️🤦🏽‍♀️', 1)	🤦🏽‍♀️	 ", label:""},
    {
      value: 'position(search_string, text_in_string)',
      tooltip:
        "Return location of first occurrence of search_string in string, counting from 1. Returns 0 if no match found.	position('b' in 'abc')	2	 ",
      label: 'Text Position'
    },

    {
      value: 'trim(string)',
      tooltip: "Removes any spaces from either side of the string	trim('␣␣␣␣test␣␣')	test	 ",
      label: 'Trim Spaces'
    },
    {
      value: 'trim(string, characters)',
      tooltip:
        "Removes any occurrences of any of the characters from either side of the string	trim('>>>>test<<', '><')	test",
      label: 'Trim Characters'
    },
    {
      value: 'rpad(string,',
      tooltip:
        " count, character)	Pads the string with the character from the right until it has count characters	rpad('hello', 10, '<')	hello<<<<<	 ",
      label: 'Trim Spaces (Right)'
    },
    {
      value: 'rtrim(string)',
      tooltip: "	Removes any spaces from the right side of the string	rtrim('␣␣␣␣test␣␣')	␣␣␣␣test	 ",
      label: 'Trim Characters (Right)'
    },
    {
      value: 'rtrim(string, characters)',
      tooltip:
        "Removes any occurrences of any of the characters from the right side of the string	rtrim('>>>>test<<', '><')	>>>>test	 ",
      label: 'Trim Spaces (Left)'
    },
    {
      value: 'lpad(string,',
      tooltip:
        " count, character)	Pads the string with the character from the left until it has count characters	lpad('hello', 10, '>')	>>>>>hello	 ",
      label: 'Trim Characters (Left)'
    },
    {
      value: 'ltrim(string)',
      tooltip: "	Removes any spaces from the left side of the string	ltrim('␣␣␣␣test␣␣')	test␣␣	 ",
      label: ''
    },
    {
      value: 'ltrim(string, characters)',
      tooltip:
        "Removes any occurrences of any of the characters from the left side of the string	ltrim('>>>>test<<', '><')	test<<	 ",
      label: ''
    },
    {
      value: 'split_part(string, separator, index)',
      tooltip:
        "Split the string along the separator and return the data at the (1-based) index of the list. If the index is outside the bounds of the list, return an empty string (to match PostgreSQL’s behavior).	split_part('a|b|c', '|', 2)	b	 ",
      label: 'Split'
    },

    {
      value: 'ascii(string)',
      tooltip:
        "	Returns an integer that represents the Unicode code point of the first character of the string	ascii('Ω')	937	 ",
      label: 'ASCII'
    },
    {
      value: 'bar(x,min, max[, width])',
      tooltip:
        ' Draw a band whose width is proportional to (x - min) and equal to width characters when x = max. width defaults to 80.	bar(5, 0, 20, 10)	██▌	 ',
      label: 'Draw Bar'
    },
    {
      value: 'chr(x)',
      tooltip:
        'Returns a character which is corresponding the ASCII code value or Unicode code point	chr(65)	A	 ',
      label: 'Character from ASCII'
    }

    // {value: "format(format, parameters...)", tooltip: "Formats a string using the fmt syntax	format('Benchmark '{}' took {} seconds', 'CSV', 42)	Benchmark 'CSV' took 42 seconds	 ", label:""},
    // {value: "from_base64(string)", tooltip: "	Convert a base64 encoded string to a character string.	from_base64('QQ==')	'A'	 ", label:""},
    // {value: "hash(value)", tooltip: "	Returns an integer with the hash of the value	hash('🦆')	2595805878642663834	 ", label:""},
    // {value: "instr(string,", tooltip: " search_string)	Return location of first occurrence of search_string in string, counting from 1. Returns 0 if no match found.	instr('test test', 'es')	2	 ", label:""},
    // {value: "string LIKE ", tooltip: "target	Returns true if the string matches the like specifier (see Pattern Matching)	'hello' LIKE '%lo'	true	 ", label:""},
    // {value: "like_escape(string,", tooltip: " like_specifier, escape_character)	Returns true if the string matches the like_specifier (see Pattern Matching). escape_character is used to search for wildcard characters in the string.	like_escape('a%c', 'a$%c', '$')	true	 ", label:""},
    // {value: "md5(value)", tooltip: "	Returns the MD5 hash of the value	md5('123')	'202cb962ac59075b964b07152d234b70'	 ", label:""},
    // {value: "nfc_normalize(string)", tooltip: "	Convert string to Unicode NFC normalized string. Useful for comparisons and ordering if text data is mixed between NFC normalized and not.	nfc_normalize('ardèch')	arde`ch	 ", label:""},
    // {value: "not_like_escape(string,", tooltip: " like_specifier, escape_character)	Returns false if the string matches the like_specifier (see Pattern Matching). escape_character is used to search for wildcard characters in the string.	like_escape('a%c', 'a$%c', '$')	true	 ", label:""},
    // {value: "ord(string)", tooltip: "	Return ASCII character code of the leftmost character in a string.	ord('ü')	252	 ", label:""},
    // {value: "printf(format,", tooltip: " parameters...)	Formats a string using printf syntax	printf('Benchmark '%s' took %d seconds', 'CSV', 42)	Benchmark 'CSV' took 42 seconds	 ", label:""},
    // {value: "regexp_full_match(string,", tooltip: " regex)	Returns true if the entire string matches the regex (see Pattern Matching)	regexp_full_match('anabanana', '(an)*')	false	 ", label:""},
    // {value: "regexp_matches(string,", tooltip: " regex)	Returns true if a part of string matches the regex (see Pattern Matching)	regexp_matches('anabanana', '(an)*')	true	 ", label:""},
    // {value: "regexp_replace(string,", tooltip: " regex, replacement, modifiers)	Replaces the first occurrence of regex with the replacement, use 'g' modifier to replace all occurrences instead (see Pattern Matching)	select regexp_replace('hello', '[lo]', '-')	he-lo	 ", label:""},
    // {value: "regexp_extract(string,", tooltip: " regex[, group = 0])	Split the string along the regex and extract first occurrence of group	regexp_extract('hello_world', '([a-z ]+)_?', 1)	hello	 ", label:""},
    // {value: "regexp_extract_all(string,", tooltip: " regex[, group = 0])	Split the string along the regex and extract all occurrences of group	regexp_extract_all('hello_world', '([a-z ]+)_?', 1)	[hello, world]	 ", label:""},
    // {value: "string SIMILAR ", tooltip: "TO regex	Returns true if the string matches the regex; identical to regexp_full_match (see Pattern Matching)	'hello' SIMILAR TO 'l+'	false	 ", label:""},
    // {value: "strlen(string)", tooltip: "	Number of bytes in string	strlen('🦆')	4	 ", label:""},
    // {value: "strpos(string,", tooltip: " search_string)	Alias of instr. Return location of first occurrence of search_string in string, counting from 1. Returns 0 if no match found.	strpos('test test', 'es')	2	 ", label:""},
    // {value: "strip_accents(string)", tooltip: "	Strips accents from string	strip_accents('mühleisen')	muhleisen	 ", label:""},
    // {value: "string_split_regex(string,", tooltip: " regex)	Splits the string along the regex	string_split_regex('hello␣world; 42', ';?␣')	['hello', 'world', '42']	regexp_split_to_array, str_split_regex", label:""},
    // {value: "substring_grapheme(string,", tooltip: " start, length)	Extract substring of length grapheme clusters starting from character start. Note that a start value of 1 refers to the first character of the string.	substring_grapheme('🦆🤦🏼‍♂️🤦🏽‍♀️🦆', 3, 2)	🤦🏽‍♀️🦆	 ", label:""},
    // {value: "to_base64(blob)", tooltip: "	Convert a blob to a base64 encoded string.	to_base64('A'::blob)	QQ==	base64", label:""},
    // {value: "unicode(string)", tooltip: "	Returns the unicode code of the first character of the string	unicode('ü')	252	 ", label:""},
  ],
  Date: [
    {
      label: 'Convert to Date',
      value: 'DATE x',
      tooltip: "Converts a string to a date. DATE '2012-08-08' > 2012-08-08"
    },
    {
      label: 'Make Date',
      value: 'make_date(year, month, day)',
      tooltip: 'Creates a date from year, month and day. make_date(2012, 8, 8) > 2012-08-08'
    },
    {
      label: 'Format Date',
      value: 'strftime(DATE x, y)',
      tooltip: "Formats a date. strftime(DATE '2012-08-08', '%Y/%m/%d') > 2012/08/08"
    },
    {
      label: 'Month Name',
      value: 'monthname(DATE x)',
      tooltip: "Returns the name of the month. month_name(DATE '2012-08-08') > August"
    },
    {
      label: 'Day Name',
      value: 'dayname(DATE x)',
      tooltip: "Returns the name of the day. day_name(DATE '2012-08-08') > Wednesday"
    },
    {
      label: 'Extract Part of Date',
      value: 'date_part(part, DATE x)',
      tooltip: "Extracts part of a date. date_part('year', DATE '2012-08-08') > 2012. "
    },
    {
      label: 'Add Days',
      value: 'DATE x + 1',
      tooltip: "Adds days to a date. DATE '2012-08-08' + 1 > 2012-08-09"
    },
    {
      label: 'Subtract Dates',
      value: 'DATE x - DATE y',
      tooltip: "Subtracts two dates. (ex. DATE '2012-08-08' - DATE '2012-08-07' = 1)"
    },
    {
      label: 'Date Difference',
      value: 'date_diff(DATE x, DATE y)',
      tooltip:
        "Returns the difference between two dates. date_diff(DATE '2012-08-08', DATE '2012-08-12') = 4"
    },
    {
      label: 'Greatest Date',
      value: 'greatest(DATE x, DATE y)',
      tooltip:
        "Returns the greatest date. greatest(DATE '2012-08-08', DATE '2012-08-12') > 2012-08-12"
    },
    {
      label: 'Least Date',
      value: 'least(DATE x, DATE y)',
      tooltip: "Returns the smallest date. least(DATE '2012-08-08', DATE '2012-08-12') > 2012-08-08"
    },
    {
      label: 'Last Day',
      value: 'last_day(DATE x)',
      tooltip: "Returns the last day of the month. last_day(DATE '2012-08-08') > 2012-08-31"
    },
    {
      label: 'Today',
      value: 'today()',
      tooltip: "Returns today's date. today() > 2012-08-08"
    }
  ],
  Validation: [
    {
      value: 'isfinite(x)',
      label: 'Is Infinite',
      tooltip:
        '	Returns true if the floating point value is finite, false otherwise	isfinite(5.5)	true'
    },
    {
      value: 'isnan(x)',
      label: 'Is Not a Number',
      tooltip:
        "	Returns true if the floating point value is not a number, false otherwise	isnan('NaN'::float)	true"
    }
  ],
  Utilities: [
    {
      value: 'ifnull(expr, fallback)',
      tooltip: "A two-argument version of coalesce	ifnull(NULL, 'default_string')	'default_string'",
      label: 'Fallback value (if null)'
    },
    {
      value: 'coalesce(value1, value2, ...)',
      tooltip:
        "	Return the first expression that evaluates to a non-NULL value. Accepts 1 or more parameters. Each expression can be a column, literal value, function result, or many others.	coalesce(NULL, NULL, 'default_string')	'default_string'",
      label: 'Coalesce'
    },
    {
      value: 'nullif(a,b)',
      tooltip:
        'Return null if a = b, else return a. Equivalent to CASE WHEN a=b THEN NULL ELSE a END.	nullif(1+1, 2)	NULL',
      label: 'Null If'
    },
    {
      value: 'error(message)',
      tooltip: "	Throws the given error message	error('access_mode')	 ",
      label: 'Error'
    },
    {
      value: 'uuid()	Return',
      tooltip: ' a random uuid similar to this: eeccb8c5-9943-b2bb-bb5e-222f4e14b687.	uuid()	various',
      label: 'Generate ID'
    }
  ],
  Trigonometry: [
    {
      value: 'acos(x)',
      label: 'Arccosine',
      tooltip: 'Computes the arccosine of x (eg. acos(0.5) > 1.0471975511965976)'
    },
    {
      value: 'asin(x)',
      label: 'Arcsine',
      tooltip: 'computes the arcsine of x	(eg. asin(0.5) > 0.5235987755982989)'
    },
    {
      value: 'atan(x)',
      label: 'Arctangent',
      tooltip: '	computes the arctangent of x	atan(0.5)	0.4636476090008061'
    },
    {
      value: 'atan2(y,',
      label: 'Arctangent XY',
      tooltip: ' x)	computes the arctangent (y, x)	atan2(0.5, 0.5)	0.7853981633974483'
    },
    {
      value: 'cos(x)',
      label: 'Cosine',
      tooltip: '	computes the cosine of x	cos(90)	-0.4480736161291701'
    },
    {
      value: 'cot(x)',
      label: 'Cotangent',
      tooltip: '	computes the cotangent of x	cot(0.5)	1.830487721712452'
    },

    { value: 'sin(x)', label: '', tooltip: '	computes the sin of x	sin(90)	0.8939966636005579' },
    { value: 'sign(x)', label: '', tooltip: '	returns the sign of x as -1, 0 or 1	sign(-349)	-1' },
    { value: 'tan(x)', label: '', tooltip: '	computes the tangent of x	tan(90)	-1.995200412208242' }
  ],
  Bitwise: [
    {
      value: 'bit_count(x)',
      label: 'Bit Count',
      tooltip: '	returns the number of bits that are set	bit_count(31)	5'
    },

    {
      value: 'signbit(x)',
      label: 'Sign bit',
      tooltip: '	returns whether the signbit is set or not	signbit(-0.0)	true'
    },
    {
      label: 'AND',
      value: '&'
    },
    {
      label: 'OR',
      value: '|'
    },
    {
      label: 'Shift Right',
      value: '>>'
    },
    {
      label: 'Shift Left',
      value: '<<'
    },
    {
      label: 'Negation',
      value: '~'
    },
    { value: 'xor(x)', label: 'XOR', tooltip: '	bitwise XOR	xor(17, 5)	20' },

    {
      value: 'nextafter(x,y)',
      label: 'Next Float After',
      tooltip:
        'return the next floating point value after x in the direction of y	nextafter(1::float, 2::float)	1.0000001'
    }
  ]
}
