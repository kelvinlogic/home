/* Arabic keyboard layouts
 * contains layout: 'arabic-azerty', 'arabic-qwerty-1', 'arabic-qwerty-2', 'arabic-qwerty-3', 'arabic-qwerty-4'
 *
 * To use:
 *  Point to this js file into your page header: <script src="layouts/arabic.js" type="text/javascript"></script>
 *  Initialize the keyboard using: $('input').keyboard({ layout: 'arabic-azerty' });
 *
 * license for this file: WTFPL, unless the source layout site has a problem with me using them as a reference
 */

/* based on http://ascii-table.com/keyboard.php/462 */
$.keyboard.layouts['arabic-azerty'] = {
	'default' : [
		'\u00b2 & \u00e9 " \' ( - \u00e8 _ \u00e7 \u00e0 ) = {bksp}',
		"{tab} a z e r t y u i o p ` $",
		"q s d f g h j k l m \u00f9 \u066d {enter}",
		"{shift} < w x c v b n , ; : ! {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'shift' : [
		"\u00b2 1 2 3 4 5 6 7 8 9 0 \u00b0 + {bksp}",
		"{tab} A Z E R T Y U I O P \u0308 \u00a3",
		"Q S D F G H J K L M \u066a \u00b5 {enter}",
		"{shift} > W X C V B N ? . / \u00a7 {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'alt' : [
		'> & \u00e9 # { [ | \u0300 \\ ^ @ ] } {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u0647 \u062e \u062d \u062c \u062f',
		'\u0634 \u0633 \u064a \u0628 \u0644 \u0627 \u062a \u0646 \u0645 \u0643 \u0637 \u0630 {enter}',
		'{shift} \u0640 \u0626 \u0621 \u0624 \u0631 \ufefb \u0649 \u0629 \u0648 \u0632 \u0638 {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	],
	'alt-shift' : [
		'< 1 2 3 4 5 6 7 8 9 0 \u00b0 + {bksp}',
		'{tab} \u064e \u064b \u064f \u064c \ufef9 \u0625 \u0060 \u00f7 \u00d7 \u061b \u062c \u00a4',
		'\\ \u0633 [ ] \ufef7 \u0623 \u0640 \u060c / : \u00a8 \u0651 {enter}',
		'{shift} | ~ \u0652 \u0650 \u064d \ufef5 \u0622 \' , . \u061f {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	]
};

/* based on http://ascii-table.com/keyboard.php/470 */
$.keyboard.layouts['arabic-qwerty-1'] = {
	'default' : [
		'` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
		"{tab} q w e r t y u i o p [ ] \\",
		"a s d f g h j k l ; ' {enter}",
		"{shift} z x c v b n m , . / {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'shift' : [
		"~ ! @ # $ % ^ & * ( ) _ + {bksp}",
		"{tab} Q W E R T Y U I O P { } |",
		'A S D F G H J K L : " {enter}',
		"{shift} Z X C V B N M < > ? {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'alt' : [
		'\u0630 \u0661 \u0662 \u0663 \u0664 \u0665 \u0666 \u0667 \u0668 \u0669 \u0660 - = {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u0647 \u062e \u062d \u062c \u062f \\',
		'\u0634 \u0633 \u064a \u0628 \u0644 \u0627 \u062a \u0646 \u0645 \u0643 \u0637 {enter}',
		'{shift} \u0626 \u0621 \u0624 \u0631 \ufefb \u0649 \u0629 \u0648 \u0632 \u0638 {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	],
	'alt-shift' : [
		'\u0651 ! @ # $ % ^ & * ( ) _ + {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u00f7 \u00d7 \u061b > < |',
		'\u0634 \u0633 \u064a \u0628 \u0644 \u0623 \u0640 \u060c / : " {enter}',
		'{shift} \u0626 \u0621 \u0624 \u0631 \ufef5 \u0622 \u0629 , . \u061f {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	]
};

/* based on keyboard layout from http://ascii-table.com/keyboard.php/238 */
$.keyboard.layouts['arabic-qwerty-2'] = {
	'default' : [
		'< 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
		"{tab} q w e r t y u i o p [ ]",
		"a s d f g h j k l ; ' ` {enter}",
		"{shift} \\ z x c v b n m , . / {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'shift' : [
		"> ! @ # $ % ^ & * ( ) _ + {bksp}",
		"{tab} Q W E R T Y U I O P { }",
		'A S D F G H J K L : " ~ {enter}',
		"{shift} | Z X C V B N M , . ? {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'alt' : [
		'< \u0661 \u0662 \u0663 \u0664 \u0665 \u0666 \u0667 \u0668 \u0669 \u0660 - = {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u0647 \u062e \u062d \u062c \u062f',
		'\u0634 \u0633 \u064a \u0628 \u0644 \u0627 \u062a \u0646 \u0645 \u0643 \u0637 \u0630 {enter}',
		'{shift} \u0640 \u0626 \u0621 \u0624 \u0631 \ufefb \u0649 \u0629 \u0648 \u0632 \u0638 {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	],
	'alt-shift' : [
		'> ! @ # $ % ^ & * ( ) _ + {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u00f7 \u00d7 \u061b { }',
		'\\ \u0633 \u064a \u0628 \ufef7 \u0623 \u062a \u060c \u0645 : " \u0651 {enter}',
		'{shift} | \u0626 \u0621 \u0624 \u0631 \ufef5 \u0622 \u0629 , . \u061f {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	]
};

/* based on keyboard layout from http://ascii-table.com/keyboard.php/239 */
$.keyboard.layouts['arabic-qwerty-3'] = {
	'default' : [
		'< 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
		"{tab} q w e r t y u i o p \u00a2 |",
		"a s d f g h j k l ; ' ` {enter}",
		"{shift} \u0640 z x c v b n m , . / {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'shift' : [
		"> ! @ # $ % \u00ac & * ( ) _ + {bksp}",
		"{tab} Q W E R T Y U I O P \u00a3 |",
		'A S D F G H J K L : " ~ {enter}',
		"{shift} \u00a6 Z X C V B N M , . ? {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'alt' : [
		'< \u0661 \u0662 \u0663 \u0664 \u0665 \u0666 \u0667 \u0668 \u0669 \u0660 - = {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u0647 \u062e \u062d \u062c \u062f',
		'\u0634 \u0633 \u064a \u0628 \u0644 \u0627 \u062a \u0646 \u0645 \u0643 \u0637 \u0630 {enter}',
		'{shift} \u0640 \u0626 \u0621 \u0624 \u0631 \ufefb \u0649 \u0629 \u0648 \u0632 \u0638 {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	],
	'alt-shift' : [
		'> ! @ # $ % \u00ac & * ( ) _ + {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u00f7 \u00d7 \u061b \u00a3 |',
		'\u0634 \u0633 \u064a \u0628 \ufef7 \u0623 \u062a \u060c / : " \u0651 {enter}',
		'{shift} \u00a6 \u0626 \u0621 \u0624 \u0631 \ufef5 \u0622 \u0629 , . \u061f {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	]
};

/* based on keyboard layout from http://ascii-table.com/keyboard.php/253 */
$.keyboard.layouts['arabic-qwerty-4'] = {
	'default' : [
		'< 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
		"{tab} q w e r t y u i o p [ ]",
		"a s d f g h j k l ; ' ` {enter}",
		"{shift} \\ z x c v b n m , . / {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'shift' : [
		"> ! @ # $ % ^ & * ( ) _ + {bksp}",
		"{tab} Q W E R T Y U I O P { }",
		'A S D F G H J K L : " ~ {enter}',
		"{shift} | Z X C V B N M , . ? {shift}",
		"{accept} {alt} {space} {alt} {cancel}"
	],
	'alt' : [
		'< \u0661 \u0662 \u0663 \u0664 \u0665 \u0666 \u0667 \u0668 \u0669 \u0660 - = {bksp}',
		'{tab} \u0636 \u0635 \u062b \u0642 \u0641 \u063a \u0639 \u0647 \u062e \u062d \u062c \u062f',
		'\u0634 \u0633 \u064a \u0628 \u0644 \u0627 \u062a \u0646 \u0645 \u0643 \u0637 \u0630 {enter}',
		'{shift} \u0640 \u0626 \u0621 \u0624 \u0631 \ufefb \u0649 \u0629 \u0648 \u0632 \u0638 {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	],
	'alt-shift' : [
		'> ! @ # $ % ^ & * ( ) _ + {bksp}',
		'{tab} \u064e \u064b \u064f \u064c \ufef9 \u0625 \u0639 \u00f7 \u00d7 \u061b { }',
		'\\ \u0633 \u064a \u0628 \ufef7 \u0623 \u062a \u060c \u002f : " \u0651 {enter}',
		'{shift} | \u0626 \u0652 \u0650 \u064d \ufef5 \u0622 \u0629 , . \u061f {shift}',
		'{accept} {alt} {space} {alt} {cancel}'
	]
};

// Custom keyboard with arabic only.
$.keyboard.layouts['arabic-only-qwerty-1'] = {
    'default' : [
        '\u0630:(`) \u0661:(1) \u0662:(2) \u0663:(3) \u0664:(4) \u0665:(5) \u0666:(6) \u0667:(7) \u0668:(8) \u0669:(9) \u0660:(0) - = {bksp}',
        '{tab} \u0636:(q) \u0635:(w) \u062b:(e) \u0642:(r) \u0641:(t) \u063a:(y) \u0639:(u) \u0647:(i) \u062e:(o) \u062d:(p) \u062c:([) \u062f:(]) \\',
        '\u0634:(a) \u0633:(s) \u064a:(d) \u0628:(f) \u0644:(g) \u0627:(h) \u062a:(j) \u0646:(k) \u0645:(l) \u0643:(;) \u0637:(\') {enter}',
        '{shift} \u0626:(z) \u0621:(x) \u0624:(c) \u0631:(v) \ufefb:(b) \u0649:(n) \u0629:(m) \u0648:(,) \u0632:(.) \u0638:(/) {shift}',
        '{accept} {alt} {space} {alt} {cancel}'
    ],
    'shift' : [
        '\u0651:(~) ! @ # $ % ^ & * ( ) _ + {bksp}',
        '{tab} \u0636:(Q) \u0635:(W) \u062b:(E) \u0642:(R) \u0641:(T) \u063a:(Y) \u0639:(U) \u00f7:(I) \u00d7:(O) \u061b:(P) >:({) <:(}) |',
        '\u0634:(A) \u0633:(S) \u064a:(D) \u0628:(F) \u0644:(G) \u0623:(H) \u0640:(J) \u060c:(K) /:(L) : " {enter}',
        '{shift} \u0626:(Z) \u0621:(X) \u0624:(C) \u0631:(V) \ufef5:(B) \u0622:(N) \u0629:(M) ,:(<) .:(>) \u061f:(?) {shift}',
        '{accept} {alt} {space} {alt} {cancel}'
    ]
};

// Keyboard Language
// please update this section to match this language and email me with corrections!
// ***********************
if (typeof(language) === 'undefined') { var language = {}; }
language.arabic = {
	display : {
		'a'      : '\u2714:Accept (Shift-Enter)', // check mark - same action as accept
		'accept' : 'Accept:Accept (Shift-Enter)',
		'alt'    : 'AltGr:Alternate Graphemes',
		'b'      : '\u2190:Backspace',    // Left arrow (same as &larr;)
		'bksp'   : 'Bksp:Backspace',
		'c'      : '\u2716:Cancel (Esc)', // big X, close - same action as cancel
		'cancel' : 'Cancel:Cancel (Esc)',
		'clear'  : 'C:Clear',             // clear num pad
		'combo'  : '\u00f6:Toggle Combo Keys',
		'dec'    : '.:Decimal',           // decimal point for num pad (optional), change '.' to ',' for European format
		'e'      : '\u21b5:Enter',        // down, then left arrow - enter symbol
		'enter'  : 'Enter:Enter',
		'lock'   : '\u21ea Lock:Caps Lock', // caps lock
		's'      : '\u21e7:Shift',        // thick hollow up arrow
		'shift'  : 'Shift:Shift',
		'sign'   : '\u00b1:Change Sign',  // +/- sign for num pad
		'space'  : '&nbsp;:Space',
		't'      : '\u21e5:Tab',          // right arrow to bar (used since this virtual keyboard works with one directional tabs)
		'tab'    : '\u21e5 Tab:Tab'       // \u21b9 is the true tab symbol (left & right arrows)
	},
	// Message added to the key title while hovering, if the mousewheel plugin exists
	wheelMessage : 'Use mousewheel to see other keys',
    rtl: true
};

// This will add arabic language options to the keyboard's existing language options.
$.extend(true, $.keyboard.language, language);
