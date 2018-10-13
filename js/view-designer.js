var app =  new Vue({
	el:"#main",
	data:{
		questions:[],
		selectedQuestion:null,
		questionCounter:0,
		jumpCounter:0,
		settings:{}
	},	
	
	watch:{
		'selectedQuestion.temp.options':function(val)
		{
			if (val===undefined)
				return;
			
			else if(val=="")
				this.selectedQuestion.options=[];
			
			else
				this.selectedQuestion.options = val.split("\n").filter(String);
		}
		
		/*'selectedQuestion.temp.visibility': function(val)
		{
			this.selectedQuestion.visibility = this.replaceExpression(val);
		},
		'selectedQuestion.temp.enable': function(val)
		{
			this.selectedQuestion.enable = this.replaceExpression(val);
		},
		'selectedQuestion.jumps': function(val)
		{
			console.log("change");
			//this.selectedQuestion.enable = this.replaceExpression(val);
		}
		*/
	},
	
	methods:{
		addQuestion: function(){
			this.questions.push({
				id:this.questionCounter++,
				type:"ShortAnswer",
				caption:"",
				jumps:[],
				answers:[],
				temp:{}
			});
						
		},
		
		removeQuestion:function(q){
			this.questions = this.questions.filter(x=>x.id!=q.id);
		},
		
		showDetail: function(q){
			this.selectedQuestion = q;
			
			this.questions.map(x=> {
				if(x.isActive!="")
					x.isActive="";
			});
			
			this.selectedQuestion.isActive = "active";
		},
		
		addJump: function(){		
			this.selectedQuestion.jumps.push({
				expression: "",
				jumpTo:"",
				id:this.jumpCounter++,
				temp:{}
			});
		},
		removeJump:function(j){
			this.selectedQuestion.jumps= this.selectedQuestion.jumps.filter(x=>x.id!=j.id);
		},
		
		shortType: function(type)
		{
			switch(type)
			{
				case "ShortAnswer": return "SA";
				case "LongAnswer": return "LA";
				case "Multiple": return "M";
				case "Radio": return "R";
				case "YesNo": return "YN";
			}
			
		},
		
		replaceExpression(expression)
		{
			let regex = /{(.*?)}/g;
			
			return isEmptyString(expression)?expression:
				expression.replace(regex, (match, qid) => {
					for(let i=0; i<this.questions.length; i++)
					{
						let question = this.questions[i];
						if(question.id == qid)
						{
							if(["Multiple", "Radio"].includes(question.type))
								return "app.questions[" + i + "].answers";
							
							return "app.questions[" + i + "].answer";
						}
					}
					
					throw "invalid question id " + qid + " in visibility rule of question #" + q.id;
				});
			
		},
		
		finalize:function(){
			this.questions.map(q=>{
				q.enable = this.replaceExpression(q.temp.enable);
				q.visibility = this.replaceExpression(q.temp.visibility);
				q.jumps.map(j=>{
					j.expression = this.replaceExpression(j.temp.expression);
				});
			});
			
		}

	}
	
	
});



$(document).ready(function(){
	$.get("questions.json", function(data){
		app.questions = data.questions;
		app.selectedQuestion = data.selectedQuestion;
		app.questionCounter = data.questionCounter;
		app.jumpCounter = data.jumpCounter;
		app.settings = {};
	})
	$("#export").click(function(){
		app.finalize();
		console.log(JSON.stringify(app.$data));
	})
})

//CUSTOM FUNCTIONS
function isEmptyString(str)
{
	return str == null || str == '' || str == undefined;
}

