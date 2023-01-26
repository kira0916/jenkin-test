FROM  node

RUN	mkdir /var/task
WORKDIR /var/task
RUN	npm install -y mysql express http
RUN	npm install --save express
RUN	npm install -y ejs express-session session-file-store
RUN	mkdir /var/task/views

COPY	main3.js /var/task/
COPY	package.js /var/task/
COPY	board.html /var/task/views
COPY    main.html /var/task/views
COPY    write.html /var/task/views
COPY    organization.html /var/task/views

CMD [ "node", "main3.js" ]

EXPOSE	3000
