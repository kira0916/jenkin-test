#! /bin/bash
# mysql
sudo apt-get install -y mysql-client-core-8.0
export LANG="ko_KR.UTF-8"
mysql -h prod-mysql-fs.mysql.database.azure.com -u admin1 -pIt12345! << FOE
  create database project;
  use project;
  create table member (
	  id int AUTO_INCREMENT NOT NULL primary key,
	  email varchar(30) NOT NULL,
	  full_name varchar(20) NOT NULL,
	  password varchar(20) NOT NULL,
	  phone_number varchar(20) DEFAULT NULL,
	  department_name varchar(20) NOT NULL
  	);

  create table board (
  	board_id int AUTO_INCREMENT NOT NULL primary key,
  	member_id int(10) NOT NULL,
  	title varchar(20) NOT NULL,
  	content varchar(200) NOT NULL,
  	time DATETIME DEFAULT now(),
  	FOREIGN KEY (member_id) REFERENCES member(id)
  	);

#   grant all privileges on project.* to 'root'@'%' IDENTIFIED BY 'It12345!';
#   grant all privileges on project.* to 'root'@'mydb.czgwhg0kozpu.ap-northeast-2.rds.amazonaws.com' IDENTIFIED BY 'It12345!';
  flush privileges;

  SHOW GRANTS FOR CURRENT_USER;

  use project;

  ALTER TABLE member convert to charset utf8;
  ALTER TABLE board convert to charset utf8;

  ALTER TABLE board AUTO_INCREMENT=1;
  SET @COUNT = 0;
  UPDATE board SET board_id = @COUNT:=@COUNT+1;

  SELECT * FROM board, member WHERE member.id = board.member_id;
FOE
