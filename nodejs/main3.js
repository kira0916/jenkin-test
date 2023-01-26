var mysql = require('mysql');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
var session= require('express-session');
var fileStore= require('session-file-store')(session);

app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.use(express.static('static')); 
app.use(session({
    secret: 'sung',
    resave: false,
    saveUninitialized: true,
    store: new fileStore()
}));


var main_board = "SELECT * FROM member, board WHERE member.id = board.member_id ORDER BY board.board_id;";
var board_write = "";

const config = {
	host    : "prod-mysql-fs.mysql.database.azure.com",
        user    : "admin1",
        password: "It12345!",
        port    : 3306
}
var connection = mysql.createConnection(config);

connection.connect(function(err) {
        if (err) {
                console.error("Database connection failed : " + err.stack);
                return;
        }

        console.log('Connected to database.');
});

connection.changeUser({
    database : 'project'
}, (err) => {
    if (err) {
      console.log('Error in changing database', err);
      return;
    }
    // Do another query
});


app.set('view engine', 'ejs');


app.get('/board.html.js', function (req, res, next) {
	var rows = '';
	if (req.session.logined) {
	connection.query(main_board, function (err, rows) {
	        if (!err) {
	            	res.render('board.html',
				{rows: rows },
				function(err, html){
				if (err){
					console.log(err)
				}
				res.end(html)
			});
			
	            }else{
	                res.statusCode=302
	                res.setHeader("Location","http://www.kb97.xyz/404.html");
	                res.end();
	            }
	})
    };	return(rows);
	connection.end();
});

app.get('/write.html.js', function (req, res, next) {
	connection.query('select * from member where email="'+req.session.user_id+'";', function(err,rows,fields){
	console.log(rows[0]["full_name"])	
        res.render('write.html',
		    {rows: rows[0]["full_name"]},
                    function(err, html){
                    if (err){
                            console.log(err)
                    }
                    res.end(html)
		    });
	})
});

app.get('/main.html.js', function (req, res, next) {
            res.render('main.html',
                    function(err, html){
                    if (err){
                            console.log(err)
                    }
                    res.end(html)
                    });
});

app.get('/organization.html.js', function (req, res, next) {
            res.render('organization.html',
                    function(err, html){
                    if (err){
                            console.log(err)
                    }
                    res.end(html)
                    });
});




app.get('/login.html.js',function(req,res){
    if(req.session.logined){
        res.render('http://www.kb97.xyz/logout.html',{id: req.session.user_id});
    }else 
    res.render('http://www.kb97.xyz/login.html')
});
    // register view
app.get('/register.html',function(req,res){
    res.render('http://www.kb97.xyz/register.html')
});


//controllers
    // login controller
app.post('/login.js',function(req,res){
        // <form> 에서 보낸 값을 받아온다 POST
    var data={
        'id' : req.body.id,
        'password' : req.body.password   
    }
    console.log('post id : '+data.id);
    console.log('post password : '+data.password);
        //res.send(data.id+" "+data.password)

        // DB로 query해서 레코드가 있는지 확인한다
    connection.query('select * from member where email="'+data.id+'";', function(err,rows,fields){
        console.log('queried');
        if (err) { 
            //1. 쿼리에 실패하면 -> 에러페이지
            res.status=302;
            res.send('Error : '+err)
            res.end();
        }else if(rows.length<=0){
           //2. 레코드가 없으면 -> 로그인 실패 페이지
            res.send('no id match found');
            res.end();
        }else   
        {   //3. 레코드가 있으면 ->
                // 비밀번호와 아이디 확인
		console.log(rows[0]['password']);
            if( rows[0]['email']==data.id && rows[0]['password']==data.password)
            {   //같으면 로그인 성공 페이지== 로그인 세션을 가진 메인페이지
            
                req.session.logined= true;
                req.session.user_id=req.body.id;
                res.render('main.html',{data});
            }
                // 다르면 로그인 실패, 에러를 출력하고 다시 로그인 페이지로
            else
            {
                res.send("<script>alert('아이디 또는 비밀번호가 일치하지 않습니다.'); location.href='/login.html';</script>") 
            }
        }
    }); return (0);
        
});
    //logout controller
app.get('/logout.html.js',function(req,res){
    req.session.destroy();
    res.redirect('http://www.kb97.xyz');
});


    // register controller
app.post('/register.js',function(req,res){
        // post로 회원가입 정보를 받아온다
    var data = req.body;
        // 아이디 중복 검사
        // DB에 쿼리문을 날려 err,rows,fields값을 받아오는 콜백함수를 사용한다.
    connection.query('SELECT * from member where id="'+data.id+'";',function(err,rows,fields){
        if(err) {
            // 쿼리 에러
            console.log('Error: '+err);
            throw err;
        }
        if (rows.length<=0){
            // 중복되는 아이디가 없다. 회원가입 성공. DB에 레코드를 추가한다.
            var params= [null,data.email,data.full_name,data.password,data.phone_number,data.department_name];
            console.log(" datas : " + data.email +"  , "+data.department_name);
            connection.query('insert into member values(?,?,?,?,?,?)',params,function(err,results){
                if(err){
                    //쿼리 에러
                    console.log('Error insert query : '+err);
                    throw err;
                }
                else{
                     // insert 쿼리 성공: 성공 창을 띄우고 이전 로그인 페이지로 돌아간다
                     res.send("<script>alert('success'); location.href='http://www.kb97.xyz/login.html';</script> ");
                }
            });
        }else{
            // 아이디가 중복된다
            // 회원가입 실패. 에러를 띄우고 회원가입 페이지를 초기화 시킨다.
                // + 비밀번호 유효성
                // + 이메일 유효성
                // + 전화번호 유효성 검사
                res.send("<script>alert('중복된 아이디입니다.'); location.href='http://www.kb97.xyzx/register.html';</script> ");
        }
    })
});


    // 글쓰기 페이지에서 글 등록 controller

app.post('/write.js',function(req,res){
    // 글 등록 페이지에서 POST로 넘어온 데이터= req.body
    var member_id;
    // DB에 글쓰기
    //Session사용자의 member 레코드에서 member_no 값 query
    connection.query("SELECT id from member where email='"+req.session.user_id+"';",function(err,rows,fields){
        if(err)
            throw err;
        else{
            member_id=rows[0]['id'];
            console.log('member_id : '+member_id);
            connection.query("INSERT INTO board values(NULL,"+member_id+",'"+req.body.title+"','"+req.body.content+"',NOW())",function(err,result,fields){
                // if query 실패 => 에러페이지
                if(err){
                    console.log("Error : " + err);
                    throw err;
                }
                else {// if insert query 성공 => board.html로 다시
                    res.redirect('http://www.kb97.xyz/board.html.js')
                };
            });
        }
    });
});


app.get('/health.html',function(req,res,err){
	res.sendStatus(200);
});

var server = app.listen(port, function () {
    console.log("Express server has started on port : "+port);
});

app.engine('html',require('ejs').renderFile);


