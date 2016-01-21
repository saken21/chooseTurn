<?php

	if ($_POST) {
		
		$host = "localhost";
		$name = "chooseTurn";
		$dsn  = "mysql:host=".$host.";dbname=".$name.";charset=utf8";
		$id   = "root";
		$pass = "root";

		$pdo  = new PDO($dsn,$id,$pass,array(PDO::ATTR_EMULATE_PREPARES=>false));
		$stmt = $pdo->query($_POST['query']);
		
		if ($_POST['insert']) {
			
			echo($pdo->lastInsertId());
			
		} else if (count($stmt) > 0) {
			
			$array = array();

			while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) array_push($array,$row);
			echo(json_encode($array));
			
		}
		
		$pdo = null;
		
	}

?>