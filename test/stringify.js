//"use strict";

var assert = require ("assert");
var properties = require ("../lib");
var fs = require ("fs");

var WIN = process.platform === "win32";
var EOL = WIN ? "\r\n" : "\n";

var tests = {
	"comments multiline": function (done){
		var builder = properties.builder ().header ("a\nb\r\nc\n");
		var data = properties.stringify (builder);
		var expected = "#a" + EOL + "#b" + EOL + "#c" + EOL + "#" + EOL + EOL;
		assert.strictEqual (data, expected);
		
		done ();
	},
	"comments whitespace, escape and unicode": function (done){
		var options = { unicode: true };
		var builder = properties.builder ().header ("   a\t↓   ");
		var data = properties.stringify (builder, options);
		var expected = "#   a\t\\u2193   " + EOL + EOL;
		assert.strictEqual (data, expected);
		
		done ();
	},
	"key and value whitespace, escape and unicode": function (done){
		var options = { unicode: true };
		var builder = properties.builder ()
				.property ({ comment: "asd", key: "   a\t↓   ", value: "   a\t↓   " });
		var data = properties.stringify (builder, options);
		var expected = "#asd" + EOL + "\\ \\ \\ a\\t\\u2193\\ \\ \\ =\\ \\ \\ a" +
				"\\t\\u2193   ";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"custom comment and separator": function (done){
		var options = { comment: ";", separator: "-" };
		var builder = properties.builder ()
				.property ({ comment: "asd", key: "a", value: "b" });
		var data = properties.stringify (builder, options);
		var expected = ";asd" + EOL + "a-b";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"no key": function (done){
		var builder = properties.builder ()
				.property ({ value: "b" });
		var data = properties.stringify (builder);
		var expected = "=b";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"no value": function (done){
		var builder = properties.builder ()
				.property ({ key: "a" });
		var data = properties.stringify (builder);
		var expected = "a=";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"no key and no value": function (done){
		var builder = properties.builder ()
				.property ();
		var data = properties.stringify (builder);
		var expected = "=";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"section, whitespace, escape and unicode": function (done){
		var options = { unicode: true };
		var builder = properties.builder ()
				.section ({ name: "   a\t↓   " });
		var data = properties.stringify (builder, options);
		var expected = "[   a\\t\\u2193   ]";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"empty section": function (done){
		var builder = properties.builder ()
				.section ();
		var data = properties.stringify (builder);
		var expected = "[]";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"builder": function (done){
		var builder = properties.builder ()
				.header ("a\nb\n")
				.property ({ key: "a", value: "a value" })
				.property ({ key: "b" })
				.property ({ comment: "c comment", key: "c", value: "c value" })
				.property ({ comment: "d comment", key: "d" })
				.section ()
				.section ({ comment: "h section", name: "h" })
				.property ({ key: "a", value: "a value" })
				.property ({ comment: "b comment", key: "b", value: "b value" });
		var data = properties.stringify (builder);
		var expected = "#a" + EOL + "#b" + EOL + "#" + EOL + EOL + "a=a value" +
				EOL + "b=" + EOL + "#c comment" + EOL + "c=c value" + EOL +
				"#d comment" + EOL + "d=" + EOL + "[]" + EOL + "#h section" + EOL +
				"[h]" + EOL + "a=a value" + EOL + "#b comment" + EOL + "b=b value";
		assert.strictEqual (data, expected);
		
		done ();
	},
	"replacer": function (done){
		var builder = properties.builder ()
				.property ({ key: "a", value: "a value" })
				.section ("a")
				.property ({ key: "a", value: "a value" })
				.section ("b")
				.property ({ key: "a", value: "a value" });
		var options = {
			replacer: function (key, value, section){
				if (section === "b") return;
				if (!section && key === "a") return "A VALUE";
				return this.assert ();
			}
		};
		var data = properties.stringify (builder, options);
		var expected = "a=A VALUE" + EOL + "[a]" + EOL + "a=a value";
		assert.strictEqual (data, expected);
		
		done ();
	}
};

var keys = Object.keys (tests);
var keysLength = keys.length;

(function again (i){
	if (i<keysLength){
		var fn = tests[keys[i]];
		if (fn.length){
			fn (function (){
				again (i + 1);
			});
		}else{
			fn ();
			again (i + 1);
		}
	}
})(0);