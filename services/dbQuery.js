
module.exports ={
	create:async(model,query,cb)=>{
		return new Promise((resolve, reject) => {
			model.create(query,(err,data)=>{
				console.log(err);
				if(err){
					console.log("error on create query================",err)
					reject(err);
				}
				else{
					resolve(null);	
				}
			})
		});
	},
	findOne:async(model,criteria,projection,options)=>{
		options.lean = true;
		return new Promise((resolve, reject) => {
			model.findOne(criteria, projection, options, (err,data)=>{
				if(err){
					console.log("error on findOne query================",err)
					reject(err);
				}
				else{
					resolve(data);  
				}
			})
		});
	}
}