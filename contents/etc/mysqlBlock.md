# MySQL 외부 접속 불가 문제 해결 방법
-   MySQL 서버에 외부에서 접속할 수 없는 경우, 다양한 원인이 있을 수 있습니다. 이 글에서는 MySQL 외부 접속 문제를 해결하기 위한 단계별 방법을 정리하였습니다.

1.  MySQL 설정 파일 수정
2.  1 설정 파일 열기  
    MySQL의 설정 파일을 수정해야 합니다. 일반적으로 /etc/mysql/my.cnf 또는 /etc/mysql/mysql.conf.d/mysqld.cnf에 위치합니다. 아래 명령어로 파일을 열어주세요.

\`\`\`
sudo vi /etc/mysql/my.cnf
\`\`\`

또는

\`\`\`
sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf
\`\`\`

1.2 bind-address 설정 변경  
파일 내에서 bind-address 항목을 찾아서, 기본값인 127.0.0.1에서 0.0.0.0으로 변경합니다. 이는 MySQL 서버가 모든 IP 주소에서의 연결을 수락하도록 설정하는 것입니다.

\`\`\`
bind-address = 0.0.0.0
\`\`\`

2.  사용자 권한 설정
3.  1 MySQL에 접속  
    MySQL에 접속하여 사용자 권한을 설정합니다.

\`\`\`
mysql -u root -p
\`\`\`

2.2 원격 접속 사용자 추가  
아래 SQL 명령어를 사용하여 원격에서 접속할 수 있는 사용자를 추가합니다.

\`\`\`
CREATE USER 'root'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
\`\`\`

여기서 your\\_password는 원하는 비밀번호로 변경하세요.

3.  방화벽 설정 확인  
    방화벽이 활성화된 경우, MySQL 포트(기본 3306)를 열어야 합니다. 아래 명령어로 포트를 허용합니다.

\`\`\`
sudo ufw allow 3306/tcp
\`\`\`

4.  MySQL 재시작  
    설정을 변경한 후, MySQL 서비스를 재시작합니다.

\`\`\`
sudo systemctl restart mysql
\`\`\`

5.  외부에서 접속 시도  
    이제 외부에서 MySQL에 접속을 시도해 보세요.

## Host '{IP}' is not allowed to connect to this MySQL server 오류

-   외부에서 DB 접근시 허용 IP에 대한 오류이다. 외부 접근시 허용할 IP를 설정해주면 해결이 됩니다.

### 설정 확인

\`\`\`
select Host,User,plugin,authentication_string FROM mysql.user;
\`\`\`

### 모든 IP 허용

\`\`\`
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '패스워드';
\`\`\`

### 특정 IP 허용

\`\`\`
GRANT ALL PRIVILEGES ON *.* TO 'root'@'{IP}' IDENTIFIED BY '패스워드';
\`\`\`
