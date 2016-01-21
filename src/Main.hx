package src;

import js.JQuery;
import jp.saken.utils.Handy;
import jp.saken.utils.Ajax;
 
class Main {
	
	private static var _myIP:String;
	private static var _map :Map<Int,String>;
	private static var _jAll:JQuery;
	
	private static inline var TURN_LENGTH:Int = 6;
	
	public static function main():Void {
		
		new JQuery('document').ready(init);
		
	}
	
	private static function init(event:JqEvent):Void {
		
		getIP();
		
	}
	
	private static function getIP():Void {
		
		Ajax.getIP(function(ip:String):Void {
			
			_myIP = ip;
			getData();
			
		});
		
	}
	
	private static function getData():Void {
		
		_map = new Map();
		
		Ajax.getData('items',['ip','turn'],function(data:Array<Dynamic>):Void {
			
			for (i in 0...data.length) {
				
				var info:Dynamic = data[i];
				var ip  :String  = info.ip;
				
				if (ip == _myIP) {
					
					finish();
					return;
					
				}
				
				_map[info.turn] = ip;
				
			}
			
			setHTML();
			
		});
		
	}
	
	private static function finish():Void {
		
		Handy.alert('順番決定済みです。');
		
	}
	
	private static function setHTML():Void {
		
		_jAll = new JQuery('#all');
		
		var html:String = '<h1>発表順</h1><ul>';
		
		for (i in 0...TURN_LENGTH) {
			
			var num:Int    = i + 1;
			var ip :String = _map[num];
			var cls:String = _map.exists(num) ? ' buried' : '';
			
			html += '<li class="turn' + cls + '" data-num="' + num + '" data-ip="' + ip + '">' + num + '番</li>';
			
		}
		
		_jAll.html(html + '</ul>').find('li').on('click',onClick);
		
	}
	
	private static function onClick(event:JqEvent):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		if (jTarget.hasClass('buried')) return;
		
		var num:String = jTarget.data('num');
		
		_jAll.remove();
		
		Ajax.insertData('items',['ip','turn'],[_myIP,num],function(id:Int):Void {
			Handy.alert('あなたの発表順は' + num + '番に決定しました！');
		});
		
	}

}