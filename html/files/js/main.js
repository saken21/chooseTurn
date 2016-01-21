(function () { "use strict";
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
};
var HxOverrides = function() { };
HxOverrides.strDate = function(s) {
	var _g = s.length;
	switch(_g) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k1 = s.split("-");
		return new Date(k1[0],k1[1] - 1,k1[2],0,0,0);
	case 19:
		var k2 = s.split(" ");
		var y = k2[0].split("-");
		var t = k2[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
var Lambda = function() { };
Lambda.exists = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
};
var List = function() {
	this.length = 0;
};
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
};
var IMap = function() { };
var Std = function() { };
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var haxe = {};
haxe.Http = function(url) {
	this.url = url;
	this.headers = new List();
	this.params = new List();
	this.async = true;
};
haxe.Http.prototype = {
	setParameter: function(param,value) {
		this.params = Lambda.filter(this.params,function(p) {
			return p.param != param;
		});
		this.params.push({ param : param, value : value});
		return this;
	}
	,request: function(post) {
		var me = this;
		me.responseData = null;
		var r = this.req = js.Browser.createXMLHttpRequest();
		var onreadystatechange = function(_) {
			if(r.readyState != 4) return;
			var s;
			try {
				s = r.status;
			} catch( e ) {
				s = null;
			}
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) {
				me.req = null;
				me.onData(me.responseData = r.responseText);
			} else if(s == null) {
				me.req = null;
				me.onError("Failed to connect or resolve host");
			} else switch(s) {
			case 12029:
				me.req = null;
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.req = null;
				me.onError("Unknown host");
				break;
			default:
				me.req = null;
				me.responseData = r.responseText;
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var $it0 = this.params.iterator();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += encodeURIComponent(p.param) + "=" + encodeURIComponent(p.value);
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e1 ) {
			me.req = null;
			this.onError(e1.toString());
			return;
		}
		if(!Lambda.exists(this.headers,function(h) {
			return h.header == "Content-Type";
		}) && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var $it1 = this.headers.iterator();
		while( $it1.hasNext() ) {
			var h1 = $it1.next();
			r.setRequestHeader(h1.header,h1.value);
		}
		r.send(uri);
		if(!this.async) onreadystatechange(null);
	}
	,onData: function(data) {
	}
	,onError: function(msg) {
	}
	,onStatus: function(status) {
	}
};
haxe.ds = {};
haxe.ds.IntMap = function() {
	this.h = { };
};
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
};
var jp = {};
jp.saken = {};
jp.saken.utils = {};
jp.saken.utils.Ajax = function() { };
jp.saken.utils.Ajax.getIP = function(onLoaded) {
	var http = new haxe.Http("files/php/" + "getIP.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		onLoaded(data);
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.request(true);
};
jp.saken.utils.Ajax.getDatetime = function(onLoaded) {
	var http = new haxe.Http("files/php/" + "getDatetime.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.request(true);
};
jp.saken.utils.Ajax.uploadImage = function(filename,base64,onLoaded) {
	var http = new haxe.Http("files/php/" + "uploadImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.setParameter("base64",base64);
	http.request(true);
};
jp.saken.utils.Ajax.deleteImage = function(filename,onLoaded) {
	var http = new haxe.Http("files/php/" + "deleteImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.request(true);
};
jp.saken.utils.Ajax.getData = function(table,columns,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT " + columns.join(",") + " FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getMaxData = function(table,column,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		var reg = new EReg("([0-9]+)","");
		var isMatch = reg.match(data);
		onLoaded(isMatch?Std.parseInt(reg.matched(0)):0);
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT MAX(" + column + ") FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getIsEmpty = function(table,onLoaded,where) {
	jp.saken.utils.Ajax.getData(table,["id"],function(data) {
		onLoaded(data.length < 1);
	},where);
};
jp.saken.utils.Ajax.insertData = function(table,columns,values,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded(Std.parseInt(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var _g1 = 0;
	var _g = values.length;
	while(_g1 < _g) {
		var i = _g1++;
		values[i] = "'" + values[i] + "'";
	}
	var query = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (" + values.join(",") + ")";
	jp.saken.utils.Ajax.requestConnectDB(query,true);
};
jp.saken.utils.Ajax.updateData = function(table,columns,values,where,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	var array = [];
	var _g1 = 0;
	var _g = columns.length;
	while(_g1 < _g) {
		var p = _g1++;
		array[p] = columns[p] + "= '" + values[p] + "'";
	}
	var query = "UPDATE " + table + " SET " + array.join(",") + " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.setConnectDB = function() {
	jp.saken.utils.Ajax._connectDB = new haxe.Http("files/php/" + "connectDB.php");
};
jp.saken.utils.Ajax.requestConnectDB = function(query,isInsert) {
	if(isInsert == null) isInsert = false;
	jp.saken.utils.Ajax.setBusy();
	jp.saken.utils.Ajax._connectDB.setParameter("query",query);
	if(isInsert) jp.saken.utils.Ajax._connectDB.setParameter("insert","true");
	jp.saken.utils.Ajax._connectDB.request(true);
};
jp.saken.utils.Ajax.setBusy = function() {
	jp.saken.utils.Dom.jWindow.on("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.unsetBusy = function() {
	jp.saken.utils.Dom.jWindow.unbind("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.onBeforeunload = function(event) {
	return "データベース登録中です。";
};
var js = {};
jp.saken.utils.Dom = function() { };
jp.saken.utils.Handy = function() { };
jp.saken.utils.Handy.alert = function(value) {
	jp.saken.utils.Dom.window.alert(value);
};
jp.saken.utils.Handy.confirm = function(text,ok,cancel) {
	if(jp.saken.utils.Dom.window.confirm(text)) ok(); else if(cancel != null) cancel();
};
jp.saken.utils.Handy.getPastDate = function(date,num) {
	if(num == null) num = 30;
	var second = HxOverrides.strDate(date).getTime() - num * 86400000;
	var date1;
	var d = new Date();
	d.setTime(second);
	date1 = d;
	var m = jp.saken.utils.Handy.getFilledNumber(date1.getMonth() + 1,2);
	var d1 = jp.saken.utils.Handy.getFilledNumber(date1.getDate(),2);
	return date1.getFullYear() + "-" + m + "-" + d1;
};
jp.saken.utils.Handy.getFilledNumber = function(num,digits) {
	if(digits == null) digits = 3;
	var result = num + "";
	var blankLength = digits - jp.saken.utils.Handy.getDigits(num);
	var _g = 0;
	while(_g < blankLength) {
		var i = _g++;
		result = "0" + result;
	}
	return result;
};
jp.saken.utils.Handy.getDigits = function(val) {
	return (val + "").length;
};
jp.saken.utils.Handy.getLinkedHTML = function(text,target) {
	if(target == null) target = "_blank";
	if(new EReg("http","").match(text)) text = new EReg("((http|https)://[0-9a-z-/._?=&%\\[\\]~^:]+)","gi").replace(text,"<a href=\"$1\" target=\"" + target + "\">$1</a>");
	return text;
};
jp.saken.utils.Handy.getBreakedHTML = function(text) {
	if(new EReg("\n","").match(text)) text = new EReg("\r?\n","g").replace(text,"<br>");
	return text;
};
jp.saken.utils.Handy.getAdjustedHTML = function(text) {
	return jp.saken.utils.Handy.getLinkedHTML(jp.saken.utils.Handy.getBreakedHTML(text));
};
jp.saken.utils.Handy.getLines = function(text) {
	return jp.saken.utils.Handy.getNumberOfCharacter(text,"\n") + 1;
};
jp.saken.utils.Handy.getNumberOfCharacter = function(text,character) {
	return text.split(character).length - 1;
};
jp.saken.utils.Handy.getLimitText = function(text,count) {
	if(count == null) count = 10;
	if(text.length > count) text = HxOverrides.substr(text,0,count) + "...";
	return text;
};
jp.saken.utils.Handy.getReplacedSC = function(text) {
	text = StringTools.replace(text,"'","&#039;");
	text = StringTools.replace(text,"\\","&#47;");
	return text;
};
jp.saken.utils.Handy.getSlicedArray = function(array,num) {
	if(num == null) num = 1000;
	var results = [];
	var _g1 = 0;
	var _g = Math.ceil(array.length / num);
	while(_g1 < _g) {
		var i = _g1++;
		var j = i * num;
		results.push(array.slice(j,j + num));
	}
	return results;
};
jp.saken.utils.Handy.shuffleArray = function(array) {
	var copy = array.slice();
	var results = [];
	var length = copy.length;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var index = Math.floor(Math.random() * length);
		results.push(copy[index]);
		copy.splice(index,1);
	}
	return results;
};
js.Browser = function() { };
js.Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw "Unable to create XMLHttpRequest object.";
};
var src = {};
src.Main = function() { };
src.Main.main = function() {
	new js.JQuery("document").ready(src.Main.init);
};
src.Main.init = function(event) {
	src.Main.getIP();
};
src.Main.getIP = function() {
	jp.saken.utils.Ajax.getIP(function(ip) {
		src.Main._myIP = ip;
		src.Main.getData();
	});
};
src.Main.getData = function() {
	src.Main._map = new haxe.ds.IntMap();
	jp.saken.utils.Ajax.getData("items",["ip","turn"],function(data) {
		var _g1 = 0;
		var _g = data.length;
		while(_g1 < _g) {
			var i = _g1++;
			var info = data[i];
			var ip = info.ip;
			if(ip == src.Main._myIP) {
				src.Main.finish();
				return;
			}
			var k = info.turn;
			src.Main._map.set(k,ip);
			ip;
		}
		src.Main.setHTML();
	});
};
src.Main.finish = function() {
	jp.saken.utils.Handy.alert("順番決定済みです。");
};
src.Main.setHTML = function() {
	src.Main._jAll = new js.JQuery("#all");
	var html = "<h1>発表順</h1><ul>";
	var _g = 0;
	while(_g < 6) {
		var i = _g++;
		var num = i + 1;
		var ip = src.Main._map.get(num);
		var cls;
		if(src.Main._map.exists(num)) cls = " buried"; else cls = "";
		html += "<li class=\"turn" + cls + "\" data-num=\"" + num + "\" data-ip=\"" + ip + "\">" + num + "番</li>";
	}
	src.Main._jAll.html(html + "</ul>").find("li").on("click",src.Main.onClick);
};
src.Main.onClick = function(event) {
	var jTarget = new js.JQuery(event.target);
	if(jTarget.hasClass("buried")) return;
	var num = jTarget.data("num");
	src.Main._jAll.remove();
	jp.saken.utils.Ajax.insertData("items",["ip","turn"],[src.Main._myIP,num],function(id) {
		jp.saken.utils.Handy.alert("あなたの発表順は" + num + "番に決定しました！");
	});
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
var q = window.jQuery;
js.JQuery = q;
jp.saken.utils.Ajax.PATH = "files/php/";
jp.saken.utils.Dom.document = window.document;
jp.saken.utils.Dom.window = window;
jp.saken.utils.Dom.jWindow = new js.JQuery(jp.saken.utils.Dom.window);
jp.saken.utils.Dom.body = jp.saken.utils.Dom.document.body;
jp.saken.utils.Dom.jBody = new js.JQuery(jp.saken.utils.Dom.body);
jp.saken.utils.Dom.userAgent = jp.saken.utils.Dom.window.navigator.userAgent;
src.Main.TURN_LENGTH = 6;
src.Main.main();
})();
