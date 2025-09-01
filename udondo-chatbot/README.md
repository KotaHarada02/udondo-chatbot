### プロセスのキル
lsof -i :8787 
->output: 
COMMAND   PID   USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    81209 xxxxxx   17u  IPv6 0xb620ecd6aa6dc2cb      0t0  TCP *:msgsrvr (LISTEN)

この時、
kill -9 81209
で、プロセスをキルできる