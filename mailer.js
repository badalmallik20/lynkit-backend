var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport( {
	service: 'Gmail',
	auth: {
		user: 'badalmallik20@gmail.com',
		pass: 'Gautam.1072'
	}
});

module.exports = {
	sendMail: async (data,cb)=> {
		var message = {
			from: 'Lynkit Team <badalmallik20@gmail.com>',
			to: data.to,
			subject: data.subject
		};

		if(data.text) message.text = data.text;
		if(data.html) message.html=data.html;

		transport.sendMail(message, function(error){
			if(error){
				console.log("send mail error--",error)
				cb(error);
			}else{
				cb(null, {status:1})
			}
		});
	}
}